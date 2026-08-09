from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.models import User, Profile
from app.schemas.schemas import UserCreate, UserResponse

router = APIRouter()

DEFAULT_USER_ID = "default-user-id"

async def ensure_default_user(db: AsyncSession) -> User:
    result = await db.execute(select(User).where(User.id == DEFAULT_USER_ID))
    user = result.scalar_one_or_none()
    if not user:
        user = User(
            id=DEFAULT_USER_ID,
            email="candidate@careerpilot.ai",
            full_name="Candidate"
        )
        db.add(user)
        await db.flush()

        # Create blank profile
        profile = Profile(
            user_id=DEFAULT_USER_ID,
            headline="New Candidate Profile",
            summary="",
            location="",
            years_of_experience=0.0,
            target_roles=[],
            preferred_locations=[],
            remote_preference="flexible",
            expected_salary="",
            notice_period="",
            employment_type="full-time",
            skills=[],
            education=[],
            work_experience=[]
        )
        db.add(profile)
        await db.commit()
        await db.refresh(user)
    return user

@router.get("/me", response_model=UserResponse)
async def get_current_user(db: AsyncSession = Depends(get_db)):
    user = await ensure_default_user(db)
    return user
