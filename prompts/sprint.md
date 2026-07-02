# Sprint.md — Recourse Build Plan

Assumption: ~24-hour hackathon build window (standard for the source material this was derived from). Adjust hour counts proportionally if your actual window differs — the phase *order* should not change.

This file is written to be handed directly to Antigravity as a build plan. Read `product.md` for the "why" and `requirements.md` for the "what" before starting any phase below.

## Build Order Principle
**Build the escalation engine before you polish anything else.** It's deterministic, cheap (2–3 hours), and it's the single feature that makes this an accountability platform instead of a complaint form. Every prior draft of this project under-built it — don't repeat that mistake.

---

## Phase 0 — Setup (Hour 0–1)
1. Spin up a small CPU instance on Jarvislabs.ai (a GPU instance is unnecessary for MVP — TF-IDF + Logistic Regression trains in minutes on CPU. Only provision GPU if attempting the DistilBERT stretch goal in Phase 6).
2. Scaffold repo: single FastAPI backend, single React frontend, PostgreSQL instance (local or managed).
3. Create module skeleton per `requirements.md` §Tech Stack (`intake/`, `scoring/`, `escalation/`, `dashboard/`, `models/`).
4. Set up Postgres schema from `requirements.md` §Data Model.

**Exit criteria:** empty FastAPI app running, hitting Postgres, React app scaffolded and talking to a health-check endpoint.

---

## Phase 1 — Data + Classification Model (Hour 1–3.5)
1. Generate 500–1000 synthetic labeled complaints (complaint text → department, category, priority) via LLM. Save as CSV.
2. Hand-write 15–20 keyword severity-floor rules for harassment/safety/discrimination categories.
3. Train TF-IDF + Logistic Regression on the synthetic set. Save as `.pkl`.
4. Build `/classify` endpoint: runs model, then applies severity-floor override on top.

**Exit criteria:** POST a complaint string, get back department/category/priority, with severity override provably firing on a harassment-keyword test case.

---

## Phase 2 — Evidence Scoring Engine (Hour 3.5–5.5)
Do NOT train a model here — this is a transparent formula. See `requirements.md` §4 for the exact factor weights.

1. Build the weighted scoring function (meeting frequency, attendance, prior cases, review delay, documents, response history).
2. Add evidence freshness tracking (`last_updated` per evidence item, stale flag >30 days).
3. Add contradictory evidence handling (supporting % vs conflicting %, not a single collapsed number).
4. Keep AI Confidence (from classifier) and Evidence Strength (from this formula) as two separate fields everywhere — API response, DB, UI.
5. Build `/score` endpoint returning the full breakdown (per-factor contributions, freshness flags, conflict split).

**Exit criteria:** given mock evidence JSON, endpoint returns a score plus a human-readable "because" list matching the explainability UI format in `requirements.md` §10.

---

## Phase 3 — Case Ownership + Escalation State Machine (Hour 5.5–8)
**This is the priority feature. Do not defer it to "if time permits."**

1. Implement case status/owner columns and the ownership transition table from `requirements.md` §6.
2. Implement the SLA + escalation background job exactly as specified in `requirements.md` §7 (pseudocode included there).
3. Add a demo-mode config flag that compresses SLA windows to ~60 seconds.
4. Add the permanent `escalated_flag` — once true, it never resets, and it's visible on the dashboard.

**Exit criteria:** create a case, assign it, let the demo-mode SLA expire, watch it auto-escalate and reassign owner — end to end, no manual intervention.

---

## Phase 4 — Core Workflow UI (Hour 8–14)
Build in this order — each is a thin vertical slice, get one fully working before starting the next:
1. Employee portal: submit case (structured form + canned follow-ups), track status.
2. HR Decision Center: view AI summary + evidence breakdown, approve/modify, assign owner + deadline.
3. Manager Workspace: view assigned case, mark progress/complete, upload proof (mock upload ok).
4. Employee Verification: Yes/Partially/No + rating + comment, triggers case close.

**Exit criteria:** one complaint can travel the full loop — submit → classify → score → HR assign → manager act → employee verify → closed — through the UI, no manual DB edits.

---

## Phase 5 — Dashboard (Hour 14–17)
Build the metrics from `requirements.md` §12, in priority order:
1. Total cases, escalation count per manager/department (cheapest, do first).
2. Average resolution time.
3. **Employee-verified vs. manager-marked-resolved gap chart** — this is your strongest visual for judges, don't cut it for time.

---

## Phase 6 — Polish + Stretch (Hour 17–21)
Only after everything above works end to end:
- Rule-based recommendation engine (JSON knowledge base, category → interventions).
- Risk classification routing (harassment bypasses manager, goes straight to HR).
- Explainability UI polish (checkmarks/crosses, confidence badge).
- *Stretch, optional:* DistilBERT fine-tune on Jarvislabs GPU instance in place of TF-IDF+LogReg, only if Phases 1–5 are solid with time to spare.

---

## Phase 7 — Demo Prep (Hour 21–24)
1. Seed 2–3 mock HRMS/attendance/calendar JSON datasets, clearly labeled "simulated" in the UI.
2. Script the live demo around the escalation moment: submit a case, fast-forward the compressed SLA, show it escalate on screen live — this is the moment judges remember.
3. Rehearse the positioning line: *"This isn't an engagement survey tool — it's an accountability system for employee relations."*
4. Prepare the honest non-goals slide: name Organizational Learning Engine and real integrations as future roadmap, framed as scoping discipline, not a gap.
5. Lock terminology: always "corroborates," never "validates."

## Cut List (if you're behind schedule — cut in this order)
1. Stretch DistilBERT model — cut first, TF-IDF+LogReg is already a defensible "real ML" story.
2. Recommendation engine polish — a flat JSON lookup is enough, don't gold-plate it.
3. Dashboard charts beyond the top 3 in Phase 5.
4. Canned follow-up question variety — one generic set per category is enough.

**Never cut:** the escalation engine (Phase 3) or the evidence explainability UI (Phase 2/4). Those two are what separate this from every other hackathon complaint-triage tool.