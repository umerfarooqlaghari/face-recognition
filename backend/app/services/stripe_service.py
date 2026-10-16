import stripe
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.config import settings
from app.models.models import Tenant, User

logger = logging.getLogger(__name__)

# Price: $2.00 USD per employee per month
PER_SEAT_PRICE_CENTS = 200

def init_stripe():
    if settings.STRIPE_SECRET_KEY:
        stripe.api_key = settings.STRIPE_SECRET_KEY

async def get_or_create_stripe_price_id() -> str:
    """
    Retrieves the configured Stripe Price ID, or dynamically ensures a $2/user/month
    per-seat recurring price exists in Stripe.
    """
    init_stripe()
    if settings.STRIPE_PRICE_ID:
        return settings.STRIPE_PRICE_ID

    # Look for existing Product & Price
    try:
        products = stripe.Product.list(active=True, limit=10)
        saas_product = None
        for p in products.data:
            if p.name == "Face Attendance SaaS Plan":
                saas_product = p
                break

        if not saas_product:
            saas_product = stripe.Product.create(
                name="Face Attendance SaaS Plan",
                description="Enterprise Face Verification Attendance Platform ($2/user/month with 14-day free trial)",
                metadata={"app": "face_recognition_attendance"}
            )

        prices = stripe.Price.list(product=saas_product.id, active=True, limit=10)
        for pr in prices.data:
            if pr.unit_amount == PER_SEAT_PRICE_CENTS and pr.recurring and pr.recurring.interval == "month":
                return pr.id

        # Create $2/month recurring price
        new_price = stripe.Price.create(
            product=saas_product.id,
            unit_amount=PER_SEAT_PRICE_CENTS,
            currency="usd",
            recurring={"interval": "month"},
            metadata={"description": "$2 per user per month"}
        )
        return new_price.id
    except Exception as e:
        logger.error(f"Error fetching/creating Stripe Price: {e}")
        raise e

async def create_checkout_session(
    tenant: Tenant,
    user: User,
    seat_count: int,
    db: AsyncSession
) -> Dict[str, Any]:
    """
    Creates a Stripe Checkout Session for the organization:
    - 14-day free trial
    - $2 USD per active employee/user per month
    """
    init_stripe()
    price_id = await get_or_create_stripe_price_id()

    # Determine seat count (minimum 1)
    effective_seats = max(int(seat_count), 1)

    customer_id = tenant.stripe_customer_id
    if not customer_id:
        try:
            customer = stripe.Customer.create(
                email=user.email,
                name=tenant.name,
                metadata={"tenant_id": str(tenant.id), "slug": tenant.slug}
            )
            customer_id = customer.id
            tenant.stripe_customer_id = customer_id
            await db.commit()
        except Exception as e:
            logger.warning(f"Could not pre-create Stripe customer: {e}")

    session_params: Dict[str, Any] = {
        "mode": "subscription",
        "line_items": [
            {
                "price": price_id,
                "quantity": effective_seats,
            }
        ],
        "subscription_data": {
            "trial_period_days": 14,
            "metadata": {
                "tenant_id": str(tenant.id),
                "seat_count": str(effective_seats)
            }
        },
        "metadata": {
            "tenant_id": str(tenant.id),
            "user_id": str(user.id),
            "seat_count": str(effective_seats)
        },
        "client_reference_id": str(tenant.id),
        "success_url": f"{settings.FRONTEND_URL}/?billing=success&session_id={{CHECKOUT_SESSION_ID}}",
        "cancel_url": f"{settings.FRONTEND_URL}/?billing=canceled",
    }

    if customer_id:
        session_params["customer"] = customer_id
    else:
        session_params["customer_email"] = user.email

    checkout_session = stripe.checkout.Session.create(**session_params)
    return {
        "checkout_url": checkout_session.url,
        "session_id": checkout_session.id,
        "seats": effective_seats,
        "price_per_seat": 2.00,
        "trial_days": 14
    }

async def create_portal_session(tenant: Tenant) -> Dict[str, Any]:
    """
    Creates a Stripe Customer Billing Portal Session for managing invoices,
    payment cards, and cancellation.
    """
    init_stripe()
    if not tenant.stripe_customer_id:
        raise ValueError("Organization has not initiated a Stripe subscription yet.")

    portal_session = stripe.billing_portal.Session.create(
        customer=tenant.stripe_customer_id,
        return_url=f"{settings.FRONTEND_URL}/"
    )
    return {"portal_url": portal_session.url}

async def sync_subscription_seats(tenant: Tenant, db: AsyncSession) -> Optional[int]:
    """
    Automatically recalculates the organization's workforce count and updates
    the Stripe subscription quantity ($2/employee).
    """
    init_stripe()
    if not tenant.stripe_subscription_id:
        return None

    # Count active employees in organization
    res = await db.execute(
        select(func.count(User.id)).where(User.tenant_id == tenant.id, User.is_active == True)
    )
    count = res.scalar() or 1
    effective_seats = max(count, 1)

    tenant.subscription_seat_count = effective_seats
    await db.commit()

    try:
        sub = stripe.Subscription.retrieve(tenant.stripe_subscription_id)
        if sub and sub.get("items") and sub["items"].get("data"):
            item_id = sub["items"]["data"][0]["id"]
            stripe.SubscriptionItem.modify(item_id, quantity=effective_seats)
            logger.info(f"Updated Stripe subscription {tenant.stripe_subscription_id} to {effective_seats} seats")
    except Exception as e:
        logger.error(f"Failed to sync subscription seats with Stripe: {e}")

    return effective_seats

