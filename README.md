# CareerPilot AI — AI Career Operating System & Job Search CRM

> **Zerops Hackathon 2026 Submission**  
> An AI-powered Job Search & Career Management CRM for candidates. Solves the complete lifecycle: **Resume Upload & AI Profile Parsing → Job Discovery & Ingestion → 6-Factor Deterministic AI Matching → Application CRM Pipeline (Kanban) → Ethical Resume Tailoring & Outreach → Interview Tracking & Timeline → Skill Gap Analytics & AI Career Coach**.

---

## 🌟 Problem & Product Vision

Traditional job boards answer:  
> *"Which jobs exist?"*

**CareerPilot AI** answers:  
> *"Which jobs are worth applying to? Why am I a good match? What skills am I missing? How should I tailor my resume without fabricating experience? How should I contact the recruiter? When is my interview, and how is my job search performing?"*

---

## ⚡ Key Differentiators & Product Features

1. **6-Factor Deterministic AI Matching Engine**:
   Rather than letting LLMs hallucinate match scores, the backend calculates a 100% explainable, defensible score using exact weighted mathematical formulas:
   $$Score = 0.40(\text{Skill}) + 0.20(\text{Experience}) + 0.15(\text{Role}) + 0.10(\text{Location}) + 0.10(\text{Tools}) + 0.05(\text{Education})$$
   LLMs provide contextual rationale and missing skill categorizations.

2. **Ethical Non-Fabricating AI Resume Tailor**:
   Strict prompt guardrails enforce that experience, companies, metrics, or certifications are **never invented**. Information is reordered, rephrased, and aligned for ATS keyword optimization.

3. **Job Search Application CRM (Kanban Pipeline)**:
   Salesforce-style CRM tracking candidate applications across 12 stages (`DISCOVERED`, `SAVED`, `APPLIED`, `HR_CONTACTED`, `INTERVIEW_SCHEDULED`, `TECHNICAL_ROUND`, `MANAGER_ROUND`, `HR_DISCUSSION`, `OFFER`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`).

4. **Recruiter Outreach Suite**:
   1-click draft generation for LinkedIn connection notes, cold recruiter emails, 5-day follow-up messages, and post-interview thank you notes.

5. **Centralized Interview Tracker & Preparation Hub**:
   Schedule interview rounds, record interviewer feedback, store meeting links, and practice mock technical interviews with AI evaluation scores.

6. **Skill Gap Intelligence & Personalized Learning Roadmaps**:
   Identifies high-impact missing technologies across targeted roles (e.g. Prometheus, Grafana, ArgoCD) and generates week-by-week learning roadmaps.

7. **Redirect-Only Application Enforcement**:
   No automatic job applications or spamming. Clicking **"Apply Now"** opens the official career portal and prompts the candidate to confirm application submission before moving it into the CRM pipeline.

---

## ☁️ Zerops Native Architecture

Multi-service configuration in `zerops.yaml` deploying 4 native services inside a single Zerops project:

```
zerops.yaml Structure:
├── db        (Managed PostgreSQL 16 Service)
├── api       (Python 3.11 FastAPI Backend)
├── worker    (Python 3.11 Background Job Ingestion Worker)
└── frontend  (Node.js 20 Next.js 14 App Router)
```

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Recharts, Framer Motion, TanStack Query.
- **Backend**: Python 3.11, FastAPI, SQLAlchemy 2.0 (Async), Pydantic v2, PostgreSQL / SQLite (aiosqlite/asyncpg), PyPDF text extraction.
- **AI Service**: Dedicated AI abstraction layer supporting Gemini, OpenAI, and a deterministic offline fallback parser.
- **Deployment**: Zerops multi-service project (`zerops.yaml`).

---

## 🚀 Local Development Setup

### 1. Backend Setup
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Run Backend Tests
```bash
cd backend
source .venv/bin/activate
PYTHONPATH=. pytest tests/
```

---

## ☁️ Deploying to Zerops

1. Install Zerops CLI (`zcli`).
2. Log in to Zerops: `zcli login <token>`
3. Import or push project using `zerops.yaml`:
```bash
zcli push
```

---

## 🤖 AI Disclosure

AI tools (ChatGPT / Claude / Gemini / Antigravity) were utilized during development as AI coding assistants for architecture brainstorming, schema design, UI component styling, and unit test generation. All system design decisions, 6-factor deterministic scoring math, ethical guardrail enforcement, and Zerops multi-service integration were reviewed and implemented by the developer.
