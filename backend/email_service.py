import os
import json
import threading
import urllib.request
import urllib.error

# ─── Resend Configuration ─────────────────────────────────────────────────────
# Set RESEND_API_KEY in your Render environment variables.
# Sign up free at https://resend.com → API Keys → Create API Key
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")

# The "From" address. Free Resend accounts can use: onboarding@resend.dev
# Once you verify your own domain, update this to something@yourdomain.com
FROM_EMAIL = os.getenv("FROM_EMAIL", "onboarding@resend.dev")
FROM_NAME  = os.getenv("FROM_NAME",  "AlignNova Portal")

APP_BASE_URL = os.getenv("APP_BASE_URL", "http://localhost:5173")


def _build_welcome_html(student_name: str, set_password_url: str) -> str:
    """Build a premium HTML welcome email."""
    first_name = student_name.split()[0] if student_name else "Student"
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to AlignNova</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    body {{ font-family: 'Inter', Arial, sans-serif; background: #f0f4f8; color: #1a1a2e; }}
    .wrapper {{ max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.12); }}
    .header {{ background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #2563eb 100%); padding: 48px 40px 40px; text-align: center; position: relative; overflow: hidden; }}
    .header::before {{ content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 60%); }}
    .logo-badge {{ display: inline-flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); border-radius: 50px; padding: 8px 20px; margin-bottom: 28px; backdrop-filter: blur(10px); }}
    .logo-text {{ color: #ffffff; font-size: 15px; font-weight: 700; letter-spacing: 0.5px; }}
    .header h1 {{ color: #ffffff; font-size: 32px; font-weight: 800; line-height: 1.2; margin-bottom: 12px; }}
    .header p {{ color: rgba(255,255,255,0.80); font-size: 16px; line-height: 1.6; }}
    .confetti-row {{ text-align: center; font-size: 28px; margin: 24px 0 0; letter-spacing: 6px; }}
    .body {{ padding: 40px; }}
    .greeting {{ font-size: 22px; font-weight: 700; color: #1a1a2e; margin-bottom: 16px; }}
    .message {{ font-size: 15px; color: #4b5563; line-height: 1.7; margin-bottom: 24px; }}
    .highlight-box {{ background: linear-gradient(135deg, #f0f4ff 0%, #faf0ff 100%); border: 1px solid #e0e7ff; border-radius: 14px; padding: 20px 24px; margin-bottom: 32px; }}
    .highlight-box p {{ font-size: 14px; color: #4338ca; font-weight: 500; line-height: 1.6; }}
    .highlight-box strong {{ color: #3730a3; }}
    .cta-section {{ text-align: center; margin-bottom: 36px; }}
    .cta-button {{ display: inline-block; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #ffffff !important; text-decoration: none; font-size: 16px; font-weight: 700; padding: 16px 48px; border-radius: 50px; box-shadow: 0 8px 24px rgba(79,70,229,0.35); letter-spacing: 0.3px; }}
    .cta-subtext {{ margin-top: 14px; font-size: 13px; color: #9ca3af; }}
    .steps {{ margin-bottom: 36px; }}
    .steps h3 {{ font-size: 16px; font-weight: 700; color: #1a1a2e; margin-bottom: 16px; }}
    .step {{ display: flex; align-items: flex-start; gap: 14px; margin-bottom: 14px; }}
    .step-num {{ width: 28px; height: 28px; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; border-radius: 50%; font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }}
    .step-text {{ font-size: 14px; color: #374151; line-height: 1.5; }}
    .step-text strong {{ color: #1a1a2e; font-weight: 600; }}
    .divider {{ height: 1px; background: #f3f4f6; margin: 28px 0; }}
    .link-fallback {{ font-size: 13px; color: #6b7280; line-height: 1.6; word-break: break-all; }}
    .link-fallback a {{ color: #4f46e5; }}
    .footer {{ background: #f9fafb; border-top: 1px solid #f3f4f6; padding: 28px 40px; text-align: center; }}
    .footer p {{ font-size: 13px; color: #9ca3af; line-height: 1.6; }}
    .footer strong {{ color: #6b7280; }}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo-badge">
        <span class="logo-text">⭐ AlignNova</span>
      </div>
      <h1>You're In,<br/>{first_name}! 🎉</h1>
      <p>Your placement portal account is ready and waiting.</p>
      <div class="confetti-row">✨ 🚀 🎓</div>
    </div>

    <div class="body">
      <p class="greeting">Welcome to AlignNova Placement Portal</p>
      <p class="message">
        Hi <strong>{student_name}</strong>, your institution's placement coordinator has created
        an account for you on <strong>AlignNova</strong> — your gateway to internships, recruitment
        drives, and career opportunities.
      </p>

      <div class="highlight-box">
        <p>
          🔐 <strong>One last step:</strong> Click the button below to set your personal password
          and activate your account. The link is valid for <strong>7 days</strong>.
        </p>
      </div>

      <div class="cta-section">
        <a href="{set_password_url}" class="cta-button">Join Now &rarr;</a>
        <p class="cta-subtext">🔒 Secure link &nbsp;·&nbsp; Expires in 7 days</p>
      </div>

      <div class="steps">
        <h3>What happens next?</h3>
        <div class="step">
          <div class="step-num">1</div>
          <div class="step-text"><strong>Set your password</strong> — Choose a strong, personal password to secure your account.</div>
        </div>
        <div class="step">
          <div class="step-num">2</div>
          <div class="step-text"><strong>Explore your dashboard</strong> — View active internship drives, track applications, and complete your profile.</div>
        </div>
        <div class="step">
          <div class="step-num">3</div>
          <div class="step-text"><strong>Apply to drives</strong> — Browse opportunities posted by your placement team and apply with one click.</div>
        </div>
      </div>

      <div class="divider"></div>

      <p class="link-fallback">
        If the button doesn't work, copy and paste this link into your browser:<br/>
        <a href="{set_password_url}">{set_password_url}</a>
      </p>
    </div>

    <div class="footer">
      <p>
        Sent by <strong>AlignNova Placement Portal</strong>.<br/>
        If you didn't expect this, please contact your placement coordinator.<br/><br/>
        © 2024 AlignNova. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>"""


def send_welcome_email(to_email: str, student_name: str, set_password_token: str) -> bool:
    """
    Send a welcome email via Resend API.
    Runs in a background thread so it never blocks the API response.
    Returns True immediately (fire-and-forget).

    Required env vars:
        RESEND_API_KEY  - from https://resend.com (starts with re_...)
        APP_BASE_URL    - e.g. https://your-app.onrender.com
        FROM_EMAIL      - e.g. onboarding@resend.dev (free) or you@yourdomain.com
    """
    if not RESEND_API_KEY:
        print("[email_service] RESEND_API_KEY not set — skipping welcome email.")
        return False

    set_password_url = f"{APP_BASE_URL}/set-password?token={set_password_token}"
    html_body = _build_welcome_html(student_name, set_password_url)
    plain_body = (
        f"Welcome to AlignNova, {student_name}!\n\n"
        f"Your placement portal account has been created. "
        f"Click the link below to set your password:\n\n"
        f"{set_password_url}\n\n"
        f"This link expires in 7 days.\n\n— AlignNova Team"
    )

    payload = json.dumps({
        "from": f"{FROM_NAME} <{FROM_EMAIL}>",
        "to": [to_email],
        "subject": "🎓 Welcome to AlignNova — Activate Your Account",
        "html": html_body,
        "text": plain_body,
    }).encode("utf-8")

    def _send():
        try:
            req = urllib.request.Request(
                "https://api.resend.com/emails",
                data=payload,
                headers={
                    "Authorization": f"Bearer {RESEND_API_KEY}",
                    "Content-Type": "application/json",
                },
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                result = json.loads(resp.read())
                print(f"[email_service] Welcome email sent to {to_email} | id={result.get('id')}")
        except urllib.error.HTTPError as e:
            body = e.read().decode()
            print(f"[email_service] Resend API error {e.code}: {body}")
        except Exception as exc:
            print(f"[email_service] Failed to send email to {to_email}: {exc}")

    thread = threading.Thread(target=_send, daemon=True)
    thread.start()
    return True
