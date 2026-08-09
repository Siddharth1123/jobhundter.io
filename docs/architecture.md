# Architecture & System Design — CareerPilot AI

## Product Vision & Core Mission
Traditional job boards answer: *"Which jobs exist?"*  
**CareerPilot AI** answers: *"Which jobs are worth applying to, why am I a good match, how should I tailor my resume, and how do I manage my entire application lifecycle from discovery to offer?"*

---

## Zerops Multi-Service Topology

```
                                  +-----------------------+
                                  |     Zerops Router     |
                                  +-----------+-----------+
                                              |
                        +---------------------+---------------------+
                        |                                           |
                        v                                           v
           +-------------------------+                 +-------------------------+
           |    Frontend Service     |                 |       API Service       |
           | Next.js 14 App Router   |                 |    FastAPI / Python     |
           | TailwindCSS + shadcn UI |                 | SQLAlchemy 2 / Pydantic |
           +-------------------------+ +---------------+------------+------------+
                                       |                            |
                                       v                            v
                          +-------------------------+  +-------------------------+
                          |     Worker Service      |  |   Managed PostgreSQL    |
                          | Background Ingestion &  |  |   (DB Service on Zerops)|
                          | Auto Match Processing   |  |  Relational + JSONB     |
                          +-------------------------+  +-------------------------+
```

---

## 6-Factor Deterministic Match Engine Formula

$$\text{Final Score} = (\text{Skill Score} \times 0.40) + (\text{Experience Score} \times 0.20) + (\text{Role Score} \times 0.15) + (\text{Location Score} \times 0.10) + (\text{Tool Score} \times 0.10) + (\text{Education Score} \times 0.05)$$

1. **Skill Match (40%)**: Exact & fuzzy keyword overlap against parsed resume skills.
2. **Experience Match (20%)**: Extracted required years vs candidate years of experience.
3. **Role & Title Fit (15%)**: Semantic overlap between candidate target roles and job title.
4. **Location & Remote Preference (10%)**: Matching location or remote/hybrid preferences.
5. **Tools & Tech Stack (10%)**: Coverage of recognized cloud/DevOps infrastructure tools.
6. **Education Required (5%)**: Degree alignment checks.

---

## AI Ethical Guardrails
1. **Non-Fabrication Guarantee**: Resume tailoring only re-orders, re-phrases, and highlights verified candidate achievements. Never invents skills, employers, or metrics.
2. **Redirect-Only Application**: Never automatically submits job applications. Clicking "Apply Now" redirects to the official application portal and prompts confirmation to log into CRM.
