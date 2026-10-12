from datetime import date
from typing import Tuple, Optional
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.models import User, WorkModeOverride, Office

async def resolve_effective_work_mode(
    db: AsyncSession,
    user_id: uuid.UUID,
    target_date: date
) -> Tuple[str, Optional[str], Optional[Office]]:
    """
    Determines effective work mode for an employee on a given date:
    1. Checks if a date-specific override exists in work_mode_overrides.
    2. If found, returns (override.assigned_mode, override.reason, user.office).
    3. If none, falls back to (user.default_work_mode, None, user.office).
    """
    # 1. Fetch user and office
    user_res = await db.execute(select(User).where(User.id == user_id))
    user = user_res.scalar_one_or_none()
    if not user:
        raise ValueError("User not found")

    office = None
    if user.office_id:
        off_res = await db.execute(select(Office).where(Office.id == user.office_id))
        office = off_res.scalar_one_or_none()

    # 2. Check override for target_date
    override_res = await db.execute(
        select(WorkModeOverride).where(
            WorkModeOverride.user_id == user_id,
            WorkModeOverride.effective_date == target_date
        )
    )
    override = override_res.scalar_one_or_none()

    if override:
        return override.assigned_mode, override.reason, office

    return user.default_work_mode, None, office
