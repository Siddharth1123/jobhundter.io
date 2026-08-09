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
            email="siddharth.jain@careerpilot.ai",
            full_name="Siddharth Jain"
        )
        db.add(user)
        await db.flush()

        profile = Profile(
            user_id=DEFAULT_USER_ID,
            headline="Senior SRE & DevOps Engineer",
            summary="Experienced Site Reliability & Cloud Infrastructure Engineer specializing in AWS, Kubernetes, Terraform, Docker, Python microservices, and automated CI/CD deployment pipelines.",
            location="Bangalore / Remote",
            years_of_experience=3.5,
            target_roles=["Site Reliability Engineer", "DevOps Engineer", "Cloud Infrastructure Architect"],
            preferred_locations=["Remote", "Bangalore", "San Francisco"],
            remote_preference="flexible",
            expected_salary="$120,000 /yr",
            notice_period="Immediate / 30 Days",
            employment_type="full-time",
            skills=[
                {"name": "AWS", "category": "Cloud", "years_experience": 3.5},
                {"name": "Kubernetes", "category": "DevOps", "years_experience": 3.0},
                {"name": "Terraform", "category": "DevOps", "years_experience": 2.5},
                {"name": "Docker", "category": "DevOps", "years_experience": 3.5},
                {"name": "Linux", "category": "OS", "years_experience": 3.5},
                {"name": "Python", "category": "Languages", "years_experience": 3.5},
                {"name": "Prometheus", "category": "Observability", "years_experience": 2.0},
                {"name": "Grafana", "category": "Observability", "years_experience": 2.0},
                {"name": "ArgoCD", "category": "CI/CD", "years_experience": 1.5},
                {"name": "PostgreSQL", "category": "Database", "years_experience": 3.0}
            ],
            education=[
                {"institution": "Tech Institute", "degree": "B.Tech in Computer Science", "field": "Computer Science", "year": 2021}
            ],
            work_experience=[
                {
                    "company": "Cloud Systems Inc",
                    "role": "DevOps / SRE Engineer",
                    "duration": "2022 - Present",
                    "description": "Managed AWS EKS Kubernetes infrastructure, Terraform IaC, Prometheus/Grafana monitoring, and deployment automation."
                }
            ]
        )
        db.add(profile)
        await db.commit()
        await db.refresh(user)
    return user

@router.get("/me", response_model=UserResponse)
async def get_current_user(db: AsyncSession = Depends(get_db)):
    user = await ensure_default_user(db)
    return user
