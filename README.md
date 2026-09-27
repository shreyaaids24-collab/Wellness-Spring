# Personal Wellness Activity Tracker (WellSpring)

A student full-stack web app for recording, monitoring, and reviewing daily wellness activities in one place.

**Stack:** React + Vite (frontend) · FastAPI (backend) · MariaDB (database) · Recharts (charts)

> Wellness scores are for personal tracking only — not a medical or health diagnosis.

---

## Features

- Email/password authentication (JWT)
- User profile (name, age, height, weight)
- Daily activity CRUD (steps, exercise, water, sleep, screen time, mood, notes)
- Dashboard with today’s summary, wellness score, streaks, and goal progress bars
- Goals management
- Weekly / monthly analytics with charts
- Input validation on both API (Pydantic) and forms
- Relational MariaDB schema with primary keys, foreign keys, and constraints

---

## Project structure

```
├── backend/
│   ├── app/
│   │   ├── api/          # REST route modules
│   │   ├── core/         # Settings + security (JWT, passwords)
│   │   ├── database/     # SQLAlchemy engine/session (MariaDB)
│   │   ├── models/       # ORM entities
│   │   ├── schemas/      # Pydantic request/response models
│   │   ├── services/     # Wellness score + streak logic
│   │   └── main.py
│   ├── schema.sql        # Reference SQL for interviews
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── services/
│       └── utils/
├── .env.example
├── .gitignore
└── README.md
```

---

## Database design (MariaDB)

| Table | Purpose |
|-------|---------|
| `users` | Auth credentials (email + hashed password) |
| `profiles` | Personal details (1:1 with `users`) |
| `daily_activities` | One wellness entry per user per date |
| `goals` | Daily goal targets (active set per user) |

Relationships:

- `profiles.user_id` → `users.id` (FK, CASCADE)
- `daily_activities.user_id` → `users.id` (FK, CASCADE)
- `goals.user_id` → `users.id` (FK, CASCADE)
- Unique constraint on `(user_id, activity_date)` so a day can only be logged once

Driver: **PyMySQL** via SQLAlchemy URL  
`mysql+pymysql://user:password@localhost:3306/wellness_tracker`

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- MariaDB running locally
- Git

---

## 1. Create the MariaDB database

In the MariaDB client (`mysql` / HeidiSQL / DBeaver):

```sql
CREATE DATABASE wellness_tracker
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Optional: run `backend/schema.sql` for the full reference DDL.  
Tables are also auto-created by SQLAlchemy when the API starts.

---

## 2. Backend setup

```bash
cd backend
python -m venv .venv

# Windows PowerShell
.\.venv\Scripts\Activate.ps1

# macOS / Linux
# source .venv/bin/activate

pip install -r requirements.txt
```

Create `backend/.env` from the root `.env.example`:

```env
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/wellness_tracker
SECRET_KEY=change-me-to-a-long-random-string
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Start the API:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- API docs: http://127.0.0.1:8000/docs  
- Health check: http://127.0.0.1:8000/health  

Run these commands from the `backend/` folder so Python can resolve the `app` package.

---

## 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

Optional `frontend/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000
```

---

## REST API overview

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Create account + profile + default goals |
| POST | `/auth/login` | Return JWT |
| GET/PUT | `/profile` | Read / update profile |
| POST/GET | `/activities` | Create / list activities |
| GET/PUT/DELETE | `/activities/{id}` | Single activity CRUD |
| GET/POST | `/goals` | List / create goals |
| GET | `/goals/active` | Active goal set |
| PUT/DELETE | `/goals/{id}` | Update / delete goal |
| GET | `/analytics/today` | Dashboard summary |
| GET | `/analytics/weekly` | Last 7 days |
| GET | `/analytics/monthly` | Last 30 days |

All routes except `/auth/*` and `/health` require header:  
`Authorization: Bearer <token>`

---

## Wellness score (transparent, non-medical)

Each category contributes up to **20 points** (total **100**):

| Category | Rule |
|----------|------|
| Steps / Exercise / Water | Progress toward goal (capped at 20) |
| Sleep | Peaks at goal; mild penalty for large oversleep |
| Screen time | Full points when at or below the limit |

A day counts toward a **streak** when at least **4 of 5** goals are met.

---

## Design Thinking (project narrative)

1. **Understand** – People track wellness in scattered notes and forget patterns.  
2. **Needs** – One place to log daily habits, see progress, and review history.  
3. **Problem** – “How might we help an individual consistently record and review daily wellness activities?”  
4. **Solution** – Simple web tracker with CRUD, goals, score, streaks, and charts.  
5. **Implement / test** – FastAPI + React + MariaDB; validate inputs; exercise via Swagger + UI.  
6. **Iterate** – Improve empty states, error messages, and mobile navigation based on use.

---

## Interview talking points

- Separated `users` vs `profiles` (auth vs personal data)
- ORM relationships and SQL FKs / unique constraints
- Pydantic validation for email, password strength, numeric ranges, moods, dates
- JWT Bearer auth dependency injection in FastAPI
- Modular frontend: pages, services, context
- Recharts for weekly/monthly visualization

---

## Git

```bash
git init
git add .
git commit -m "Initial commit: Personal Wellness Activity Tracker"
```

Create a GitHub repo and push when ready.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Can't connect to MySQL server` | Confirm MariaDB is running and `DATABASE_URL` credentials are correct |
| `Access denied for user` | Check username/password; grant privileges on `wellness_tracker` |
| CORS errors in browser | Ensure `CORS_ORIGINS` includes your Vite URL |
| Frontend can’t reach API | Confirm uvicorn is on port 8000 and `VITE_API_URL` is correct |
| Password hash errors | Use the pinned `bcrypt==4.0.1` from `requirements.txt` |
