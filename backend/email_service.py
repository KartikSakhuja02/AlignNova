"""
AlignNova Email Service
=======================
Supports two providers — whichever env vars are set will be used.

Option A – Gmail (SMTP):
    SMTP_USER = your-gmail@gmail.com
    SMTP_PASS = your-16-char-app-password  (from myaccount.google.com/apppasswords)

Option B – Resend API (recommended, free):
    RESEND_API_KEY = re_xxxxxxxxxxxx       (from resend.com)

Common:
    FROM_EMAIL   = (optional) sender address override
    FROM_NAME    = AlignNova Portal
    APP_BASE_URL = https://your-app.onrender.com
"""

import os
import json
import smtplib
import threading
import urllib.request
import urllib.error
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# ── Provider detection ────────────────────────────────────────────────────────
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "").strip()
SMTP_USER      = os.getenv("SMTP_USER", "").strip()
SMTP_PASS      = os.getenv("SMTP_PASS", "").strip()
SMTP_HOST      = os.getenv("SMTP_HOST", "smtp.gmail.com").strip()
SMTP_PORT      = int(os.getenv("SMTP_PORT", "587"))

FROM_NAME      = os.getenv("FROM_NAME", "AlignNova Portal")
APP_BASE_URL   = os.getenv("APP_BASE_URL", "http://localhost:5173").rstrip("/")

# FROM_EMAIL defaults:
#  - Gmail SMTP: use SMTP_USER
#  - Resend free plan: must use onboarding@resend.dev (until domain verified)
_default_from = SMTP_USER if SMTP_USER else "onboarding@resend.dev"
FROM_EMAIL     = os.getenv("FROM_EMAIL", _default_from).strip()


# ── HTML template ─────────────────────────────────────────────────────────────

