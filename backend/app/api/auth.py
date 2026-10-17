from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
import re
import secrets
from app.models.models import User, UserDevice, Tenant, Office
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    hash_token
)
from app.core.config import settings
from app.schemas.auth import (
    LoginRequest,
    RefreshTokenRequest,
    UserRegisterRequest,
    UserResponse,
    TokenResponse,
    DeviceTelemetry
)
from app.schemas.tenant import TenantSignupRequest
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/tenant/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup_tenant(req: TenantSignupRequest, db: AsyncSession = Depends(get_db)):
    """
    Organization / Management Signup.
    Creates a new Tenant, default Office, and the Organization Administrator.
    """
    clean_name = req.company_name.strip()
    if not clean_name:
        raise HTTPException(status_code=400, detail="Company name is required")

    # Generate unique slug
    base_slug = re.sub(r'[^a-z0-9]+', '-', clean_name.lower()).strip('-')
    if not base_slug:
        base_slug = "org"
    slug = base_slug
    idx = 1
    while True:
        existing_slug = await db.execute(select(Tenant).where(Tenant.slug == slug))
        if not existing_slug.scalar_one_or_none():
            break
        slug = f"{base_slug}-{idx}"
        idx += 1

    # Create Tenant
    tenant = Tenant(
        name=clean_name,
        slug=slug,
        is_active=True
    )
    db.add(tenant)
    await db.flush()

    # Create Initial Office
    office = Office(
        tenant_id=tenant.id,
        name=req.office_name or "Headquarters",
        latitude=req.office_latitude if req.office_latitude is not None else 24.8607,
        longitude=req.office_longitude if req.office_longitude is not None else 67.0011,
        radius_meters=req.office_radius_meters or 200,
        address=req.office_address or "Main Campus"
    )
    db.add(office)
    await db.flush()

    # Check if admin email exists in this tenant
    existing_user = await db.execute(
        select(User).where(User.tenant_id == tenant.id, User.email == req.admin_email)
    )
    if existing_user.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered in this organization")

    # Create Admin User
    admin_user = User(
        tenant_id=tenant.id,
        email=req.admin_email.strip().lower(),
        password_hash=hash_password(req.admin_password),
        full_name=req.admin_name.strip(),
        employee_code=f"ADM-{secrets.randbelow(9000) + 1000}",
        role="admin",
        default_work_mode="on_site",
        office_id=office.id,
        is_active=True
    )
    db.add(admin_user)
    await db.flush()

    # Generate Tokens with Tenant Scoping
    access_token = create_access_token({
        "sub": str(admin_user.id),
        "tenant_id": str(tenant.id),
        "email": admin_user.email,
        "role": admin_user.role
    })
    raw_refresh_token, refresh_hash, refresh_expires_at = create_refresh_token(
        expires_days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )

    # Bind web device session
    now_utc = datetime.now(timezone.utc)
    web_device = UserDevice(
        user_id=admin_user.id,
        device_id=f"web-{admin_user.id}",
        device_model="Web Portal",
        os_name="Web",
        os_version="1.0",
        app_version="1.0.0",
        refresh_token_hash=refresh_hash,
        refresh_token_expires_at=refresh_expires_at,
        last_active_at=now_utc,
        is_trusted=True
    )
    db.add(web_device)
    await db.commit()
    await db.refresh(admin_user)

    return TokenResponse(
        access_token=access_token,
        refresh_token=raw_refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(admin_user)
    )

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(req: UserRegisterRequest, db: AsyncSession = Depends(get_db)):
    clean_email = req.email.strip().lower()

    # Find or default tenant
    tenant_res = await db.execute(select(Tenant).order_by(Tenant.created_at.asc()).limit(1))
    default_tenant = tenant_res.scalar_one_or_none()
    if not default_tenant:
        default_tenant = Tenant(name="Primary Organization", slug="primary-org", is_active=True)
        db.add(default_tenant)
        await db.flush()

    # Find or default office
    office_id = req.office_id
    if not office_id:
        office_res = await db.execute(select(Office).where(Office.tenant_id == default_tenant.id).limit(1))
        found_off = office_res.scalar_one_or_none()
        if not found_off:
            found_off = Office(
                tenant_id=default_tenant.id,
                name="Headquarters",
                latitude=37.7749,
                longitude=-122.4194,
                radius_meters=200
            )
            db.add(found_off)
            await db.flush()
        office_id = found_off.id

    # Check existing email in tenant
    existing = await db.execute(select(User).where(User.tenant_id == default_tenant.id, User.email == clean_email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="User with this email already registered in organization")

    new_user = User(
        tenant_id=default_tenant.id,
        email=clean_email,
        password_hash=hash_password(req.password),
        full_name=req.full_name.strip(),
        employee_code=req.employee_code.strip(),
        role=req.role or "employee",
        default_work_mode=req.default_work_mode or "on_site",
        office_id=office_id,
        is_active=True
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    # Find user by email
    res = await db.execute(select(User).where(User.email == req.email.strip().lower()))
    users = res.scalars().all()
    if not users:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Check credentials against matching users (tenant isolated)
    authenticated_user = None
    for u in users:
        if verify_password(req.password, u.password_hash):
            authenticated_user = u
            break

    if not authenticated_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    if not authenticated_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )

    user = authenticated_user

    # Generate 15-minute access token and 7-day refresh token scoped to tenant
    access_token = create_access_token({
        "sub": str(user.id),
        "tenant_id": str(user.tenant_id),
        "email": user.email,
        "role": user.role
    })
    raw_refresh_token, refresh_hash, refresh_expires_at = create_refresh_token(
        expires_days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )

    device_info = req.device or DeviceTelemetry(
        device_id=f"web-{user.id}",
        device_model="Web Browser",
        os_name="Web",
        os_version="1.0",
        app_version="1.0.0"
    )

    # Upsert device binding
    device_res = await db.execute(
        select(UserDevice).where(
            UserDevice.user_id == user.id,
            UserDevice.device_id == device_info.device_id
        )
    )
    device_record = device_res.scalar_one_or_none()
    now_utc = datetime.now(timezone.utc)

    if device_record:
        if not device_record.is_trusted:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This device has been untrusted or revoked. Access denied for security."
            )
        device_record.device_model = device_info.device_model or device_record.device_model
        device_record.os_name = device_info.os_name or device_record.os_name
        device_record.os_version = device_info.os_version or device_record.os_version
        device_record.app_version = device_info.app_version or device_record.app_version
        device_record.refresh_token_hash = refresh_hash
        device_record.refresh_token_expires_at = refresh_expires_at
        device_record.last_active_at = now_utc
    else:
        device_record = UserDevice(
            user_id=user.id,
            device_id=device_info.device_id,
            device_model=device_info.device_model,
            os_name=device_info.os_name,
            os_version=device_info.os_version,
            app_version=device_info.app_version,
            refresh_token_hash=refresh_hash,
            refresh_token_expires_at=refresh_expires_at,
            last_active_at=now_utc,
            is_trusted=True
        )
        db.add(device_record)

    await db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=raw_refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user)
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_tokens(req: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    incoming_hash = hash_token(req.refresh_token)
    device_res = await db.execute(
        select(UserDevice).where(
            UserDevice.device_id == req.device_id,
            UserDevice.refresh_token_hash == incoming_hash
        )
    )
    device = device_res.scalar_one_or_none()
    if not device:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token or device"
        )

    if not device.is_trusted:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Device session has been revoked for security reasons."
        )

    now_utc = datetime.now(timezone.utc)
    if device.refresh_token_expires_at < now_utc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired, please login again"
        )

    user_res = await db.execute(select(User).where(User.id == device.user_id))
    user = user_res.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not active")

    # Rotate refresh token and generate new access token
    new_access_token = create_access_token({
        "sub": str(user.id),
        "tenant_id": str(user.tenant_id),
        "email": user.email,
        "role": user.role
    })
    new_raw_refresh, new_refresh_hash, new_expires_at = create_refresh_token(
        expires_days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )

    device.refresh_token_hash = new_refresh_hash
    device.refresh_token_expires_at = new_expires_at
    device.last_active_at = now_utc
    await db.commit()

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_raw_refresh,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)

