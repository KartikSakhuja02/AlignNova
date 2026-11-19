"""Offline checks for template content, safe interpolation, and delivery wiring."""
import json
from html.parser import HTMLParser
from pathlib import Path
import unittest
from unittest.mock import patch

from backend import email_service, email_templates
from scratch.generate_email_previews import build_previews


class Links(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.hrefs = []
        self.tags = []
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        self.tags.append(tag)
        if tag == 'a':
            self.hrefs.append(dict(attrs).get('href'))


class EmailTemplatesTest(unittest.TestCase):
    def test_activation_and_reset_urls_and_expiry(self):
        url = 'https://campus.example/set-password?token=sample&purpose=activation'
        for html, expiry in [
            (email_templates.build_welcome_html('Alex', url, request_activation_url='https://campus.example/request-activation'), '7 days'),
            (email_templates.build_partner_welcome_html('Alex', 'Partner', url), '7 days'),
            (email_templates.build_reset_password_html('Alex', url), '1 hour'),
        ]:
            self.assertEqual(Links(html).hrefs.count(url), 2)
            self.assertIn(expiry, html)
            self.assertIn('used once', html)
            self.assertNotIn('script', Links(html).tags)
            self.assertNotIn('link', Links(html).tags)
        welcome = email_templates.build_welcome_html('Alex', url, request_activation_url='https://campus.example/request-activation')
        self.assertIn('https://campus.example/request-activation', Links(welcome).hrefs)

    def test_names_and_requirement_updates_are_text(self):
        payload = '<img src=x onerror="alert(1)"> & Co'
        html = email_templates.build_opportunity_alert_html(payload, payload, payload, 'Internship', payload, payload, payload, payload, 'https://campus.example/drives', updated_requirements_str='- ' + payload)
        self.assertNotIn('<img', html)
        self.assertIn('&lt;img', html)
        self.assertIn('&amp; Co', html)
        self.assertIn('Updated requirements', html)
        self.assertIn('https://campus.example/drives', Links(html).hrefs)
        for html in [email_templates.build_welcome_html(payload, '#activation'), email_templates.build_partner_welcome_html(payload, payload, '#activation'), email_templates.build_reset_password_html(payload, '#reset')]:
            self.assertNotIn('<img', html)
            self.assertIn('&lt;img', html)

    def test_optional_company_logo(self):
        args = ('Alex', 'A & B', 'Engineer', 'Internship', 'Pune', '₹30,000', '20 Nov', 'Eligible course', '/drives')
        html = email_templates.build_opportunity_alert_html(*args, company_logo_url='https://campus.example/logo.png')
        self.assertIn('src="https://campus.example/logo.png"', html)
        self.assertIn('alt="A &amp; B logo"', html)
        self.assertNotIn('<img', email_templates.build_opportunity_alert_html(*args, company_logo_url='javascript:alert(1)'))
        self.assertNotIn('Updated requirements', email_templates.build_opportunity_alert_html(*args))

    def test_previews_match_delivered_templates(self):
        path = Path(__file__).resolve().parents[1] / 'frontend/src/data/email-previews.json'
        self.assertEqual(json.loads(path.read_text(encoding='utf-8')), build_previews())
        for html in build_previews().values():
            self.assertIn('bgcolor="#f8f7f2"', html)
            self.assertIn('bgcolor="#fffefa"', html)
            self.assertIn('width="600"', html)  # Outlook fallback container.
            self.assertNotIn('var(--', html)
            self.assertNotIn('script', Links(html).tags)

    def test_delivery_uses_shared_templates_without_sending(self):
        with patch.object(email_service, 'EMAIL_PROXY_URL', 'https://proxy.example/api/send-email'), \
             patch.object(email_service, 'submit_email', side_effect=lambda job: bool(job() or True)), \
             patch.object(email_service, '_send_with_fallback', return_value='mock') as send:
            email_service.send_welcome_email('sample@example.com', 'Alex', 'sample-token', 'https://campus.example')
            email_service.send_reset_password_email('sample@example.com', 'Alex', 'sample-token', 'https://campus.example')
            email_service.send_partner_welcome_email('sample@example.com', 'Alex', 'Partner', 'sample-token', 'https://campus.example')
            email_service.send_opportunity_alert_email('sample@example.com', 'Alex', 'Partner', 'Engineer', 'Internship', 'Pune', '₹30,000', '20 Nov', 'Eligible', 'https://campus.example')
            result = email_service.send_test_email_sync('sample@example.com')
            self.assertTrue(result['ok'])
            self.assertEqual(send.call_count, 5)
            for call in send.call_args_list:
                self.assertIn('Your campus placement workspace.', call.args[2])
            opportunity = send.call_args_list[3]
            self.assertIn('https://campus.example/drives', Links(opportunity.args[2]).hrefs)
            self.assertIn('https://campus.example/drives', opportunity.args[3])
            self.assertIn('7 days', send.call_args_list[2].args[3])


if __name__ == '__main__':
    unittest.main()
