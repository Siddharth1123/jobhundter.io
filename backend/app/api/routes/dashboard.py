from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.session import get_db
from app.models.models import Job, JobMatch, Application, Interview
from app.schemas.schemas import DashboardMetricsResponse
from app.api.routes.users import ensure_default_user, DEFAULT_USER_ID

router = APIRouter()

@router.get("", response_model=DashboardMetricsResponse)
async def get_dashboard_metrics(db: AsyncSession = Depends(get_db)):
    await ensure_default_user(db)

    # Job counts
    jobs_count_res = await db.execute(select(func.count(Job.id)))
    jobs_discovered = jobs_count_res.scalar() or 0

    # Strong matches count (overall_score >= 80)
    matches_count_res = await db.execute(
        select(func.count(JobMatch.id)).where(JobMatch.user_id == DEFAULT_USER_ID, JobMatch.overall_score >= 80.0)
    )
    strong_matches = matches_count_res.scalar() or 0

    # Applications
    apps_res = await db.execute(select(Application).where(Application.user_id == DEFAULT_USER_ID))
    apps = apps_res.scalars().all()

    total_applications = len(apps)
    saved_jobs = len([a for a in apps if a.stage == "SAVED"])
    offers_received = len([a for a in apps if a.stage in ["OFFER", "ACCEPTED"]])
    rejections = len([a for a in apps if a.stage == "REJECTED"])
    waiting_responses = len([a for a in apps if a.stage in ["APPLIED", "HR_CONTACTED"]])

    # Active interviews
    int_res = await db.execute(
        select(func.count(Interview.id)).where(Interview.user_id == DEFAULT_USER_ID, Interview.status == "SCHEDULED")
    )
    active_interviews = int_res.scalar() or 0

    # Stage funnel counts
    funnel = {
        "DISCOVERED": jobs_discovered,
        "SAVED": saved_jobs,
        "APPLIED": len([a for a in apps if a.stage == "APPLIED"]),
        "HR_CONTACTED": len([a for a in apps if a.stage == "HR_CONTACTED"]),
        "INTERVIEW": len([a for a in apps if "INTERVIEW" in a.stage or "ROUND" in a.stage]),
        "OFFER": offers_received,
        "REJECTED": rejections
    }

    # Extract missing skills from user job matches
    missing_skills_map = {}
    matches_res = await db.execute(select(JobMatch).where(JobMatch.user_id == DEFAULT_USER_ID))
    all_matches = matches_res.scalars().all()
    for m in all_matches:
        if m.missing_skills and isinstance(m.missing_skills, list):
            for ms in m.missing_skills:
                s_name = ms.get("skill") if isinstance(ms, dict) else str(ms)
                if s_name:
                    missing_skills_map[s_name] = missing_skills_map.get(s_name, 0) + 1

    top_missing_skills = [
        {"skill": skill, "count": count, "importance": "HIGH", "reason": f"Required in {count} of your matched roles."}
        for skill, count in sorted(missing_skills_map.items(), key=lambda x: x[1], reverse=True)[:5]
    ]

    return DashboardMetricsResponse(
        jobs_discovered=jobs_discovered,
        jobs_scanned=jobs_discovered,
        strong_matches=strong_matches,
        saved_jobs=saved_jobs,
        total_applications=total_applications,
        active_interviews=active_interviews,
        offers_received=offers_received,
        rejections=rejections,
        waiting_responses=waiting_responses,
        followups_due=0,
        funnel=funnel,
        top_missing_skills=top_missing_skills
    )
