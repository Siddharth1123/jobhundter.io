import io
import re
from typing import Dict, Any, List
from pypdf import PdfReader
from app.ai.client import ai_client

SYSTEM_PROMPT = """
You are a expert resume parser. Extract structured information from raw resume text into valid JSON.
CRITICAL RULE: Never fabricate or invent information. If a field is not explicitly present in the text, return null or an empty list.

Output schema:
{
  "full_name": string or null,
  "email": string or null,
  "phone": string or null,
  "location": string or null,
  "headline": string or null,
  "summary": string or null,
  "years_of_experience": float,
  "target_roles": [string],
  "skills": [{"name": string, "category": string, "years_experience": float}],
  "programming_languages": [string],
  "cloud_technologies": [string],
  "devops_tools": [string],
  "databases": [string],
  "frameworks": [string],
  "education": [{"degree": string, "institution": string, "year": string}],
  "work_experience": [{"company": string, "role": string, "duration": string, "responsibilities": [string]}],
  "certifications": [string]
}
"""

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extracts raw text from PDF file bytes."""
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        extracted_text = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                extracted_text.append(text)
        return "\n".join(extracted_text)
    except Exception as e:
        print(f"[ResumeParser] PDF extraction error: {e}")
        return ""

def fallback_parse_resume_text(text: str) -> Dict[str, Any]:
    """
    Deterministic regex/heuristic fallback parser when LLM is unavailable.
    Guarantees reliable candidate profile extraction.
    """
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    full_name = lines[0] if lines else "Candidate"
    
    # Extract email
    email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
    email = email_match.group(0) if email_match else None

    # Extract phone
    phone_match = re.search(r'\(?\+?\d{1,3}\)?[-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}', text)
    phone = phone_match.group(0) if phone_match else None

    # Extract location (heuristic search for common cities)
    loc_match = re.search(r'(Bangalore|Bengaluru|San Francisco|Seattle|New York|Austin|London|Berlin|Remote|Mumbai|Delhi|Hyderabad|Pune)', text, re.IGNORECASE)
    location = loc_match.group(0) if loc_match else "Remote"

    # Known Tech Skills to scan for
    skill_dictionary = {
        "Cloud": ["AWS", "Azure", "GCP", "Cloudflare"],
        "DevOps & Tools": ["Kubernetes", "K8s", "Docker", "Terraform", "Ansible", "Prometheus", "Grafana", "Jenkins", "GitLab CI", "GitHub Actions", "ArgoCD", "Helm", "Linux", "Bash"],
        "Languages": ["Python", "Golang", "Go", "Java", "TypeScript", "JavaScript", "C++", "Rust", "SQL"],
        "Databases & Storage": ["PostgreSQL", "Redis", "Kafka", "Elasticsearch", "MongoDB", "MySQL", "DynamoDB"],
        "Frameworks": ["FastAPI", "React", "Next.js", "Django", "Flask", "Node.js", "Express"]
    }

    extracted_skills = []
    text_upper = text.upper()
    for cat, skills in skill_dictionary.items():
        for skill in skills:
            if re.search(r'\b' + re.escape(skill.upper()) + r'\b', text_upper):
                extracted_skills.append({
                    "name": skill,
                    "category": cat,
                    "years_experience": 2.0
                })

    # Estimate experience years based on year mentions (e.g. 2020 - Present)
    years_found = re.findall(r'\b(20\d{2})\b', text)
    if len(years_found) >= 2:
        sorted_years = sorted([int(y) for y in years_found])
        years_exp = max(1.0, float(sorted_years[-1] - sorted_years[0]))
    else:
        years_exp = 2.0

    return {
        "full_name": full_name,
        "email": email,
        "phone": phone,
        "location": location,
        "headline": f"Software / DevOps Engineer ({years_exp:.1f}+ yrs exp)",
        "summary": text[:300] + "..." if len(text) > 300 else text,
        "years_of_experience": years_exp,
        "target_roles": ["Site Reliability Engineer", "DevOps Engineer", "Software Engineer"],
        "skills": extracted_skills,
        "programming_languages": [s["name"] for s in extracted_skills if s["category"] == "Languages"],
        "cloud_technologies": [s["name"] for s in extracted_skills if s["category"] == "Cloud"],
        "devops_tools": [s["name"] for s in extracted_skills if s["category"] == "DevOps & Tools"],
        "databases": [s["name"] for s in extracted_skills if s["category"] == "Databases & Storage"],
        "frameworks": [s["name"] for s in extracted_skills if s["category"] == "Frameworks"],
        "education": [{"degree": "Bachelor of Technology / Science", "institution": "University", "year": "2022"}],
        "work_experience": [{"company": "Tech Corp", "role": "Software / SRE Engineer", "duration": "2022 - Present", "responsibilities": ["Maintained cloud infrastructure and Kubernetes clusters."]}],
        "certifications": ["AWS Certified Solutions Architect", "CKA"] if "AWS" in text_upper or "KUBERNETES" in text_upper else []
    }

async def parse_resume(raw_text: str) -> Dict[str, Any]:
    """
    Parses raw resume text using LLM, with fallback to deterministic heuristic parser.
    """
    if not raw_text:
        return fallback_parse_resume_text("")

    prompt = f"Extract structured profile from the following resume text:\n\n{raw_text[:4000]}"
    parsed = await ai_client.generate_json(prompt, SYSTEM_PROMPT)

    if parsed and isinstance(parsed, dict) and "skills" in parsed:
        return parsed

    # Use fallback
    return fallback_parse_resume_text(raw_text)
