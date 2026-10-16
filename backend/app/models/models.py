import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, DateTime, Date, Float, Integer,
    ForeignKey, Text, UniqueConstraint
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, relationship
from pgvector.sqlalchemy import Vector

Base = declarative_base()

def get_utc_now():
    return datetime.now(timezone.utc)

class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(150), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    domain = Column(String(150), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)

    # Stripe SaaS Billing & 14-Day Trial ($2/user/month)
    stripe_customer_id = Column(String(255), nullable=True, index=True)
    stripe_subscription_id = Column(String(255), nullable=True, index=True)
    subscription_status = Column(String(50), default="trialing", nullable=False) # trialing, active, past_due, canceled, incomplete
    trial_ends_at = Column(DateTime(timezone=True), nullable=True)
    subscription_current_period_end = Column(DateTime(timezone=True), nullable=True)
    subscription_seat_count = Column(Integer, default=1, nullable=False)

    users = relationship("User", back_populates="tenant", cascade="all, delete-orphan")
    offices = relationship("Office", back_populates="tenant", cascade="all, delete-orphan")
    attendance_records = relationship("AttendanceRecord", back_populates="tenant")

class Office(Base):
    __tablename__ = "offices"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    radius_meters = Column(Integer, default=200, nullable=False)
    address = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)

    tenant = relationship("Tenant", back_populates="offices")
    users = relationship("User", back_populates="office")

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    email = Column(String(255), nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(150), nullable=False)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    department = Column(String(100), nullable=True)
    designation = Column(String(100), nullable=True)
    phone_number = Column(String(30), nullable=True)
    employee_code = Column(String(50), nullable=False, index=True)
    role = Column(String(20), default="employee", nullable=False) # super_admin, admin, manager, employee
    office_id = Column(UUID(as_uuid=True), ForeignKey("offices.id"), nullable=True)
    manager_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    default_work_mode = Column(String(20), default="on_site", nullable=False) # on_site, remote
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)

    __table_args__ = (
        UniqueConstraint("tenant_id", "email", name="uq_tenant_user_email"),
        UniqueConstraint("tenant_id", "employee_code", name="uq_tenant_user_employee_code"),
    )

    tenant = relationship("Tenant", back_populates="users")
    office = relationship("Office", back_populates="users")
    manager = relationship("User", remote_side=[id], foreign_keys=[manager_id])
    biometric_profile = relationship("BiometricProfile", back_populates="user", uselist=False)
    devices = relationship("UserDevice", back_populates="user")
    attendance_records = relationship("AttendanceRecord", back_populates="user")
    leaves = relationship("Leave", back_populates="user", foreign_keys="[Leave.user_id]")

class BiometricProfile(Base):
    __tablename__ = "biometric_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    embedding = Column(Vector(512), nullable=False)
    reference_photo_url = Column(Text, nullable=True)
    is_verified = Column(Boolean, default=True, nullable=False)
    enrolled_at = Column(DateTime(timezone=True), default=get_utc_now)

    user = relationship("User", back_populates="biometric_profile")

class UserDevice(Base):
    __tablename__ = "user_devices"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    device_id = Column(String(255), nullable=False)
    device_model = Column(String(100), nullable=True)
    os_name = Column(String(50), nullable=True)
    os_version = Column(String(50), nullable=True)
    app_version = Column(String(50), nullable=True)
    refresh_token_hash = Column(String(255), nullable=False)
    refresh_token_expires_at = Column(DateTime(timezone=True), nullable=False)
    is_trusted = Column(Boolean, default=True, nullable=False)
    last_active_at = Column(DateTime(timezone=True), default=get_utc_now)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)

    __table_args__ = (
        UniqueConstraint("user_id", "device_id", name="uq_user_device"),
    )

    user = relationship("User", back_populates="devices")

class WorkModeOverride(Base):
    __tablename__ = "work_mode_overrides"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    effective_date = Column(Date, nullable=False)
    assigned_mode = Column(String(20), nullable=False) # on_site, remote
    reason = Column(Text, nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)

    __table_args__ = (
        UniqueConstraint("user_id", "effective_date", name="uq_user_effective_date"),
    )

class FaceScanInvite(Base):
    __tablename__ = "face_scan_invites"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    invite_token = Column(String(255), unique=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)

class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    check_in_time = Column(DateTime(timezone=True), nullable=False)
    check_out_time = Column(DateTime(timezone=True), nullable=True)
    verification_type = Column(String(20), nullable=False) # face_geo, face_remote
    status = Column(String(20), default="present", nullable=False) # present, late, half_day, absent
    similarity_score = Column(Float, nullable=False)
    liveness_score = Column(Float, nullable=False)
    device_id = Column(UUID(as_uuid=True), ForeignKey("user_devices.id"), nullable=True)
    check_in_latitude = Column(Float, nullable=True)
    check_in_longitude = Column(Float, nullable=True)
    distance_from_office_meters = Column(Float, nullable=True)
    snapshot_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)

    __table_args__ = (
        UniqueConstraint("user_id", "date", name="uq_user_attendance_date"),
    )

    tenant = relationship("Tenant", back_populates="attendance_records")
    user = relationship("User", back_populates="attendance_records")

class Leave(Base):
    __tablename__ = "leaves"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(30), default="pending_manager", nullable=False) # pending_manager, pending_admin, approved, rejected
    approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True) # legacy/final
    level1_approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    level1_approved_at = Column(DateTime(timezone=True), nullable=True)
    level2_approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    level2_approved_at = Column(DateTime(timezone=True), nullable=True)
    admin_bypassed = Column(Boolean, default=False, nullable=False)
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)

    user = relationship("User", back_populates="leaves", foreign_keys=[user_id])

class AttendanceRequest(Base):
    __tablename__ = "attendance_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    check_in_time = Column(DateTime(timezone=True), nullable=False)
    check_out_time = Column(DateTime(timezone=True), nullable=True)
    reason = Column(Text, nullable=False)
    status = Column(String(20), default="pending", nullable=False) # pending, approved, rejected
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    reviewer_note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)

    user = relationship("User", foreign_keys=[user_id])