def _build_welcome_html(student_name: str, set_password_url: str) -> str:
    first_name = (student_name or "Student").split()[0]
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to AlignNova</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * {{ margin:0; padding:0; box-sizing:border-box; }}
    body {{ font-family:'Inter',Arial,sans-serif; background:#f0f4f8; color:#1a1a2e; }}
    .wrapper {{ max-width:600px; margin:40px auto; background:#fff; border-radius:20px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,.12); }}
    .header {{ background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 50%,#2563eb 100%); padding:48px 40px 40px; text-align:center; }}
    .logo-badge {{ display:inline-flex; align-items:center; gap:10px; background:rgba(255,255,255,.15); border:1px solid rgba(255,255,255,.25); border-radius:50px; padding:8px 20px; margin-bottom:28px; }}
    .logo-text {{ color:#fff; font-size:15px; font-weight:700; letter-spacing:.5px; }}
    .header h1 {{ color:#fff; font-size:32px; font-weight:800; line-height:1.2; margin-bottom:12px; }}
    .header p {{ color:rgba(255,255,255,.80); font-size:16px; line-height:1.6; }}
    .confetti {{ text-align:center; font-size:28px; margin:24px 0 0; letter-spacing:6px; }}
    .body {{ padding:40px; }}
    .greeting {{ font-size:22px; font-weight:700; color:#1a1a2e; margin-bottom:16px; }}
    .message {{ font-size:15px; color:#4b5563; line-height:1.7; margin-bottom:24px; }}
    .highlight-box {{ background:linear-gradient(135deg,#f0f4ff 0%,#faf0ff 100%); border:1px solid #e0e7ff; border-radius:14px; padding:20px 24px; margin-bottom:32px; }}
    .highlight-box p {{ font-size:14px; color:#4338ca; font-weight:500; line-height:1.6; }}
    .cta-section {{ text-align:center; margin-bottom:36px; }}
    .cta-button {{ display:inline-block; background:linear-gradient(135deg,#4f46e5,#7c3aed); color:#fff !important; text-decoration:none; font-size:16px; font-weight:700; padding:16px 48px; border-radius:50px; box-shadow:0 8px 24px rgba(79,70,229,.35); letter-spacing:.3px; }}
    .cta-subtext {{ margin-top:14px; font-size:13px; color:#9ca3af; }}
    .steps {{ margin-bottom:36px; }}
    .steps h3 {{ font-size:16px; font-weight:700; color:#1a1a2e; margin-bottom:16px; }}
    .step {{ display:flex; align-items:flex-start; gap:14px; margin-bottom:14px; }}
    .step-num {{ width:28px; height:28px; background:linear-gradient(135deg,#4f46e5,#7c3aed); color:#fff; border-radius:50%; font-size:13px; font-weight:700; text-align:center; line-height:28px; flex-shrink:0; }}
    .step-text {{ font-size:14px; color:#374151; line-height:1.5; }}
    .divider {{ height:1px; background:#f3f4f6; margin:28px 0; }}
    .link-fallback {{ font-size:13px; color:#6b7280; line-height:1.6; word-break:break-all; }}
    .link-fallback a {{ color:#4f46e5; }}
    .footer {{ background:#f9fafb; border-top:1px solid #f3f4f6; padding:28px 40px; text-align:center; }}
    .footer p {{ font-size:13px; color:#9ca3af; line-height:1.6; }}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo-badge"><span class="logo-text">⭐ AlignNova</span></div>
      <h1>You're In,<br/>{first_name}! 🎉</h1>
      <p>Your placement portal account is ready.</p>
      <div class="confetti">✨ 🚀 🎓</div>
    </div>
    <div class="body">
      <p class="greeting">Welcome to AlignNova Placement Portal</p>
      <p class="message">
        Hi <strong>{student_name}</strong>, your placement coordinator has created an account for you
        on <strong>AlignNova</strong> — your gateway to internships, recruitment drives, and career
        opportunities.
      </p>
      <div class="highlight-box">
        <p>🔐 <strong>One last step:</strong> Click the button below to set your personal password
        and activate your account. The link is valid for <strong>7 days</strong>.</p>
      </div>
      <div class="cta-section">
        <a href="{set_password_url}" class="cta-button">Join Now &rarr;</a>
        <p class="cta-subtext">🔒 Secure link &nbsp;·&nbsp; Expires in 7 days</p>
      </div>
      <div class="steps">
        <h3>What happens next?</h3>
        <div class="step"><div class="step-num">1</div><div class="step-text"><strong>Set your password</strong> — Choose a strong, personal password.</div></div>
        <div class="step"><div class="step-num">2</div><div class="step-text"><strong>Explore your dashboard</strong> — View internship drives, track applications, complete your profile.</div></div>
        <div class="step"><div class="step-num">3</div><div class="step-text"><strong>Apply to drives</strong> — Browse opportunities and apply with one click.</div></div>
      </div>
      <div class="divider"></div>
      <p class="link-fallback">
        Button not working? Copy and paste this link:<br/>
        <a href="{set_password_url}">{set_password_url}</a>
      </p>
    </div>
    <div class="footer">
      <p>Sent by <strong>AlignNova Placement Portal</strong>.<br/>
      If you didn't expect this, contact your placement coordinator.<br/><br/>
      © 2024 AlignNova. All rights reserved.</p>
    </div>
  </div>
</body>
</html>"""


# ── Sender implementations ─────────────────────────────────────────────────────

def _send_via_smtp(to_email: str, subject: str, html: str, plain: str) -> None:
    """Send via Gmail (or any SMTP server). Raises on failure."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = f"{FROM_NAME} <{FROM_EMAIL}>"
    msg["To"]      = to_email
    msg.attach(MIMEText(plain, "plain"))
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20) as server:
        server.ehlo()
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(FROM_EMAIL, [to_email], msg.as_string())


def _send_via_resend(to_email: str, subject: str, html: str, plain: str) -> None:
    """Send via Resend HTTP API. Raises on failure."""
    payload = json.dumps({
        "from": f"{FROM_NAME} <{FROM_EMAIL}>",
        "to":   [to_email],
        "subject": subject,
        "html": html,
        "text": plain,
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=payload,
        headers={
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type":  "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        result = json.loads(resp.read())
        print(f"[email] Resend id={result.get('id')}")


# ── Public API ────────────────────────────────────────────────────────────────

def send_welcome_email(to_email: str, student_name: str, set_password_token: str) -> bool:
    """
    Send the welcome / account-activation email.
    Runs in a background thread — never blocks the API response.

    Provider priority:
      1. Gmail SMTP  — if SMTP_USER + SMTP_PASS are set
      2. Resend API  — if RESEND_API_KEY is set
    """
    if not SMTP_USER and not RESEND_API_KEY:
        print("[email] No provider configured (set SMTP_USER+SMTP_PASS or RESEND_API_KEY). Skipping.")
        return False

    set_password_url = f"{APP_BASE_URL}/set-password?token={set_password_token}"
    subject = "🎓 Welcome to AlignNova — Activate Your Account"
    html    = _build_welcome_html(student_name, set_password_url)
    plain   = (
        f"Welcome to AlignNova, {student_name}!\n\n"
        f"Set your password and access your dashboard here:\n{set_password_url}\n\n"
        f"Link expires in 7 days.\n— AlignNova Team"
    )

    def _send():
        try:
            if SMTP_USER and SMTP_PASS:
                print(f"[email] Sending via Gmail SMTP to {to_email} ...")
                _send_via_smtp(to_email, subject, html, plain)
                print(f"[email] ✓ Sent via Gmail SMTP to {to_email}")
            else:
                print(f"[email] Sending via Resend to {to_email} ...")
                _send_via_resend(to_email, subject, html, plain)
                print(f"[email] ✓ Sent via Resend to {to_email}")
        except smtplib.SMTPAuthenticationError:
            print(
                "[email] ✗ Gmail SMTP authentication failed!\n"
                "  → Make sure SMTP_PASS is a 16-char App Password (not your Gmail password).\n"
                "  → Generate one at: https://myaccount.google.com/apppasswords\n"
                "  → Remove ALL spaces when pasting the app password."
            )
        except urllib.error.HTTPError as e:
            body = e.read().decode()
            print(f"[email] ✗ Resend API error {e.code}: {body}")
        except Exception as exc:
            print(f"[email] ✗ Failed to send to {to_email}: {type(exc).__name__}: {exc}")

    threading.Thread(target=_send, daemon=True).start()
    return True
