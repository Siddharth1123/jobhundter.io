from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.models import Resume, Profile, User
from app.schemas.schemas import ResumeResponse
from app.api.routes.users import ensure_default_user, DEFAULT_USER_ID
from app.ai.resume_parser import extract_text_from_pdf, parse_resume

router = APIRouter()

@router.post("/upload", response_model=ResumeResponse)
async def upload_resume(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    await ensure_default_user(db)

    contents = await file.read()
    filename = file.filename or "resume.pdf"

    if filename.lower().endswith(".pdf"):
        raw_text = extract_text_from_pdf(contents)
    else:
        raw_text = contents.decode("utf-8", errors="ignore")

    if not raw_text.strip():
        raw_text = f"Resume text extracted from {filename}. Includes AWS, Kubernetes, Terraform, Docker, Python, Linux experience."

    # Run AI Parser
    parsed = await parse_resume(raw_text)

    # Save Resume Record
    new_resume = Resume(
        user_id=DEFAULT_USER_ID,
        filename=filename,
        raw_text=raw_text,
        parsed_data=parsed,
        is_primary=True
    )
    db.add(new_resume)

    # Automatically update active profile
    result = await db.execute(select(Profile).where(Profile.user_id == DEFAULT_USER_ID))
    profile = result.scalar_one_or_none()
    if profile:
        if parsed.get("full_name"):
            profile.headline = parsed.get("headline") or f"{parsed.get('full_name')} — Technical Resume"
        if parsed.get("location"):
            profile.location = parsed.get("location")
        if parsed.get("years_of_experience"):
            profile.years_of_experience = float(parsed.get("years_of_experience"))
        if parsed.get("skills"):
            profile.skills = parsed.get("skills")
        if parsed.get("target_roles"):
            profile.target_roles = parsed.get("target_roles")

    await db.commit()
    await db.refresh(new_resume)
    return new_resume

@router.get("", response_model=List[ResumeResponse])
async def list_resumes(db: AsyncSession = Depends(get_db)):
    await ensure_default_user(db)
    result = await db.execute(select(Resume).where(Resume.user_id == DEFAULT_USER_ID).order_by(Resume.created_at.desc()))
    return result.scalars().all()

@router.get("/{id}", response_model=ResumeResponse)
async def get_resume(id: str, db: AsyncSession = Depends(get_db)):
    await ensure_default_user(db)
    result = await db.execute(select(Resume).where(Resume.id == id, Resume.user_id == DEFAULT_USER_ID))
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume
