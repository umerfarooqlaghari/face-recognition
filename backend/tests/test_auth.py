import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_auth_workflow_and_device_binding():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        unique_suffix = uuid.uuid4().hex[:8]
        email = f"emp_{unique_suffix}@company.com"
        emp_code = f"EMP-{unique_suffix}"
        password = "SuperSecurePassword123!"

        # 1. Register User
        reg_payload = {
            "email": email,
            "password": password,
            "full_name": "Test Employee",
            "employee_code": emp_code,
            "role": "employee",
            "default_work_mode": "on_site"
        }
        reg_res = await client.post("/api/auth/register", json=reg_payload)
        assert reg_res.status_code == 201, reg_res.text
        user_data = reg_res.json()
        assert user_data["email"] == email
        assert user_data["employee_code"] == emp_code

        # 2. Login with Device Telemetry
        device_id = f"device_{uuid.uuid4().hex[:12]}"
        login_payload = {
            "email": email,
            "password": password,
            "device": {
                "device_id": device_id,
                "device_model": "iPhone 15 Pro",
                "os_name": "iOS",
                "os_version": "18.1",
                "app_version": "1.0.0"
            }
        }
        login_res = await client.post("/api/auth/login", json=login_payload)
        assert login_res.status_code == 200, login_res.text
        tokens = login_res.json()
        access_token = tokens["access_token"]
        refresh_token = tokens["refresh_token"]
        assert access_token is not None
        assert refresh_token is not None
        assert tokens["expires_in"] == 15 * 60

        # 3. Access Protected /me Endpoint
        me_res = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {access_token}"})
        assert me_res.status_code == 200
        me_data = me_res.json()
        assert me_data["email"] == email
        assert me_data["role"] == "employee"

        # 4. Rotate 7-Day Refresh Token
        refresh_payload = {
            "refresh_token": refresh_token,
            "device_id": device_id
        }
        ref_res = await client.post("/api/auth/refresh", json=refresh_payload)
        assert ref_res.status_code == 200, ref_res.text
        new_tokens = ref_res.json()
        assert new_tokens["access_token"] is not None
        assert new_tokens["refresh_token"] != refresh_token  # Rotated!

        # 5. Old Refresh Token Must Now Be Invalid
        stale_ref_res = await client.post("/api/auth/refresh", json=refresh_payload)
        assert stale_ref_res.status_code == 401
