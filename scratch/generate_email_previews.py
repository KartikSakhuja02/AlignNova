"""Regenerate admin preview HTML after editing backend/email_templates.py.

Run from the project root: python scratch/generate_email_previews.py
Uses sample values only and never sends email.
"""
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from backend import email_templates as templates


def build_previews():
    recipient = 'PREVIEW_RECIPIENT_NAME'
    company = 'PREVIEW_COMPANY_NAME'
    opportunity = dict(student_name=recipient, company=company,
        role='PREVIEW_ROLE_TITLE', type_str='Internship', location='Bengaluru, India',
        package_or_stipend='₹30,000 / month', deadline='20 Nov 2026',
        fit_explanation='Your 8.2 CGPA meets the 7.0 minimum. Your course is eligible and you have no active backlogs.',
        apply_url='#preview-drives')
    return {
        'welcome': templates.build_welcome_html(recipient, '#preview-activation', request_activation_url='#preview-renewal'),
        'opportunity': templates.build_opportunity_alert_html(**opportunity),
        'update': templates.build_opportunity_alert_html(**opportunity, updated_requirements_str='- Minimum CGPA updated to 7.0\n- Computer Science added to eligible courses'),
        'partner': templates.build_partner_welcome_html(recipient, company, '#preview-partner-activation'),
        'reset': templates.build_reset_password_html(recipient, '#preview-password-reset'),
        'test': templates.build_test_email_html(),
    }


if __name__ == '__main__':
    output = ROOT / 'frontend/src/data/email-previews.json'
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(build_previews(), ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Generated {len(build_previews())} email previews from delivery templates.')
