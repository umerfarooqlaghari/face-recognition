from fastapi import APIRouter, Depends, HTTPException, Request, Header, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timezone
from app.db.session import get_db
from app.models.models import User, Tenant
from app.api.deps import get_current_user
from app.services.stripe_service import (
    create_checkout_session,
    create_portal_session,
    handle_stripe_webhook_event
)

router = APIRouter(prefix="/billing", tags=["Billing & Stripe Subscriptions"])

@router.get("/subscription-status")
async def get_subscription_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns the organization's current SaaS subscription & 14-day trial details.
    """
    tenant_res = await db.execute(select(Tenant).where(Tenant.id == current_user.tenant_id))
    tenant = tenant_res.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=404, detail="Organization not found")

    # Count total active staff members for this tenant
    count_res = await db.execute(
        select(func.count(User.id)).where(User.tenant_id == tenant.id, User.is_active == True)
    )
    seat_count = count_res.scalar() or 1

    trial_days_remaining = None
    if tenant.trial_ends_at:
        now = datetime.now(timezone.utc)
        diff = (tenant.trial_ends_at - now).total_seconds()
        trial_days_remaining = max(int(diff // 86400), 0)

    return {
        "tenant_id": str(tenant.id),
        "tenant_name": tenant.name,
        "subscription_status": tenant.subscription_status or "trialing",
        "seat_count": seat_count,
        "price_per_user_usd": 2.00,
        "estimated_monthly_usd": seat_count * 2.00,
        "trial_ends_at": tenant.trial_ends_at.isoformat() if tenant.trial_ends_at else None,
        "trial_days_remaining": trial_days_remaining,
        "current_period_end": tenant.subscription_current_period_end.isoformat() if tenant.subscription_current_period_end else None,
        "has_stripe_subscription": bool(tenant.stripe_subscription_id),
        "has_stripe_customer": bool(tenant.stripe_customer_id),
    }

@router.post("/create-checkout-session")
async def start_checkout_session(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Initiates a Stripe Checkout Session for $2/user/month with a 14-day free trial.
    Only admin or super_admin can manage billing.
    """
    if current_user.role not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Only organization administrators can manage billing")

    tenant_res = await db.execute(select(Tenant).where(Tenant.id == current_user.tenant_id))
    tenant = tenant_res.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=404, detail="Organization not found")

    # Determine seat count
    count_res = await db.execute(
        select(func.count(User.id)).where(User.tenant_id == tenant.id, User.is_active == True)
    )
    seat_count = count_res.scalar() or 1

    try:
        session_data = await create_checkout_session(
            tenant=tenant,
            user=current_user,
            seat_count=seat_count,
            db=db
        )
        return session_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate checkout session: {str(e)}")

@router.post("/create-portal-session")
async def start_portal_session(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generates a secure Stripe Customer Billing Portal session URL to manage
    stored cards, view invoices, or cancel/modify subscription.
    """
    if current_user.role not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Only organization administrators can access customer portal")

    tenant_res = await db.execute(select(Tenant).where(Tenant.id == current_user.tenant_id))
    tenant = tenant_res.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=404, detail="Organization not found")

    try:
        portal_data = await create_portal_session(tenant=tenant)
        return portal_data
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate customer portal session: {str(e)}")

@router.post("/webhook", status_code=status.HTTP_200_OK)
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="Stripe-Signature"),
    db: AsyncSession = Depends(get_db)
):
    """
    Stripe Webhook Endpoint.
    Listens for subscription, trial, and invoice lifecycle events.
    """
    payload = await request.body()
    try:
        result = await handle_stripe_webhook_event(
            payload=payload,
            sig_header=stripe_signature or "",
            db=db
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Webhook processing error: {str(e)}")
