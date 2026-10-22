import pytest
from datetime import datetime, timezone, timedelta, date
from app.services.timing_service import check_employee_grace_status, resolve_employee_shift_config

def test_grace_status_in_window():
    """Shift 09:00 - 18:00 UTC, Grace 15m. Current time 09:07 UTC -> in_grace_period = True"""
    shift_cfg = {
        "shift_name": "Standard Shift",
        "work_start_time": "09:00",
        "work_end_time": "18:00",
        "grace_period_minutes": 15,
        "timezone": "UTC"
    }
    now_utc = datetime(2026, 10, 23, 9, 7, 0, tzinfo=timezone.utc)
    res = check_employee_grace_status(now_utc, shift_cfg)

    assert res["in_grace_period"] is True
    assert res["past_grace"] is False
    assert res["before_shift"] is False
    assert res["scheduled_start_str"] == "09:00 AM"
    assert res["grace_cutoff_str"] == "09:15 AM"
    assert res["local_date"] == date(2026, 10, 23)

def test_grace_status_before_shift():
    """Shift 09:00 - 18:00 UTC. Current time 08:45 UTC -> before_shift = True"""
    shift_cfg = {
        "shift_name": "Standard Shift",
        "work_start_time": "09:00",
        "work_end_time": "18:00",
        "grace_period_minutes": 15,
        "timezone": "UTC"
    }
    now_utc = datetime(2026, 10, 23, 8, 45, 0, tzinfo=timezone.utc)
    res = check_employee_grace_status(now_utc, shift_cfg)

    assert res["in_grace_period"] is False
    assert res["before_shift"] is True
    assert res["past_grace"] is False

def test_grace_status_past_grace():
    """Shift 09:00 - 18:00 UTC. Current time 09:16 UTC -> past_grace = True"""
    shift_cfg = {
        "shift_name": "Standard Shift",
        "work_start_time": "09:00",
        "work_end_time": "18:00",
        "grace_period_minutes": 15,
        "timezone": "UTC"
    }
    now_utc = datetime(2026, 10, 23, 9, 16, 0, tzinfo=timezone.utc)
    res = check_employee_grace_status(now_utc, shift_cfg)

    assert res["in_grace_period"] is False
    assert res["past_grace"] is True

def test_grace_status_exact_boundaries():
    """Shift 09:00 - 18:00 UTC. 09:00:00 is in grace, 09:15:00 is in grace, 09:15:01 is past"""
    shift_cfg = {
        "shift_name": "Standard Shift",
        "work_start_time": "09:00",
        "work_end_time": "18:00",
        "grace_period_minutes": 15,
        "timezone": "UTC"
    }
    start_exact = datetime(2026, 10, 23, 9, 0, 0, tzinfo=timezone.utc)
    assert check_employee_grace_status(start_exact, shift_cfg)["in_grace_period"] is True

    cutoff_exact = datetime(2026, 10, 23, 9, 15, 0, tzinfo=timezone.utc)
    assert check_employee_grace_status(cutoff_exact, shift_cfg)["in_grace_period"] is True

    past_second = datetime(2026, 10, 23, 9, 15, 1, tzinfo=timezone.utc)
    assert check_employee_grace_status(past_second, shift_cfg)["in_grace_period"] is False
    assert check_employee_grace_status(past_second, shift_cfg)["past_grace"] is True
