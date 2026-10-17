import uuid
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from datetime import datetime, timezone
from app.models.models import User, Tenant
from app.core.security import decode_access_token

security_scheme = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    user_id_str = payload.get("sub")
    try:
        user_uuid = uuid.UUID(user_id_str)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user ID in token")

    result = await db.execute(select(User).where(User.id == user_uuid))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user account")

    # Verify organization tenant is active
    tenant_res = await db.execute(select(Tenant).where(Tenant.id == user.tenant_id))
    tenant = tenant_res.scalar_one_or_none()
    if not tenant or not tenant.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Organization account is suspended or inactive."
        )

    return user

async def get_current_tenant_id(
    current_user: User = Depends(get_current_user)
) -> uuid.UUID:
    return current_user.tenant_id

async def require_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    if current_user.role not in ("super_admin", "admin", "manager"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to management administrators"
        )
    return current_user

async def require_active_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Enforces active Stripe SaaS subscription or unexpired 14-day free trial.
    """
    tenant_res = await db.execute(select(Tenant).where(Tenant.id == current_user.tenant_id))
    tenant = tenant_res.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=404, detail="Organization not found")

    status_str = (tenant.subscription_status or "trialing").lower()
    if status_str == "active":
        return current_user

    if status_str == "trialing":
        if tenant.trial_ends_at:
            now_utc = datetime.now(timezone.utc)
            if tenant.trial_ends_at < now_utc:
                raise HTTPException(
                    status_code=status.HTTP_402_PAYMENT_REQUIRED,
                    detail="Organization 14-day free trial has expired. An administrator must activate a subscription in Billing."
                )
        return current_user

    # Past due or canceled
    raise HTTPException(
        status_code=status.HTTP_402_PAYMENT_REQUIRED,
        detail=f"Organization subscription is {status_str}. Please update payment method in Billing to continue."
    )

