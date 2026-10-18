import logging
from datetime import datetime, date, time, timedelta, timezone
from typing import Dict, Any, Optional, Tuple, List
import calendar

try:
    from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
except ImportError:
    from backports.zoneinfo import ZoneInfo, ZoneInfoNotFoundError  # type: ignore

from app.models.models import User, Office, Tenant

logger = logging.getLogger("timing_service")

# Common enterprise timezones for convenience and selection
COMMON_TIMEZONES = [
    "UTC",
    "Asia/Karachi",
    "Asia/Dubai",
    "Asia/Riyadh",
    "Asia/Kolkata",
    "Asia/Singapore",
    "Asia/Tokyo",
    "Europe/London",
    "Europe/Berlin",
    "Europe/Paris",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Australia/Sydney"
]

def get_safe_zoneinfo(tz_name: Optional[str]) -> ZoneInfo:
    """Return a valid ZoneInfo instance, falling back safely to UTC if invalid."""
    if not tz_name or not tz_name.strip():
        return ZoneInfo("UTC")
    try:
        return ZoneInfo(tz_name.strip())
    except (ZoneInfoNotFoundError, Exception):
        logger.warning(f"Unknown timezone '{tz_name}'. Falling back to UTC.")
        return ZoneInfo("UTC")

def parse_time_str(time_str: Optional[str], default_hour: int = 9, default_minute: int = 0) -> Tuple[int, int]:
    """Parse 'HH:MM' string to (hour, minute)."""
    if not time_str or ":" not in str(time_str):
        return default_hour, default_minute
    try:
        parts = str(time_str).strip().split(":")
        h = max(0, min(23, int(parts[0])))
        m = max(0, min(59, int(parts[1])))
        return h, m
    except Exception:
        return default_hour, default_minute

def resolve_employee_shift_config(
    user: User,
    office: Optional[Office] = None,
    tenant: Optional[Tenant] = None
) -> Dict[str, Any]:
    """
    Resolves the working hours, grace period, and regional timezone for an employee.
    Hierarchy:
      1. User-level manual custom shift (e.g., Night Shift, specific timings)
      2. Office-level regional timings (e.g., London 09:00-17:30, Karachi 09:00-18:00)
      3. Tenant-level organization defaults (fallback)
    """
    # 1. Custom User Override
    if user.custom_work_start_time:
        start_time = user.custom_work_start_time
        end_time = user.custom_work_end_time or (office.work_end_time if office else (tenant.default_work_end_time if tenant else "18:00"))
        
        # Grace period
        if user.custom_grace_period_minutes is not None:
            grace_period = user.custom_grace_period_minutes
        elif office and office.grace_period_minutes is not None:
            grace_period = office.grace_period_minutes
        elif tenant and tenant.default_grace_period_minutes is not None:
            grace_period = tenant.default_grace_period_minutes
        else:
            grace_period = 15

        # Timezone
        if user.custom_timezone:
            tz_str = user.custom_timezone
        elif office and office.timezone:
            tz_str = office.timezone
        elif tenant and tenant.default_timezone:
            tz_str = tenant.default_timezone
        else:
            tz_str = "UTC"

        shift_name = user.shift_name or "Custom Shift"
        is_override = True

    # 2. Office-level regional shift
    elif office:
        start_time = office.work_start_time or "09:00"
        end_time = office.work_end_time or "18:00"
        grace_period = office.grace_period_minutes if office.grace_period_minutes is not None else 15
        tz_str = office.timezone or (tenant.default_timezone if tenant else "UTC")
        shift_name = f"{office.name} Standard"
        is_override = False

    # 3. Tenant-level organization default
    else:
        start_time = (tenant.default_work_start_time if tenant else None) or "09:00"
        end_time = (tenant.default_work_end_time if tenant else None) or "18:00"
        grace_period = (tenant.default_grace_period_minutes if tenant else None) if (tenant and tenant.default_grace_period_minutes is not None) else 15
        tz_str = (tenant.default_timezone if tenant else None) or "UTC"
        shift_name = "Company Default"
        is_override = False

    return {
        "shift_name": shift_name,
        "work_start_time": start_time,
        "work_end_time": end_time,
        "grace_period_minutes": grace_period,
        "timezone": tz_str,
        "is_custom_shift": is_override
    }

