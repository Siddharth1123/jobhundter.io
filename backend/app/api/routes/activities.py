from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.models import Activity, Application
from app.schemas.schemas import ActivityResponse, ActivityCreate
from app.api.routes.users import ensure_default_user, DEFAULT_USER_ID

router = APIRouter()

@router.post("/applications/{id}/activities", response_model=ActivityResponse)
async def create_activity(id: str, payload: ActivityCreate, db: AsyncSession = Depends(get_db)):
    await ensure_default_user(db)
    app_res = await db.execute(select(Application).where(Application.id == id, Application.user_id == DEFAULT_USER_ID))
    app = app_res.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    act = Activity(
        application_id=id,
        user_id=DEFAULT_USER_ID,
        activity_type=payload.activity_type,
        title=payload.title,
        description=payload.description
    )
    db.add(act)
    await db.commit()
    await db.refresh(act)
    return act

@router.get("/applications/{id}/activities", response_model=List[ActivityResponse])
async def list_activities(id: str, db: AsyncSession = Depends(get_db)):
    await ensure_default_user(db)
    result = await db.execute(
        select(Activity).where(Activity.application_id == id).order_by(Activity.created_at.desc())
    )
    return result.scalars().all()
