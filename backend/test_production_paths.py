"""Exercise the production request paths against an isolated SQLite database."""
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest import TestCase
from unittest.mock import patch

from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event

from backend import database, main
from backend.access_token import create_access_token, create_reset_password_token
from backend.create_admin import reset_admin_password


def bearer(username, role="student"):
    return {"Authorization": "Bearer " + create_access_token({"sub": username, "role": role})}


class ProductionPathsTest(TestCase):
    def setUp(self):
        temporary = self.enterContext(TemporaryDirectory())
        engine = create_engine(f"sqlite:///{Path(temporary, 'test.db').as_posix()}")
        self.addCleanup(engine.dispose)
        old_engine = database.SessionLocal.kw["bind"]
        database.SessionLocal.configure(bind=engine)
        self.addCleanup(database.SessionLocal.configure, bind=old_engine)
        self.enterContext(patch.object(database, "engine", engine))
        self.enterContext(patch.object(main, "PRODUCTION", False))
        self.broadcast = self.enterContext(patch.object(main, "submit_broadcast", return_value=True))
        main.drive_cache.invalidate()
        main.stats_cache.invalidate()
        self.client = self.enterContext(TestClient(main.app))
        self.queries = []

        @event.listens_for(engine, "before_cursor_execute")
        def record_query(conn, cursor, statement, parameters, context, executemany):
            if statement.lstrip().upper().startswith("SELECT"):
                self.queries.append(statement)

        for name in ("eligible", "other"):
            response = self.client.post("/api/signup", json={
                "username": name, "password": "sample-password", "role": "admin",
                "email": f"{name}@example.test",
            })
            self.assertEqual(response.status_code, 200, response.text)
            self.assertEqual(response.json()["role"], "student")
        self.admin = bearer("admin", "admin")
        self.student = bearer("eligible")
        self.other = bearer("other")

    def test_read_counts_write_invalidation_and_eligibility(self):
        database.update_profile("eligible", uni_performance='{"aggregate_cgpa":8.4}')
        response = self.client.post("/api/drives", headers=self.admin, json={
            "role": "Engineer", "company": "Sample Company", "eligibility": "7.0",
        })
        self.assertEqual(response.status_code, 200, response.text)
        drive_id = response.json()["id"]
        self.queries.clear()
        for _ in range(2):
            self.assertEqual(self.client.get("/api/drives", headers=self.admin).json()[0]["id"], drive_id)
        self.assertEqual(len(self.queries), 1)
        self.assertEqual(self.client.get("/api/drives", headers=self.other).json(), [])
        self.assertEqual(self.client.get("/api/drives").status_code, 401)
        for headers in (self.other, self.admin):
            self.assertEqual(self.client.post("/api/apply", headers=headers, json={"drive_id": drive_id}).status_code, 403)

        applied = self.client.post("/api/apply", headers=self.student, json={"drive_id": drive_id})
        self.assertEqual(applied.status_code, 200, applied.text)
        application_id = applied.json()["id"]
        repeat = self.client.post("/api/apply", headers=self.student, json={"drive_id": drive_id})
        self.assertEqual(repeat.json()["id"], application_id)
        self.queries.clear()
        self.assertEqual(self.client.get("/api/applications", headers=self.admin).json()[0]["company"], "Sample Company")
        self.assertEqual(len(self.queries), 1)
        self.queries.clear()
        for _ in range(2):
            self.assertEqual(self.client.get("/api/dashboard/stats", headers=self.admin).json()["total_applications"], 1)
        self.assertEqual(len(self.queries), 1)
        self.assertEqual(self.client.delete(f"/api/applications/{application_id}", headers=self.student).status_code, 200)
        self.assertEqual(self.client.get("/api/dashboard/stats", headers=self.admin).json()["total_applications"], 0)
        self.assertEqual(self.client.put(f"/api/drives/{drive_id}", headers=self.admin, json={"role": "Updated"}).status_code, 200)
        self.assertEqual(self.client.get("/api/drives", headers=self.admin).json()[0]["role"], "Updated")

    def test_private_document_and_password_reset(self):
        pdf = b"%PDF-1.7\nsample test file"
        files = {"file": ("resume.pdf", pdf, "application/pdf")}
        response = self.client.post("/api/profile/resume", headers=self.student, files=files)
        self.assertEqual(response.status_code, 200, response.text)
        self.assertNotIn("hashed_password", response.json())
        url = response.json()["resume_url"]
        self.assertEqual(self.client.get(url).status_code, 401)
        self.assertEqual(self.client.get(url, headers=self.other).status_code, 404)
        download = self.client.get(url, headers=self.student)
        self.assertEqual(download.content, pdf)
        self.assertEqual(download.headers["cache-control"], "private, no-store")
        replacement = self.client.post("/api/profile/resume", headers=self.student, files=files)
        self.assertNotEqual(replacement.json()["resume_url"], url)
        self.assertEqual(self.client.get(url, headers=self.student).status_code, 404)
        reset = create_reset_password_token("eligible")
        self.assertEqual(self.client.get("/api/profile", headers={"Authorization": f"Bearer {reset}"}).status_code, 401)
        password = {"token": reset, "new_password": "new-sample-password"}
        self.assertEqual(self.client.post("/api/set-password", json=password).status_code, 200)
        self.assertEqual(self.client.post("/api/set-password", json=password).status_code, 400)
        response = self.client.post("/api/login", data={"username": "eligible@example.test", "password": password["new_password"]})
        self.assertEqual(response.status_code, 200, response.text)

    def test_health_and_cache_headers(self):
        self.queries.clear()
        self.assertEqual(self.client.get("/healthz").status_code, 200)
        self.assertEqual(self.queries, [])
        self.assertEqual(self.client.get("/api/missing").status_code, 404)
        self.assertEqual(self.client.get("/api/profile", headers=self.student).headers["cache-control"], "private, no-store")
        assets = Path(main.FRONTEND_DIST, "assets")
        if assets.is_dir():
            asset = next(assets.glob("*.js"))
            self.assertEqual(self.client.get("/").headers["cache-control"], "no-cache")
            self.assertIn("immutable", self.client.get(f"/assets/{asset.name}").headers["cache-control"])

    def test_recover_existing_production_admin(self):
        with patch.object(main, "PRODUCTION", True):
            rejected = self.client.post("/api/login", data={"username": "admin", "password": "adminpass"})
            self.assertEqual(rejected.status_code, 401)
            self.assertFalse(reset_admin_password("eligible", "sample-new-password"))
            self.assertTrue(reset_admin_password("admin", "sample-new-password"))
            for identifier in ("admin", "admin@demo.local"):
                response = self.client.post("/api/login", data={"username": identifier, "password": "sample-new-password"})
                self.assertEqual(response.status_code, 200, response.text)
                self.assertEqual(response.json()["role"], "admin")

    def test_launch_full_drive_payload_and_email_worker_failure(self):
        payload = {
            "company": " Campus Partner ", "role": " Analyst ", "type": "Internship + PPO",
            "eligibility": "7.00", "min_10th_percent": "70.00", "min_12th_percent": "70.00",
            "package": "8", "stipend": "20000", "duration": "3 months", "drive_date": "2026-12-21",
            "location": "Pune", "eligible_courses": "Computer Science",
            "no_active_backlogs": 1, "partner_id": None,
        }
        self.assertEqual(self.client.post("/api/drives", headers=self.admin, json={**payload, "company": " "}).status_code, 422)
        self.assertEqual(self.client.post("/api/drives", headers=self.student, json=payload).status_code, 403)
        with patch.object(main, "submit_broadcast", side_effect=RuntimeError("Test worker unavailable")):
            with self.assertLogs("alignnova", level="ERROR"):
                launched = self.client.post("/api/drives", headers=self.admin, json=payload)
        self.assertEqual(launched.status_code, 200, launched.text)
        drive = launched.json()
        self.assertEqual(drive["company"], "Campus Partner")
        self.assertEqual(drive["role"], "Analyst")
        self.assertEqual(self.client.get("/api/drives", headers=self.admin).json()[0]["id"], drive["id"])
        self.assertEqual(self.client.get(f'/api/drives/{drive["id"]}', headers=self.admin).json()["stipend"], "20000")
        self.assertEqual(self.client.get("/api/dashboard/stats", headers=self.admin).json()["total_drives"], 1)
        self.assertEqual(self.client.delete(f'/api/drives/{drive["id"]}', headers=self.admin).status_code, 200)
        self.assertEqual(self.client.get("/api/drives", headers=self.admin).json(), [])

    def test_student_and_recruiter_onboarding_and_recovery(self):
        with patch.object(main, "send_welcome_email") as student_mail, \
             patch.object(main, "send_partner_welcome_email") as partner_mail, \
             patch.object(main, "send_reset_password_email") as reset_mail:
            student = self.client.post("/api/admin/students", headers=self.admin, json={
                "username": "invited", "email": "invited@example.test", "full_name": "Invited Student",
                "password": "temporary-password", "course": "Computer Science",
            })
            self.assertEqual(student.status_code, 200, student.text)
            self.assertNotIn("hashed_password", student.json())
            self.assertEqual(self.client.get("/api/admin/students", headers=self.admin).status_code, 200)
            student_token = student_mail.call_args.kwargs["set_password_token"]
            partner = self.client.post("/api/admin/partners", headers=self.admin, json={
                "email": "recruiter@example.test", "full_name": "Sample Recruiter", "company": "Sample Company",
            })
            self.assertEqual(partner.status_code, 200, partner.text)
            self.assertEqual(self.client.get("/api/admin/partners", headers=self.admin).json()[0]["id"], partner.json()["id"])
            self.assertEqual(self.client.post("/api/request-activation", json={"email": "recruiter@example.test"}).status_code, 200)
            self.assertEqual(partner_mail.call_count, 2)
            self.assertEqual(student_mail.call_count, 1)
            partner_token = partner_mail.call_args.args[3]

            for setup_token, role in ((student_token, "student"), (partner_token, "hr")):
                activate = self.client.post("/api/set-password", json={"token": setup_token, "new_password": "sample-new-password"})
                self.assertEqual(activate.status_code, 200, activate.text)
                self.assertEqual(activate.json()["role"], role)
            hr = {"Authorization": f'Bearer {activate.json()["access_token"]}'}
            result = self.client.get("/api/partner/students", headers=hr)
            self.assertEqual(result.status_code, 200, result.text)
            self.assertIn("invited", {student["username"] for student in result.json()})
            self.assertEqual(self.client.get("/api/admin/students", headers=hr).status_code, 403)
            self.assertEqual(self.client.get("/api/partner/students", headers=self.student).status_code, 403)

            reset = self.client.post("/api/forgot-password", json={"email": "recruiter@example.test"})
            self.assertEqual(reset.status_code, 200)
            reset_mail.assert_called_once()
            self.assertEqual(self.client.post("/api/forgot-password", json={"email": "absent@example.test"}).json(), reset.json())

    def test_application_review_and_eligible_email_alert(self):
        database.update_profile("eligible", uni_performance='{"aggregate_cgpa":8.4}')
        drive = self.client.post("/api/drives", headers=self.admin, json={
            "company": "Test Employer", "role": "Analyst", "eligibility": "7.0",
        }).json()
        broadcast, = self.broadcast.call_args.args
        with patch.object(main, "send_opportunity_alert_email", return_value=True) as send:
            broadcast()
            broadcast()
            send.assert_called_once()
            self.assertEqual(send.call_args.args[0], "eligible@example.test")

        application = self.client.post("/api/apply", headers=self.student, json={"drive_id": drive["id"]}).json()
        status_url = f'/api/applications/{application["id"]}/status'
        self.assertEqual(self.client.post(status_url, headers=self.student, json={"status": "approved"}).status_code, 403)
        self.assertEqual(self.client.post(status_url, headers=self.admin, json={"status": "approved"}).status_code, 200)
        self.assertEqual(self.client.get("/api/applications", headers=self.student).json()[0]["status"], "approved")
        self.assertEqual(self.client.get("/api/dashboard/stats", headers=self.admin).json()["placed_students"], 1)