async def handle_stripe_webhook_event(payload: bytes, sig_header: str, db: AsyncSession) -> Dict[str, Any]:
    """
    Processes verified Stripe Webhook events and syncs tenant subscription lifecycle:
    - checkout.session.completed
    - customer.subscription.updated / created
    - customer.subscription.deleted
    - invoice.payment_succeeded / payment_failed
    """
    init_stripe()
    webhook_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        if webhook_secret and webhook_secret != "whsec_placeholder":
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        else:
            # Fallback for dev mode when testing without signature verification
            import json
            event = json.loads(payload.decode("utf-8"))
    except Exception as e:
        logger.error(f"Stripe Webhook Signature Verification Failed: {e}")
        raise ValueError(f"Webhook error: {str(e)}")

    event_type = event.get("type")
    data_object = event.get("data", {}).get("object", {})

    logger.info(f"Received Stripe Webhook Event: {event_type}")

    if event_type == "checkout.session.completed":
        session = data_object
        tenant_id = session.get("client_reference_id") or session.get("metadata", {}).get("tenant_id")
        customer_id = session.get("customer")
        subscription_id = session.get("subscription")

        if tenant_id:
            import uuid
            t_uuid = uuid.UUID(tenant_id)
            tenant_res = await db.execute(select(Tenant).where(Tenant.id == t_uuid))
            tenant = tenant_res.scalar_one_or_none()
            if tenant:
                tenant.stripe_customer_id = customer_id
                tenant.stripe_subscription_id = subscription_id
                tenant.subscription_status = "active"

                # Check subscription details for trial
                if subscription_id:
                    try:
                        sub = stripe.Subscription.retrieve(subscription_id)
                        tenant.subscription_status = sub.get("status", "active")
                        if sub.get("trial_end"):
                            tenant.trial_ends_at = datetime.fromtimestamp(sub["trial_end"], tz=timezone.utc)
                        if sub.get("current_period_end"):
                            tenant.subscription_current_period_end = datetime.fromtimestamp(sub["current_period_end"], tz=timezone.utc)
                    except Exception as err:
                        logger.warning(f"Could not fetch subscription details on checkout: {err}")

                await db.commit()
                logger.info(f"Tenant {tenant.id} successfully subscribed via Stripe Session {session.get('id')}")

    elif event_type in ("customer.subscription.created", "customer.subscription.updated"):
        sub = data_object
        sub_id = sub.get("id")
        customer_id = sub.get("customer")
        status = sub.get("status")
        trial_end = sub.get("trial_end")
        current_period_end = sub.get("current_period_end")

        # Find tenant by subscription ID or customer ID
        tenant_res = await db.execute(
            select(Tenant).where((Tenant.stripe_subscription_id == sub_id) | (Tenant.stripe_customer_id == customer_id))
        )
        tenant = tenant_res.scalar_one_or_none()
        if tenant:
            tenant.stripe_subscription_id = sub_id
            tenant.subscription_status = status
            if trial_end:
                tenant.trial_ends_at = datetime.fromtimestamp(trial_end, tz=timezone.utc)
            if current_period_end:
                tenant.subscription_current_period_end = datetime.fromtimestamp(current_period_end, tz=timezone.utc)
            await db.commit()
            logger.info(f"Tenant {tenant.id} subscription status updated to '{status}'")

    elif event_type == "customer.subscription.deleted":
        sub = data_object
        sub_id = sub.get("id")
        tenant_res = await db.execute(select(Tenant).where(Tenant.stripe_subscription_id == sub_id))
        tenant = tenant_res.scalar_one_or_none()
        if tenant:
            tenant.subscription_status = "canceled"
            await db.commit()
            logger.info(f"Tenant {tenant.id} subscription canceled.")

    elif event_type == "invoice.payment_succeeded":
        invoice = data_object
        sub_id = invoice.get("subscription")
        if sub_id:
            tenant_res = await db.execute(select(Tenant).where(Tenant.stripe_subscription_id == sub_id))
            tenant = tenant_res.scalar_one_or_none()
            if tenant:
                tenant.subscription_status = "active"
                await db.commit()

    elif event_type == "invoice.payment_failed":
        invoice = data_object
        sub_id = invoice.get("subscription")
        if sub_id:
            tenant_res = await db.execute(select(Tenant).where(Tenant.stripe_subscription_id == sub_id))
            tenant = tenant_res.scalar_one_or_none()
            if tenant:
                tenant.subscription_status = "past_due"
                await db.commit()

    return {"status": "success", "event": event_type}
