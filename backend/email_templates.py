"""Email-safe HTML shared by delivered messages and generated admin previews.

Colors match frontend/src/theme.css. Essential layout and styling are inline;
the small media query only improves spacing on narrow screens.
"""
from datetime import datetime, timezone
from html import escape

PAPER = '#f8f7f2'
SURFACE = '#fffefa'
INK = '#202e2d'
MUTED = '#626760'
LINE = '#cdd3c5'
GREEN = '#263e36'
ACCENT = '#a6442c'
SOFT = '#e8ebe2'
SANS = 'Arial, Helvetica, sans-serif'
SERIF = "Georgia, 'Times New Roman', serif"


def _text(value):
    return escape(str(value or ''), quote=True)


def _paragraph(text):
    return f'<p style="margin:0 0 20px;color:{MUTED};font:15px/1.75 {SANS};">{text}</p>'


def _heading(title):
    return f'<h1 style="margin:0 0 22px;color:{INK};font:normal 34px/1.15 {SERIF};letter-spacing:-.8px;">{title}</h1>'


def _action(label, url, note=''):
    url = _text(url)
    return f'''<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0 16px;">
<tr><td bgcolor="{GREEN}" style="background:{GREEN};border-radius:3px;text-align:center;mso-padding-alt:16px 26px;">
<a href="{url}" style="display:inline-block;padding:16px 26px;border:1px solid {GREEN};border-radius:3px;color:#ffffff;text-decoration:none;font:bold 14px/1.3 {SANS};">{_text(label)} &rarr;</a>
</td></tr></table>
<p style="margin:0 0 22px;color:{MUTED};font:12px/1.6 {SANS};">{_text(note)}</p>
<p style="margin:0 0 6px;color:{MUTED};font:12px/1.6 {SANS};">If the button doesn’t work, copy this link into your browser:</p>
<p style="margin:0 0 26px;font:12px/1.6 {SANS};word-break:break-all;overflow-wrap:anywhere;"><a href="{url}" style="color:{ACCENT};text-decoration:underline;">{url}</a></p>'''


def _steps(items):
    rows = ''.join(f'''<tr><td width="32" valign="top" style="padding:14px 12px 14px 0;border-top:1px solid {LINE};color:{ACCENT};font:italic 18px {SERIF};">{i:02}</td>
<td style="padding:14px 0;border-top:1px solid {LINE};"><p style="margin:0 0 4px;color:{INK};font:bold 14px/1.5 {SANS};">{_text(title)}</p><p style="margin:0;color:{MUTED};font:13px/1.7 {SANS};">{_text(description)}</p></td></tr>'''
                   for i, (title, description) in enumerate(items, 1))
    return f'<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;margin-top:28px;">{rows}</table>'


