import asyncio
import uuid
from sqlalchemy import text
from app.db.session import engine

DEFAULT_TENANT_ID = uuid.UUID("11111111-1111-1111-1111-111111111111")

async def run_migration():
    print("Starting Multi-Tenant Database Migration...")
    
    statements = [
        # 1. Create tenants table
        """
        CREATE TABLE IF NOT EXISTS tenants (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(150) NOT NULL,
            slug VARCHAR(100) UNIQUE NOT NULL,
            domain VARCHAR(150),
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
        """,
        # 2. Insert default tenant
        f"""
        INSERT INTO tenants (id, name, slug, domain, is_active)
        VALUES ('{DEFAULT_TENANT_ID}', 'Global Organization', 'global-org', 'global.org', TRUE)
        ON CONFLICT (slug) DO NOTHING
        """,
        # 3. Offices
        "ALTER TABLE offices ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE",
        f"UPDATE offices SET tenant_id = '{DEFAULT_TENANT_ID}' WHERE tenant_id IS NULL",
        "ALTER TABLE offices ALTER COLUMN tenant_id SET NOT NULL",
        "CREATE INDEX IF NOT EXISTS idx_offices_tenant_id ON offices(tenant_id)",

        # 4. Users
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE",
        f"UPDATE users SET tenant_id = '{DEFAULT_TENANT_ID}' WHERE tenant_id IS NULL",
        "ALTER TABLE users ALTER COLUMN tenant_id SET NOT NULL",
        "CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id)",

        # Constraints
        "ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key",
        "ALTER TABLE users DROP CONSTRAINT IF EXISTS users_employee_code_key",
        """
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_tenant_user_email') THEN
                ALTER TABLE users ADD CONSTRAINT uq_tenant_user_email UNIQUE (tenant_id, email);
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_tenant_user_employee_code') THEN
                ALTER TABLE users ADD CONSTRAINT uq_tenant_user_employee_code UNIQUE (tenant_id, employee_code);
            END IF;
        END $$;
        """,

        # 5. Attendance records
        "ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE",
        f"UPDATE attendance_records SET tenant_id = '{DEFAULT_TENANT_ID}' WHERE tenant_id IS NULL",
        "ALTER TABLE attendance_records ALTER COLUMN tenant_id SET NOT NULL",
        "CREATE INDEX IF NOT EXISTS idx_attendance_records_tenant_id ON attendance_records(tenant_id)",

        # 6. Work mode overrides
        "ALTER TABLE work_mode_overrides ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE",
        f"UPDATE work_mode_overrides SET tenant_id = '{DEFAULT_TENANT_ID}' WHERE tenant_id IS NULL",
        "ALTER TABLE work_mode_overrides ALTER COLUMN tenant_id SET NOT NULL",
        "CREATE INDEX IF NOT EXISTS idx_work_mode_overrides_tenant_id ON work_mode_overrides(tenant_id)",

        # 7. Face scan invites
        "ALTER TABLE face_scan_invites ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE",
        f"UPDATE face_scan_invites SET tenant_id = '{DEFAULT_TENANT_ID}' WHERE tenant_id IS NULL",
        "ALTER TABLE face_scan_invites ALTER COLUMN tenant_id SET NOT NULL",
        "CREATE INDEX IF NOT EXISTS idx_face_scan_invites_tenant_id ON face_scan_invites(tenant_id)",

        # 8. Leaves
        "ALTER TABLE leaves ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE",
        f"UPDATE leaves SET tenant_id = '{DEFAULT_TENANT_ID}' WHERE tenant_id IS NULL",
        "ALTER TABLE leaves ALTER COLUMN tenant_id SET NOT NULL",
        "CREATE INDEX IF NOT EXISTS idx_leaves_tenant_id ON leaves(tenant_id)"
    ]

    async with engine.begin() as conn:
        for stmt in statements:
            s = stmt.strip()
            if s:
                print(f"Executing: {s[:50]}...")
                await conn.execute(text(s))

    print("Multi-Tenant database migration completed successfully!")

if __name__ == "__main__":
    asyncio.run(run_migration())
