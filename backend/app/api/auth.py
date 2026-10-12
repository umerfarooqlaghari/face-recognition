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
        employee_code="ADM-001",
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
