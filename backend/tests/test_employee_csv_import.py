import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_employee_csv_template_preview_and_import():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        unique = uuid.uuid4().hex[:6]

        # 1. Register & Login Admin
        admin_email = f"admin_csv_{unique}@company.com"
        admin_pwd = "Password123!"
        admin_res = await client.post("/api/auth/register", json={
            "email": admin_email,
            "password": admin_pwd,
            "full_name": "CSV Admin",
            "employee_code": f"ADM-{unique}",
            "role": "admin"
        })
        assert admin_res.status_code == 201

        login_res = await client.post("/api/auth/login", json={
            "email": admin_email,
            "password": admin_pwd,
            "device": {"device_id": f"dev_adm_{unique}"}
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Test Download Template
        tmpl_res = await client.get("/api/management/employees/import/template", headers=headers)
        assert tmpl_res.status_code == 200
        assert "First Name,Last Name,Email" in tmpl_res.text

        # 3. Test Preview Import with valid row, invalid email row, and duplicate row
        csv_content = (
            "First Name,Last Name,Email,Employee Code,Department,Designation,Work Mode\n"
            f"Alice,Smith,alice_{unique}@company.com,EMP-A{unique},Engineering,Software Engineer,on_site\n"
            f"Bob,Jones,invalid_email_format,EMP-B{unique},Marketing,Lead,remote\n"
            f"Charlie,Brown,charlie_{unique}@company.com,EMP-C{unique},Operations,Coordinator,on_site\n"
            f"Duplicate,Alice,alice_{unique}@company.com,EMP-D{unique},Sales,Rep,remote\n"
        ).encode("utf-8")

        preview_res = await client.post(
            "/api/management/employees/import/preview",
            headers=headers,
            files={"file": ("employees.csv", csv_content, "text/csv")}
        )
        assert preview_res.status_code == 200, preview_res.text
        preview_data = preview_res.json()
        assert preview_data["total_rows"] == 4
        assert preview_data["valid_rows"] == 2 # Alice and Charlie
        assert preview_data["invalid_rows"] == 2 # Bob (invalid email) and Duplicate Alice
        assert preview_data["duplicate_rows"] == 1

        # 4. Commit Import
        commit_res = await client.post(
            "/api/management/employees/import",
            headers=headers,
            files={"file": ("employees.csv", csv_content, "text/csv")}
        )
        assert commit_res.status_code == 201, commit_res.text
        commit_data = commit_res.json()
        assert commit_data["total_rows"] == 4
        assert commit_data["created"] == 2
        assert commit_data["skipped"] == 2
        created_emails = [c["email"] for c in commit_data["created_records"]]
        assert f"alice_{unique}@company.com" in created_emails
        assert f"charlie_{unique}@company.com" in created_emails

        # 5. Verify they appear in /api/management/employees
        emp_list_res = await client.get("/api/management/employees", headers=headers)
        assert emp_list_res.status_code == 200
        roster = emp_list_res.json()
        roster_emails = [e["email"] for e in roster]
        assert f"alice_{unique}@company.com" in roster_emails
        assert f"charlie_{unique}@company.com" in roster_emails
