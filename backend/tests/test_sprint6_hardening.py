import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.biometric_benchmark import run_biometric_benchmarks
from app.services.geo_engine import calculate_haversine_distance, is_within_geofence

def test_biometric_far_frr_benchmarks_engine():
    """
    Evaluates ArcFace 512D unit hypersphere cosine feature distribution:
    - False Acceptance Rate (FAR) < 0.001%
    - False Rejection Rate (FRR) < 1.0%
    """
    res = run_biometric_benchmarks(sample_size=25000, threshold=0.68)
    assert res["status"] == "PASSED"
    assert res["far_target_met"] is True
    assert res["false_acceptance_rate_percent"] < 0.001
    assert res["frr_target_met"] is True
    assert res["false_rejection_rate_percent"] < 1.0
    assert res["genuine_similarity_mean"] > 0.80
    assert abs(res["impostor_similarity_mean"]) < 0.05

@pytest.mark.asyncio
async def test_biometric_benchmark_api_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/biometrics/benchmarks?sample_size=10000&threshold=0.68")
        assert res.status_code == 200
        data = res.json()
        assert data["far_target_met"] is True
        assert data["frr_target_met"] is True
        assert data["status"] == "PASSED"

@pytest.mark.asyncio
async def test_untrusted_device_session_revocation():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        unique = uuid.uuid4().hex[:6]
        email = f"user_sec_{unique}@company.com"
        pwd = "Password123!"

        # 1. Register User
        reg_res = await client.post("/api/auth/register", json={
            "email": email,
            "password": pwd,
            "full_name": "Security User",
            "employee_code": f"SEC-{unique}",
            "role": "employee"
        })
        assert reg_res.status_code == 201

        # 2. Login from Device A
        dev_a = f"dev_hard_a_{unique}"
        login_res = await client.post("/api/auth/login", json={
            "email": email,
            "password": pwd,
            "device": {"device_id": dev_a, "device_model": "Pixel 8"}
        })
        assert login_res.status_code == 200
        token_a = login_res.json()["access_token"]
        refresh_a = login_res.json()["refresh_token"]

        # 3. Verify Device A is listed as trusted
        devs_res = await client.get("/api/auth/devices", headers={"Authorization": f"Bearer {token_a}"})
        assert devs_res.status_code == 200
        devices = devs_res.json()
        target_dev = next((d for d in devices if d["device_id"] == dev_a), None)
        assert target_dev is not None
        assert target_dev["is_trusted"] is True

        # 4. Revoke Device A session
        revoke_res = await client.post(
            f"/api/auth/devices/{dev_a}/revoke",
            headers={"Authorization": f"Bearer {token_a}"}
        )
        assert revoke_res.status_code == 200
        assert revoke_res.json()["status"] == "success"

        # 5. Verify refresh is blocked from revoked device
        refresh_attempt = await client.post("/api/auth/refresh", json={
            "refresh_token": refresh_a,
            "device_id": dev_a
        })
        assert refresh_attempt.status_code == 403
        assert "revoked" in refresh_attempt.json()["detail"].lower()

        # 6. Verify subsequent login from revoked device is rejected
        login_blocked = await client.post("/api/auth/login", json={
            "email": email,
            "password": pwd,
            "device": {"device_id": dev_a}
        })
        assert login_blocked.status_code == 403
        assert "untrusted or revoked" in login_blocked.json()["detail"].lower()

def test_geofence_boundary_precision_199m_vs_201m():
    """
    Checks Haversine distance calculations right at the 200m boundary:
    195m is inside; 205m is outside.
    """
    office_lat = 37.7749
    office_lon = -122.4194

    # Point ~190m North (approx 0.00171 degrees latitude ~ 190m)
    inside_lat = office_lat + 0.00171
    inside_lon = office_lon
    dist_inside = calculate_haversine_distance(office_lat, office_lon, inside_lat, inside_lon)
    is_in, _ = is_within_geofence(inside_lat, inside_lon, office_lat, office_lon, radius_meters=200)

    assert 185.0 < dist_inside < 195.0
    assert is_in is True

    # Point ~210m North (approx 0.00190 degrees latitude ~ 211m)
    outside_lat = office_lat + 0.00190
    outside_lon = office_lon
    dist_outside = calculate_haversine_distance(office_lat, office_lon, outside_lat, outside_lon)
    is_out, _ = is_within_geofence(outside_lat, outside_lon, office_lat, office_lon, radius_meters=200)

    assert 205.0 < dist_outside < 215.0
    assert is_out is False

@pytest.mark.asyncio
async def test_anti_mock_location_defense():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        unique = uuid.uuid4().hex[:6]

        reg_res = await client.post("/api/auth/register", json={
            "email": f"mock_test_{unique}@company.com",
            "password": "Password123!",
            "full_name": "Mock Test",
            "employee_code": f"MCK-{unique}",
            "role": "employee"
        })
        assert reg_res.status_code == 201
        user_id = reg_res.json()["id"]

        # Attempt to validate geofence with simulated/mocked GPS
        mock_val = await client.post("/api/work-modes/validate-geofence", json={
            "user_id": user_id,
            "latitude": 37.7749,
            "longitude": -122.4194,
            "is_mocked": True
        })
        assert mock_val.status_code == 403
        assert "Mock" in mock_val.json()["detail"]
