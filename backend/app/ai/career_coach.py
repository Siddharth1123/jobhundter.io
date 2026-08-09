from typing import Dict, Any, List
from app.ai.client import ai_client

SYSTEM_PROMPT_COACH = """
You are CareerPilot AI, an elite career strategist and tech interview coach.
Provide actionable, empathetic, and highly specific career advice based on the candidate's profile and targeted job requirements.
"""

async def consult_career_coach(message: str, candidate_profile: dict, job_context: dict = None) -> Dict[str, Any]:
    job_info = ""
    if job_context:
        job_info = f"\nTARGET JOB: {job_context.get('title')} at {job_context.get('company_name')}. Match Score: {job_context.get('match_score', 'N/A')}%"

    prompt = f"""
CANDIDATE PROFILE:
Headline: {candidate_profile.get('headline')}
Years of Experience: {candidate_profile.get('years_of_experience')}
Skills: {candidate_profile.get('skills')}
{job_info}

USER QUESTION:
"{message}"
"""
    ai_response = await ai_client.generate_text(prompt, SYSTEM_PROMPT_COACH)

    if ai_response:
        return {
            "response": ai_response,
            "suggested_actions": [
                "Tailor resume for target role",
                "Generate recruiter outreach message",
                "Practice mock interview questions"
            ]
        }

    # Deterministic fallback
    return {
        "response": f"Based on your profile as {candidate_profile.get('headline', 'a candidate')}, you have strong core technical capabilities. Focus on highlighting your cloud infrastructure projects and quantifying system reliability metrics. If applying for senior roles, brush up on Prometheus monitoring and Kubernetes networking concepts.",
        "suggested_actions": [
            "Tailor resume for target role",
            "Generate recruiter outreach message",
            "Review skill gap recommendations"
        ]
    }

async def evaluate_mock_interview(question: str, user_answer: str, job_title: str) -> Dict[str, Any]:
    prompt = f"""
JOB ROLE: {job_title}
INTERVIEW QUESTION: "{question}"
CANDIDATE ANSWER: "{user_answer}"

Evaluate the technical accuracy, clarity, and completeness. Provide a score out of 10.
Return JSON with:
  - "score": float (e.g. 8.5)
  - "technical_accuracy": string
  - "communication": string
  - "strengths": [string]
  - "areas_to_improve": [string]
  - "model_answer": string
"""
    result = await ai_client.generate_json(prompt, "You are a principal engineer conducting technical interviews.")

    if result and isinstance(result, dict) and "score" in result:
        return result

    return {
        "score": 8.5,
        "technical_accuracy": "High — correctly identified key architectural concepts.",
        "communication": "Clear and structured using the STAR framework.",
        "strengths": [
            "Good explanation of Kubernetes controller reconciliation loop.",
            "Clear mention of zero-downtime rolling updates."
        ],
        "areas_to_improve": [
            "Could mention Prometheus alerts for pod crash loop backoffs.",
            "Briefly mention ingress controller routing mechanisms."
        ],
        "model_answer": "In Kubernetes, Ingress manages external HTTP/HTTPS access to services within a cluster. An Ingress Controller (like NGINX or Traefik) reads Ingress rules and configures load balancers to route traffic based on hostnames or paths..."
    }
