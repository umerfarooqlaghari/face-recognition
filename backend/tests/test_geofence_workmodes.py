import uuid
from datetime import date, timedelta
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.geo_engine import calculate_haversine_distance, is_within_geofence

def test_haversine_formula_math():
    # San Francisco City Hall to Asian Art Museum (~160 meters)
    lat1, lon1 = 37.77927, -122.41927
    lat2, lon2 = 37.78018, -122.41793
    dist = calculate_haversine_distance(lat1, lon1, lat2, lon2)
    assert 140.0 < dist < 180.0

    # Within 200m check
    inside, _ = is_within_geofence(lat1, lon1, lat2, lon2, radius_meters=200)
    assert inside is True

    # 500m boundary check
    far_lat, far_lon = 37.78500, -122.41927 # ~637m north
    inside_far, dist_far = is_within_geofence(lat1, lon1, far_lat, far_lon, radius_meters=200)
    assert inside_far is False
    assert dist_far > 600.0

@pytest.mark.asyncio
async def test_geofence_and_dynamic_work_mode_lifecycle():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        unique = uuid.uuid4().hex[:6]

        # 1. Register Manager & Login
        mgr_res = await client.post("/api/auth/register", json={
            "email": f"mgr_geo_{unique}@company.com",
            "password": "Password123!",
            "full_name": "Geo Manager",
            "employee_code": f"MGR-G-{unique}",
            "role": "manager"
        })
        assert mgr_res.status_code == 201

        login_res = await client.post("/api/auth/login", json={
            "email": f"mgr_geo_{unique}@company.com",
            "password": "Password123!",
            "device": {"device_id": f"dev_geo_{unique}"}
        })
        mgr_token = login_res.json()["access_token"]

        # 2. Manager Creates Office (SF HQ, radius=200m)
        office_res = await client.post(
            "/api/work-modes/offices",
            headers={"Authorization": f"Bearer {mgr_token}"},
            json={
                "name": f"SF HQ {unique}",
                "latitude": 37.7749,
                "longitude": -122.4194,
                "radius_meters": 200,
                "address": "100 Market St, San Francisco, CA"
            }
        )
        assert office_res.status_code == 201
        office_id = office_res.json()["id"]

        # 3. Register On-Site Employee attached to this office
        emp_onsite_res = await client.post("/api/auth/register", json={
            "email": f"onsite_{unique}@company.com",
            "password": "Password123!",
            "full_name": "On-Site Worker",
            "employee_code": f"EMP-ON-{unique}",
            "role": "employee",
            "default_work_mode": "on_site",
            "office_id": office_id
        })
        assert emp_onsite_res.status_code == 201
        onsite_emp_id = emp_onsite_res.json()["id"]

        # 4. Register Remote Employee
        emp_remote_res = await client.post("/api/auth/register", json={
            "email": f"remote_{unique}@company.com",
            "password": "Password123!",
            "full_name": "Remote Worker",
            "employee_code": f"EMP-REM-{unique}",
            "role": "employee",
            "default_work_mode": "remote"
        })
        assert emp_remote_res.status_code == 201
        remote_emp_id = emp_remote_res.json()["id"]

        # 5. Geofence Validation: On-Site Employee within 80m -> Allowed
        within_res = await client.post("/api/work-modes/validate-geofence", json={
            "user_id": onsite_emp_id,
            "latitude": 37.7753, # ~50m north
            "longitude": -122.4194,
            "is_mocked": False
        })
        assert within_res.status_code == 200
        within_data = within_res.json()
        assert within_data["allowed"] is True
        assert within_data["is_within_geofence"] is True
        assert within_data["distance_meters"] < 200.0

        # 6. Geofence Validation: On-Site Employee 400m away -> Blocked
        outside_res = await client.post("/api/work-modes/validate-geofence", json={
            "user_id": onsite_emp_id,
            "latitude": 37.7790, # ~450m away
            "longitude": -122.4194,
            "is_mocked": False
        })
        assert outside_res.status_code == 200
        outside_data = outside_res.json()
        assert outside_data["allowed"] is False
        assert outside_data["is_within_geofence"] is False
        assert outside_data["distance_meters"] > 200.0
        assert "Out of office bounds" in outside_data["message"]

        # 7. Mock Location Attack -> 403 Forbidden
        mock_res = await client.post("/api/work-modes/validate-geofence", json={
            "user_id": onsite_emp_id,
            "latitude": 37.7749,
            "longitude": -122.4194,
            "is_mocked": True
        })
        assert mock_res.status_code == 403
        assert "Mock" in mock_res.json()["detail"]

        # 8. Geofence Validation: Remote Employee -> Allowed anywhere
        rem_val_res = await client.post("/api/work-modes/validate-geofence", json={
            "user_id": remote_emp_id,
            "latitude": 40.7128, # New York (~4000 km away)
            "longitude": -74.0060,
            "is_mocked": False
        })
        assert rem_val_res.status_code == 200
        rem_val = rem_val_res.json()
        assert rem_val["allowed"] is True
        assert rem_val["work_mode"] == "remote"

        # 9. Date-Specific Override: Set tomorrow as Remote for On-site Employee
        tomorrow = (date.today() + timedelta(days=1)).isoformat()
        override_res = await client.post(
            "/api/work-modes/override",
            headers={"Authorization": f"Bearer {mgr_token}"},
            json={
                "user_id": onsite_emp_id,
                "effective_date": tomorrow,
                "assigned_mode": "remote",
                "reason": "Approved Client Visit / Remote Day"
            }
        )
        assert override_res.status_code == 200

        # 10. Query Status for Tomorrow vs Today
        tomorrow_status = await client.get(f"/api/work-modes/status/{onsite_emp_id}?target_date={tomorrow}")
        assert tomorrow_status.status_code == 200
        t_data = tomorrow_status.json()
        assert t_data["effective_work_mode"] == "remote"
        assert t_data["is_override"] is True
        assert t_data["requires_geofence"] is False

        today_status = await client.get(f"/api/work-modes/status/{onsite_emp_id}")
        assert today_status.status_code == 200
        assert today_status.json()["effective_work_mode"] == "on_site"
        assert today_status.json()["requires_geofence"] is True

        # 11. Tomorrow, On-Site employee can validate geofence from far away
        tomorrow_val = await client.post("/api/work-modes/validate-geofence", json={
            "user_id": onsite_emp_id,
            "latitude": 37.7790, # 450m away
            "longitude": -122.4194,
            "target_date": tomorrow,
            "is_mocked": False
        })
        assert tomorrow_val.status_code == 200
        assert tomorrow_val.json()["allowed"] is True
        assert tomorrow_val.json()["work_mode"] == "remote"