@router.get("/devices")
async def list_user_devices(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all registered devices and session statuses for current user."""
    res = await db.execute(
        select(UserDevice)
        .where(UserDevice.user_id == current_user.id)
        .order_by(UserDevice.last_active_at.desc())
    )
    devices = res.scalars().all()
    return [
        {
            "id": str(d.id),
            "device_id": d.device_id,
            "device_model": d.device_model,
            "os_name": d.os_name,
            "os_version": d.os_version,
            "app_version": d.app_version,
            "is_trusted": d.is_trusted,
            "last_active_at": d.last_active_at.isoformat() if d.last_active_at else None,
            "created_at": d.created_at.isoformat() if d.created_at else None
        }
        for d in devices
    ]

@router.post("/devices/{device_id}/revoke")
async def revoke_device_session(
    device_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Revoke and invalidate session for a specific device."""
    res = await db.execute(
        select(UserDevice).where(
            UserDevice.user_id == current_user.id,
            UserDevice.device_id == device_id
        )
    )
    device = res.scalar_one_or_none()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    device.is_trusted = False
    await db.commit()
    return {"status": "success", "message": f"Device {device_id} session revoked successfully."}

@router.post("/devices/revoke-all-others")
async def revoke_all_other_devices(
    current_device_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Revoke all sessions on other devices for security containment."""
    res = await db.execute(
        select(UserDevice).where(
            UserDevice.user_id == current_user.id,
            UserDevice.device_id != current_device_id
        )
    )
    other_devices = res.scalars().all()
    for d in other_devices:
        d.is_trusted = False

    await db.commit()
    return {
        "status": "success",
        "revoked_count": len(other_devices),
        "message": f"Revoked {len(other_devices)} other active device sessions."
    }

@router.delete("/me", status_code=status.HTTP_200_OK)
@router.delete("/delete-account", status_code=status.HTTP_200_OK)
async def delete_my_account(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Self-serve account deletion for Apple App Store Guideline 5.1.1(v) compliance.
    Permanently deletes the user's account, 512D ArcFace biometric embedding,
    registered device sessions, and associated attendance history.
    """
    from app.services.stripe_service import sync_subscription_seats
    from app.models.models import Leave, AttendanceRequest, WorkModeOverride

    user_id = current_user.id
    tenant_id = current_user.tenant_id

    # Check if this user is a manager or approver on any leaves/requests and nullify references
    await db.execute(
        select(Leave).where(
            (Leave.approved_by == user_id) |
            (Leave.level1_approved_by == user_id) |
            (Leave.level2_approved_by == user_id)
        )
    )
    from sqlalchemy import update, delete
    from app.models.models import BiometricProfile, AttendanceRecord, FaceScanInvite, WorkModeOverride

    # Explicitly remove child records to avoid nullification or constraint errors
    await db.execute(delete(UserDevice).where(UserDevice.user_id == user_id))
    await db.execute(delete(BiometricProfile).where(BiometricProfile.user_id == user_id))
    await db.execute(delete(AttendanceRecord).where(AttendanceRecord.user_id == user_id))
    await db.execute(delete(Leave).where(Leave.user_id == user_id))
    await db.execute(delete(AttendanceRequest).where(AttendanceRequest.user_id == user_id))
    await db.execute(delete(FaceScanInvite).where(FaceScanInvite.user_id == user_id))
    await db.execute(delete(WorkModeOverride).where(WorkModeOverride.user_id == user_id))

    # Nullify approver/creator links on other users' records
    await db.execute(
        update(Leave)
        .where(Leave.approved_by == user_id)
        .values(approved_by=None)
    )
    await db.execute(
        update(Leave)
        .where(Leave.level1_approved_by == user_id)
        .values(level1_approved_by=None)
    )
    await db.execute(
        update(Leave)
        .where(Leave.level2_approved_by == user_id)
        .values(level2_approved_by=None)
    )
    await db.execute(
        update(AttendanceRequest)
        .where(AttendanceRequest.reviewed_by == user_id)
        .values(reviewed_by=None)
    )
    await db.execute(
        update(WorkModeOverride)
        .where(WorkModeOverride.created_by == user_id)
        .values(created_by=None)
    )
    await db.execute(
        update(User)
        .where(User.manager_id == user_id)
        .values(manager_id=None)
    )

    # Check if user is the sole admin or if there are other users
    all_users_res = await db.execute(select(User).where(User.tenant_id == tenant_id))
    all_users = all_users_res.scalars().all()

    is_sole_user = len(all_users) <= 1
    tenant_res = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    tenant = tenant_res.scalar_one_or_none()

    # Delete the user record
    await db.delete(current_user)
    await db.commit()

    # If this was the sole user of the organization, deactivate or delete the tenant
    if is_sole_user and tenant:
        tenant.is_active = False
        tenant.subscription_status = "canceled"
        await db.commit()
    elif tenant and tenant.stripe_subscription_id:
        try:
            await sync_subscription_seats(tenant, db)
        except Exception:
            pass

    return {
        "status": "success",
        "message": "Your account, personal data, and biometric face profiles have been permanently deleted."
    }

