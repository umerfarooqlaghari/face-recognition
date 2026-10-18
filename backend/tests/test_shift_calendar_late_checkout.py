import pytest
from datetime import datetime, date, timezone, timedelta
from app.services.timing_service import (
    resolve_employee_shift_config,
    calculate_lateness,
    format_time_local,
    format_hours_worked,
    get_safe_zoneinfo,
    parse_time_str
)
from app.services.email_service import (
    generate_late_employee_html,
    generate_late_digest_html
)

class MockModel:
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)

# ==============================================================================
# Feature 1 Tests: Shift & Office Timings, Region Timezones, Grace Periods & Custom Overrides
# ==============================================================================

def test_tenant_default_shift_resolution():
    """Verify tenant default shift is used when employee has no custom shift and no office."""
    tenant = MockModel(
        default_timezone="Asia/Karachi",
        default_work_start_time="09:00",
        default_work_end_time="18:00",
        default_grace_period_minutes=15
    )
    user = MockModel(
        custom_work_start_time=None,
        custom_work_end_time=None,
        custom_grace_period_minutes=None,
        shift_name=None,
        custom_timezone=None
    )
    cfg = resolve_employee_shift_config(user, office=None, tenant=tenant)
    assert cfg["shift_name"] == "Company Default"
    assert cfg["work_start_time"] == "09:00"
    assert cfg["work_end_time"] == "18:00"
    assert cfg["grace_period_minutes"] == 15
    assert cfg["timezone"] == "Asia/Karachi"
    assert cfg["is_custom_shift"] is False

def test_office_regional_shift_resolution():
    """Verify regional office timings override tenant defaults."""
    tenant = MockModel(
        default_timezone="UTC",
        default_work_start_time="09:00",
        default_work_end_time="18:00",
        default_grace_period_minutes=15
    )
    office = MockModel(
        name="London Branch",
        timezone="Europe/London",
        work_start_time="08:30",
        work_end_time="17:00",
        grace_period_minutes=10
    )
    user = MockModel(
        custom_work_start_time=None,
        custom_work_end_time=None,
        custom_grace_period_minutes=None,
        shift_name=None,
        custom_timezone=None
    )
    cfg = resolve_employee_shift_config(user, office=office, tenant=tenant)
    assert cfg["shift_name"] == "London Branch Standard"
    assert cfg["work_start_time"] == "08:30"
    assert cfg["work_end_time"] == "17:00"
    assert cfg["grace_period_minutes"] == 10
    assert cfg["timezone"] == "Europe/London"
    assert cfg["is_custom_shift"] is False

def test_individual_custom_shift_override_e_g_night_shift():
    """Verify individual custom shift (e.g. Night Shift) overrides both office and tenant."""
    tenant = MockModel(
        default_timezone="UTC",
        default_work_start_time="09:00",
        default_work_end_time="18:00",
        default_grace_period_minutes=15
    )
    office = MockModel(
        name="HQ",
        timezone="America/New_York",
        work_start_time="09:00",
        work_end_time="17:00",
        grace_period_minutes=15
    )
    user = MockModel(
        custom_work_start_time="22:00",
        custom_work_end_time="06:00",
        custom_grace_period_minutes=20,
        shift_name="Night Shift Operations",
        custom_timezone="America/New_York"
    )
    cfg = resolve_employee_shift_config(user, office=office, tenant=tenant)
    assert cfg["shift_name"] == "Night Shift Operations"
    assert cfg["work_start_time"] == "22:00"
    assert cfg["work_end_time"] == "06:00"
    assert cfg["grace_period_minutes"] == 20
    assert cfg["timezone"] == "America/New_York"
    assert cfg["is_custom_shift"] is True

# ==============================================================================
# Feature 1 & 3 Tests: Timezone-Aware Lateness & Grace Period Edge Cases
# ==============================================================================

def test_on_time_within_grace_period():
    """Employee arrives at 09:12 AM when start is 09:00 AM and grace is 15 mins -> ON TIME."""
    shift_cfg = {
        "work_start_time": "09:00",
        "work_end_time": "18:00",
        "grace_period_minutes": 15,
        "timezone": "Asia/Karachi"  # UTC + 5
    }
    # 09:12 AM in Asia/Karachi = 04:12 AM UTC
    check_in_utc = datetime(2026, 10, 18, 4, 12, 0, tzinfo=timezone.utc)
    res = calculate_lateness(check_in_utc, shift_cfg)
    assert res["is_late"] is False
    assert res["minutes_late"] == 0
    assert res["local_check_in_str"] == "09:12 AM"
    assert res["scheduled_start_str"] == "09:00 AM"

def test_late_past_grace_period():
    """Employee arrives at 09:25 AM when start is 09:00 AM and grace is 15 mins -> LATE by 25 mins."""
    shift_cfg = {
        "work_start_time": "09:00",
        "work_end_time": "18:00",
        "grace_period_minutes": 15,
        "timezone": "Asia/Karachi"  # UTC + 5
    }
    # 09:25 AM in Asia/Karachi = 04:25 AM UTC
    check_in_utc = datetime(2026, 10, 18, 4, 25, 0, tzinfo=timezone.utc)
    res = calculate_lateness(check_in_utc, shift_cfg)
    assert res["is_late"] is True
    assert res["minutes_late"] == 25
    assert res["local_check_in_str"] == "09:25 AM"

