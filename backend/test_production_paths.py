"""Exercise the production request paths against an isolated SQLite database."""
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest import TestCase
from unittest.mock import patch

from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event

from backend import database, main
from backend.access_token import create_access_token, create_reset_password_token


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
