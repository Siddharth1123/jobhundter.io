from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine, Base
from app.api.routes import (
    health, users, profiles, resumes, jobs,
    matches, applications, activities, notes, interviews, ai, dashboard
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB Tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health endpoint at root/health
app.include_router(health.router, tags=["Health"])

# API v1 routes
api_prefix = settings.API_V1_STR
app.include_router(users.router, prefix=f"{api_prefix}/users", tags=["Users"])
app.include_router(profiles.router, prefix=f"{api_prefix}/profile", tags=["Profile"])
app.include_router(resumes.router, prefix=f"{api_prefix}/resumes", tags=["Resumes"])
app.include_router(jobs.router, prefix=f"{api_prefix}/jobs", tags=["Jobs"])
app.include_router(matches.router, prefix=f"{api_prefix}", tags=["Job Matches"])
app.include_router(applications.router, prefix=f"{api_prefix}/applications", tags=["Applications CRM"])
app.include_router(activities.router, prefix=f"{api_prefix}", tags=["Activities"])
app.include_router(notes.router, prefix=f"{api_prefix}", tags=["Notes"])
app.include_router(interviews.router, prefix=f"{api_prefix}", tags=["Interviews"])
app.include_router(ai.router, prefix=f"{api_prefix}/ai", tags=["AI Assistance"])
app.include_router(dashboard.router, prefix=f"{api_prefix}/dashboard", tags=["Dashboard"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to CareerPilot AI API",
        "docs": "/docs",
        "health": "/health"
    }
