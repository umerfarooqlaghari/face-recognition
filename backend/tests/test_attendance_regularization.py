import uuid
from datetime import date, datetime, timezone
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_missed_attendance_regularization_workflow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        unique = uuid.uuid4().hex[:6]

        # 1. Sign up Tenant Admin
        signup_res = await client.post("/api/auth/tenant/signup", json={
            "company_name": f"Regularize Corp {unique}",
            "admin_name": "Admin Boss",
            "admin_email": f"admin_reg_{unique}@corp.com",
            "admin_password": "Password123!",
            "office_name": "Main Tower",
            "office_latitude": 24.8607,
            "office_longitude": 67.0011,
            "office_radius_meters": 200
        })
        assert signup_res.status_code == 201
        admin_token = signup_res.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        # 2. Add an Employee via Form
        emp_res = await client.post("/api/management/employees", headers=admin_headers, json={
            "full_name": "Alice Regular",
            "email": f"alice_reg_{unique}@corp.com",
            "employee_code": f"EMP-REG-{unique}",
            "default_work_mode": "on_site"
        })
        assert emp_res.status_code == 201
        emp_data = emp_res.json()["user"]
        emp_id = emp_data["id"]

        # 3. Employee Submits Missed Attendance Request
        # (Manager submits on employee's behalf or employee submits)
        today_str = date.today().isoformat()
        reg_create = await client.post("/api/attendance/regularize", headers=admin_headers, json={
            "date": today_str,
            "check_in_time": "09:15:00",
            "check_out_time": "18:00:00",
            "reason": "Device ran out of battery at office entrance gate",
            "user_id": emp_id
        })
        assert reg_create.status_code == 201
        req_id = reg_create.json()["id"]
        assert reg_create.json()["status"] == "pending"

        # 4. List Tenant Regularization Requests
        list_res = await client.get("/api/attendance/tenant-regularization-requests", headers=admin_headers)
        assert list_res.status_code == 200
        req_items = list_res.json()
        assert any(r["id"] == req_id for r in req_items)

        # 5. Manager Reviews & Approves Regularization Request
        review_res = await client.post(
            f"/api/attendance/regularization-requests/{req_id}/review",
            headers=admin_headers,
            json={
                "status": "approved",
                "reviewer_note": "Verified by reception badge log"
            }
        )
        assert review_res.status_code == 200
        assert review_res.json()["status"] == "approved"

        # 6. Verify Attendance Timesheet shows regularized attendance record
        timesheet_res = await client.get(f"/api/attendance/timesheets?employee_id={emp_id}", headers=admin_headers)
        assert timesheet_res.status_code == 200
        ts_data = timesheet_res.json()
        assert len(ts_data) >= 1
        found_ts = next(t for t in ts_data if t["user_id"] == emp_id)
        assert found_ts["verification_type"] == "regularized"
        assert found_ts["status"] == "present"
        assert found_ts["duration_hours"] is not None
        assert found_ts["duration_hours"] > 8.0 # 09:15 to 18:00 is 8.75h
