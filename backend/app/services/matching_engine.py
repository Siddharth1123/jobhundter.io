import re
from typing import Dict, List, Any, Tuple

# Pre-defined technology list for tool/technology matching distinction
KNOWN_TOOLS = {
    "aws", "gcp", "azure", "kubernetes", "k8s", "docker", "terraform", "ansible",
    "prometheus", "grafana", "jenkins", "gitlab", "github actions", "argocd",
    "helm", "istio", "linux", "bash", "python", "golang", "go", "postgresql",
    "redis", "kafka", "elasticsearch", "mongodb", "nginx", "datadog", "new relic",
    "vault", "cloudformation", "packer", "puppet", "chef"
}

def normalize_text(text: str) -> str:
    if not text:
        return ""
    return re.sub(r'[^a-z0-9\s]', '', text.lower()).strip()

def calculate_skill_score(candidate_skills: List[str], required_skills: List[str]) -> Tuple[float, List[str], List[Dict[str, str]]]:
    """
    Skill Match: 40% max
    Returns (skill_score_40, matched_skills, missing_skills)
    """
    if not required_skills:
        return 35.0, candidate_skills[:5], []

    cand_set = {normalize_text(s) for s in candidate_skills if s}
    req_set = {normalize_text(s) for s in required_skills if s}

    matched = []
    missing = []

    for req in required_skills:
        norm_req = normalize_text(req)
        if any(norm_req in cand or cand in norm_req for cand in cand_set):
            matched.append(req)
        else:
            # Importance heuristic based on occurrence frequency or keyword
            importance = "HIGH" if norm_req in {"kubernetes", "k8s", "aws", "terraform", "docker", "python"} else "MEDIUM"
            missing.append({
                "skill": req,
                "importance": importance,
                "reason": f"Required in target job specification."
            })

    match_ratio = len(matched) / len(required_skills) if required_skills else 1.0
    score = round(match_ratio * 40.0, 2)
    return score, matched, missing

def calculate_experience_score(candidate_years: float, job_description: str, job_title: str) -> float:
    """
    Experience Match: 20% max
    Extracts required years from JD or infers from level.
    """
    # Extract years requirement (e.g., "1-3 years", "5+ years", "3 to 5 years")
    match = re.search(r'(\d+)\s*(?:-|\+|to)\s*(\d+)?\s*years?', job_description, re.IGNORECASE)
    req_years = 2.0
    if match:
        req_years = float(match.group(1))

    if candidate_years >= req_years:
        return 20.0
    elif candidate_years >= (req_years - 1.0):
        return 16.0
    elif candidate_years >= (req_years / 2.0):
        return 10.0
    else:
        return 5.0

def calculate_role_score(candidate_roles: List[str], job_title: str) -> float:
    """
    Role/Title Match: 15% max
    """
    norm_title = normalize_text(job_title)
    if not candidate_roles:
        return 10.0

    for role in candidate_roles:
        norm_role = normalize_text(role)
        if norm_role in norm_title or norm_title in norm_role:
            return 15.0
        # Check partial token overlap (e.g. SRE / Site Reliability, DevOps, Engineer)
        role_tokens = set(norm_role.split())
        title_tokens = set(norm_title.split())
        overlap = role_tokens.intersection(title_tokens)
        if overlap:
            return 12.0

    return 7.5

def calculate_location_score(candidate_location: str, preferred_locations: List[str], remote_pref: str, job_location: str) -> float:
    """
    Location Match: 10% max
    """
    norm_job_loc = normalize_text(job_location)
    if "remote" in norm_job_loc or remote_pref.lower() == "remote":
        return 10.0

    if candidate_location and normalize_text(candidate_location) in norm_job_loc:
        return 10.0

    for pref in preferred_locations:
        if normalize_text(pref) in norm_job_loc:
            return 9.0

    return 6.0

def calculate_tool_score(candidate_skills: List[str], job_description: str) -> float:
    """
    Tool/Technology Match: 10% max
    Identifies tools in job description and checks candidate coverage.
    """
    norm_jd = normalize_text(job_description)
    jd_tools = [tool for tool in KNOWN_TOOLS if tool in norm_jd]
    if not jd_tools:
        return 9.0

    cand_tools = {normalize_text(s) for s in candidate_skills}
    matched_tools = [t for t in jd_tools if any(t in c for c in cand_tools)]

    ratio = len(matched_tools) / len(jd_tools) if jd_tools else 1.0
    return round(ratio * 10.0, 2)

def calculate_education_score(education_list: List[Dict[str, Any]], job_description: str) -> float:
    """
    Education Match: 5% max
    """
    norm_jd = normalize_text(job_description)
    if "phd" in norm_jd or "doctorate" in norm_jd:
        has_phd = any("phd" in normalize_text(str(edu)) for edu in education_list)
        return 5.0 if has_phd else 3.0
    elif "master" in norm_jd or "m.s" in norm_jd or "m.tech" in norm_jd:
        has_master = any(term in normalize_text(str(edu)) for term in education_list for term in ["master", "ms", "mtech"])
        return 5.0 if has_master else 4.0
    else:
        # Bachelor default
        return 5.0

def compute_deterministic_match(candidate_profile: Dict[str, Any], job_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes overall match score out of 100 based on exact weighted formulas:
    - Skill score (40%)
    - Experience score (20%)
    - Role score (15%)
    - Location score (10%)
    - Tool score (10%)
    - Education score (5%)
    """
    cand_skills = candidate_profile.get("skills", [])
    if isinstance(cand_skills, list) and len(cand_skills) > 0 and isinstance(cand_skills[0], dict):
        cand_skill_names = [s.get("name", "") for s in cand_skills]
    else:
        cand_skill_names = [str(s) for s in cand_skills]

    req_skills = job_data.get("skills_required", [])
    job_desc = job_data.get("description", "")
    job_title = job_data.get("title", "")
    job_loc = job_data.get("location", "Remote")

    skill_score, matched_skills, missing_skills = calculate_skill_score(cand_skill_names, req_skills)
    exp_score = calculate_experience_score(candidate_profile.get("years_of_experience", 0.0), job_desc, job_title)
    role_score = calculate_role_score(candidate_profile.get("target_roles", []), job_title)
    loc_score = calculate_location_score(
        candidate_profile.get("location", ""),
        candidate_profile.get("preferred_locations", []),
        candidate_profile.get("remote_preference", "flexible"),
        job_loc
    )
    tool_score = calculate_tool_score(cand_skill_names, job_desc)
    edu_score = calculate_education_score(candidate_profile.get("education", []), job_desc)

    overall_score = round(skill_score + exp_score + role_score + loc_score + tool_score + edu_score, 1)
    
    # Cap between 0 and 100
    overall_score = min(100.0, max(0.0, overall_score))

    # Determine recommendation tier
    if overall_score >= 85.0:
        recommendation = "HIGHLY_RECOMMENDED"
    elif overall_score >= 70.0:
        recommendation = "APPLY"
    elif overall_score >= 50.0:
        recommendation = "CONSIDER"
    else:
        recommendation = "PASS"

    explanation = (
        f"Candidate scored {overall_score}% overall. "
        f"Strong alignment on skills ({skill_score}/40) and role ({role_score}/15). "
        f"Matched {len(matched_skills)} core skills. "
        f"{len(missing_skills)} missing requirement(s) identified."
    )

    return {
        "overall_score": overall_score,
        "skill_score": skill_score,
        "experience_score": exp_score,
        "role_score": role_score,
        "location_score": loc_score,
        "tool_score": tool_score,
        "education_score": edu_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "recommendation": recommendation,
        "explanation": explanation
    }
