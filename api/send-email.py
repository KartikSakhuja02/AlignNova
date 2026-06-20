from http.server import BaseHTTPRequestHandler
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        # 1. Parse request body
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self._send_response(400, {"error": "Missing request body"})
                return
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
        except Exception as e:
            self._send_response(400, {"error": f"Invalid JSON body: {str(e)}"})
            return

        # 2. Authenticate using shared secret
        proxy_secret = os.getenv("EMAIL_PROXY_SECRET", "").strip()
        req_secret = self.headers.get("X-Proxy-Secret", "").strip()
        if proxy_secret and req_secret != proxy_secret:
            self._send_response(401, {"error": "Unauthorized: Invalid or missing X-Proxy-Secret"})
            return

        # 3. Read SMTP credentials
        smtp_user = os.getenv("SMTP_USER", "").strip()
        smtp_pass = os.getenv("SMTP_PASS", "").strip()
        smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com").strip()
        try:
            smtp_port = int(os.getenv("SMTP_PORT", "587"))
        except ValueError:
            smtp_port = 587

        if not smtp_user or not smtp_pass:
            self._send_response(500, {"error": "Server configuration error: SMTP_USER or SMTP_PASS not set on Vercel"})
            return

        # 4. Extract email payload
        to_email = data.get("to_email", "").strip()
        subject = data.get("subject", "").strip()
        html = data.get("html", "").strip()
        plain = data.get("plain", "").strip()
        from_email = data.get("from_email", smtp_user).strip()
        from_name = data.get("from_name", "AlignNova Portal").strip()

        if not to_email or not subject or not (html or plain):
            self._send_response(400, {"error": "Missing required fields: to_email, subject, and html or plain body"})
            return

        # 5. Build and send MIME email
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"]    = f"{from_name} <{from_email}>"
            msg["To"]      = to_email
            
            if plain:
                msg.attach(MIMEText(plain, "plain"))
            if html:
                msg.attach(MIMEText(html, "html"))

            with smtplib.SMTP(smtp_host, smtp_port, timeout=20) as server:
                server.ehlo()
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.sendmail(from_email, [to_email], msg.as_string())

            self._send_response(200, {"ok": True})
        except Exception as e:
            self._send_response(500, {"error": f"SMTP failure: {type(e).__name__}: {str(e)}"})

    def _send_response(self, status_code: int, body: dict):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(body).encode('utf-8'))
