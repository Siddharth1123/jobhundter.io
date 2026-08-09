from app.services.matching_engine import (
    calculate_skill_score,
    calculate_experience_score,
    calculate_role_score,
    compute_deterministic_match
)

def test_skill_score_calculation():
    cand_skills = ["AWS", "Kubernetes", "Terraform", "Docker"]
    req_skills = ["AWS", "Kubernetes", "Terraform", "Prometheus", "Grafana"]

    score, matched, missing = calculate_skill_score(cand_skills, req_skills)
    
    # 3 out of 5 matched -> 3/5 * 40 = 24.0
    assert score == 24.0
    assert "AWS" in matched
    assert "Kubernetes" in matched
    assert "Terraform" in matched
    assert len(missing) == 2
    missing_names = [m["skill"] for m in missing]
    assert "Prometheus" in missing_names
    assert "Grafana" in missing_names

def test_full_deterministic_match():
    cand_profile = {
        "skills": ["AWS", "Kubernetes", "Terraform", "Docker", "Linux", "Python"],
        "years_of_experience": 3.0,
        "target_roles": ["Site Reliability Engineer", "DevOps Engineer"],
        "location": "Bangalore",
        "preferred_locations": ["Bangalore", "Remote"],
        "remote_preference": "flexible",
        "education": [{"degree": "B.Tech Computer Science"}]
    }

    job_data = {
        "title": "Site Reliability Engineer",
        "description": "Requires 2+ years experience in AWS, Kubernetes, Terraform, Docker, Prometheus.",
        "skills_required": ["AWS", "Kubernetes", "Terraform", "Docker", "Prometheus"],
        "location": "Bangalore (Hybrid)"
    }

    match_result = compute_deterministic_match(cand_profile, job_data)
    
    # High score expected (> 80)
    assert match_result["overall_score"] >= 80.0
    assert match_result["recommendation"] in ["HIGHLY_RECOMMENDED", "APPLY"]
    assert "AWS" in match_result["matched_skills"]
    assert "Prometheus" in [m["skill"] for m in match_result["missing_skills"]]
