 AlignNova
 
Connecting students, companies and universities with opportunities and career development through a centralised platform for placement and profile management.
AlignNova is a full-stack career and placement management system that streamlines interactions among students, administrators, and opportunities.
Rather than handling resumes, profiles, eligibility criteria, and placement data through numerous spreadsheets and portals, AlignNova offers a unified platform that keeps everything well-organised, easily accessible, and simple to manage.
________________________________________________________________________________________________________________________________________________________________________
✨ Why AlignNova?
Most placement processes suffer from:
•	Dispersed student information
•	Manual process for verifying eligibility
•	Challenges in managing resumes
•	Challenges in monitoring applications
•	Limited centralised communication channels.
AlignNova tackles these issues with a secure, role-specific platform that allows students and administrators to handle the full placement process smoothly.
________________________________________________________________________________________________________________________________________________________________________
 Key Features
 
 Student Portal
•	Reliable login and authentication methods
•	Managing professional profiles
•	Resume upload and handling
•	Tracking skills and educational progress
•	Placement eligibility visibility
•	Career-focused dashboard
______________________________________________________________________________________________________________________________
 Admin Portal
•	Student management system
•	Eligibility verification
•	Placement process administration
•	Dashboard analytics
•	Role-based access control
•	Centralised student records
__________________________________________________________________________________________________________________________________
 Authentication & Security
•	JWT-based authentication
•	Access token management
•	Password setup workflow
•	Password reset functionality
•	Role-based authorization
•	Session management
___________________________________________________________________________________________________________________________________
Architecture Overview

Frontend (HTML + JavaScript + Tailwind CSS)
                │
                ▼
          FastAPI Backend
                │
                ▼
      Authentication Layer
          (JWT Tokens)
                │
                ▼
          SQLite Database

_________________________________________________________________________________________________________________________________________
Technology Stack

Layer	                  Technology
Backend	                 FastAPI
Frontend	               React
Styling	                 Tailwind CSS
Database	               PostgreSQL
Authentication	         JWT (JSON Web Tokens)
Deployment	             Render and Vercel

__________________________________________________________________________________________________________________________________________
_ Project Structure
AlignNova/
│
├── backend/
│   ├── routes/
│   ├── models/
│   ├── database/
│   ├── access_token.py
│   └── main.py
│
├── frontend/
│   ├── signin/
│   ├── admin_dashboard/
│   ├── students_dashboard/
│   └── styles.css
│
├── docker-compose.yml
├── package.json
└── README.md

________________________________________________________________________________________________________________________________________________
 Installation
1. Clone Repository
git clone <repository-url>
cd AlignNova
________________________________________________________________________________________________________________________________________________
2. Create Virtual Environment
python -m venv .venv
Activate environment:
Windows
.venv\Scripts\activate
Linux / macOS
source .venv/bin/activate
____________________________________________________________________________________________________________________________________________________
3. Install Backend Dependencies
pip install -r backend/requirements.txt
______________________________________________________________________________________________________________________________________________________
4. Install Frontend Dependencies
npm install
Build Tailwind CSS:
npm run build:css
This generates:
frontend/styles.css
________________________________________________________________________________________________________________________________________________________
5. Configure Environment Variables (Optional)
Create:
backend/.env

Example:
SECRET_KEY=change-me
ACCESS_TOKEN_EXPIRE_MINUTES=60
DATABASE_URL=sqlite:///./alignnova.db
__________________________________________________________________________________________________________________________________________________________
6. Run the Application
uvicorn backend.main:app --reload --port 8000

_ Application URLs
Sign In
http://localhost:8000/signin/signin_page/index.html
Admin Dashboard
http://localhost:8000/admin_dashboard/index.html
Student Dashboard
http://localhost:8000/students_dashboard/index.html

___________________________________________________________________________________________________________________________________________________________

__ Security Highlights
AlignNova implements:
•	JWT authentication
•	Token expiration handling
•	Role-based access control
•	Password reset tokens
•	Password setup workflow
•	Protected API routes
For demonstration purposes, authentication uses browser cookies.


For production deployments:
•	Use HttpOnly cookies
•	Enable Secure cookies
•	Enforce HTTPS
•	Use PostgreSQL
•	Rotate secrets regularly

Future Enhancements (upcoming soon)

•	Company recruitment portal
•	Placement analytics dashboard
•	Email notifications
•	Resume scoring system
•	AI-powered career recommendations
•	Interview scheduling
•	Multi-role approval workflows
•	Cloud deployment support
______________________________________________________________________________________________________________________________________________________

 Vision
AlignNova represents more than merely a placement management system.
It functions as a comprehensive career ecosystem, enabling students to display their skills, allowing administrators to manage opportunities effectively, and helping organisations find talent through a clear and straightforward process.
___________________________________________________________________________________________________________________________________________________________

Built with FastAPI, JWT Authentication, Tailwind CSS, and a focus on simplifying student career management.

