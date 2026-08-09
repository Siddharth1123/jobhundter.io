from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.models import Interview, Application, Activity
from app.schemas.schemas import InterviewResponse, InterviewCreate, InterviewUpdate
from app.api.routes.users import ensure_default_user, DEFAULT_USER_ID

router = APIRouter()

@router.post("/applications/{id}/interviews", response_model=InterviewResponse)
async def create_interview(id: str, payload: InterviewCreate, db: AsyncSession = Depends(get_db)):
    await ensure_default_user(db)
    app_res = await db.execute(select(Application).where(Application.id == id, Application.user_id == DEFAULT_USER_ID))
    app = app_res.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    interview = Interview(
        application_id=id,
        user_id=DEFAULT_USER_ID,
        round_name=payload.round_name,
        scheduled_at=payload.scheduled_at,
        duration_minutes=payload.duration_minutes,
        interviewer_name=payload.interviewer_name,
        meeting_url=payload.meeting_url,
        status=payload.status,
        notes=payload.notes
    )
    db.add(interview)

    # Log CRM Activity
    act = Activity(
        application_id=id,
        user_id=DEFAULT_USER_ID,
        activity_type="INTERVIEW",
        title=f"Interview scheduled: {payload.round_name}",
        description=f"Scheduled with {payload.interviewer_name or 'Interviewer'} on {payload.scheduled_at.strftime('%Y-%m-%d %H:%M')}."
    )
    db.add(act)

    # Auto advance stage to INTERVIEW_SCHEDULED if currently lower
    if app.stage in ["DISCOVERED", "SAVED", "APPLIED", "HR_CONTACTED"]:
        app.stage = "INTERVIEW_SCHEDULED"

    await db.commit()
    await db.refresh(interview)
    return interview

@router.patch("/interviews/{id}", response_model=InterviewResponse)
async def update_interview(id: str, payload: InterviewUpdate, db: AsyncSession = Depends(get_db)):
    await ensure_default_user(db)
    result = await db.execute(select(Interview).where(Interview.id == id, Interview.user_id == DEFAULT_USER_ID))
    interview = result.scalar_one_or_none()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(interview, key, value)

    await db.commit()
    await db.refresh(interview)
    return interview

@router.get("/interviews", response_model=List[InterviewResponse])
async def list_interviews(db: AsyncSession = Depends(get_db)):
    await ensure_default_user(db)
    result = await db.execute(
        select(Interview).where(Interview.user_id == DEFAULT_USER_ID).order_by(Interview.scheduled_at.asc())
    )
    return result.scalars().all()
