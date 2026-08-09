from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.db.session import get_db
from app.models.models import Job
from app.schemas.schemas import JobResponse, JobCreate

router = APIRouter()

@router.get("", response_model=List[JobResponse])
async def list_jobs(
    q: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    query = select(Job)
    if q:
        query = query.where(
            or_(
                Job.title.ilike(f"%{q}%"),
                Job.company_name.ilike(f"%{q}%"),
                Job.description.ilike(f"%{q}%")
            )
        )
    if location:
        query = query.where(Job.location.ilike(f"%{location}%"))

    result = await db.execute(query.order_by(Job.created_at.desc()))
    return result.scalars().all()

@router.get("/{id}", response_model=JobResponse)
async def get_job(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Job).where(Job.id == id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.post("", response_model=JobResponse)
async def create_job(payload: JobCreate, db: AsyncSession = Depends(get_db)):
    job = Job(**payload.model_dump())
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return job
