import logging
from typing import Dict, Any, Optional, List
import boto3
from botocore.exceptions import ClientError
from app.core.config import settings

logger = logging.getLogger("email_service")

def generate_welcome_email_html(
    employee_name: str,
    employee_code: str,
    email: str,
    temporary_password: str,
    company_name: str,
    invite_token: Optional[str] = None
) -> str:
    """
    Generate an executive Navy Blue and White HTML email template.
    No emojis. Professional corporate layout.
    """
    enrollment_section = ""
    if invite_token:
        enrollment_section = f"""
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-top: 24px;">
            <p style="margin: 0 0 8px 0; color: #0f172a; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Biometric Face Enrollment</p>
            <p style="margin: 0 0 12px 0; color: #475569; font-size: 14px; line-height: 1.5;">
                You have been issued a secure enrollment key for 3D Face Verification. Please complete enrollment within 48 hours.
            </p>
            <div style="background-color: #ffffff; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 12px; font-family: monospace; font-size: 15px; color: #1e3a8a; font-weight: 700; word-break: break-all;">
                {invite_token}
            </div>
        </div>
        """

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Account Credentials - {company_name}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 40px 16px;">
        <tr>
            <td align="center">
                <table width="100%" max-width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.05);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #0f172a; padding: 32px 40px; text-align: left;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td>
                                        <div style="font-size: 11px; font-weight: 700; color: #93c5fd; letter-spacing: 1.5px; text-transform: uppercase;">ENTERPRISE ATTENDANCE PORTAL</div>
                                        <div style="font-size: 24px; font-weight: 800; color: #ffffff; margin-top: 4px;">{company_name}</div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px;">
                            <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #0f172a;">Welcome, {employee_name}</h1>
                            <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                                Your organization profile has been created in the attendance system. Use the credentials below to authenticate via the Mobile Application and Web Portal.
                            </p>

                            <!-- Credentials Box -->
                            <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td style="padding-bottom: 12px; font-size: 13px; color: #64748b; font-weight: 600;">EMPLOYEE CODE</td>
                                        <td style="padding-bottom: 12px; font-size: 14px; color: #0f172a; font-weight: 700; text-align: right; font-family: monospace;">{employee_code}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding-bottom: 12px; font-size: 13px; color: #64748b; font-weight: 600;">WORK EMAIL</td>
                                        <td style="padding-bottom: 12px; font-size: 14px; color: #0f172a; font-weight: 700; text-align: right;">{email}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-size: 13px; color: #64748b; font-weight: 600;">TEMPORARY PASSWORD</td>
                                        <td style="font-size: 15px; color: #1e3a8a; font-weight: 800; text-align: right; font-family: monospace;">{temporary_password}</td>
                                    </tr>
                                </table>
                            </div>

                            <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.5; color: #475569;">
                                Upon initial sign-in, you will be prompted to register your mobile device hardware and complete biometric verification.
                            </p>

                            {enrollment_section}

                            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
                                <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #64748b;">
                                    Security notice: Do not share your temporary credentials with unauthorized personnel. For assistance, contact your system administrator.
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 20px 40px; border-top: 1px solid #e2e8f0; text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                                Powered by Multi-Tenant Biometric Attendance Platform &bull; {company_name}
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""

def generate_welcome_email_text(
    employee_name: str,
    employee_code: str,
    email: str,
    temporary_password: str,
    company_name: str,
    invite_token: Optional[str] = None
) -> str:
    token_str = f"\nBiometric Enrollment Token: {invite_token}\n" if invite_token else ""
    return f"""Welcome to {company_name} Attendance Portal

Dear {employee_name},

Your organization profile has been created. Use the credentials below to log in:

Employee Code: {employee_code}
Work Email: {email}
Temporary Password: {temporary_password}
{token_str}
Security notice: Please keep your temporary credentials confidential.
"""

