"""
AlignNova Email Service
=======================
Supports three providers (port 443 — fully allowed on Render free tier):
1. Vercel Serverless SMTP Proxy:
    EMAIL_PROXY_URL    = https://your-vercel-project.vercel.app/api/send-email
    EMAIL_PROXY_SECRET = your_shared_secret

2. Brevo:
    BREVO_API_KEY      = xkeysib_xxxxxxxxxxxx
    FROM_EMAIL         = noreply.alignnova@gmail.com

3. Resend:
    RESEND_API_KEY     = re_xxxxxxxxxxxx
    FROM_EMAIL         = onboarding@resend.dev

Required env vars:
    FROM_NAME          = AlignNova Portal
    APP_BASE_URL       = https://your-app.onrender.com
"""

import os
import json
import threading
import urllib.request
import urllib.error

# ── Provider Configuration ───────────────────────────────────────────────────
EMAIL_PROXY_URL    = os.getenv("EMAIL_PROXY_URL", "").strip()
EMAIL_PROXY_SECRET = os.getenv("EMAIL_PROXY_SECRET", "").strip()

BREVO_API_KEY      = os.getenv("BREVO_API_KEY", "").strip()
RESEND_API_KEY     = os.getenv("RESEND_API_KEY", "").strip()

FROM_NAME          = os.getenv("FROM_NAME", "AlignNova Portal")
APP_BASE_URL       = os.getenv("APP_BASE_URL", "http://localhost:5173").rstrip("/")

# If using Brevo/Proxy, the user sets FROM_EMAIL. If using Resend, it defaults to onboarding@resend.dev.
_default_from = "onboarding@resend.dev"
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


# ── Sender implementations ────────────────────────────────────────────────────

