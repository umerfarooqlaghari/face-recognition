import pytest
import pytest_asyncio
import uuid
from datetime import datetime, date, timezone, timedelta
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import delete

from app.main import app
from app.core.security import create_access_token, hash_password
from app.db.session import get_db
from app.models.models import Base, User, Tenant, Office, AttendanceRecord, Leave

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"

@pytest_asyncio.fixture
async def async_app_client():

    engine = create_async_engine(TEST_DB_URL, echo=False)
    async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed test data
    tenant_id = uuid.uuid4()
    admin_id = uuid.uuid4()
    emp_id = uuid.uuid4()
    office_id = uuid.uuid4()

    async with async_session() as session:
        t = Tenant(
            id=tenant_id,
            name="Test Corp",
            slug="test-corp",
            default_timezone="Asia/Karachi",
            default_work_start_time="09:00",
            default_work_end_time="18:00",
            default_grace_period_minutes=15
        )
        session.add(t)

        off = Office(
            id=office_id,
            tenant_id=tenant_id,
            name="Karachi HQ",
            latitude=24.8607,
            longitude=67.0011,
            radius_meters=200,
            timezone="Asia/Karachi",
            work_start_time="09:00",
            work_end_time="18:00",
            grace_period_minutes=15
        )
        session.add(off)

        admin = User(
            id=admin_id,
            tenant_id=tenant_id,
            email="admin@testcorp.com",
            password_hash=hash_password("adminpass123"),
            full_name="Admin User",
            employee_code="ADM-001",
            role="admin",
            default_work_mode="on_site",
            office_id=office_id
        )
        session.add(admin)

        emp = User(
            id=emp_id,
            tenant_id=tenant_id,
            email="employee@testcorp.com",
            password_hash=hash_password("emppass123"),
            full_name="John Doe",
            employee_code="EMP-101",
            role="employee",
            default_work_mode="on_site",
            office_id=office_id,
            custom_work_start_time="22:00",
            custom_work_end_time="06:00",
            custom_grace_period_minutes=20,
            shift_name="Night Shift"
        )
        session.add(emp)

        await session.commit()

    async def override_get_db():
        async with async_session() as s:
            yield s

    app.dependency_overrides[get_db] = override_get_db

    admin_token = create_access_token(data={"sub": str(admin_id), "tenant_id": str(tenant_id), "role": "admin"})
    emp_token = create_access_token(data={"sub": str(emp_id), "tenant_id": str(tenant_id), "role": "employee"})

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield {
            "client": client,
            "admin_token": admin_token,
            "emp_token": emp_token,
            "admin_id": admin_id,
            "emp_id": emp_id,
            "office_id": office_id,
            "tenant_id": tenant_id,
            "session_factory": async_session
        }

    app.dependency_overrides.clear()
    await engine.dispose()

# ==============================================================================
# Endpoint Tests: Checkout Negative & Positive Cases
# ==============================================================================

