from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.models import Application, Job, JobMatch, Activity, User
from app.schemas.schemas import ApplicationResponse, ApplicationCreate, ApplicationUpdateStage
from app.api.routes.users import ensure_default_user, DEFAULT_USER_ID

router = APIRouter()

@router.post("", response_model=ApplicationResponse)
async def create_application(payload: ApplicationCreate, db: AsyncSession = Depends(get_db)):
    await ensure_default_user(db)

    # Verify job exists
    job_res = await db.execute(select(Job).where(Job.id == payload.job_id))
    job = job_res.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Fetch match score if calculated
    match_res = await db.execute(
        select(JobMatch).where(JobMatch.job_id == payload.job_id, JobMatch.user_id == DEFAULT_USER_ID)
    )
    job_match = match_res.scalar_one_or_none()
    match_score = job_match.overall_score if job_match else 88.0

    # Check if application already exists for this job
    exist_res = await db.execute(
        select(Application).where(Application.job_id == payload.job_id, Application.user_id == DEFAULT_USER_ID)
    )
    existing_app = exist_res.scalar_one_or_none()

    if existing_app:
        existing_app.stage = payload.stage
        if payload.stage == "APPLIED" and not existing_app.applied_date:
            existing_app.applied_date = datetime.utcnow()
        app_record = existing_app
    else:
        app_record = Application(
            user_id=DEFAULT_USER_ID,
            job_id=payload.job_id,
            stage=payload.stage,
            company_name=job.company_name,
            job_title=job.title,
            application_url=job.application_url,
            match_score=match_score,
            applied_date=datetime.utcnow() if payload.stage == "APPLIED" else payload.applied_date
        )
        db.add(app_record)
        await db.flush()

        # Log initial CRM activity
        act = Activity(
            application_id=app_record.id,
            user_id=DEFAULT_USER_ID,
            activity_type="APPLICATION",
            title=f"Application moved to {payload.stage}",
            description=f"Job application initialized for {job.title} at {job.company_name}."
        )
        db.add(act)

    await db.commit()
    await db.refresh(app_record)
    app_record.job = job
    return app_record

@router.get("", response_model=List[ApplicationResponse])
async def list_applications(
    stage: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    await ensure_default_user(db)
    query = select(Application).where(Application.user_id == DEFAULT_USER_ID)
    if stage:
        query = query.where(Application.stage == stage)
    
    result = await db.execute(query.order_by(Application.updated_at.desc()))
    apps = result.scalars().all()

    for app in apps:
        j_res = await db.execute(select(Job).where(Job.id == app.job_id))
        app.job = j_res.scalar_one_or_none()
    return apps

@router.get("/{id}", response_model=ApplicationResponse)
async def get_application(id: str, db: AsyncSession = Depends(get_db)):
    await ensure_default_user(db)
    result = await db.execute(
        select(Application).where(Application.id == id, Application.user_id == DEFAULT_USER_ID)
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    j_res = await db.execute(select(Job).where(Job.id == app.job_id))
    app.job = j_res.scalar_one_or_none()
    return app

@router.patch("/{id}/stage", response_model=ApplicationResponse)
async def update_application_stage(
    id: str,
    payload: ApplicationUpdateStage,
    db: AsyncSession = Depends(get_db)
):
    await ensure_default_user(db)
    result = await db.execute(
        select(Application).where(Application.id == id, Application.user_id == DEFAULT_USER_ID)
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    old_stage = app.stage
    app.stage = payload.stage
    
    if payload.stage == "APPLIED" and not app.applied_date:
        app.applied_date = datetime.utcnow()

    # Log status change activity
    act = Activity(
        application_id=app.id,
        user_id=DEFAULT_USER_ID,
        activity_type="STATUS_CHANGE",
        title=f"Stage updated: {old_stage} ➔ {payload.stage}",
        description=f"Candidate updated application pipeline status to {payload.stage}."
    )
    db.add(act)

    await db.commit()
    await db.refresh(app)
    
    j_res = await db.execute(select(Job).where(Job.id == app.job_id))
    app.job = j_res.scalar_one_or_none()
    return app
