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
import logging
import threading
import time
import traceback
import urllib.request
import urllib.error

from backend.email_templates import (
    build_welcome_html as _build_welcome_html,
    build_reset_password_html as _build_reset_password_html,
    build_opportunity_alert_html as _build_opportunity_alert_html,
    build_partner_welcome_html as _build_partner_welcome_html,
    build_test_email_html as _build_test_email_html,
)

# ── Logger Setup ─────────────────────────────────────────────────────────────
logger = logging.getLogger("alignnova.email")
logger.setLevel(logging.DEBUG)
if not logger.handlers:
    _handler = logging.StreamHandler()
    _handler.setFormatter(logging.Formatter(
        "%(asctime)s [%(name)s] %(levelname)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    ))
    logger.addHandler(_handler)

# ── Provider Configuration ───────────────────────────────────────────────────
EMAIL_PROXY_URL    = os.getenv("EMAIL_PROXY_URL", "").strip()
if EMAIL_PROXY_URL and not EMAIL_PROXY_URL.endswith("/api/send-email"):
    EMAIL_PROXY_URL = EMAIL_PROXY_URL.rstrip("/") + "/api/send-email"
EMAIL_PROXY_SECRET = os.getenv("EMAIL_PROXY_SECRET", "").strip()

BREVO_API_KEY      = os.getenv("BREVO_API_KEY", "").strip()
RESEND_API_KEY     = os.getenv("RESEND_API_KEY", "").strip()

FROM_NAME          = os.getenv("FROM_NAME", "AlignNova Portal")
APP_BASE_URL       = os.getenv("APP_BASE_URL", "http://localhost:5173").rstrip("/")

# If using Brevo/Proxy, the user sets FROM_EMAIL. If using Resend, it defaults to onboarding@resend.dev.
_default_from = "onboarding@resend.dev"
FROM_EMAIL     = os.getenv("FROM_EMAIL", _default_from).strip()





# ── Sender implementations ────────────────────────────────────────────────────

def _send_via_proxy(to_email: str, subject: str, html: str, plain: str) -> None:
    """Send via Vercel Serverless SMTP Proxy HTTP API. Raises on failure."""
    logger.info("[PROXY] Preparing request to Vercel proxy")
    logger.debug("[PROXY] Proxy URL: %s", EMAIL_PROXY_URL)
    logger.debug("[PROXY] Proxy secret set: %s (length=%d)", bool(EMAIL_PROXY_SECRET), len(EMAIL_PROXY_SECRET))
    logger.debug("[PROXY] To: %s | Subject: %s | From: %s <%s>", to_email, subject, FROM_NAME, FROM_EMAIL)
    logger.debug("[PROXY] HTML body length: %d chars | Plain body length: %d chars", len(html), len(plain))

    payload = json.dumps({
        "to_email": to_email,
        "subject": subject,
        "html": html,
        "plain": plain,
        "from_email": FROM_EMAIL,
        "from_name": FROM_NAME
    }).encode("utf-8")

    logger.debug("[PROXY] Payload size: %d bytes", len(payload))

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
    start_time = time.time()
    logger.info("[PROXY] Sending HTTP POST to %s ...", EMAIL_PROXY_URL)
    with urllib.request.urlopen(req, timeout=15) as resp:
        elapsed = time.time() - start_time
        resp_body = resp.read()
        logger.debug("[PROXY] Response status: %d | Time: %.2fs | Body: %s", resp.status, elapsed, resp_body.decode()[:500])
        result = json.loads(resp_body)
        if not result.get("ok"):
            raise Exception(result.get("error", "Unknown proxy error"))
        logger.info("[PROXY] ✓ Success (%.2fs)", elapsed)


def _send_via_brevo(to_email: str, subject: str, html: str, plain: str, recipient_name: str = "") -> None:
    """Send via Brevo HTTP API (over HTTPS port 443). Raises on failure."""
    logger.info("[BREVO] Preparing request to Brevo API")
    logger.debug("[BREVO] API key prefix: %s (length=%d)", BREVO_API_KEY[:8] + "..." if BREVO_API_KEY else "(empty)", len(BREVO_API_KEY))
    logger.debug("[BREVO] To: %s (%s) | Subject: %s | From: %s <%s>", to_email, recipient_name or "no name", subject, FROM_NAME, FROM_EMAIL)

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

    logger.debug("[BREVO] Payload size: %d bytes", len(payload))

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
    start_time = time.time()
    logger.info("[BREVO] Sending HTTP POST to Brevo API ...")
    with urllib.request.urlopen(req, timeout=15) as resp:
        elapsed = time.time() - start_time
        resp_body = resp.read()
        logger.debug("[BREVO] Response status: %d | Time: %.2fs | Body: %s", resp.status, elapsed, resp_body.decode()[:500])
        result = json.loads(resp_body)
        logger.info("[BREVO] ✓ Success — messageId=%s (%.2fs)", result.get('messageId'), elapsed)


def _send_via_resend(to_email: str, subject: str, html: str, plain: str) -> None:
    """Send via Resend HTTP API. Raises on failure."""
    logger.info("[RESEND] Preparing request to Resend API")
    logger.debug("[RESEND] API key prefix: %s (length=%d)", RESEND_API_KEY[:8] + "..." if RESEND_API_KEY else "(empty)", len(RESEND_API_KEY))
    logger.debug("[RESEND] To: %s | Subject: %s | From: %s <%s>", to_email, subject, FROM_NAME, FROM_EMAIL)

    payload = json.dumps({
        "from": f"{FROM_NAME} <{FROM_EMAIL}>",
        "to":   [to_email],
        "subject": subject,
        "html": html,
        "text": plain,
    }).encode("utf-8")

    logger.debug("[RESEND] Payload size: %d bytes", len(payload))

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
    start_time = time.time()
    logger.info("[RESEND] Sending HTTP POST to Resend API ...")
    with urllib.request.urlopen(req, timeout=15) as resp:
        elapsed = time.time() - start_time
        resp_body = resp.read()
        logger.debug("[RESEND] Response status: %d | Time: %.2fs | Body: %s", resp.status, elapsed, resp_body.decode()[:500])
        result = json.loads(resp_body)
        logger.info("[RESEND] ✓ Success — id=%s (%.2fs)", result.get('id'), elapsed)


def _send_with_fallback(to_email: str, subject: str, html: str, plain: str, recipient_name: str = "", tag: str = "EMAIL") -> str:
    """
    Attempt to send an email using configured providers in priority order:
    1. Vercel Proxy (if EMAIL_PROXY_URL set)
    2. Brevo (if BREVO_API_KEY set)
    3. Resend (if RESEND_API_KEY set)

    If a provider fails (e.g. HTTP 410 Gone), it logs a warning and automatically falls back to the next available provider.
    Returns the provider name that succeeded.
    Raises Exception if all providers fail or if none configured.
    """
    providers_tried = []
    errors = []

    # 1. Try Vercel Proxy
    if EMAIL_PROXY_URL:
        providers_tried.append("vercel_proxy")
        try:
            logger.info("[%s] Trying provider #1: Vercel Proxy (%s) ...", tag, EMAIL_PROXY_URL)
            _send_via_proxy(to_email, subject, html, plain)
            logger.info("[%s] ✓ Successfully sent via Vercel Proxy to %s", tag, to_email)
            return "vercel_proxy"
        except Exception as exc:
            err_msg = f"Vercel Proxy error: {exc}"
            logger.warning("[%s] ⚠️ Vercel Proxy failed (%s). Falling back to next available provider...", tag, err_msg)
            errors.append(err_msg)

    # 2. Try Brevo
    if BREVO_API_KEY:
        providers_tried.append("brevo")
        try:
            logger.info("[%s] Trying provider #%d: Brevo ...", tag, len(providers_tried))
            _send_via_brevo(to_email, subject, html, plain, recipient_name)
            logger.info("[%s] ✓ Successfully sent via Brevo to %s", tag, to_email)
            return "brevo"
        except Exception as exc:
            err_msg = f"Brevo error: {exc}"
            logger.warning("[%s] ⚠️ Brevo failed (%s). Falling back to next available provider...", tag, err_msg)
            errors.append(err_msg)

    # 3. Try Resend
    if RESEND_API_KEY:
        providers_tried.append("resend")
        try:
            logger.info("[%s] Trying provider #%d: Resend ...", tag, len(providers_tried))
            _send_via_resend(to_email, subject, html, plain)
            logger.info("[%s] ✓ Successfully sent via Resend to %s", tag, to_email)
            return "resend"
        except Exception as exc:
            err_msg = f"Resend error: {exc}"
            logger.warning("[%s] ⚠️ Resend failed (%s).", tag, err_msg)
            errors.append(err_msg)

    if not providers_tried:
        raise Exception("No email provider configured. Set EMAIL_PROXY_URL, BREVO_API_KEY, or RESEND_API_KEY.")

    raise Exception(f"All configured email providers failed [{', '.join(providers_tried)}]: {'; '.join(errors)}")


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
    logger.info("=" * 60)
    logger.info("[CONFIG] Email Service Configuration:")
    logger.info("[CONFIG]   provider       : %s", cfg['provider'])
    if cfg['provider'] == 'vercel_proxy':
        logger.info("[CONFIG]   proxy_url      : %s", cfg['email_proxy_url'])
        logger.info("[CONFIG]   proxy_secret   : %s", 'SET' if cfg['email_proxy_secret_set'] else 'NOT SET (unsecured)')
    elif cfg['provider'] == 'brevo':
        logger.info("[CONFIG]   brevo_key      : %s", cfg['brevo_key_prefix'])
    elif cfg['provider'] == 'resend':
        logger.info("[CONFIG]   resend_key     : %s", cfg['resend_key_prefix'])
    else:
        logger.warning("[CONFIG]   NO EMAIL PROVIDER configured! Set EMAIL_PROXY_URL, BREVO_API_KEY, or RESEND_API_KEY.")
    logger.info("[CONFIG]   from_email     : %s", cfg['from_email'])
    logger.info("[CONFIG]   from_name      : %s", FROM_NAME)
    logger.info("[CONFIG]   app_base_url   : %s", cfg['app_base_url'])
    # Log all email-related env vars presence (not values)
    logger.info("[CONFIG]   ENV CHECK: EMAIL_PROXY_URL=%s, EMAIL_PROXY_SECRET=%s, BREVO_API_KEY=%s, RESEND_API_KEY=%s, FROM_EMAIL=%s, FROM_NAME=%s, APP_BASE_URL=%s",
        'SET' if EMAIL_PROXY_URL else 'EMPTY',
        'SET' if EMAIL_PROXY_SECRET else 'EMPTY',
        'SET' if BREVO_API_KEY else 'EMPTY',
        'SET' if RESEND_API_KEY else 'EMPTY',
        FROM_EMAIL or 'EMPTY',
        FROM_NAME or 'EMPTY',
        APP_BASE_URL or 'EMPTY'
    )
    logger.info("=" * 60)


def send_test_email_sync(to_email: str) -> dict:
    """Send a test email synchronously and return the result."""
    cfg = get_config_status()

    if not EMAIL_PROXY_URL and not BREVO_API_KEY and not RESEND_API_KEY:
        return {
            "ok": False,
            "provider": "none",
            "error": "No email provider configured. Set EMAIL_PROXY_URL, BREVO_API_KEY, or RESEND_API_KEY in Render environment variables.",
            "config": cfg,
        }

    subject = "✅ AlignNova — Test Email"
    plain   = "This is a test email from AlignNova. If you received this, email delivery is working correctly!"
    html = _build_test_email_html()

    try:
        provider_used = _send_with_fallback(to_email, subject, html, plain, tag="TEST")
        return {"ok": True, "provider": provider_used, "config": cfg}
    except Exception as e:
        logger.error("[TEST] ✗ All email providers failed: %s", e)
        logger.debug("[TEST] Full traceback:\n%s", traceback.format_exc())
        return {"ok": False, "provider": cfg["provider"], "error": str(e), "config": cfg}


def send_welcome_email(to_email: str, student_name: str, set_password_token: str, base_url: str = None) -> bool:
    """
    Send the welcome / account-activation email.
    Runs in a background thread — never blocks the API response.
    """
    if not EMAIL_PROXY_URL and not BREVO_API_KEY and not RESEND_API_KEY:
        logger.warning("[WELCOME] No email provider configured — skipping welcome email to %s", to_email)
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
        logger.info("[WELCOME] Background thread started for %s (student: %s)", to_email, student_name)
        logger.debug("[WELCOME] set_password_url: %s", set_password_url)
        logger.debug("[WELCOME] base_url used: %s", active_base_url)
        send_start = time.time()
        try:
            provider_used = _send_with_fallback(to_email, subject, html, plain, recipient_name=student_name, tag="WELCOME")
            logger.info("[WELCOME] ✓ Sent welcome email to %s via %s (%.2fs)", to_email, provider_used, time.time() - send_start)
        except Exception as exc:
            logger.error("[WELCOME] ✗ Failed sending to %s: %s", to_email, exc)
            logger.debug("[WELCOME] Full traceback:\n%s", traceback.format_exc())

    threading.Thread(target=_send, daemon=True).start()
    return True

    threading.Thread(target=_send, daemon=True).start()
    return True




def send_reset_password_email(to_email: str, student_name: str, reset_token: str, base_url: str = None) -> bool:
    """
    Send the reset password email.
    Runs in a background thread — never blocks the API response.
    """
    if not EMAIL_PROXY_URL and not BREVO_API_KEY and not RESEND_API_KEY:
        logger.warning("[RESET] No email provider configured — skipping reset password email to %s", to_email)
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
        logger.info("[RESET] Background thread started for %s (student: %s)", to_email, student_name)
        logger.debug("[RESET] reset_url: %s", reset_url)
        send_start = time.time()
        try:
            provider_used = _send_with_fallback(to_email, subject, html, plain, recipient_name=student_name, tag="RESET")
            logger.info("[RESET] ✓ Sent reset password email to %s via %s (%.2fs)", to_email, provider_used, time.time() - send_start)
        except Exception as exc:
            logger.error("[RESET] ✗ Failed sending to %s: %s", to_email, exc)
            logger.debug("[RESET] Full traceback:\n%s", traceback.format_exc())

    threading.Thread(target=_send, daemon=True).start()
    return True




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
        logger.warning("[OPPORTUNITY] No email provider configured — skipping opportunity alert to %s", to_email)
        return False

    active_base_url = (base_url or APP_BASE_URL).rstrip("/")
    apply_url = f"{active_base_url}/drives"
    logo_white_url = f"{active_base_url}/logo_white.png"
    subject = f"🔔 AlignNova Opportunity Alert: {company} is hiring for {role}!"
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
        f"— AlignNova Team"
    )

    def _send():
        logger.info("[OPPORTUNITY] Background thread started for %s (student: %s, company: %s, role: %s)", to_email, student_name, company, role)
        send_start = time.time()
        try:
            provider_used = _send_with_fallback(to_email, subject, html, plain, recipient_name=student_name, tag="OPPORTUNITY")
            logger.info("[OPPORTUNITY] ✓ Sent opportunity alert to %s via %s (%.2fs)", to_email, provider_used, time.time() - send_start)
        except Exception as exc:
            logger.error("[OPPORTUNITY] ✗ Failed sending to %s: %s", to_email, exc)
            logger.debug("[OPPORTUNITY] Full traceback:\n%s", traceback.format_exc())

    threading.Thread(target=_send, daemon=True).start()
    return True




def send_partner_welcome_email(to_email: str, partner_name: str, company_name: str, set_password_token: str, base_url: str = None) -> bool:
    """
    Send the partner welcome / account-activation email.
    Runs in a background thread — never blocks the API response.
    """
    if not EMAIL_PROXY_URL and not BREVO_API_KEY and not RESEND_API_KEY:
        logger.warning("[PARTNER] No email provider configured — skipping partner welcome email to %s", to_email)
        return False

    active_base_url = (base_url or APP_BASE_URL).rstrip("/")
    set_password_url = f"{active_base_url}/set-password?token={set_password_token}"
    logo_white_url = f"{active_base_url}/logo_white.png"
    subject = "✉️ Welcome to the Network — Action Required"
    html    = _build_partner_welcome_html(partner_name, company_name, set_password_url, logo_white_url)
    plain   = (
        f"Welcome to the Network, {partner_name}!\n\n"
        f"We are pleased to inform you that an institutional account has been successfully provisioned for your organization ({company_name}) within the AlignNova Placement Portal.\n\n"
        f"Activate your account here:\n{set_password_url}\n\n"
        f"Link expires in 7 days.\n— AlignNova Team"
    )

    def _send():
        logger.info("[PARTNER] Background thread started for %s (partner: %s, company: %s)", to_email, partner_name, company_name)
        logger.debug("[PARTNER] set_password_url: %s", set_password_url)
        send_start = time.time()
        try:
            provider_used = _send_with_fallback(to_email, subject, html, plain, recipient_name=partner_name, tag="PARTNER")
            logger.info("[PARTNER] ✓ Sent partner welcome to %s via %s (%.2fs)", to_email, provider_used, time.time() - send_start)
        except Exception as exc:
            logger.error("[PARTNER] ✗ Failed sending to %s: %s", to_email, exc)
            logger.debug("[PARTNER] Full traceback:\n%s", traceback.format_exc())

    threading.Thread(target=_send, daemon=True).start()
    return True