@pytest.mark.asyncio
async def test_checkout_without_checking_in_fails_400(async_app_client):
    """Negative case: Checking out before checking in must return 400 Bad Request."""
    client = async_app_client["client"]
    token = async_app_client["emp_token"]

    res = await client.post(
        "/api/attendance/check-out",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 400
    assert "Cannot check out without checking in first today" in res.json()["detail"]

@pytest.mark.asyncio
async def test_checkout_computes_worked_hours_and_prevents_duplicate(async_app_client):
    """
    Positive case & Edge case:
    1. Create an existing check-in 3.5 hours ago.
    2. Check-out computes ~3.5 hours worked.
    3. Second checkout returns 'Already checked out today' without overwriting duration.
    """
    client = async_app_client["client"]
    token = async_app_client["emp_token"]
    emp_id = async_app_client["emp_id"]
    tenant_id = async_app_client["tenant_id"]
    session_factory = async_app_client["session_factory"]

    # Seed check-in record from 3.5 hours ago
    today = date.today()
    check_in_time = datetime.now(timezone.utc) - timedelta(hours=3, minutes=30)
    async with session_factory() as session:
        rec = AttendanceRecord(
            tenant_id=tenant_id,
            user_id=emp_id,
            date=today,
            check_in_time=check_in_time,
            verification_type="face_geo",
            status="present",
            similarity_score=0.95,
            liveness_score=0.98
        )
        session.add(rec)
        await session.commit()

    # Perform check-out
    res1 = await client.post(
        "/api/attendance/check-out",
        headers={"Authorization": f"Bearer {token}"},
        data={"latitude": 24.8607, "longitude": 67.0011}
    )
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["check_out_time"] is not None
    assert data1["hours_worked"] is not None
    assert 3.4 <= data1["hours_worked"] <= 3.6
    assert "Checked out successfully" in data1["message"]

    # Attempt second check-out (duplicate checkout prevention)
    res2 = await client.post(
        "/api/attendance/check-out",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res2.status_code == 200
    data2 = res2.json()
    assert "Already checked out today" in data2["message"]
    assert data2["hours_worked"] == data1["hours_worked"]

# ==============================================================================
# Endpoint Tests: Calendar View
# ==============================================================================

@pytest.mark.asyncio
async def test_calendar_view_generation(async_app_client):
    """Verify Admin can retrieve full day-by-day calendar view for an employee."""
    client = async_app_client["client"]
    admin_token = async_app_client["admin_token"]
    emp_id = async_app_client["emp_id"]

    res = await client.get(
        f"/api/attendance/calendar/{emp_id}?year=2026&month=10",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["year"] == 2026
    assert data["month"] == 10
    assert data["month_name"] == "October"
    assert data["employee_name"] == "John Doe"
    assert data["shift_name"] == "Night Shift"
    assert data["scheduled_start_time"] == "22:00"
    assert data["scheduled_end_time"] == "06:00"
    assert len(data["days"]) == 31  # October has 31 days
    assert data["summary"]["total_days"] == 31

@pytest.mark.asyncio
async def test_calendar_access_control_negative_case(async_app_client):
    """Negative case: Regular employee cannot view another employee's calendar."""
    client = async_app_client["client"]
    emp_token = async_app_client["emp_token"]
    admin_id = async_app_client["admin_id"]

    # Employee tries to view admin's calendar
    res = await client.get(
        f"/api/attendance/calendar/{admin_id}?year=2026&month=10",
        headers={"Authorization": f"Bearer {emp_token}"}
    )
    assert res.status_code == 403
    assert "Access denied" in res.json()["detail"]

# ==============================================================================
# Endpoint Tests: Timing Updates & Late Digest
# ==============================================================================

@pytest.mark.asyncio
async def test_update_office_and_tenant_timings(async_app_client):
    """Verify updating tenant defaults and regional office timings."""
    client = async_app_client["client"]
    admin_token = async_app_client["admin_token"]
    office_id = async_app_client["office_id"]

    # 1. Update Tenant Timings
    res1 = await client.put(
        "/api/management/tenant/timings",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "default_timezone": "America/New_York",
            "default_work_start_time": "08:30",
            "default_work_end_time": "17:30",
            "default_grace_period_minutes": 20
        }
    )
    assert res1.status_code == 200
    assert res1.json()["tenant"]["default_timezone"] == "America/New_York"

    # 2. Update Office Timings
    res2 = await client.put(
        f"/api/management/offices/{office_id}/timings",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "timezone": "Europe/London",
            "work_start_time": "09:30",
            "work_end_time": "18:30",
            "grace_period_minutes": 10
        }
    )
    assert res2.status_code == 200
    assert res2.json()["timezone"] == "Europe/London"

@pytest.mark.asyncio
async def test_send_late_digest_endpoint(async_app_client):
    """Verify sending daily late digest email to HR/Admin."""
    client = async_app_client["client"]
    admin_token = async_app_client["admin_token"]

    # If no employees are late today
    res = await client.post(
        "/api/attendance/send-late-digest",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"target_date": date.today().isoformat()}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["late_count"] == 0
    assert "No late check-ins recorded" in data["message"]

@pytest.mark.asyncio
async def test_checkout_json_body_and_query_params(async_app_client):
    """Verify check-out works seamlessly with JSON body (used by React / React Native) and coordinates."""
    client = async_app_client["client"]
    token = async_app_client["emp_token"]
    emp_id = async_app_client["emp_id"]
    tenant_id = async_app_client["tenant_id"]
    session_factory = async_app_client["session_factory"]

    # Delete existing attendance records for employee today if any
    today = date.today()
    async with session_factory() as session:
        await session.execute(
            delete(AttendanceRecord).where(
                AttendanceRecord.user_id == emp_id,
                AttendanceRecord.date == today
            )
        )
        # Create fresh check-in record from 2 hours ago
        rec = AttendanceRecord(
            tenant_id=tenant_id,
            user_id=emp_id,
            date=today,
            check_in_time=datetime.now(timezone.utc) - timedelta(hours=2),
            verification_type="face_geo",
            status="present",
            similarity_score=0.92,
            liveness_score=0.95
        )
        session.add(rec)
        await session.commit()

    # Call check-out with JSON body: {"latitude": 24.8607, "longitude": 67.0011}
    res_json = await client.post(
        "/api/attendance/check-out",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json={"latitude": 24.8607, "longitude": 67.0011}
    )
    assert res_json.status_code == 200
    data = res_json.json()
    assert data["check_out_time"] is not None
    assert 1.9 <= data["hours_worked"] <= 2.1
    assert "Checked out successfully" in data["message"]

