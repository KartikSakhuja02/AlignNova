
# AlignNova (Demo)

Backend and frontend integrated demo for presentation.

## Requirements
- Python 3.10+

## Setup
1. Create and activate a virtualenv (recommended):

```bash
python -m venv .venv
.\.venv\Scripts\activate
```

2. Install backend dependencies:

```bash
pip install -r backend/requirements.txt
```

2.5. Install frontend build dependencies and build Tailwind CSS:

```bash
npm install
npm run build:css
```

This writes a production `frontend/styles.css` file used by the HTML pages.

3. Create a `.env` in `backend/` if you want to customize secrets (optional):

```
SECRET_KEY=change-me
ACCESS_TOKEN_EXPIRE_MINUTES=60
DATABASE_URL=sqlite:///./alignnova.db
```

4. Run the app:

```bash
uvicorn backend.main:app --reload --port 8000
```

5. Open the app in your browser:

- Sign-in page: http://localhost:8000/signin/signin_page/index.html
- Admin dashboard: http://localhost:8000/admin_dashboard/index.html
- Students dashboard: http://localhost:8000/students_dashboard/index.html

## Demo accounts
- Admin: `admin` / `adminpass`
- Student: `alice` / `alicepass`

## Notes
- For demo purposes authentication stores the access token in a non-httpOnly cookie; for production use secure cookies or localStorage with proper precautions and use `Set-Cookie` from server with `HttpOnly` and `Secure`.
- The backend uses SQLite by default for quick demos; change `DATABASE_URL` in `.env` to use Postgres/Neon in production.

## Deployment

Docker (recommended):

Build and run with docker-compose:

```bash
docker-compose build
docker-compose up -d
```

The app will be available at http://localhost:8000

Deploy to Heroku (example):

```bash
heroku create your-app-name
git push heroku main
heroku config:set SECRET_KEY="your-secret" ACCESS_TOKEN_EXPIRE_MINUTES=60
heroku ps:scale web=1
```

Make sure to copy `backend/.env.example` to `backend/.env` or set env vars in your host.
#
