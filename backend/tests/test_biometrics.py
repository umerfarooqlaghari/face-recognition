import io
import uuid
import pytest
import numpy as np
from PIL import Image, ImageDraw
from httpx import AsyncClient, ASGITransport
from app.main import app

def generate_test_face_image(width=200, height=200) -> bytes:
    """Generates an in-memory JPEG with facial oval and texture for testing."""
    img = Image.new("RGB", (width, height), color=(240, 240, 245))
    draw = ImageDraw.Draw(img)
    # Draw face oval
    draw.ellipse([40, 30, 160, 170], fill=(230, 190, 160), outline=(180, 140, 110), width=2)
    # Draw eyes
    draw.ellipse([65, 75, 85, 95], fill=(50, 40, 30))
    draw.ellipse([115, 75, 135, 95], fill=(50, 40, 30))
    # Draw nose
    draw.line([100, 95, 100, 120], fill=(160, 120, 90), width=3)
    # Draw mouth
    draw.arc([75, 125, 125, 145], start=0, end=180, fill=(180, 70, 70), width=3)
    
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=90)
    return buf.getvalue()

@pytest.mark.asyncio
async def test_face_invite_and_enrollment_workflow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Setup Manager and Employee accounts
        mgr_suffix = uuid.uuid4().hex[:6]
        emp_suffix = uuid.uuid4().hex[:6]

        # Register Manager
        mgr_res = await client.post("/api/auth/register", json={
            "email": f"mgr_{mgr_suffix}@company.com",
            "password": "Password123!",
            "full_name": "Test Manager",
            "employee_code": f"MGR-{mgr_suffix}",
            "role": "manager"
        })
        assert mgr_res.status_code == 201

        # Register Employee
        emp_res = await client.post("/api/auth/register", json={
            "email": f"emp_{emp_suffix}@company.com",
            "password": "Password123!",
            "full_name": "Sarah Connor",
            "employee_code": f"EMP-{emp_suffix}",
            "role": "employee"
        })
        assert emp_res.status_code == 201
        emp_id = emp_res.json()["id"]

        # 2. Login Manager
        mgr_login = await client.post("/api/auth/login", json={
            "email": f"mgr_{mgr_suffix}@company.com",
            "password": "Password123!",
            "device": {"device_id": f"mgr_dev_{mgr_suffix}"}
        })
        assert mgr_login.status_code == 200
        mgr_token = mgr_login.json()["access_token"]

        # 3. Manager Generates Face Scan Invite
        inv_res = await client.post(
            "/api/biometrics/invites/generate",
            headers={"Authorization": f"Bearer {mgr_token}"},
            json={"user_id": emp_id, "expires_hours": 48}
        )
        assert inv_res.status_code == 200, inv_res.text
        inv_data = inv_res.json()
        invite_token = inv_data["invite_token"]
        assert invite_token.startswith("inv_")
        assert inv_data["employee_name"] == "Sarah Connor"

        # 4. Public Token Verification Endpoint
        verify_res = await client.get(f"/api/biometrics/invites/verify/{invite_token}")
        assert verify_res.status_code == 200
        assert verify_res.json()["valid"] is True
        assert verify_res.json()["full_name"] == "Sarah Connor"

        # 5. Enroll Face Reference using Invite Token
        face_bytes = generate_test_face_image(200, 200)
        enroll_res = await client.post(
            "/api/biometrics/enroll",
            data={"invite_token": invite_token},
            files={"file": ("face_ref.jpg", face_bytes, "image/jpeg")}
        )
        assert enroll_res.status_code == 200, enroll_res.text
        enroll_data = enroll_res.json()
        assert enroll_data["success"] is True
        assert enroll_data["user_id"] == emp_id
        assert enroll_data["is_verified"] is True

        # 6. Verify Token Cannot Be Re-used
        reuse_res = await client.post(
            "/api/biometrics/enroll",
            data={"invite_token": invite_token},
            files={"file": ("face_ref2.jpg", face_bytes, "image/jpeg")}
        )
        assert reuse_res.status_code == 400
        assert "already been used" in reuse_res.text

        # 7. Check Profile Endpoint
        profile_res = await client.get(
            f"/api/biometrics/profile/{emp_id}",
            headers={"Authorization": f"Bearer {mgr_token}"}
        )
        assert profile_res.status_code == 200
        assert profile_res.json()["is_verified"] is True

        # 8. Test Quality Rejection for Low-Res Image
        low_res = io.BytesIO()
        Image.new("RGB", (50, 50), color=(100, 100, 100)).save(low_res, format="JPEG")
        bad_enroll = await client.post(
            "/api/biometrics/enroll",
            headers={"Authorization": f"Bearer {mgr_token}"},
            data={"user_id": emp_id},
            files={"file": ("tiny.jpg", low_res.getvalue(), "image/jpeg")}
        )
        assert bad_enroll.status_code == 422
        assert "resolution too low" in bad_enroll.text
