from http.server import BaseHTTPRequestHandler
import hmac
import json
import ssl
import smtplib
import time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os


def _log(level, msg):
    """Simple log helper that prints with timestamp and level."""
    ts = time.strftime("%Y-%m-%d %H:%M:%S")
    print(f"{ts} [email-proxy] {level}: {msg}", flush=True)


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Gracefully handle GET requests (e.g. browser visits)
        _log("INFO", "GET request received — returning status")
        self._send_response(200, {
            "status": "active",
            "message": "AlignNova Email Proxy is running. Send POST requests to send emails."
        })

    def do_POST(self):
        _log("INFO", "=" * 50)
        _log("INFO", "POST request received — starting email send flow")

        proxy_secret = os.getenv("EMAIL_PROXY_SECRET", "").strip()
        presented_secret = self.headers.get("X-Proxy-Secret", "")
        if not proxy_secret:
            self._send_response(503, {"error": "Email proxy not configured"})
            return
        if not hmac.compare_digest(presented_secret.encode(), proxy_secret.encode()):
            self._send_response(401, {"error": "Unauthorized"})
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            if not 0 < content_length <= 256 * 1024:
                self._send_response(413, {"error": "Invalid request size"})
                return
            data = json.loads(self.rfile.read(content_length))
            if not isinstance(data, dict) or any(not isinstance(value, str) for value in data.values()):
                raise ValueError("Expected string fields")
        except (ValueError, UnicodeError):
            self._send_response(400, {"error": "Invalid email payload"})
            return

        # 3. Read SMTP credentials
        smtp_user = os.getenv("SMTP_USER", "").strip()
        smtp_pass = os.getenv("SMTP_PASS", "").strip()
        smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com").strip()
        try:
            smtp_port = int(os.getenv("SMTP_PORT", "587"))
        except ValueError:
            smtp_port = 587

        _log("INFO", f"SMTP config: host={smtp_host}, port={smtp_port}")

        if not smtp_user or not smtp_pass:
            _log("ERROR", f"SMTP credentials missing! SMTP_USER={'SET' if smtp_user else 'EMPTY'}, SMTP_PASS={'SET' if smtp_pass else 'EMPTY'}")
            self._send_response(500, {"error": "Server configuration error: SMTP_USER or SMTP_PASS not set on Vercel"})
            return

        # 4. Extract email payload
        to_email = data.get("to_email", "").strip()
        subject = data.get("subject", "").strip()
        html = data.get("html", "").strip()
        plain = data.get("plain", "").strip()
        from_email = os.getenv("SMTP_FROM_EMAIL", smtp_user).strip()
        from_name = data.get("from_name", "AlignNova Portal").strip()

        _log("INFO", f"Email payload: to={to_email}, from={from_name} <{from_email}>")
        _log("DEBUG", f"HTML body length: {len(html)} chars, Plain body length: {len(plain)} chars")

        if not to_email or not subject or not (html or plain):
            missing = []
            if not to_email: missing.append("to_email")
            if not subject: missing.append("subject")
            if not html and not plain: missing.append("html/plain body")
            _log("ERROR", f"Missing required fields: {', '.join(missing)}")
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
                _log("DEBUG", "Attached plain text part")
            if html:
                msg.attach(MIMEText(html, "html"))
                _log("DEBUG", "Attached HTML part")

            _log("INFO", f"Connecting to SMTP server {smtp_host}:{smtp_port} ...")
            start_time = time.time()

            tls = ssl.create_default_context()
            connection = (smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=8, context=tls)
                          if smtp_port == 465 else smtplib.SMTP(smtp_host, smtp_port, timeout=8))
            with connection as server:
                connect_time = time.time() - start_time
                _log("INFO", f"SMTP connection established ({connect_time:.2f}s)")

                _log("DEBUG", "Sending EHLO ...")
                server.ehlo()
                _log("DEBUG", "EHLO done")

                if smtp_port != 465:
                    server.starttls(context=tls)

                _log("INFO", f"Logging in as {smtp_user} ...")
                login_start = time.time()
                server.login(smtp_user, smtp_pass)
                _log("INFO", f"SMTP login successful ({time.time() - login_start:.2f}s)")

                _log("INFO", f"Sending email from {from_email} to {to_email} ...")
                send_start = time.time()
                server.sendmail(from_email, [to_email], msg.as_string())
                _log("INFO", f"Email sent successfully ({time.time() - send_start:.2f}s)")

            total_time = time.time() - start_time
            _log("INFO", f"✓ COMPLETE — Email delivered to {to_email} (total: {total_time:.2f}s)")
            _log("INFO", "=" * 50)
            self._send_response(200, {"ok": True})

        except smtplib.SMTPAuthenticationError as e:
            _log("ERROR", f"SMTP Authentication FAILED: {e}")
            _log("ERROR", "This usually means: 1) Wrong SMTP_PASS (app password), 2) Gmail requires App Password (not regular password), 3) Less secure apps disabled")
            self._send_response(500, {"error": f"SMTP auth failure: {type(e).__name__}: {str(e)}"})

        except smtplib.SMTPRecipientsRefused as e:
            _log("ERROR", f"Recipient refused: {e}")
            self._send_response(500, {"error": f"Recipient refused: {type(e).__name__}: {str(e)}"})

        except smtplib.SMTPException as e:
            _log("ERROR", f"SMTP error: {type(e).__name__}: {e}")
            self._send_response(500, {"error": f"SMTP failure: {type(e).__name__}: {str(e)}"})

        except ConnectionError as e:
            _log("ERROR", f"Connection error to {smtp_host}:{smtp_port}: {e}")
            _log("ERROR", "This could mean: 1) SMTP host/port wrong, 2) Network/firewall blocking, 3) Vercel blocking outbound SMTP")
            self._send_response(500, {"error": f"Connection failure: {type(e).__name__}: {str(e)}"})

        except TimeoutError as e:
            _log("ERROR", f"Timeout connecting to {smtp_host}:{smtp_port}: {e}")
            self._send_response(500, {"error": f"SMTP timeout: {type(e).__name__}: {str(e)}"})

        except Exception as e:
            _log("ERROR", f"Unexpected error: {type(e).__name__}: {e}")
            self._send_response(500, {"error": f"SMTP failure: {type(e).__name__}: {str(e)}"})

    def _send_response(self, status_code: int, body: dict):
        _log("DEBUG", f"Sending HTTP {status_code} response: {json.dumps(body)[:200]}")
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(json.dumps(body).encode('utf-8'))
