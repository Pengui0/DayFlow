# DayFlow — Human Resource Management System

Odoo Hackathon project. A lightweight HRMS for employee onboarding, attendance, leave management, and payroll visibility, with role-based access for Admins/HR and Employees.

## Features
- Secure authentication (Sign Up / Sign In) via Supabase Auth
- Role-based access — Admin vs Employee
- Employee profile management (view/edit)
- Attendance tracking with check-in/check-out
- Leave & time-off requests with admin approval workflow
- Payroll visibility (read-only for employees, editable by admin)
- Analytics & reports dashboard

## Tech Stack

**Frontend:** React + Vite (TypeScript), Tailwind CSS + shadcn/ui, React Router, Supabase JS client, TanStack Query, React Hook Form + Zod, Zustand, Recharts

**Backend:** FastAPI (Python), Supabase (Postgres + Auth + Storage + RLS)

## Project Structure
```
DayFlow/
├── frontend/     # React + Vite app
└── backend/      # FastAPI app + Supabase config, models, routes
```

## Getting Started

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
# fill in .env with your Supabase credentials
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### Database
Run these in the Supabase SQL Editor, in order:
1. `backend/migration/schema.sql`
2. Any additional migration files in `backend/migration/`
3. `backend/migration/seed_test_data.sql` (optional, for local test accounts)

## Contributors
- [Pengui0](https://github.com/Pengui0)
- [bheemanapallibhuvan-ai](https://github.com/bheemanapallibhuvan-ai)
