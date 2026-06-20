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

def _build_welcome_html(student_name: str, set_password_url: str, logo_white_url: str, logo_blue_url: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  <title>Welcome to Alignnova</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
</head>
<body style="background-color: #F8FAFC; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111C2D; margin: 0; padding: 32px 16px; min-height: 100vh;">
  <!-- Main Email Container -->
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid rgba(199, 196, 216, 0.3); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);">
    
    <!-- Hero Section: Logo & Branding -->
    <div style="background: linear-gradient(135deg, #3525cd 0%, #4f46e5 100%); padding: 32px 24px; text-align: center;">
      <table role="presentation" style="margin: 0 auto; border-collapse: collapse;">
        <tr>
          <td style="vertical-align: middle;">
            <img alt="Alignova Logo" src="{logo_white_url}" style="height: 40px; width: auto; vertical-align: middle; border-radius: 8px;" />
          </td>
          <td style="vertical-align: middle; padding-left: 12px;">
            <span style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.01em; font-family: 'Plus Jakarta Sans', sans-serif;">Alignova</span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Body Content -->
    <div style="padding: 40px 32px;">
      <h1 style="font-size: 26px; font-weight: 700; color: #111C2D; margin: 0 0 20px 0; line-height: 1.3; font-family: 'Plus Jakarta Sans', sans-serif;">
        Welcome to the Career Network, <span style="color: #3525cd; font-weight: 800;">{student_name}</span>!
      </h1>
      <p style="font-size: 16px; color: #464555; line-height: 1.6; margin: 0 0 28px 0; font-family: 'Plus Jakarta Sans', sans-serif;">
        Your executive account is now fully provisioned. You have been selected to join the Alignova placement ecosystem, where high-performance students meet industry-leading recruiters.
      </p>

      <!-- Action Button wrapper table for email client compatibility -->
      <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 32px 0;">
        <tr>
          <td align="center">
            <a href="{set_password_url}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-size: 14px; font-weight: 600; padding: 14px 36px; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.15); font-family: 'Plus Jakarta Sans', sans-serif;">
              Join Now &nbsp;&rarr;
            </a>
          </td>
        </tr>
      </table>

      <!-- Fallback Link -->
      <div style="margin-top: 24px; text-align: center; font-family: 'Plus Jakarta Sans', sans-serif;">
        <p style="font-size: 12px; color: #777587; margin: 0 0 4px 0;">If the button doesn't work, copy and paste this link in your browser:</p>
        <a href="{set_password_url}" style="font-size: 12px; color: #3525cd; word-break: break-all; text-decoration: underline;">{set_password_url}</a>
      </div>

      <!-- Steps Section -->
      <div style="margin-top: 36px; padding-top: 36px; border-top: 1px solid rgba(199, 196, 216, 0.3);">
        <h2 style="font-size: 18px; font-weight: 700; color: #111C2D; margin: 0 0 24px 0; font-family: 'Plus Jakarta Sans', sans-serif;">What happens next?</h2>
        
        <!-- Step 1 -->
        <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="width: 40px; vertical-align: top; padding-right: 16px;">
              <div style="background: linear-gradient(135deg, #4f46e5 0%, #3525cd 100%); width: 36px; height: 36px; border-radius: 18px; color: #ffffff; font-weight: bold; font-size: 14px; text-align: center; line-height: 36px; font-family: 'Plus Jakarta Sans', sans-serif;">1</div>
            </td>
            <td style="vertical-align: top;">
              <h3 style="font-size: 14px; font-weight: 700; color: #111C2D; margin: 0 0 4px 0; font-family: 'Plus Jakarta Sans', sans-serif;">Set your password</h3>
              <p style="font-size: 14px; color: #464555; margin: 0; line-height: 1.5; font-family: 'Plus Jakarta Sans', sans-serif;">Secure your account by configuring your corporate credentials and MFA settings.</p>
            </td>
          </tr>
        </table>

        <!-- Step 2 -->
        <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="width: 40px; vertical-align: top; padding-right: 16px;">
              <div style="background: linear-gradient(135deg, #4f46e5 0%, #3525cd 100%); width: 36px; height: 36px; border-radius: 18px; color: #ffffff; font-weight: bold; font-size: 14px; text-align: center; line-height: 36px; font-family: 'Plus Jakarta Sans', sans-serif;">2</div>
            </td>
            <td style="vertical-align: top;">
              <h3 style="font-size: 14px; font-weight: 700; color: #111C2D; margin: 0 0 4px 0; font-family: 'Plus Jakarta Sans', sans-serif;">Complete your profile</h3>
              <p style="font-size: 14px; color: #464555; margin: 0; line-height: 1.5; font-family: 'Plus Jakarta Sans', sans-serif;">Upload your professional portfolio and academic transcripts for recruiter review.</p>
            </td>
          </tr>
        </table>

        <!-- Step 3 -->
        <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="width: 40px; vertical-align: top; padding-right: 16px;">
              <div style="background: linear-gradient(135deg, #4f46e5 0%, #3525cd 100%); width: 36px; height: 36px; border-radius: 18px; color: #ffffff; font-weight: bold; font-size: 14px; text-align: center; line-height: 36px; font-family: 'Plus Jakarta Sans', sans-serif;">3</div>
            </td>
            <td style="vertical-align: top;">
              <h3 style="font-size: 14px; font-weight: 700; color: #111C2D; margin: 0 0 4px 0; font-family: 'Plus Jakarta Sans', sans-serif;">Apply to drives</h3>
              <p style="font-size: 14px; color: #464555; margin: 0; line-height: 1.5; font-family: 'Plus Jakarta Sans', sans-serif;">Browse available executive placement drives and submit your applications directly.</p>
            </td>
          </tr>
        </table>

      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f0f3ff; padding: 32px 24px; text-align: center; border-top: 1px solid rgba(199, 196, 216, 0.2);">
      <div style="margin-bottom: 16px;">
        <a href="#" style="font-size: 12px; color: #3525cd; text-decoration: none; margin: 0 12px; font-weight: 600; font-family: 'Plus Jakarta Sans', sans-serif;">Support</a>
        <a href="#" style="font-size: 12px; color: #3525cd; text-decoration: none; margin: 0 12px; font-weight: 600; font-family: 'Plus Jakarta Sans', sans-serif;">Privacy Policy</a>
        <a href="#" style="font-size: 12px; color: #3525cd; text-decoration: none; margin: 0 12px; font-weight: 600; font-family: 'Plus Jakarta Sans', sans-serif;">Preference Center</a>
      </div>
      <p style="font-size: 12px; color: #464555; margin: 0 0 8px 0; line-height: 1.6; font-family: 'Plus Jakarta Sans', sans-serif;">
        Sent by Alignova Placement Portal • Executive precision in career placement.
      </p>
      <p style="font-size: 12px; color: #777587; margin: 0; font-family: 'Plus Jakarta Sans', sans-serif;">
        © 2024 Alignova International. All rights reserved.
      </p>
      <div style="margin-top: 24px; opacity: 0.4;">
        <img alt="Alignova Logo" src="{logo_blue_url}" style="height: 24px; width: auto; filter: grayscale(100%);" />
      </div>
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


def send_welcome_email(to_email: str, student_name: str, set_password_token: str, base_url: str = None) -> bool:
    """
    Send the welcome / account-activation email.
    Runs in a background thread — never blocks the API response.
    """
    if not EMAIL_PROXY_URL and not BREVO_API_KEY and not RESEND_API_KEY:
        print("[email] No provider configured — skipping welcome email.")
        return False

    active_base_url = (base_url or APP_BASE_URL).rstrip("/")
    set_password_url = f"{active_base_url}/set-password?token={set_password_token}"
    logo_white_url = f"{active_base_url}/logo_white.png"
    logo_blue_url = f"{active_base_url}/logo.png"
    subject = "🎓 Welcome to AlignNova — Activate Your Account"
    html    = _build_welcome_html(student_name, set_password_url, logo_white_url, logo_blue_url)
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
