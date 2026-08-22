# Workout Quest

Workout Quest is a full-stack gamified workout and habit tracking web app built with React, Vite, Tailwind CSS, FastAPI, SQLAlchemy, JWT auth, and PostgreSQL.

It includes:

- Daily dashboard for workout status, streaks, XP, level progress, personal records, recent history, and monthly score
- Workout routine management with weekday scheduling and exercise ordering
- Daily workout session tracking with set-by-set weight, reps, completion, and notes
- Calendar logic for completed, partial, missed, rest, holiday, and vacation days
- Junk food habit tracking with clean-day streak logic
- XP, levels, streaks, achievements, personal records, and monthly scoring
- TXT workout session export
- Progress charts and history views

## Project Structure

```text
backend/   FastAPI API, SQLAlchemy models, services, auth, and database bootstrap
frontend/  React + Vite SPA with Tailwind dashboard UI and charting
```

## Local Setup

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Start the backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

### 3. Start the frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

The app will be available at `http://localhost:5173`.

## First Run

On first backend startup, the app creates:

- Database tables
- System achievements

You start with a clean slate:

- No demo user
- No demo routines
- No demo workout history
- No demo exercise library

Create your account from the auth screen, then add your own exercises and routines.

## Notes

- The backend uses PostgreSQL via `DATABASE_URL`.
- The database bootstrap currently uses `Base.metadata.create_all()` for simplicity.
- All major features persist to PostgreSQL-backed tables instead of frontend-only temporary state.
