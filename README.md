# 🚀 JobTracker.pro

A production-grade, full-stack application designed to help job seekers manage their applications, store resumes, and visualize their job hunt pipeline.

🔗 **[Live Application](https://jobtracker-frontend-mzcx.onrender.com)**
📚 **[Live API Documentation (Swagger UI)](https://jobtracker-api-k18g.onrender.com/docs)**

![Dashboard Screenshot](./screenshot.png) *(Upload your screenshot to GitHub and name it screenshot.png)*

## 🛠️ Tech Stack
*   **Frontend:** React (Vite), Tailwind CSS, Recharts, React Router
*   **Backend:** FastAPI (Python 3), SQLAlchemy, Alembic, Pydantic
*   **Database:** PostgreSQL (Neon Serverless)
*   **Auth:** OAuth2 with JWT (JSON Web Tokens), Bcrypt
*   **Deployment:** Render (Frontend & Backend), Neon (Database)

## 🧠 Architecture & Engineering Decisions
*   **Monorepo Structure:** Frontend and backend are deployed as separate services from a single repository for easier version control.
*   **Layered Backend:** Separated into `routers`, `models`, `schemas`, and `core` to ensure clean separation of concerns.
*   **Database Migrations:** Used Alembic to safely apply schema changes (like adding user profiles) across local and production environments without data loss.
*   **Async Processing:** Utilized FastAPI `BackgroundTasks` to simulate automated follow-up emails without blocking the main HTTP request cycle.
*   **Protected Routes:** Implemented JWT-based dependency injection to ensure users can only access and modify their own data.

## ⚙️ Core Features
- [x] Secure User Registration & Login (JWT)
- [x] Full CRUD for Job Applications
- [x] Responsive SaaS Dashboard (Mobile & Desktop)
- [x] Live Analytics (Aggregated SQL stats + Donut Chart)
- [x] PDF Resume Upload & Secure Streaming
- [x] Dynamic User Profiles (Update name, avatar initials)
- [x] Custom Toast Notifications & Skeleton Loading States

## 🚀 Local Setup
1. Clone the repo
2. Backend: `cd app && python -m venv venv && pip install -r requirements.txt`
3. Frontend: `cd jobtracker-frontend && npm install && npm run dev`
4. Add a `.env` file with your `DATABASE_URL` and `SECRET_KEY`.
5. Run `alembic upgrade head` to create database tables.