async def send_employee_welcome_email(
    to_email: str,
    employee_name: str,
    employee_code: str,
    temporary_password: str,
    company_name: str,
    invite_token: Optional[str] = None
) -> Dict[str, Any]:
    """
    Sends credentials to employee via AWS SES.
    If AWS credentials are not set, runs in simulated mode and logs details safely.
    """
    subject = f"Your Attendance Credentials - {company_name}"
    html_content = generate_welcome_email_html(
        employee_name=employee_name,
        employee_code=employee_code,
        email=to_email,
        temporary_password=temporary_password,
        company_name=company_name,
        invite_token=invite_token
    )
    text_content = generate_welcome_email_text(
        employee_name=employee_name,
        employee_code=employee_code,
        email=to_email,
        temporary_password=temporary_password,
        company_name=company_name,
        invite_token=invite_token
    )

    # Check if AWS credentials exist
    has_aws_keys = bool(settings.AWS_ACCESS_KEY_ID.strip() and settings.AWS_SECRET_ACCESS_KEY.strip())

    if not has_aws_keys:
        logger.info(
            f"[AWS SES SIMULATED] To: {to_email} | Employee: {employee_name} ({employee_code}) | Password: {temporary_password}"
        )
        print(f"\n=======================================================")
        print(f"[AWS SES SIMULATED EMAIL DISPATCH]")
        print(f"Recipient: {to_email}")
        print(f"Subject:   {subject}")
        print(f"Company:   {company_name}")
        print(f"Employee:  {employee_name} ({employee_code})")
        print(f"Password:  {temporary_password}")
        if invite_token:
            print(f"Invite:    {invite_token}")
        print(f"=======================================================\n")
        return {
            "status": "simulated",
            "delivered": True,
            "message": "AWS credentials not provided. Logged credentials for local development.",
            "recipient": to_email
        }

    try:
        ses_client = boto3.client(
            "ses",
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )

        response = ses_client.send_email(
            Source=settings.AWS_SES_FROM_EMAIL,
            Destination={
                "ToAddresses": [to_email]
            },
            Message={
                "Subject": {
                    "Data": subject,
                    "Charset": "UTF-8"
                },
                "Body": {
                    "Text": {
                        "Data": text_content,
                        "Charset": "UTF-8"
                    },
                    "Html": {
                        "Data": html_content,
                        "Charset": "UTF-8"
                    }
                }
            }
        )
        message_id = response.get("MessageId")
        logger.info(f"AWS SES email sent successfully to {to_email}. MessageId: {message_id}")
        return {
            "status": "sent",
            "delivered": True,
            "message_id": message_id,
            "recipient": to_email
        }
    except ClientError as e:
        error_msg = e.response["Error"]["Message"]
        logger.error(f"Failed to send email via AWS SES: {error_msg}")
        return {
            "status": "error",
            "delivered": False,
            "error": error_msg,
            "recipient": to_email
        }
    except Exception as e:
        logger.error(f"Unexpected error in AWS SES dispatch: {str(e)}")
        return {
            "status": "error",
            "delivered": False,
            "error": str(e),
            "recipient": to_email
        }

# ==============================================================================
# Late Arrival Individual Employee Email
# ==============================================================================

def generate_late_employee_html(
    employee_name: str,
    employee_code: str,
    check_in_time_str: str,
    scheduled_start_str: str,
    grace_period_minutes: int,
    minutes_late: int,
    company_name: str,
    shift_name: str = "Standard Shift"
) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Late Check-In Advisory - {company_name}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 40px 16px;">
        <tr>
            <td align="center">
                <table width="100%" max-width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.05);">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #0f172a; padding: 28px 40px; text-align: left;">
                            <div style="font-size: 11px; font-weight: 700; color: #f87171; letter-spacing: 1.5px; text-transform: uppercase;">ATTENDANCE ADVISORY NOTICE</div>
                            <div style="font-size: 22px; font-weight: 800; color: #ffffff; margin-top: 4px;">{company_name}</div>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 36px 40px;">
                            <h1 style="margin: 0 0 14px 0; font-size: 19px; font-weight: 700; color: #0f172a;">Late Arrival Recorded</h1>
                            <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #334155;">
                                Dear {employee_name}, your biometric check-in today exceeded your scheduled shift start time and organization grace period.
                            </p>

                            <!-- Breakdown Table -->
                            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td style="padding-bottom: 10px; font-size: 12px; color: #64748b; font-weight: 600;">EMPLOYEE</td>
                                        <td style="padding-bottom: 10px; font-size: 13px; color: #0f172a; font-weight: 700; text-align: right;">{employee_name} ({employee_code})</td>
                                    </tr>
                                    <tr>
                                        <td style="padding-bottom: 10px; font-size: 12px; color: #64748b; font-weight: 600;">ASSIGNED SHIFT</td>
                                        <td style="padding-bottom: 10px; font-size: 13px; color: #0f172a; font-weight: 700; text-align: right;">{shift_name}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding-bottom: 10px; font-size: 12px; color: #64748b; font-weight: 600;">SCHEDULED START</td>
                                        <td style="padding-bottom: 10px; font-size: 13px; color: #0f172a; font-weight: 700; text-align: right;">{scheduled_start_str}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding-bottom: 10px; font-size: 12px; color: #64748b; font-weight: 600;">GRACE PERIOD</td>
                                        <td style="padding-bottom: 10px; font-size: 13px; color: #0f172a; font-weight: 700; text-align: right;">{grace_period_minutes} minutes</td>
                                    </tr>
                                    <tr>
                                        <td style="padding-bottom: 10px; font-size: 12px; color: #64748b; font-weight: 600;">RECORDED CHECK-IN</td>
                                        <td style="padding-bottom: 10px; font-size: 13px; color: #0f172a; font-weight: 700; text-align: right;">{check_in_time_str}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding-top: 8px; border-top: 1px dashed #cbd5e1; font-size: 13px; color: #dc2626; font-weight: 700;">LATENESS DURATION</td>
                                        <td style="padding-top: 8px; border-top: 1px dashed #cbd5e1; font-size: 14px; color: #dc2626; font-weight: 800; text-align: right;">{minutes_late} Minutes</td>
                                    </tr>
                                </table>
                            </div>

                            <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #64748b;">
                                If this was caused by an approved corporate errand, travel emergency, or hardware issue, please submit an attendance regularization request via the employee portal for manager review.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 18px 40px; border-top: 1px solid #e2e8f0; text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                                Automated notification from {company_name} Attendance Management System
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""

