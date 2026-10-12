from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.models import User, UserDevice
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
    TokenResponse
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(req: UserRegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check if email exists
    existing_email = await db.execute(select(User).where(User.email == req.email))
    if existing_email.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Check if employee code exists
    existing_code = await db.execute(select(User).where(User.employee_code == req.employee_code))
    if existing_code.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Employee code already in use")

    new_user = User(
        email=req.email,
        password_hash=hash_password(req.password),
        full_name=req.full_name,
        employee_code=req.employee_code,
        role=req.role or "employee",
        default_work_mode=req.default_work_mode or "on_site",
        office_id=req.office_id
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    # Find user by email
    res = await db.execute(select(User).where(User.email == req.email))
    user = res.scalar_one_or_none()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )

    # Generate 15-minute access token and 7-day refresh token
    access_token = create_access_token({
        "sub": str(user.id),
        "email": user.email,
        "role": user.role
    })
    raw_refresh_token, refresh_hash, refresh_expires_at = create_refresh_token(
        expires_days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )

    # Upsert or update device binding
    device_res = await db.execute(
        select(UserDevice).where(
            UserDevice.user_id == user.id,
            UserDevice.device_id == req.device.device_id
        )
    )
    device_record = device_res.scalar_one_or_none()
    now_utc = datetime.now(timezone.utc)

    if device_record:
        device_record.device_model = req.device.device_model or device_record.device_model
        device_record.os_name = req.device.os_name or device_record.os_name
        device_record.os_version = req.device.os_version or device_record.os_version
        device_record.app_version = req.device.app_version or device_record.app_version
        device_record.refresh_token_hash = refresh_hash
        device_record.refresh_token_expires_at = refresh_expires_at
        device_record.last_active_at = now_utc
    else:
        device_record = UserDevice(
            user_id=user.id,
            device_id=req.device.device_id,
            device_model=req.device.device_model,
            os_name=req.device.os_name,
            os_version=req.device.os_version,
            app_version=req.device.app_version,
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
