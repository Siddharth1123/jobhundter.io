from typing import Dict, Any
from app.ai.client import ai_client

SYSTEM_PROMPT_OUTREACH = """
You are a career strategist. Generate high-converting, professional, personalized recruiter outreach messages.
Return JSON with:
  - "linkedin_message": string (short, under 300 characters for connection note)
  - "recruiter_email": string (formal cold outreach email)
  - "follow_up_email": string (polite follow-up 5 days after applying)
  - "thank_you_email": string (post-interview thank you note)
"""

async def generate_recruiter_outreach(
    candidate_name: str,
    candidate_headline: str,
    job_title: str,
    company: str,
    recruiter_name: str,
    matched_skills: list
) -> Dict[str, Any]:
    prompt = f"""
Candidate: {candidate_name} ({candidate_headline})
Job Title: {job_title}
Company: {company}
Recruiter: {recruiter_name or 'Hiring Team'}
Key Matched Skills: {', '.join(matched_skills[:5])}
"""
    result = await ai_client.generate_json(prompt, SYSTEM_PROMPT_OUTREACH)

    if result and isinstance(result, dict) and "linkedin_message" in result:
        return result

    # Deterministic fallback templates
    rec_name = recruiter_name or "Hiring Manager"
    skills_str = ", ".join(matched_skills[:3]) if matched_skills else "cloud & DevOps infrastructure"

    return {
        "linkedin_message": f"Hi {rec_name}, I saw the {job_title} role at {company}. With hands-on experience in {skills_str}, I’d love to connect and discuss how my background aligns with your team's goals!",
        "recruiter_email": f"""Subject: Application Inquiry: {job_title} - {candidate_name}

Hi {rec_name},

I hope this email finds you well.

I recently came across the {job_title} opening at {company} and wanted to reach out directly. Given my background in {skills_str}, I am very excited about the work your team is doing.

I have submitted my application and would welcome the opportunity to discuss how my technical experience can contribute to {company}'s growth.

Best regards,
{candidate_name}
""",
        "follow_up_email": f"""Subject: Following up — {job_title} Application ({candidate_name})

Hi {rec_name},

I hope you’re having a great week.

I wanted to briefly follow up on my recent application for the {job_title} position at {company}. I remain very enthusiastic about this opportunity and would be glad to answer any questions or provide additional information.

Looking forward to hearing from you.

Best,
{candidate_name}
""",
        "thank_you_email": f"""Subject: Thank you — {job_title} Interview ({candidate_name})

Hi {rec_name},

Thank you for taking the time to speak with me today regarding the {job_title} role at {company}. I really enjoyed learning more about the team's engineering priorities and infrastructure vision.

Our conversation reinforced my interest in joining {company}. Please let me know if you need any additional details from my end.

Best regards,
{candidate_name}
"""
    }