async def send_late_employee_email(
    to_email: str,
    employee_name: str,
    employee_code: str,
    check_in_time_str: str,
    scheduled_start_str: str,
    grace_period_minutes: int,
    minutes_late: int,
    company_name: str,
    shift_name: str = "Standard Shift"
) -> Dict[str, Any]:
    """
    Sends an automated notification to an employee who arrived late.
    """
    subject = f"Attendance Advisory: Late Check-In Recorded - {company_name}"
    html_content = generate_late_employee_html(
        employee_name=employee_name,
        employee_code=employee_code,
        check_in_time_str=check_in_time_str,
        scheduled_start_str=scheduled_start_str,
        grace_period_minutes=grace_period_minutes,
        minutes_late=minutes_late,
        company_name=company_name,
        shift_name=shift_name
    )
    text_content = f"""Attendance Advisory: Late Check-In
Company: {company_name}
Employee: {employee_name} ({employee_code})
Shift: {shift_name}
Scheduled Start: {scheduled_start_str} (Grace: {grace_period_minutes}m)
Check-In: {check_in_time_str}
Lateness: {minutes_late} minutes.
Please submit a regularization request if this was an approved exception.
"""

    has_aws_keys = bool(settings.AWS_ACCESS_KEY_ID.strip() and settings.AWS_SECRET_ACCESS_KEY.strip())
    if not has_aws_keys:
        logger.info(f"[AWS SES SIMULATED LATE EMAIL] To: {to_email} | Employee: {employee_name} | Late: {minutes_late}m")
        print(f"\n=======================================================")
        print(f"[AWS SES SIMULATED] LATE EMPLOYEE EMAIL")
        print(f"Recipient: {to_email}")
        print(f"Employee:  {employee_name} ({employee_code})")
        print(f"Check-In:  {check_in_time_str} (Scheduled: {scheduled_start_str})")
        print(f"Late:      {minutes_late} minutes")
        print(f"=======================================================\n")
        return {"status": "simulated", "delivered": True, "recipient": to_email}

    try:
        ses_client = boto3.client(
            "ses",
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )
        response = ses_client.send_email(
            Source=settings.AWS_SES_FROM_EMAIL,
            Destination={"ToAddresses": [to_email]},
            Message={
                "Subject": {"Data": subject, "Charset": "UTF-8"},
                "Body": {
                    "Text": {"Data": text_content, "Charset": "UTF-8"},
                    "Html": {"Data": html_content, "Charset": "UTF-8"}
                }
            }
        )
        return {"status": "sent", "delivered": True, "message_id": response.get("MessageId"), "recipient": to_email}
    except Exception as e:
        logger.error(f"Failed to send late employee email: {str(e)}")
        return {"status": "error", "delivered": False, "error": str(e), "recipient": to_email}

# ==============================================================================
# Late Digest Batch Email to HR / Administrators
# ==============================================================================