def calculate_lateness(
    check_in_utc: datetime,
    shift_config: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Evaluates whether a check-in is late based on localized regional timezone,
    scheduled shift start, and grace period. Handles overnight shifts seamlessly.
    
    Returns:
      {
        "is_late": bool,
        "minutes_late": int,
        "local_check_in_time": datetime,
        "local_check_in_str": str,       # e.g., "09:22 AM"
        "scheduled_start_str": str,      # e.g., "09:00 AM"
        "grace_cutoff_str": str,         # e.g., "09:15 AM"
        "scheduled_end_str": str,        # e.g., "06:00 PM"
        "timezone": str
      }
    """
    tz_str = shift_config.get("timezone", "UTC")
    local_tz = get_safe_zoneinfo(tz_str)

    # Ensure check_in_utc has timezone info
    if check_in_utc.tzinfo is None:
        check_in_utc = check_in_utc.replace(tzinfo=timezone.utc)
    
    # Convert check-in to employee's regional timezone
    local_check_in = check_in_utc.astimezone(local_tz)

    start_h, start_m = parse_time_str(shift_config.get("work_start_time"), 9, 0)
    end_h, end_m = parse_time_str(shift_config.get("work_end_time"), 18, 0)
    grace_minutes = shift_config.get("grace_period_minutes", 15)

    is_overnight = (start_h > end_h) or (start_h == end_h and start_m > end_m)

    if not is_overnight:
        # Standard day shift (e.g. 09:00 - 18:00)
        scheduled_start_dt = local_check_in.replace(hour=start_h, minute=start_m, second=0, microsecond=0)
        scheduled_end_dt = local_check_in.replace(hour=end_h, minute=end_m, second=0, microsecond=0)
    else:
        # Overnight shift (e.g. 22:00 - 06:00)
        # If check-in happened in the early morning (between midnight and end_h + 3h buffer)
        if local_check_in.hour < (end_h + 3):
            # Shift actually started yesterday evening
            yesterday = local_check_in - timedelta(days=1)
            scheduled_start_dt = yesterday.replace(hour=start_h, minute=start_m, second=0, microsecond=0)
            scheduled_end_dt = local_check_in.replace(hour=end_h, minute=end_m, second=0, microsecond=0)
        else:
            # Shift starts today evening
            scheduled_start_dt = local_check_in.replace(hour=start_h, minute=start_m, second=0, microsecond=0)
            tomorrow = local_check_in + timedelta(days=1)
            scheduled_end_dt = tomorrow.replace(hour=end_h, minute=end_m, second=0, microsecond=0)

    # Grace period threshold
    grace_cutoff_dt = scheduled_start_dt + timedelta(minutes=grace_minutes)

    if local_check_in > grace_cutoff_dt:
        is_late = True
        delta = local_check_in - scheduled_start_dt
        minutes_late = max(1, int(round(delta.total_seconds() / 60.0)))
    else:
        is_late = False
        minutes_late = 0

    return {
        "is_late": is_late,
        "minutes_late": minutes_late,
        "local_check_in_time": local_check_in,
        "local_check_in_str": local_check_in.strftime("%I:%M %p"),
        "scheduled_start_str": scheduled_start_dt.strftime("%I:%M %p"),
        "grace_cutoff_str": grace_cutoff_dt.strftime("%I:%M %p"),
        "scheduled_end_str": scheduled_end_dt.strftime("%I:%M %p"),
        "timezone": tz_str
    }

def format_time_local(dt: Optional[datetime], tz_name: str) -> Optional[str]:
    """Format UTC datetime into 12-hour local time string (e.g., '09:15 AM')."""
    if not dt:
        return None
    try:
        local_tz = get_safe_zoneinfo(tz_name)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(local_tz).strftime("%I:%M %p")
    except Exception:
        return dt.strftime("%I:%M %p")

def format_hours_worked(hours: Optional[float]) -> Optional[str]:
    """Format float hours into clean human-readable duration (e.g., 8.5 -> '8h 30m')."""
    if hours is None:
        return None
    total_minutes = int(round(hours * 60))
    if total_minutes < 0:
        total_minutes = 0
    h = total_minutes // 60
    m = total_minutes % 60
    if h == 0:
        return f"{m}m"
    if m == 0:
        return f"{h}h"
    return f"{h}h {m}m"