def test_exact_grace_cutoff():
    """Employee arrives exactly at 09:15:00 AM -> ON TIME."""
    shift_cfg = {
        "work_start_time": "09:00",
        "work_end_time": "18:00",
        "grace_period_minutes": 15,
        "timezone": "Asia/Karachi"
    }
    # 09:15 AM in Asia/Karachi = 04:15 AM UTC
    check_in_utc = datetime(2026, 10, 18, 4, 15, 0, tzinfo=timezone.utc)
    res = calculate_lateness(check_in_utc, shift_cfg)
    assert res["is_late"] is False
    assert res["minutes_late"] == 0

def test_overnight_shift_lateness():
    """
    Overnight Shift: 22:00 to 06:00 (Grace 15 mins) in America/New_York (UTC - 4).
    1. Check-in at 22:10 NY time -> ON TIME.
    2. Check-in at 22:30 NY time -> LATE by 30 mins.
    3. Check-in past midnight at 00:45 NY time -> LATE by 2 hours 45 mins (165m).
    """
    shift_cfg = {
        "work_start_time": "22:00",
        "work_end_time": "06:00",
        "grace_period_minutes": 15,
        "timezone": "America/New_York"
    }
    # 22:10 NY time on Oct 18 = 02:10 UTC on Oct 19
    utc_on_time = datetime(2026, 10, 19, 2, 10, 0, tzinfo=timezone.utc)
    res1 = calculate_lateness(utc_on_time, shift_cfg)
    assert res1["is_late"] is False
    assert res1["minutes_late"] == 0

    # 22:30 NY time on Oct 18 = 02:30 UTC on Oct 19
    utc_late = datetime(2026, 10, 19, 2, 30, 0, tzinfo=timezone.utc)
    res2 = calculate_lateness(utc_late, shift_cfg)
    assert res2["is_late"] is True
    assert res2["minutes_late"] == 30

    # 00:45 NY time on Oct 19 = 04:45 UTC on Oct 19 (Overnight post-midnight arrival)
    utc_post_midnight = datetime(2026, 10, 19, 4, 45, 0, tzinfo=timezone.utc)
    res3 = calculate_lateness(utc_post_midnight, shift_cfg)
    assert res3["is_late"] is True
    assert res3["minutes_late"] == 165  # 2h 45m = 165 mins

def test_invalid_timezone_graceful_fallback():
    """Verify that an invalid or unrecognized timezone safely falls back to UTC without crashing."""
    tz = get_safe_zoneinfo("Invalid/Unknown_Zone")
    assert tz.key == "UTC"

# ==============================================================================
# Feature 2 Tests: Duration & Formatted Working Hours
# ==============================================================================

def test_format_hours_worked():
    """Verify hours worked formatting (e.g. 8.5 -> '8h 30m', 0.75 -> '45m')."""
    assert format_hours_worked(8.5) == "8h 30m"
    assert format_hours_worked(8.0) == "8h"
    assert format_hours_worked(0.75) == "45m"
    assert format_hours_worked(0.0) == "0m"
    assert format_hours_worked(None) is None

def test_format_time_local():
    """Verify UTC datetime is correctly converted and formatted for the target timezone."""
    utc_dt = datetime(2026, 10, 18, 4, 0, 0, tzinfo=timezone.utc)
    # 04:00 UTC = 09:00 AM in Asia/Karachi (UTC+5)
    formatted = format_time_local(utc_dt, "Asia/Karachi")
    assert formatted == "09:00 AM"

    # 04:00 UTC = 12:00 AM (midnight) in America/New_York (UTC-4)
    formatted_ny = format_time_local(utc_dt, "America/New_York")
    assert formatted_ny == "12:00 AM"

# ==============================================================================
# Feature 3 Tests: Late Notification Email Templates (Employee & HR Digest)
# ==============================================================================

def test_late_employee_email_html_structure():
    """Verify corporate late advisory email contains correct breakdown and zero emojis."""
    html = generate_late_employee_html(
        employee_name="Alexander Clark",
        employee_code="EMP-1042",
        check_in_time_str="09:32 AM",
        scheduled_start_str="09:00 AM",
        grace_period_minutes=15,
        minutes_late=32,
        company_name="Apex Global Technologies",
        shift_name="Morning Shift"
    )
    assert "Apex Global Technologies" in html
    assert "Alexander Clark" in html
    assert "EMP-1042" in html
    assert "09:32 AM" in html
    assert "32 Minutes" in html
    # Ensure no emojis are used in corporate notice
    assert "🚨" not in html
    assert "⏰" not in html
    assert "⚠️" not in html

def test_late_digest_email_html_structure():
    """Verify HR batch digest email renders employee table accurately."""
    late_items = [
        {
            "name": "Sarah Connor",
            "code": "EMP-1001",
            "department": "Engineering",
            "shift_name": "Standard",
            "scheduled_start": "09:00 AM",
            "check_in_time": "09:28 AM",
            "minutes_late": 28
        },
        {
            "name": "John Doe",
            "code": "EMP-1002",
            "department": "Operations",
            "shift_name": "Night Shift",
            "scheduled_start": "22:00 PM",
            "check_in_time": "22:45 PM",
            "minutes_late": 45
        }
    ]
    html = generate_late_digest_html(
        company_name="Apex Global Technologies",
        target_date_str="2026-10-18",
        late_items=late_items
    )
    assert "2 employees" in html
    assert "Sarah Connor" in html
    assert "+28m" in html
    assert "John Doe" in html
    assert "+45m" in html