def generate_late_digest_html(
    company_name: str,
    target_date_str: str,
    late_items: List[Dict[str, Any]]
) -> str:
    rows_html = ""
    for item in late_items:
        rows_html += f"""
        <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 12px 14px; font-size: 13px; font-weight: 700; color: #0f172a;">{item.get('name')}</td>
            <td style="padding: 12px 14px; font-size: 12px; color: #475569; font-family: monospace;">{item.get('code')}</td>
            <td style="padding: 12px 14px; font-size: 12px; color: #475569;">{item.get('department', 'General')}</td>
            <td style="padding: 12px 14px; font-size: 12px; color: #475569;">{item.get('shift_name', 'Standard')}</td>
            <td style="padding: 12px 14px; font-size: 12px; color: #64748b;">{item.get('scheduled_start')}</td>
            <td style="padding: 12px 14px; font-size: 13px; font-weight: 700; color: #0f172a;">{item.get('check_in_time')}</td>
            <td style="padding: 12px 14px; font-size: 13px; font-weight: 800; color: #dc2626; text-align: right;">+{item.get('minutes_late')}m</td>
        </tr>
        """

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Late Arrivals Digest - {company_name}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 40px 16px;">
        <tr>
            <td align="center">
                <table width="100%" max-width="700" cellpadding="0" cellspacing="0" border="0" style="max-width: 700px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.05);">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #0f172a; padding: 28px 40px; text-align: left;">
                            <div style="font-size: 11px; font-weight: 700; color: #93c5fd; letter-spacing: 1.5px; text-transform: uppercase;">HR & OPERATIONS MANAGEMENT DIGEST</div>
                            <div style="font-size: 22px; font-weight: 800; color: #ffffff; margin-top: 4px;">Daily Late Arrivals Report</div>
                            <div style="font-size: 13px; color: #94a3b8; margin-top: 4px;">{company_name} &bull; {target_date_str}</div>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 32px 40px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                                <p style="margin: 0; font-size: 14px; color: #334155;">
                                    Total late check-ins recorded for today: <strong style="color: #dc2626;">{len(late_items)} employees</strong>
                                </p>
                            </div>

                            <!-- Table -->
                            <div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; text-align: left;">
                                    <thead>
                                        <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                                            <th style="padding: 10px 14px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Employee</th>
                                            <th style="padding: 10px 14px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Code</th>
                                            <th style="padding: 10px 14px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Dept</th>
                                            <th style="padding: 10px 14px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Shift</th>
                                            <th style="padding: 10px 14px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Sched</th>
                                            <th style="padding: 10px 14px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Arrival</th>
                                            <th style="padding: 10px 14px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; text-align: right;">Late By</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows_html}
                                    </tbody>
                                </table>
                            </div>

                            <p style="margin: 0; font-size: 12px; color: #64748b;">
                                You can review detailed timesheets, approve regularizations, or adjust employee shift schedules directly from the management console.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 18px 40px; border-top: 1px solid #e2e8f0; text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                                Automated HR Report generated by {company_name} Attendance Portal
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""

async def send_late_digest_email(
    to_emails: List[str],
    company_name: str,
    target_date_str: str,
    late_items: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Sends a batch digest report to HR and Admin containing all employees who arrived late today.
    """
    if not to_emails:
        return {"status": "skipped", "message": "No HR recipients provided"}

    subject = f"Daily Late Report: {len(late_items)} Employees Late ({target_date_str}) - {company_name}"
    html_content = generate_late_digest_html(
        company_name=company_name,
        target_date_str=target_date_str,
        late_items=late_items
    )
    
    # Plaintext fallback
    lines = [f"Daily Late Arrivals Report - {company_name} ({target_date_str})", f"Total Late: {len(late_items)}\n"]
    for it in late_items:
        lines.append(f"- {it.get('name')} ({it.get('code')}): Arrived {it.get('check_in_time')} (Sched: {it.get('scheduled_start')}) -> Late by {it.get('minutes_late')}m")
    text_content = "\n".join(lines)

    has_aws_keys = bool(settings.AWS_ACCESS_KEY_ID.strip() and settings.AWS_SECRET_ACCESS_KEY.strip())
    if not has_aws_keys:
        logger.info(f"[AWS SES SIMULATED LATE DIGEST] To: {to_emails} | Count: {len(late_items)}")
        print(f"\n=======================================================")
        print(f"[AWS SES SIMULATED] HR LATE ARRIVALS BATCH DIGEST")
        print(f"Recipients: {', '.join(to_emails)}")
        print(f"Company:    {company_name} ({target_date_str})")
        print(f"Late Count: {len(late_items)} employees")
        for it in late_items:
            print(f"  * {it.get('name')} ({it.get('code')}) - {it.get('check_in_time')} (+{it.get('minutes_late')}m)")
        print(f"=======================================================\n")
        return {"status": "simulated", "delivered": True, "recipients": to_emails, "late_count": len(late_items)}

    try:
        ses_client = boto3.client(
            "ses",
            region_name=settings.AWS_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )
        response = ses_client.send_email(
            Source=settings.AWS_SES_FROM_EMAIL,
            Destination={"ToAddresses": to_emails},
            Message={
                "Subject": {"Data": subject, "Charset": "UTF-8"},
                "Body": {
                    "Text": {"Data": text_content, "Charset": "UTF-8"},
                    "Html": {"Data": html_content, "Charset": "UTF-8"}
                }
            }
        )
        return {
            "status": "sent",
            "delivered": True,
            "message_id": response.get("MessageId"),
            "recipients": to_emails,
            "late_count": len(late_items)
        }
    except Exception as e:
        logger.error(f"Failed to send HR late digest email: {str(e)}")
        return {"status": "error", "delivered": False, "error": str(e), "recipients": to_emails}

