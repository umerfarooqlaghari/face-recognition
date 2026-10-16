import uuid
from datetime import date, timedelta
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_leave_workflow_and_attendance_exemption():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        unique = uuid.uuid4().hex[:6]

        # 1. Register Manager
        mgr_res = await client.post("/api/auth/register", json={
            "email": f"mgr_lv_{unique}@company.com",
            "password": "Password123!",
            "full_name": "Leave Manager",
            "employee_code": f"MGR-L-{unique}",
            "role": "manager"
        })
        assert mgr_res.status_code == 201

        mgr_login = await client.post("/api/auth/login", json={
            "email": f"mgr_lv_{unique}@company.com",
            "password": "Password123!",
            "device": {"device_id": f"dev_mgr_{unique}"}
        })
        mgr_token = mgr_login.json()["access_token"]

        # 2. Register Employee
        emp_res = await client.post("/api/auth/register", json={
            "email": f"emp_lv_{unique}@company.com",
            "password": "Password123!",
            "full_name": "Leave Employee",
            "employee_code": f"EMP-L-{unique}",
            "role": "employee"
        })
        assert emp_res.status_code == 201

        emp_login = await client.post("/api/auth/login", json={
            "email": f"emp_lv_{unique}@company.com",
            "password": "Password123!",
            "device": {"device_id": f"dev_emp_{unique}"}
        })
        emp_data = emp_login.json()
        emp_token = emp_data["access_token"]
        emp_id = emp_data["user"]["id"]

        # 3. Check Today's Attendance before leave
        today_res = await client.get(
            f"/api/attendance/today/{emp_id}",
            headers={"Authorization": f"Bearer {emp_token}"}
        )
        assert today_res.status_code == 200
        today_data = today_res.json()
        assert today_data["is_on_leave"] is False
        assert today_data["has_checked_in"] is False

        # 4. Employee Applies for Leave covering today and tomorrow
        today = date.today()
        tomorrow = today + timedelta(days=1)

        apply_res = await client.post(
            "/api/leaves/apply",
            headers={"Authorization": f"Bearer {emp_token}"},
            json={
                "start_date": today.isoformat(),
                "end_date": tomorrow.isoformat(),
                "reason": "Personal family emergency"
            }
        )
        assert apply_res.status_code == 201
        leave_info = apply_res.json()
        leave_id = leave_info["id"]
        assert leave_info["status"] == "pending"

        # 5. Check my leaves list
        my_leaves_res = await client.get(
            "/api/leaves/my-leaves",
            headers={"Authorization": f"Bearer {emp_token}"}
        )
        assert my_leaves_res.status_code == 200
        assert len(my_leaves_res.json()) >= 1
        assert my_leaves_res.json()[0]["id"] == leave_id

        # 6. Verify Attendance status is still not exempt because status is pending
        today_pending_res = await client.get(
            f"/api/attendance/today/{emp_id}",
            headers={"Authorization": f"Bearer {emp_token}"}
        )
        assert today_pending_res.status_code == 200
        assert today_pending_res.json()["is_on_leave"] is False

        # 7. Manager views tenant leaves
        tenant_leaves_res = await client.get(
            "/api/leaves/tenant-leaves?status=pending",
            headers={"Authorization": f"Bearer {mgr_token}"}
        )
        assert tenant_leaves_res.status_code == 200
        pending_list = tenant_leaves_res.json()
        assert any(l["id"] == leave_id for l in pending_list)

        # 8. Manager approves leave
        review_res = await client.post(
            f"/api/leaves/{leave_id}/review",
            headers={"Authorization": f"Bearer {mgr_token}"},
            json={"status": "approved"}
        )
        assert review_res.status_code == 200
        assert review_res.json()["status"] == "approved"

        # 9. Verify Attendance status now reflects approved leave exemption
        today_exempt_res = await client.get(
            f"/api/attendance/today/{emp_id}",
            headers={"Authorization": f"Bearer {emp_token}"}
        )
        assert today_exempt_res.status_code == 200
        exempt_data = today_exempt_res.json()
        assert exempt_data["is_on_leave"] is True
        assert exempt_data["leave_status"] == "approved"
        assert exempt_data["leave_reason"] == "Personal family emergency"

@pytest.mark.asyncio
async def test_date_override_and_management_roster():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        unique = uuid.uuid4().hex[:6]

        # 1. Register Manager
        mgr_res = await client.post("/api/auth/register", json={
            "email": f"mgr_ov_{unique}@company.com",
            "password": "Password123!",
            "full_name": "Roster Manager",
            "employee_code": f"MGR-O-{unique}",
            "role": "manager"
        })
        assert mgr_res.status_code == 201

        mgr_login = await client.post("/api/auth/login", json={
            "email": f"mgr_ov_{unique}@company.com",
            "password": "Password123!",
            "device": {"device_id": f"dev_mgr_ov_{unique}"}
        })
        mgr_token = mgr_login.json()["access_token"]

        # 2. Register Employee (On-Site default)
        emp_res = await client.post("/api/auth/register", json={
            "email": f"emp_ov_{unique}@company.com",
            "password": "Password123!",
            "full_name": "OnSite Worker",
            "employee_code": f"EMP-O-{unique}",
            "role": "employee"
        })
        assert emp_res.status_code == 201
        emp_id = emp_res.json()["id"]

        # 3. Set work mode override for tomorrow to 'remote'
        tomorrow = date.today() + timedelta(days=1)
        override_res = await client.post(
            "/api/work-modes/override",
            headers={"Authorization": f"Bearer {mgr_token}"},
            json={
                "user_id": emp_id,
                "effective_date": tomorrow.isoformat(),
                "assigned_mode": "remote",
                "reason": "Single-day remote work approval"
            }
        )
        assert override_res.status_code == 200
        assert override_res.json()["assigned_mode"] == "remote"

        # 4. Verify in Management employees roster
        roster_res = await client.get(
            "/api/management/employees",
            headers={"Authorization": f"Bearer {mgr_token}"}
        )
        assert roster_res.status_code == 200
        roster = roster_res.json()
        target_emp = next((e for e in roster if e["id"] == emp_id), None)
        assert target_emp is not None
        assert target_emp["date_override"] is not None
        assert "REMOTE" in target_emp["date_override"]
