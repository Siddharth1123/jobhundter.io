from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.models import Profile, User
from app.schemas.schemas import ProfileResponse, ProfileUpdate
from app.api.routes.users import ensure_default_user, DEFAULT_USER_ID

router = APIRouter()

@router.get("", response_model=ProfileResponse)
async def get_profile(db: AsyncSession = Depends(get_db)):
    await ensure_default_user(db)
    result = await db.execute(select(Profile).where(Profile.user_id == DEFAULT_USER_ID))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.put("", response_model=ProfileResponse)
async def update_profile(payload: ProfileUpdate, db: AsyncSession = Depends(get_db)):
    await ensure_default_user(db)
    result = await db.execute(select(Profile).where(Profile.user_id == DEFAULT_USER_ID))
    profile = result.scalar_one_or_none()
    
    if not profile:
        profile = Profile(user_id=DEFAULT_USER_ID)
        db.add(profile)

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key == "skills" and isinstance(value, list):
            # Convert Pydantic SkillItem models to dicts if needed
            value = [s.model_dump() if hasattr(s, "model_dump") else s for s in value]
        setattr(profile, key, value)

    await db.commit()
    await db.refresh(profile)
    return profile
