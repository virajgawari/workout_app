from fastapi import APIRouter

from app.api.routes import achievements, auth, calendar, dashboard, exercises, habits, progress, records, routines, sessions, settings


api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(exercises.router, prefix="/exercises", tags=["exercises"])
api_router.include_router(routines.router, prefix="/routines", tags=["routines"])
api_router.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
api_router.include_router(calendar.router, prefix="/calendar", tags=["calendar"])
api_router.include_router(habits.router, prefix="/habits", tags=["habits"])
api_router.include_router(achievements.router, prefix="/achievements", tags=["achievements"])
api_router.include_router(records.router, prefix="/records", tags=["records"])
api_router.include_router(progress.router, prefix="/progress", tags=["progress"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
