# ResolveAI MVP

ResolveAI is an employee-feedback accountability MVP with a FastAPI backend, a React role-based frontend, and an auditable AI pipeline. The current implementation routes employee concerns, feedback, suggestions, and surveys to executives/managers, grounds recommendations in a local policy/FAQ knowledge pack, turns failed resolution outcomes into a human-reviewed relearning queue, and now authenticates users through Neon-backed sessions.

## What Is Implemented

- Employee, manager, CTO/COO, and CEO workspaces in `frontend/`.
- Complaint creation and listing through FastAPI in `backend-ai/app/api/routes/complaints.py`.
- Escalation clusters for repeated unresolved issues in `backend-ai/app/api/routes/alerts.py`.
- Hybrid retrieval over:
  - `backend-ai/knowledge/policy_faq.json`
  - `synthetic_rag_data.csv` resolved cases
  - approved learning corrections from `learning_candidates`
- Groq reasoning prompts that receive cited knowledge evidence.
- Neon-backed auth with hashed passwords, bearer sessions, and seeded demo users.
- Confidence floors:
  - Concern: `>= 90`
  - Feedback: `>= 80`
  - Suggestion: `>= 85`
  - Survey: `>= 80`
- Governed relearning:
  - Employee marks a resolution `No`, `Partially`, or below `4/5`.
  - The frontend queues a learning candidate.
  - Backend stores it as `Needs Review`.
  - Executives approve/reject in the AI Risk & Routing Center.
  - Only `Approved` corrections are retrieved for future recommendations.

## Repository Map

```text
backend-ai/
  app/
    api/routes/          FastAPI routes for auth, complaints, alerts, dashboards, learning
    ai/                  retrieval, Groq reasoning, predictor client
    core/                settings and async database bootstrap
    models/              SQLAlchemy models and auth session tables
    repositories/        database operations and auth seed helpers
    schemas/             Pydantic API contracts
  knowledge/
    policy_faq.json      structured policy/FAQ source for RAG
  scripts/
    generate_policy_pdf.py

frontend/
  src/
    api/                 Axios API clients
    pages/               role-based modules
    ResolveContext.tsx   local workflow state and backend sync

docs/
  ResolveAI_Sample_Employee_Policy_FAQ.pdf

synthetic_rag_data.csv   resolved-case retrieval sample
```

## Backend Setup

Create `backend-ai/.env`:

```env
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@HOST/DBNAME
GROQ_API_KEY=your_groq_key
GROQ_MODEL=llama-3.3-70b-versatile
AI_SERVICE_URL=http://localhost:9000/predict
```

Neon connection strings can be pasted as either `postgresql://...` or
`postgresql+asyncpg://...`. The backend normalizes the URL for async SQLAlchemy
and configures SSL for remote PostgreSQL hosts.

Install dependencies in your preferred Python environment:

```bash
pip install fastapi uvicorn sqlalchemy asyncpg pydantic-settings groq requests python-dotenv
```

Run the API:

```bash
cd backend-ai
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Startup creates known tables and applies idempotent compatibility columns for
complaint policy evidence, routing, submission type, assigned manager id, action
plans, and employee verification state.

To seed or refresh the demo auth users manually:

```bash
cd backend-ai
python3 scripts/seed_auth_users.py
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Optional `.env`:

```env
VITE_API_URL=http://localhost:8000
```

Build:

```bash
cd frontend
npm run build
```

## Key API Endpoints

- `POST /complaints/` creates a complaint, retrieves policy/case evidence, calls Groq, applies score floors, and stores the result.
- `GET /complaints/` lists complaints for the frontend.
- `PATCH /complaints/{id}/lifecycle` persists assigned action plans, manager progress, completion proof, status changes, and employee verification.
- `GET /alerts/escalations` returns repeated unresolved issue clusters.
- `POST /learning/candidates` stores a failed outcome as `Needs Review`.
- `GET /learning/candidates` lists relearning candidates.
- `PATCH /learning/candidates/{id}/decision` approves or rejects a candidate.

## RAG And Scoring Flow

1. Complaint text is classified through `ComplaintPredictor`.
2. `RAGService` ranks structured policy/FAQ entries, resolved CSV cases, and approved learning corrections.
3. Policy evidence can refine category and routing.
4. Cited evidence is passed into the Groq prompt.
5. Deterministic fallback uses the top policy action if Groq is unavailable.
6. Score floors are applied after prediction so Concern/Feedback thresholds are preserved.
7. Policy citations are returned to the frontend as evidence logs.

## Relearning Flow

1. Manager completes an action plan.
2. Employee verifies the outcome.
3. If the result is `No`, `Partially`, or score `< 4`, the item returns to executive review.
4. A learning candidate is created locally and synced to `/learning/candidates`.
5. CTO/COO reviews the queue from `Plans` / AI Risk & Routing Center.
6. Approved candidates become retrievable `approved_correction` sources.
7. Rejected candidates remain auditable but are not used in retrieval.

## Policy Pack

The structured source of truth is:

```text
backend-ai/knowledge/policy_faq.json
```

Regenerate the human-readable PDF:

```bash
python3 backend-ai/scripts/generate_policy_pdf.py
```

Output:

```text
docs/ResolveAI_Sample_Employee_Policy_FAQ.pdf
```

## Deployment Notes

- Use PostgreSQL with SSL-capable async SQLAlchemy URLs.
- Set `DATABASE_URL`, `GROQ_API_KEY`, and `AI_SERVICE_URL` as environment variables.
- Configure frontend `VITE_API_URL` to the deployed FastAPI base URL.
- Replace the sample policy pack with approved company policy before production.
- Update the seeded demo passwords before production or replace them with your own identity provider.
- Add migrations for long-term schema management. Startup DDL is only an MVP convenience.

## Smoke Checks

Backend syntax:

```bash
python3 -m compileall backend-ai/app
```

Frontend build:

```bash
cd frontend
npm run build
```

Manual flow:

1. Start backend and frontend.
2. Submit a concern from Employee.
3. Confirm CTO/COO queue shows category, routing, confidence, and policy evidence.
4. Assign an action plan.
5. Complete as Manager.
6. Verify as Employee with `Partially` or score `3`.
7. Open CTO/COO `Plans` and approve/reject the relearning candidate.
