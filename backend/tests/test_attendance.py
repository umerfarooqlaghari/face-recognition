import io
import uuid
from datetime import date
import pytest
from PIL import Image, ImageDraw
from httpx import AsyncClient, ASGITransport
from app.main import app

def generate_test_face(seed_color=(230, 190, 160)) -> bytes:
    img = Image.new("RGB", (200, 200), color=(240, 240, 245))
    draw = ImageDraw.Draw(img)
    draw.ellipse([40, 30, 160, 170], fill=seed_color, outline=(180, 140, 110), width=2)
    draw.ellipse([65, 75, 85, 95], fill=(50, 40, 30))
    draw.ellipse([115, 75, 135, 95], fill=(50, 40, 30))
    draw.line([100, 95, 100, 120], fill=(160, 120, 90), width=3)
    draw.arc([75, 125, 125, 145], start=0, end=180, fill=(180, 70, 70), width=3)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=95)
    return buf.getvalue()

@pytest.mark.asyncio
async def test_realtime_attendance_checkin_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        unique = uuid.uuid4().hex[:6]

        # 1. Register & Login Manager to setup office
        mgr_res = await client.post("/api/auth/register", json={
            "email": f"mgr_att_{unique}@company.com",
            "password": "Password123!",
            "full_name": "Attendance Manager",
            "employee_code": f"MGR-ATT-{unique}",
            "role": "manager"
        })
        assert mgr_res.status_code == 201

        mgr_login = await client.post("/api/auth/login", json={
            "email": f"mgr_att_{unique}@company.com",
            "password": "Password123!",
            "device": {"device_id": f"mgr_dev_{unique}"}
        })
        mgr_token = mgr_login.json()["access_token"]

        # Create Office (radius=200m)
        office_res = await client.post(
            "/api/work-modes/offices",
            headers={"Authorization": f"Bearer {mgr_token}"},
            json={
                "name": f"Headquarters {unique}",
                "latitude": 37.7749,
                "longitude": -122.4194,
                "radius_meters": 200
            }
        )
        assert office_res.status_code == 201
        office_id = office_res.json()["id"]

        # 2. Register On-Site Employee attached to office
        emp_email = f"emp_att_{unique}@company.com"
        emp_res = await client.post("/api/auth/register", json={
            "email": emp_email,
            "password": "Password123!",
            "full_name": "John Attender",
            "employee_code": f"EMP-ATT-{unique}",
            "role": "employee",
            "default_work_mode": "on_site",
            "office_id": office_id
        })
        assert emp_res.status_code == 201
        emp_id = emp_res.json()["id"]

        emp_login = await client.post("/api/auth/login", json={
            "email": emp_email,
            "password": "Password123!",
            "device": {"device_id": f"dev_att_{unique}"}
        })
        emp_token = emp_login.json()["access_token"]

        # 3. Enroll Reference Face for Employee
        face_img_bytes = generate_test_face()
        enroll_res = await client.post(
            "/api/biometrics/enroll",
            headers={"Authorization": f"Bearer {emp_token}"},
            data={"user_id": emp_id},
            files={"file": ("ref.jpg", face_img_bytes, "image/jpeg")}
        )
        assert enroll_res.status_code == 200

        # 4. Attempt Check-In Out of Bounds (450m away) -> 403 Forbidden
        far_checkin = await client.post(
            "/api/attendance/check-in",
            headers={"Authorization": f"Bearer {emp_token}"},
            data={
                "latitude": 37.7790, # ~450m away
                "longitude": -122.4194,
                "device_id": f"dev_att_{unique}",
                "is_mocked": False
            },
            files={"file": ("probe.jpg", face_img_bytes, "image/jpeg")}
        )
        assert far_checkin.status_code == 403
        assert "Out of office bounds" in far_checkin.json()["detail"]

        # 5. Successful Check-In Within 70m of Office
        success_checkin = await client.post(
            "/api/attendance/check-in",
            headers={"Authorization": f"Bearer {emp_token}"},
            data={
                "latitude": 37.7753, # ~50m from office
                "longitude": -122.4194,
                "device_id": f"dev_att_{unique}",
                "is_mocked": False
            },
            files={"file": ("probe.jpg", face_img_bytes, "image/jpeg")}
        )
        assert success_checkin.status_code == 200, success_checkin.text
        att_data = success_checkin.json()
        assert att_data["status"] == "present"
        assert att_data["verification_type"] == "face_geo"
        assert att_data["similarity_score"] >= 0.68
        assert att_data["distance_from_office_meters"] < 200.0

        # 6. Verify Repeat Check-In on Same Day
        repeat_checkin = await client.post(
            "/api/attendance/check-in",
            headers={"Authorization": f"Bearer {emp_token}"},
            data={
                "latitude": 37.7753,
                "longitude": -122.4194,
                "is_mocked": False
            },
            files={"file": ("probe.jpg", face_img_bytes, "image/jpeg")}
        )
        assert repeat_checkin.status_code == 200
        assert "Already checked in" in repeat_checkin.json()["message"]

        # 7. Check-Out
        checkout_res = await client.post(
            "/api/attendance/check-out",
            headers={"Authorization": f"Bearer {emp_token}"}
        )
        assert checkout_res.status_code == 200
        assert checkout_res.json()["check_out_time"] is not None

        # 8. Verify Status & History Endpoints
        today_res = await client.get(
            f"/api/attendance/today/{emp_id}",
            headers={"Authorization": f"Bearer {emp_token}"}
        )
        assert today_res.status_code == 200
        today_json = today_res.json()
        assert today_json["has_checked_in"] is True
        assert today_json["has_checked_out"] is True

        history_res = await client.get(
            f"/api/attendance/history/{emp_id}",
            headers={"Authorization": f"Bearer {emp_token}"}
        )
        assert history_res.status_code == 200
        assert len(history_res.json()) >= 1
