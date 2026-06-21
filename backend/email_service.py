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

def _build_welcome_html(student_name: str, set_password_url: str, logo_white_url: str, logo_blue_url: str, request_activation_url: str) -> str:
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
        Welcome to AlignNova, <span style="color: #3525cd; font-weight: 800;">{student_name}</span>!
      </h1>
      <p style="font-size: 16px; color: #464555; line-height: 1.6; margin: 0 0 28px 0; font-family: 'Plus Jakarta Sans', sans-serif;">
        Your executive account is now fully provisioned. Your placement coordinator has assigned your account on AlignNova, the placement management portal.
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

      <!-- Request New Link Option if Expired -->
      <div style="background-color: #f0f3ff; border: 1px solid rgba(79, 70, 229, 0.15); border-radius: 12px; padding: 20px; text-align: center; margin-top: 28px; font-family: 'Plus Jakarta Sans', sans-serif;">
        <p style="font-size: 13px; color: #464555; margin: 0 0 12px 0; line-height: 1.5;">
          Note: This activation link is valid for 7 days. If you couldn't set your password in time, you can request a new link.
        </p>
        <a href="{request_activation_url}" style="display: inline-block; background-color: transparent; border: 1.5px solid #4f46e5; color: #4f46e5; font-size: 13px; font-weight: 600; padding: 10px 24px; text-decoration: none; border-radius: 8px; font-family: 'Plus Jakarta Sans', sans-serif;">
          Request New Activation Link
        </a>
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
        © 2026 Alignova International. All rights reserved.
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
        print("  [WARNING] NO EMAIL PROVIDER configured. Set EMAIL_PROXY_URL, BREVO_API_KEY, or RESEND_API_KEY.")
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
    request_activation_url = f"{active_base_url}/request-activation"
    subject = "🎓 Welcome to AlignNova — Activate Your Account"
    html    = _build_welcome_html(student_name, set_password_url, logo_white_url, logo_blue_url, request_activation_url)
    plain   = (
        f"Welcome to AlignNova, {student_name}!\n\n"
        f"Set your password and access your dashboard here:\n{set_password_url}\n\n"
        f"If the link has expired, request a new one here:\n{request_activation_url}\n\n"
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


def _build_reset_password_html(student_name: str, reset_url: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Reset Your Password | Alignova</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@100..900&display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {{
            darkMode: "class",
            theme: {{
                extend: {{
                    "colors": {{
                        "secondary-fixed-dim": "#4edea3",
                        "tertiary": "#684000",
                        "surface-dim": "#cfdaf2",
                        "primary-container": "#4f46e5",
                        "outline": "#777587",
                        "on-secondary-fixed-variant": "#005236",
                        "on-surface-variant": "#464555",
                        "surface-container": "#e7eeff",
                        "surface-variant": "#d8e3fb",
                        "secondary": "#006c49",
                        "on-primary-fixed-variant": "#3323cc",
                        "secondary-container": "#6cf8bb",
                        "on-primary-container": "#dad7ff",
                        "surface": "#f9f9ff",
                        "primary-fixed": "#e2dfff",
                        "tertiary-container": "#885500",
                        "on-tertiary": "#ffffff",
                        "primary": "#3525cd",
                        "on-primary-fixed": "#0f0069",
                        "secondary-fixed": "#6ffbbe",
                        "on-primary": "#ffffff",
                        "on-tertiary-fixed": "#2a1700",
                        "on-background": "#111c2d",
                        "primary-fixed-dim": "#c3c0ff",
                        "on-tertiary-fixed-variant": "#653e00",
                        "tertiary-fixed-dim": "#ffb95f",
                        "on-secondary": "#ffffff",
                        "surface-tint": "#4d44e3",
                        "inverse-on-surface": "#ecf1ff",
                        "inverse-primary": "#c3c0ff",
                        "outline-variant": "#c7c4d8",
                        "on-error-container": "#93000a",
                        "surface-container-high": "#dee8ff",
                        "background": "#f9f9ff",
                        "error-container": "#ffdad6",
                        "inverse-surface": "#263143",
                        "on-error": "#ffffff",
                        "surface-container-low": "#f0f3ff",
                        "surface-bright": "#f9f9ff",
                        "on-secondary-container": "#00714d",
                        "on-tertiary-container": "#ffd4a4",
                        "tertiary-fixed": "#ffddb8",
                        "on-secondary-fixed": "#002113",
                        "error": "#ba1a1a",
                        "on-surface": "#111c2d",
                        "surface-container-lowest": "#ffffff",
                        "surface-container-highest": "#d8e3fb"
                    }},
                    "borderRadius": {{
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    }},
                    "spacing": {{
                        "gutter": "1.5rem",
                        "p-sm": "1rem",
                        "p-md": "1.5rem",
                        "p-lg": "2rem",
                        "p-xl": "3rem",
                        "margin-page": "2rem",
                        "container-max": "1280px"
                    }},
                    "fontFamily": {{
                        "headline-lg": ["Plus Jakarta Sans"],
                        "headline-md": ["Plus Jakarta Sans"],
                        "body-md": ["Plus Jakarta Sans"],
                        "display-lg": ["Plus Jakarta Sans"],
                        "caption": ["Plus Jakarta Sans"],
                        "label-md": ["Plus Jakarta Sans"],
                        "headline-lg-mobile": ["Plus Jakarta Sans"],
                        "body-lg": ["Plus Jakarta Sans"]
                    }},
                    "fontSize": {{
                        "headline-lg": ["32px", {{"lineHeight": "1.3", "letterSpacing": "-0.01em", "fontWeight": "700"}}],
                        "headline-md": ["24px", {{"lineHeight": "1.4", "fontWeight": "700"}}],
                        "body-md": ["16px", {{"lineHeight": "1.5", "fontWeight": "400"}}],
                        "display-lg": ["48px", {{"lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "800"}}],
                        "caption": ["12px", {{"lineHeight": "1.4", "fontWeight": "500"}}],
                        "label-md": ["14px", {{"lineHeight": "1.4", "letterSpacing": "0.05em", "fontWeight": "600"}}],
                        "headline-lg-mobile": ["24px", {{"lineHeight": "1.3", "fontWeight": "700"}}],
                        "body-lg": ["18px", {{"lineHeight": "1.6", "fontWeight": "400"}}]
                    }}
                }},
            }},
        }}
    </script>
<style>
        .material-symbols-outlined {{
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }}
        body {{
            background-color: #f9f9ff;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
        }}
        .email-container {{
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 1rem;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -2px rgba(0, 0, 0, 0.02);
            border: 1px solid #F1F5F9;
        }}
    </style>
</head>
<body class="font-body-md text-on-surface">
<div class="email-container">
<!-- Color-block Header -->
<div class="bg-[#4f46e5] p-p-xl flex flex-col items-center justify-center text-center">
<img alt="Alignova Logo" class="h-12 w-auto mb-4" src="https://lh3.googleusercontent.com/aida/AP1WRLtawblBVTGVcbxugRT_8IY0NV0YtmE4pqf60GQg82KkLD6t1GGs0Lr5ircuMVkUEpzudUUFLXoKlKofbgMNH3yOhLRgTJhO12Mc6R6mpjW50Z9sZWJaArMORE31dz6khWqQ0ExPtkNuMjlJ0hrzD_v0ZaQDT1Vo-0sdBmGhOMOhHmV_fdwNdBnXV0sVUDmhG4ufAdAjlaRL_mrhPyj0w0nnXXu2WIJkYHQyZ-cd6B6_oJEO49Iu9Hr65sA"/>
<div class="text-white font-headline-md text-headline-md tracking-tight">
                Alignova
            </div>
<div class="text-white/80 font-label-md text-caption uppercase tracking-widest mt-1">
                Executive Precision
            </div>
</div>
<!-- Email Body -->
<div class="p-p-xl bg-surface-container-lowest">
<h1 class="font-headline-lg text-headline-lg text-on-surface mb-6">
                Reset Your Password
            </h1>
<p class="font-body-lg text-body-lg text-on-surface-variant mb-8 leading-relaxed">
                Hello {student_name},<br/><br/>
                We received a request to reset the password for your AlignNova account. Click the button below to choose a new password.
            </p>
<!-- CTA Button -->
<div class="mb-10">
<a class="inline-block bg-[#4f46e5] text-white font-label-md text-label-md px-10 py-4 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform duration-200 ease-in-out no-underline" href="{reset_url}">
                    Reset Password
                </a>
</div>
<!-- Security Note -->
<div class="p-p-md bg-surface-container-low rounded-xl border border-outline-variant/30">
<p class="font-caption text-caption text-on-surface-variant flex items-start gap-3">
<span class="material-symbols-outlined text-primary text-[18px]">info</span>
<span>If you didn't request this, you can safely ignore this email. The link will expire in 1 hour.</span>
</p>
</div>
</div>
<!-- Minimal Footer -->
<div class="p-p-lg bg-surface border-t border-outline-variant/20 text-center">
<div class="flex justify-center gap-6 mb-6">
<a class="text-on-surface-variant hover:text-primary transition-colors" href="#">
<span class="material-symbols-outlined">public</span>
</a>
<a class="text-on-surface-variant hover:text-primary transition-colors" href="#">
<span class="material-symbols-outlined">description</span>
</a>
<a class="text-on-surface-variant hover:text-primary transition-colors" href="#">
<span class="material-symbols-outlined">mail</span>
</a>
</div>
<p class="font-caption text-caption text-on-surface-variant/60 mb-2">
                © 2026 Alignova Executive Career Placement. All rights reserved.
            </p>
<p class="font-caption text-caption text-on-surface-variant/60">
                123 Corporate Plaza, Finance District, NY 10004
            </p>
<div class="mt-6 flex justify-center gap-4">
<a class="font-label-md text-[10px] text-on-surface-variant uppercase tracking-tighter hover:text-primary" href="#">Privacy Policy</a>
<span class="text-outline-variant">•</span>
<a class="font-label-md text-[10px] text-on-surface-variant uppercase tracking-tighter hover:text-primary" href="#">Terms of Service</a>
<span class="text-outline-variant">•</span>
<a class="font-label-md text-[10px] text-on-surface-variant uppercase tracking-tighter hover:text-primary" href="#">Unsubscribe</a>
</div>
</div>
</div>
<!-- Atmospheric subtle background detail -->
<div class="fixed inset-0 -z-10 pointer-events-none opacity-40">
<div class="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full"></div>
<div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 blur-[120px] rounded-full"></div>
</div>
</body></html>"""


def send_reset_password_email(to_email: str, student_name: str, reset_token: str, base_url: str = None) -> bool:
    """
    Send the reset password email.
    Runs in a background thread — never blocks the API response.
    """
    if not EMAIL_PROXY_URL and not BREVO_API_KEY and not RESEND_API_KEY:
        print("[email] No provider configured — skipping reset password email.")
        return False

    active_base_url = (base_url or APP_BASE_URL).rstrip("/")
    reset_url = f"{active_base_url}/set-password?token={reset_token}"
    subject = "🔑 Reset Your Password — AlignNova"
    html    = _build_reset_password_html(student_name, reset_url)
    plain   = (
        f"Reset Your Password\n\n"
        f"Hello {student_name},\n"
        f"We received a request to reset your password. Click here to choose a new password:\n{reset_url}\n\n"
        f"The link will expire in 1 hour.\n— AlignNova Team"
    )

    def _send():
        try:
            if EMAIL_PROXY_URL:
                print(f"[email] Sending reset password email via Vercel Proxy to {to_email} ...")
                _send_via_proxy(to_email, subject, html, plain)
                print(f"[email] ✓ Sent reset password email via Vercel Proxy to {to_email}")
            elif BREVO_API_KEY:
                print(f"[email] Sending reset password email via Brevo to {to_email} ...")
                _send_via_brevo(to_email, subject, html, plain, student_name)
                print(f"[email] ✓ Sent reset password email via Brevo to {to_email}")
            else:
                print(f"[email] Sending reset password email via Resend to {to_email} ...")
                _send_via_resend(to_email, subject, html, plain)
                print(f"[email] ✓ Sent reset password email via Resend to {to_email}")
        except urllib.error.HTTPError as e:
            body = e.read().decode()
            print(f"[email] ✗ API error {e.code}: {body}")
        except Exception as exc:
            print(f"[email] ✗ Failed to send reset password email to {to_email}: {type(exc).__name__}: {exc}")

    threading.Thread(target=_send, daemon=True).start()
    return True


def _build_opportunity_alert_html(
    student_name: str,
    company: str,
    role: str,
    type_str: str,
    location: str,
    package_or_stipend: str,
    deadline: str,
    fit_explanation: str,
    apply_url: str,
    logo_white_url: str,
    updated_requirements_str: str = "",
    company_logo_url: str = None
) -> str:
    logo_cell = ""
    if company_logo_url:
        logo_cell = f"""
              <td style="vertical-align: middle; padding-right: 16px; width: 64px;">
                <div style="width: 56px; height: 56px; background-color: #ffffff; border-radius: 12px; border: 1px solid #c7c4d8; text-align: center; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                  <img src="{company_logo_url}" alt="{company} Logo" style="max-width: 100%; max-height: 100%; object-fit: contain; display: block;" />
                </div>
              </td>
        """

    req_update_block = ""
    if updated_requirements_str:
        bullets = "".join(f"<li style='margin-bottom: 6px;'>{item.strip('- ')}</li>" for item in updated_requirements_str.strip().split("\n") if item.strip())
        req_update_block = f"""
      <div style="background-color: #fffbeb; padding: 20px; border-radius: 12px; margin-bottom: 32px; border: 1px solid #fef3c7;">
        <table role="presentation" style="border-collapse: collapse; margin-bottom: 8px;">
          <tr>
            <td style="color: #b45309; font-size: 16px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif;">🎉 Requirement Update</td>
          </tr>
        </table>
        <p style="font-size: 14px; line-height: 1.5; color: #78350f; margin: 0 0 8px 0; font-family: 'Plus Jakarta Sans', sans-serif;">
          Good news! You are now eligible for this opportunity because the application criteria were recently updated:
        </p>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #78350f; line-height: 1.5; font-family: 'Plus Jakarta Sans', sans-serif;">
          {bullets}
        </ul>
      </div>
      """

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  <title>Alignova Opportunity Alert</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
</head>
<body style="background-color: #f0f3ff; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111C2D; margin: 0; padding: 48px 16px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #c7c4d8; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <div style="background-color: #4f46e5; padding: 32px 24px; text-align: center; position: relative; overflow: hidden;">
      <table role="presentation" style="margin: 0 auto; border-collapse: collapse;">
        <tr>
          <td style="vertical-align: middle;">
            <img alt="Alignova Logo" src="{logo_white_url}" style="height: 36px; width: auto; vertical-align: middle; border-radius: 8px;" />
          </td>
          <td style="vertical-align: middle; padding-left: 12px;">
            <span style="font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.01em; font-family: 'Plus Jakarta Sans', sans-serif;">Alignova</span>
          </td>
        </tr>
      </table>
    </div>
    <div style="padding: 32px 24px;">
      <div style="margin-bottom: 32px;">
        <p style="font-size: 16px; color: #464555; margin: 0 0 16px 0;">Hi {student_name},</p>
        <h2 style="font-size: 28px; font-weight: 700; color: #3525cd; margin: 0 0 24px 0; line-height: 1.3;">You are eligible for a new placement drive</h2>
        <div style="background-color: #e7eeff; padding: 24px; border-radius: 12px; border: 1px solid #c7c4d8;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              {logo_cell}
              <td style="vertical-align: middle;">
                <div style="font-size: 14px; font-weight: 600; color: #006c49; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">New Opportunity</div>
                <h3 style="font-size: 20px; font-weight: 700; color: #111c2d; margin: 0 0 4px 0;">{role}</h3>
                <p style="font-size: 16px; color: #464555; margin: 0;">{company}</p>
              </td>
            </tr>
          </table>
        </div>
      </div>
      {req_update_block}
      <div style="background-color: rgba(226, 223, 255, 0.3); padding: 20px; border-radius: 12px; margin-bottom: 32px;">
        <table role="presentation" style="border-collapse: collapse; margin-bottom: 12px;">
          <tr>
            <td style="color: #3525cd; font-size: 16px; font-weight: 600;">Why you're a fit</td>
          </tr>
        </table>
        <p style="font-size: 16px; line-height: 1.5; color: #111c2d; margin: 0;">{fit_explanation}</p>
      </div>
      <div style="border: 1px solid #c7c4d8; border-radius: 12px; overflow: hidden; margin-bottom: 32px;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f0f3ff;">
          <tr>
            <td style="padding: 16px; border-bottom: 1px solid #c7c4d8; border-right: 1px solid #c7c4d8; width: 50%;">
              <p style="font-size: 12px; color: #464555; margin: 0 0 4px 0; text-transform: uppercase; font-weight: 500;">Location</p>
              <p style="font-size: 14px; font-weight: 600; color: #111c2d; margin: 0;">{location}</p>
            </td>
            <td style="padding: 16px; border-bottom: 1px solid #c7c4d8; width: 50%;">
              <p style="font-size: 12px; color: #464555; margin: 0 0 4px 0; text-transform: uppercase; font-weight: 500;">Role Type</p>
              <p style="font-size: 14px; font-weight: 600; color: #111c2d; margin: 0;">{type_str}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 16px; border-right: 1px solid #c7c4d8; width: 50%;">
              <p style="font-size: 12px; color: #464555; margin: 0 0 4px 0; text-transform: uppercase; font-weight: 500;">Package / Stipend</p>
              <p style="font-size: 14px; font-weight: 600; color: #006c49; margin: 0;">{package_or_stipend}</p>
            </td>
            <td style="padding: 16px; width: 50%;">
              <p style="font-size: 12px; color: #464555; margin: 0 0 4px 0; text-transform: uppercase; font-weight: 500;">Deadline</p>
              <p style="font-size: 14px; font-weight: 600; color: #ba1a1a; margin: 0;">{deadline}</p>
            </td>
          </tr>
        </table>
      </div>
      <div style="text-align: center; margin-bottom: 16px;">
        <table role="presentation" style="margin: 0 auto; border-collapse: collapse;">
          <tr>
            <td align="center">
              <a href="{apply_url}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-size: 14px; font-weight: 600; padding: 16px 40px; text-decoration: none; border-radius: 9999px; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.15); font-family: 'Plus Jakarta Sans', sans-serif;">
                View Details &amp; Apply &nbsp;&rarr;
              </a>
            </td>
          </tr>
        </table>
        <p style="font-size: 12px; color: #464555; margin-top: 16px; margin-bottom: 0;">Applicants are reviewed on a rolling basis. Early applications are encouraged.</p>
      </div>
    </div>
    <div style="background-color: #f0f3ff; padding: 32px 24px; text-align: center; border-top: 1px solid #c7c4d8;">
      <div style="margin-bottom: 24px;">
        <a href="{apply_url}" style="font-size: 12px; color: #3525cd; text-decoration: none; margin: 0 12px; font-weight: 600;">Dashboard</a>
        <a href="#" style="font-size: 12px; color: #3525cd; text-decoration: none; margin: 0 12px; font-weight: 600;">Support</a>
        <a href="#" style="font-size: 12px; color: #3525cd; text-decoration: none; margin: 0 12px; font-weight: 600;">Privacy Policy</a>
      </div>
      <div style="margin-bottom: 8px;">
        <p style="font-size: 14px; font-weight: 600; color: #464555; margin: 0 0 8px 0;">Sent by Alignova Placement Portal</p>
        <p style="font-size: 12px; color: #777587; max-w-xs; margin: 0 auto; line-height: 1.5;">
          This is an automated notification based on your profile preferences and eligibility. Manage your email preferences in your settings.
        </p>
      </div>
    </div>
  </div>
</body>
</html>"""


def send_opportunity_alert_email(
    to_email: str,
    student_name: str,
    company: str,
    role: str,
    type_str: str,
    location: str,
    package_or_stipend: str,
    deadline: str,
    fit_explanation: str,
    base_url: str = None,
    updated_requirements_str: str = "",
    company_logo_url: str = None
) -> bool:
    """
    Send the opportunity alert email.
    Runs in a background thread — never blocks the API response.
    """
    if not EMAIL_PROXY_URL and not BREVO_API_KEY and not RESEND_API_KEY:
        print("[email] No provider configured — skipping opportunity alert email.")
        return False

    active_base_url = (base_url or APP_BASE_URL).rstrip("/")
    apply_url = f"{active_base_url}/opportunities"
    logo_white_url = f"{active_base_url}/logo_white.png"
    subject = f"🔔 Alignova Opportunity Alert: {company} is hiring for {role}!"
    html    = _build_opportunity_alert_html(
        student_name=student_name,
        company=company,
        role=role,
        type_str=type_str,
        location=location,
        package_or_stipend=package_or_stipend,
        deadline=deadline,
        fit_explanation=fit_explanation,
        apply_url=apply_url,
        logo_white_url=logo_white_url,
        updated_requirements_str=updated_requirements_str,
        company_logo_url=company_logo_url
    )
    
    plain_update_str = f"\n\nRequirement Update:\nYou are now eligible because the criteria were updated:\n{updated_requirements_str}" if updated_requirements_str else ""
    
    plain   = (
        f"Hi {student_name},\n\n"
        f"You are eligible for a new placement drive: {company} - {role} ({type_str}).{plain_update_str}\n\n"
        f"Why you're a fit:\n{fit_explanation}\n\n"
        f"Details:\n"
        f"- Location: {location}\n"
        f"- Stipend/Package: {package_or_stipend}\n"
        f"- Deadline: {deadline}\n\n"
        f"Apply on your dashboard: {apply_url}\n\n"
        f"— Alignnova Team"
    )

    def _send():
        try:
            if EMAIL_PROXY_URL:
                print(f"[email] Sending opportunity alert via Vercel Proxy to {to_email} ...")
                _send_via_proxy(to_email, subject, html, plain)
                print(f"[email] ✓ Sent opportunity alert via Vercel Proxy to {to_email}")
            elif BREVO_API_KEY:
                print(f"[email] Sending opportunity alert via Brevo to {to_email} ...")
                _send_via_brevo(to_email, subject, html, plain, student_name)
                print(f"[email] ✓ Sent opportunity alert via Brevo to {to_email}")
            else:
                print(f"[email] Sending opportunity alert via Resend to {to_email} ...")
                _send_via_resend(to_email, subject, html, plain)
                print(f"[email] ✓ Sent opportunity alert via Resend to {to_email}")
        except urllib.error.HTTPError as e:
            body = e.read().decode()
            print(f"[email] ✗ API error {e.code}: {body}")
        except Exception as exc:
            print(f"[email] ✗ Failed to send opportunity alert to {to_email}: {type(exc).__name__}: {exc}")

    threading.Thread(target=_send, daemon=True).start()
    return True


def _build_partner_welcome_html(partner_name: str, company_name: str, set_password_url: str, logo_white_url: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  <title>Welcome to the Network</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
</head>
<body style="background-color: #F8FAFC; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111C2D; margin: 0; padding: 32px 16px; min-height: 100vh;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid rgba(199, 196, 216, 0.3); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);">
    <!-- Brand Header -->
    <div style="background-color: #4f46e5; padding: 24px; border-bottom: 1px solid rgba(199, 196, 216, 0.1);">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="vertical-align: middle;">
            <img alt="Alignova Logo" src="{logo_white_url}" style="height: 36px; width: auto; vertical-align: middle; border-radius: 6px; display: inline-block;" />
            <span style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.01em; margin-left: 8px; font-family: 'Plus Jakarta Sans', sans-serif; vertical-align: middle; display: inline-block;">Alignova</span>
            <span style="font-size: 11px; font-weight: 500; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 0.1em; margin-left: 8px; font-family: 'Plus Jakarta Sans', sans-serif; vertical-align: middle; display: inline-block;">Institutional Partner</span>
          </td>
          <td align="right" style="vertical-align: middle; color: rgba(255,255,255,0.4); font-size: 12px; font-weight: 600; font-family: 'Plus Jakarta Sans', sans-serif;">
            Placement Portal v2.4
          </td>
        </tr>
      </table>
    </div>
    
    <!-- Hero Banner -->
    <div style="background-color: #dee8ff; padding: 40px 24px; text-align: left;">
      <h2 style="font-size: 28px; font-weight: 700; color: #111c2d; margin: 0; font-family: 'Plus Jakarta Sans', sans-serif;">Welcome to the Network</h2>
    </div>

    <!-- Body Content -->
    <div style="padding: 32px 24px; background-color: #ffffff;">
      <p style="font-size: 16px; color: #464555; line-height: 1.6; margin: 0 0 16px 0; font-family: 'Plus Jakarta Sans', sans-serif;">Dear Partner,</p>
      <p style="font-size: 15px; color: #464555; line-height: 1.6; margin: 0 0 16px 0; font-family: 'Plus Jakarta Sans', sans-serif;">
        We are pleased to inform you that an institutional account has been successfully provisioned for your organization within the <span style="font-weight: 600; color: #4f46e5;">Alignova Placement Portal</span>.
      </p>
      <p style="font-size: 15px; color: #464555; line-height: 1.6; margin: 0 0 24px 0; font-family: 'Plus Jakarta Sans', sans-serif;">
        As an official corporate partner, you now have priority access to our elite pool of high-performing student talent. This workspace is designed to streamline your end-to-end recruitment lifecycle.
      </p>

      <!-- CTA -->
      <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 28px 0; text-align: center;">
        <tr>
          <td>
            <a href="{set_password_url}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-size: 14px; font-weight: 600; padding: 14px 40px; text-decoration: none; border-radius: 10px; box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.2); font-family: 'Plus Jakarta Sans', sans-serif;">
              Activate Account &nbsp;&rarr;
            </a>
            <p style="margin-top: 12px; font-size: 11px; color: #777587; font-family: 'Plus Jakarta Sans', sans-serif;">Link expires in 48 hours for security reasons.</p>
          </td>
        </tr>
      </table>

      <hr style="border: 0; border-top: 1px solid rgba(199, 196, 216, 0.3); margin: 32px 0;" />

      <!-- Features Grid -->
      <div style="margin-bottom: 32px;">
        <h3 style="font-size: 18px; font-weight: 700; color: #111c2d; margin: 0 0 20px 0; font-family: 'Plus Jakarta Sans', sans-serif;">Getting Started</h3>
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 31%; padding: 12px; background-color: #e7eeff; border-radius: 12px; vertical-align: top; border: 1px solid rgba(199, 196, 216, 0.1);">
              <span style="font-size: 14px; font-weight: 700; color: #111c2d; display: block; margin-bottom: 4px; font-family: 'Plus Jakarta Sans', sans-serif;">Profile Setup</span>
              <span style="font-size: 11px; color: #464555; line-height: 1.4; display: block; font-family: 'Plus Jakarta Sans', sans-serif;">Complete your organization's brand identity.</span>
            </td>
            <td style="width: 3.5%;"></td>
            <td style="width: 31%; padding: 12px; background-color: #e7eeff; border-radius: 12px; vertical-align: top; border: 1px solid rgba(199, 196, 216, 0.1);">
              <span style="font-size: 14px; font-weight: 700; color: #111c2d; display: block; margin-bottom: 4px; font-family: 'Plus Jakarta Sans', sans-serif;">Launch Drives</span>
              <span style="font-size: 11px; color: #464555; line-height: 1.4; display: block; font-family: 'Plus Jakarta Sans', sans-serif;">Initiate recruitment campaigns for Q3/Q4.</span>
            </td>
            <td style="width: 3.5%;"></td>
            <td style="width: 31%; padding: 12px; background-color: #e7eeff; border-radius: 12px; vertical-align: top; border: 1px solid rgba(199, 196, 216, 0.1);">
              <span style="font-size: 14px; font-weight: 700; color: #111c2d; display: block; margin-bottom: 4px; font-family: 'Plus Jakarta Sans', sans-serif;">Live Feeds</span>
              <span style="font-size: 11px; color: #464555; line-height: 1.4; display: block; font-family: 'Plus Jakarta Sans', sans-serif;">Review applicant data in real-time streams.</span>
            </td>
          </tr>
        </table>
      </div>

      <!-- Banner Image -->
      <div style="border-radius: 12px; overflow: hidden; height: 120px; border: 1px solid rgba(199, 196, 216, 0.2);">
        <img alt="Office Lounge" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0rTXzfrIpO6Ee40Pm-7lDnsJ43mAUb7MmU3ti_1K7f0QYi5tMtfjb83ZgLpEZG7jzP68x-oNFWjCAfrTEpj0XMggnsDBqOxIND9lxmtPLu7pU1m1pM6RswXFB4196GYSTbYpgXORufIoNX-QD3W4hCoTuV4AliPtNuo9vvRs41AoNAVEZmjMZ3oKsdVLldghnNiIRHUK_kW5EoLTxUxrZ8uu8rW0AkVXVNyWpG1DPS2eJ5NzTX-4lqZHIsOF8w-ZtA4Q_H4OVeeE" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f0f3ff; padding: 24px; border-top: 1px solid rgba(199, 196, 216, 0.2); font-family: 'Plus Jakarta Sans', sans-serif;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td>
            <p style="font-size: 13px; font-weight: 700; color: #111c2d; margin: 0 0 4px 0;">Alignnova Placement Office</p>
            <p style="font-size: 11px; color: #464555; margin: 0;">Institutional Building, South Wing, Level 4</p>
          </td>
          <td align="right" style="vertical-align: middle;">
            <a href="#" style="font-size: 13px; font-weight: 600; color: #4f46e5; text-decoration: none; margin-left: 16px;">Support</a>
            <a href="#" style="font-size: 13px; font-weight: 600; color: #4f46e5; text-decoration: none; margin-left: 16px;">Privacy</a>
          </td>
        </tr>
      </table>
    </div>
  </div>
</body>
</html>
"""


def send_partner_welcome_email(to_email: str, partner_name: str, company_name: str, set_password_token: str, base_url: str = None) -> bool:
    """
    Send the partner welcome / account-activation email.
    Runs in a background thread — never blocks the API response.
    """
    if not EMAIL_PROXY_URL and not BREVO_API_KEY and not RESEND_API_KEY:
        print("[email] No provider configured — skipping partner welcome email.")
        return False

    active_base_url = (base_url or APP_BASE_URL).rstrip("/")
    set_password_url = f"{active_base_url}/set-password?token={set_password_token}"
    logo_white_url = f"{active_base_url}/logo_white.png"
    subject = "✉️ Welcome to the Network — Action Required"
    html    = _build_partner_welcome_html(partner_name, company_name, set_password_url, logo_white_url)
    plain   = (
        f"Welcome to the Network, {partner_name}!\n\n"
        f"We are pleased to inform you that an institutional account has been successfully provisioned for your organization ({company_name}) within the Alignova Placement Portal.\n\n"
        f"Activate your account here:\n{set_password_url}\n\n"
        f"Link expires in 48 hours for security reasons.\n— AlignNova Team"
    )

    def _send():
        try:
            if EMAIL_PROXY_URL:
                print(f"[email] Sending partner welcome via Vercel Proxy to {to_email} ...")
                _send_via_proxy(to_email, subject, html, plain)
                print(f"[email] ✓ Sent partner welcome via Vercel Proxy to {to_email}")
            elif BREVO_API_KEY:
                print(f"[email] Sending partner welcome via Brevo to {to_email} ...")
                _send_via_brevo(to_email, subject, html, plain, partner_name)
                print(f"[email] ✓ Sent partner welcome via Brevo to {to_email}")
            else:
                print(f"[email] Sending partner welcome via Resend to {to_email} ...")
                _send_via_resend(to_email, subject, html, plain)
                print(f"[email] ✓ Sent partner welcome via Resend to {to_email}")
        except urllib.error.HTTPError as e:
            body = e.read().decode()
            print(f"[email] ✗ API error {e.code}: {body}")
        except Exception as exc:
            print(f"[email] ✗ Failed to send partner welcome to {to_email}: {type(exc).__name__}: {exc}")

    threading.Thread(target=_send, daemon=True).start()
    return True