def _shell(title, eyebrow, preheader, body):
    year = datetime.now(timezone.utc).year
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>{_text(title)}</title>
<style>@media only screen and (max-width:480px) {{ .mail-outer {{ padding:16px 8px!important; }} .mail-body {{ padding:28px 22px!important; }} .mail-header {{ padding:22px!important; }} }}</style></head>
<body style="margin:0;padding:0;background-color:{PAPER};color:{INK};font-family:{SANS};-webkit-text-size-adjust:100%;">
<div style="display:none;font-size:1px;line-height:1px;color:{PAPER};max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">{_text(preheader)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="{PAPER}" style="background:{PAPER};"><tr><td class="mail-outer" align="center" style="padding:40px 16px;">
<!--[if mso]><table role="presentation" width="600" align="center"><tr><td><![endif]-->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="{SURFACE}" style="max-width:600px;background:{SURFACE};border:1px solid {LINE};border-radius:4px;border-spacing:0;">
<tr><td class="mail-header" style="padding:26px 36px;border-bottom:1px solid {LINE};">
<table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td width="38" height="38" align="center" bgcolor="{GREEN}" style="background:{GREEN};border-radius:3px;color:#ffffff;font:34px/38px {SERIF};">a<span style="color:#e1bca6;">.</span></td><td style="padding-left:12px;color:{INK};font:bold 23px/1.2 {SANS};letter-spacing:-1px;">AlignNova</td></tr></table>
</td></tr>
<tr><td class="mail-body" style="padding:36px;">
<p style="margin:0 0 20px;color:{ACCENT};font:bold 10px/1.7 {SANS};letter-spacing:1.7px;">{_text(eyebrow)}</p>
{body}
</td></tr>
<tr><td style="padding:22px 36px;background:{SOFT};border-top:1px solid {LINE};">
<p style="margin:0 0 6px;color:{INK};font:bold 12px/1.6 {SANS};">Your campus placement workspace.</p>
<p style="margin:0;color:{MUTED};font:12px/1.7 {SANS};">Sent by AlignNova. For help, contact your campus placement team.</p>
<p style="margin:14px 0 0;color:{MUTED};font:11px/1.6 {SANS};">&copy; {year} AlignNova</p>
</td></tr></table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>'''


def build_welcome_html(student_name, set_password_url, logo_white_url='', logo_blue_url='', request_activation_url=''):
    # Legacy logo arguments remain accepted for compatibility with existing callers.
    body = _heading(f'Welcome to AlignNova,<br>{_text(student_name)}.')
    body += _paragraph('Your placement team has invited you to AlignNova. Set your password to access your profile, campus opportunities, and applications.')
    body += _action('Set your password', set_password_url, 'This invitation is valid for 7 days and can be used once.')
    if request_activation_url:
        body += _paragraph(f'Invitation expired? <a href="{_text(request_activation_url)}" style="color:{ACCENT};text-decoration:underline;">Request a new activation link</a>.')
    body += _steps([('Make your profile yours.', 'Add your academic records, experience, and resume.'), ('Find the right drives.', 'Browse opportunities that match your course and academic criteria.'), ('Keep your next step in sight.', 'Apply and follow updates from your placement team.')])
    return _shell('Welcome to AlignNova', 'YOUR NEXT CHAPTER', 'Your campus workspace is ready. Set your password to get started.', body)


def build_reset_password_html(student_name, reset_url):
    body = _heading('A fresh start<br>for your password.')
    body += _paragraph(f'Hi {_text(student_name)},')
    body += _paragraph('We received a request to reset your AlignNova password. Use the link below to choose a new one.')
    body += _action('Reset your password', reset_url, 'This link expires in 1 hour and can be used once.')
    body += f'<div style="padding:18px 20px;background:{SOFT};border-left:3px solid {ACCENT};">{_paragraph("Didn’t request a reset? You can ignore this email. Your password will stay the same.")}</div>'
    return _shell('Reset your AlignNova password', 'ACCOUNT ACCESS', 'Reset your password. This link is valid for 1 hour.', body)


def build_opportunity_alert_html(student_name, company, role, type_str, location, package_or_stipend, deadline, fit_explanation, apply_url, logo_white_url='', updated_requirements_str='', company_logo_url=None):
    body = _heading('A role worth<br>looking into.')
    body += _paragraph(f'Hi {_text(student_name)}, this campus drive matches your academic profile. Take a look at the details and decide if it’s your next step.')
    logo = f'<img src="{_text(company_logo_url)}" alt="{_text(company)} logo" width="48" height="48" style="display:block;margin:0 0 16px;border:0;">' if company_logo_url and str(company_logo_url).startswith(('https://', 'http://')) else ''
    body += f'<div style="padding:24px;background:{SOFT};border:1px solid {LINE};">{logo}<p style="margin:0 0 8px;color:{ACCENT};font:bold 10px/1.5 {SANS};letter-spacing:1.3px;">CAMPUS OPPORTUNITY</p><h2 style="margin:0 0 8px;color:{INK};font:normal 25px/1.25 {SERIF};">{_text(role)}</h2><p style="margin:0;color:{MUTED};font:15px/1.6 {SANS};">{_text(company)}</p></div>'
    if updated_requirements_str:
        bullets = ''.join(f'<li style="margin-bottom:6px;">{_text(item.strip().removeprefix("- "))}</li>' for item in updated_requirements_str.splitlines() if item.strip())
        body += f'<div style="margin-top:24px;padding:20px;background:#eedbd0;border-left:3px solid {ACCENT};"><h2 style="margin:0 0 10px;font:bold 14px {SANS};color:#83351f;">Updated requirements</h2><ul style="padding-left:18px;margin:0;color:#83351f;font:14px/1.7 {SANS};">{bullets}</ul></div>'
    rows = ''.join(f'<tr><th scope="row" align="left" width="42%" style="padding:13px 10px 13px 0;border-bottom:1px solid {LINE};color:{MUTED};font:normal 12px/1.6 {SANS};">{label}</th><td style="padding:13px 0;border-bottom:1px solid {LINE};color:{INK};font:bold 13px/1.6 {SANS};word-break:break-word;">{_text(value)}</td></tr>' for label, value in [('Role type', type_str), ('Location', location), ('Package / stipend', package_or_stipend), ('Drive date', deadline)])
    body += f'<table width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;margin:20px 0 24px;"><caption style="text-align:left;color:{INK};font:bold 14px {SANS};padding-bottom:6px;">The details</caption>{rows}</table>'
    body += f'<h2 style="margin:0 0 8px;color:{INK};font:bold 14px {SANS};">Why you’re eligible</h2>' + _paragraph(_text(fit_explanation))
    body += _action('View campus drives', apply_url, 'Sign in to review the full drive details and apply.')
    return _shell('A campus opportunity for you', 'YOUR NEXT STEP', f'{company} is hiring for {role}. Review the drive in your workspace.', body)


def build_partner_welcome_html(partner_name, company_name, set_password_url, logo_white_url=''):
    body = _heading('Good people.<br>New possibilities.')
    body += _paragraph(f'Hi {_text(partner_name)},')
    body += _paragraph(f'Your campus placement team has created a recruiter account for <strong style="color:{INK};">{_text(company_name)}</strong>. Set your password to start exploring student profiles in AlignNova.')
    body += _action('Activate your account', set_password_url, 'This invitation is valid for 7 days and can be used once.')
    body += _steps([('Introduce your company.', 'Upload your company logo and complete your profile.'), ('Get to know the candidates.', 'Browse student profiles, academic records, and experience.'), ('Connect with the placement team.', 'Work with your campus contact to coordinate recruitment drives.')])
    return _shell('Welcome to AlignNova', 'FOR OUR RECRUITING PARTNERS', f'Your recruiter workspace for {company_name} is ready.', body)


def build_test_email_html():
    body = _heading('Your email is<br>in good hands.')
    body += _paragraph('This is a test message from your AlignNova admin panel. If it reached your inbox, your email delivery configuration is working.')
    body += f'<div style="padding:18px 20px;background:{SOFT};border-left:3px solid {GREEN};"><p style="margin:0;color:{INK};font:bold 14px/1.7 {SANS};">Delivery check complete.</p><p style="margin:6px 0 0;color:{MUTED};font:13px/1.7 {SANS};">You’re ready to send campus invitations and opportunity alerts.</p></div>'
    return _shell('AlignNova email delivery test', 'A QUICK CHECK-IN', 'Your AlignNova test email has arrived.', body)
