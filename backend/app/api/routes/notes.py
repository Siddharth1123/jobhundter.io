from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.models import Note, Application
from app.schemas.schemas import NoteResponse, NoteCreate
from app.api.routes.users import ensure_default_user, DEFAULT_USER_ID

router = APIRouter()

@router.post("/applications/{id}/notes", response_model=NoteResponse)
async def create_note(id: str, payload: NoteCreate, db: AsyncSession = Depends(get_db)):
    await ensure_default_user(db)
    app_res = await db.execute(select(Application).where(Application.id == id, Application.user_id == DEFAULT_USER_ID))
    app = app_res.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    note = Note(
        application_id=id,
        user_id=DEFAULT_USER_ID,
        content=payload.content,
        author_name=payload.author_name or "User"
    )
    db.add(note)
    await db.commit()
    await db.refresh(note)
    return note

@router.get("/applications/{id}/notes", response_model=List[NoteResponse])
async def list_notes(id: str, db: AsyncSession = Depends(get_db)):
    await ensure_default_user(db)
    result = await db.execute(
        select(Note).where(Note.application_id == id).order_by(Note.created_at.desc())
    )
    return result.scalars().all()