def _send_via_proxy(to_email: str, subject: str, html: str, plain: str) -> None:
    """Send via Vercel Serverless SMTP Proxy HTTP API. Raises on failure."""
    payload = json.dumps({
        "to_email": to_email,
        "subject": subject,
        "html": html,
        "plain": plain,
        "from_email": FROM_EMAIL,
        "from_name": FROM_NAME
    }).encode("utf-8")

    req = urllib.request.Request(
        EMAIL_PROXY_URL,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "X-Proxy-Secret": EMAIL_PROXY_SECRET,
            "User-Agent": "AlignNova-App/1.0",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        result = json.loads(resp.read())
        if not result.get("ok"):
            raise Exception(result.get("error", "Unknown proxy error"))
        print(f"[email] Proxy success")


def _send_via_brevo(to_email: str, subject: str, html: str, plain: str, recipient_name: str = "") -> None:
    """Send via Brevo HTTP API (over HTTPS port 443). Raises on failure."""
    to_obj = {"email": to_email}
    if recipient_name:
        to_obj["name"] = recipient_name

    payload = json.dumps({
        "sender": {
            "name": FROM_NAME,
            "email": FROM_EMAIL
        },
        "to": [to_obj],
        "subject": subject,
        "htmlContent": html,
        "textContent": plain
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.brevo.com/v3/smtp/email",
        data=payload,
        headers={
            "accept":        "application/json",
            "api-key":       BREVO_API_KEY,
            "content-type":  "application/json",
            "User-Agent":    "AlignNova-App/1.0",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        result = json.loads(resp.read())
        print(f"[email] Brevo messageId={result.get('messageId')}")


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
            "User-Agent":    "AlignNova-App/1.0",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        result = json.loads(resp.read())
        print(f"[email] Resend id={result.get('id')}")


# ── Public API ────────────────────────────────────────────────────────────────

def get_config_status() -> dict:
    """Return current email config (keys/secrets are masked)."""
    if EMAIL_PROXY_URL:
        provider = "vercel_proxy"
    elif BREVO_API_KEY:
        provider = "brevo"
    elif RESEND_API_KEY:
        provider = "resend"
    else:
        provider = "none"

    return {
        "provider": provider,
        "email_proxy_url": EMAIL_PROXY_URL,
        "email_proxy_secret_set": bool(EMAIL_PROXY_SECRET),
        "brevo_api_key_set": bool(BREVO_API_KEY),
        "brevo_key_prefix": BREVO_API_KEY[:8] + "..." if BREVO_API_KEY else "(not set)",
        "resend_api_key_set": bool(RESEND_API_KEY),
        "resend_key_prefix": RESEND_API_KEY[:8] + "..." if RESEND_API_KEY else "(not set)",
        "from_email": FROM_EMAIL,
        "from_name": FROM_NAME,
        "app_base_url": APP_BASE_URL,
    }


def print_config():
    """Print email config to stdout at startup so it shows in Render logs."""
    cfg = get_config_status()
    print("=" * 60)
    print("[email_service] Configuration:")
    print(f"  provider       : {cfg['provider']}")
    if cfg['provider'] == 'vercel_proxy':
        print(f"  proxy_url      : {cfg['email_proxy_url']}")
        print(f"  proxy_secret   : {'SET' if cfg['email_proxy_secret_set'] else 'NOT SET (unsecured)'}")
    elif cfg['provider'] == 'brevo':
        print(f"  brevo_key      : {cfg['brevo_key_prefix']}")
    elif cfg['provider'] == 'resend':
        print(f"  resend_key     : {cfg['resend_key_prefix']}")
    else:
        print("  ⚠️  NO EMAIL PROVIDER configured. Set EMAIL_PROXY_URL, BREVO_API_KEY, or RESEND_API_KEY.")
    print(f"  from_email     : {cfg['from_email']}")
    print(f"  app_base_url   : {cfg['app_base_url']}")
    print("=" * 60)


def send_test_email_sync(to_email: str) -> dict:
    """Send a test email synchronously and return the result."""
    cfg = get_config_status()

    if cfg["provider"] == "none":
        return {
            "ok": False,
            "provider": "none",
            "error": "No email provider configured. Set EMAIL_PROXY_URL, BREVO_API_KEY, or RESEND_API_KEY in Render environment variables.",
            "config": cfg,
        }

    subject = "✅ AlignNova — Test Email"
    plain   = "This is a test email from AlignNova. If you received this, email delivery is working correctly!"
    html    = f"""<div style="font-family:Arial,sans-serif;max-width:500px;margin:40px auto;padding:32px;background:#fff;border-radius:16px;border:1px solid #e5e7eb;">
  <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
    <p style="color:#fff;font-size:24px;margin:0;">⭐ AlignNova</p>
  </div>
  <h2 style="color:#1a1a2e;font-size:20px;">✅ Email delivery is working!</h2>
  <p style="color:#4b5563;font-size:15px;line-height:1.6;">
    This test email was sent from your AlignNova admin panel.<br/>
    Provider used: <strong>{cfg['provider']}</strong>
  </p>
</div>"""

    try:
        if cfg["provider"] == "vercel_proxy":
            print(f"[email] TEST: trying Vercel Proxy → {to_email}")
            _send_via_proxy(to_email, subject, html, plain)
            print(f"[email] TEST: ✓ Vercel Proxy success → {to_email}")
            return {"ok": True, "provider": "vercel_proxy", "config": cfg}
        elif cfg["provider"] == "brevo":
            print(f"[email] TEST: trying Brevo → {to_email}")
            _send_via_brevo(to_email, subject, html, plain)
            print(f"[email] TEST: ✓ Brevo success → {to_email}")
            return {"ok": True, "provider": "brevo", "config": cfg}
        else:
            print(f"[email] TEST: trying Resend → {to_email}")
            _send_via_resend(to_email, subject, html, plain)
            print(f"[email] TEST: ✓ Resend success → {to_email}")
            return {"ok": True, "provider": "resend", "config": cfg}

    except urllib.error.HTTPError as e:
        body = e.read().decode()
        msg = f"{cfg['provider'].capitalize()} API returned HTTP {e.code}: {body}"
        print(f"[email] TEST: ✗ {msg}")
        return {"ok": False, "provider": cfg["provider"], "error": msg, "config": cfg}

    except Exception as e:
        msg = f"{type(e).__name__}: {e}"
        print(f"[email] TEST: ✗ Unexpected error: {msg}")
        return {"ok": False, "provider": cfg["provider"], "error": msg, "config": cfg}


def send_welcome_email(to_email: str, student_name: str, set_password_token: str) -> bool:
    """
    Send the welcome / account-activation email.
    Runs in a background thread — never blocks the API response.
    """
    if not EMAIL_PROXY_URL and not BREVO_API_KEY and not RESEND_API_KEY:
        print("[email] No provider configured — skipping welcome email.")
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
            if EMAIL_PROXY_URL:
                print(f"[email] Sending via Vercel Proxy to {to_email} ...")
                _send_via_proxy(to_email, subject, html, plain)
                print(f"[email] ✓ Sent via Vercel Proxy to {to_email}")
            elif BREVO_API_KEY:
                print(f"[email] Sending via Brevo to {to_email} ...")
                _send_via_brevo(to_email, subject, html, plain, student_name)
                print(f"[email] ✓ Sent via Brevo to {to_email}")
            else:
                print(f"[email] Sending via Resend to {to_email} ...")
                _send_via_resend(to_email, subject, html, plain)
                print(f"[email] ✓ Sent via Resend to {to_email}")
        except urllib.error.HTTPError as e:
            body = e.read().decode()
            print(f"[email] ✗ API error {e.code}: {body}")
        except Exception as exc:
            print(f"[email] ✗ Failed to send to {to_email}: {type(exc).__name__}: {exc}")

    threading.Thread(target=_send, daemon=True).start()
    return True
