# Product.md — Recourse (working title)

## One-liner
An AI-assisted **Employee Relations Case Management Platform** that turns employee complaints into evidence-backed, time-bound, owned cases — so issues get *solved*, not just *logged*.

## The Positioning Correction (read this first)
The original pitch was "AI Employee Engagement Platform." That's the wrong market.

| Employee Engagement (what you're NOT building) | Employee Relations (what you ARE building) |
|---|---|
| Surveys, pulse checks, eNPS | Workplace issues, investigations |
| Sentiment tracking | Accountability, resolution tracking |
| "How do people feel" | "Did the problem get fixed, and who was responsible" |

Say this explicitly in the pitch: *"We're not another engagement survey tool. We're an accountability system for employee relations."* This single sentence reframes every feature you're about to demo.

## The Problem
Employee complaints today follow this pattern:
```
Complaint → Manager → (silence) → Nothing happens
```
There is no ownership, no deadline, no escalation, and no verification that the problem was actually fixed. Engagement surveys measure sentiment; they don't close loops.

## Core Philosophy
**AI where it adds value. Deterministic logic where trust matters.**

- AI is used for: intake structuring, complaint classification, evidence synthesis, resolution recommendations.
- Deterministic rules are used for: evidence scoring, SLA timers, escalation, severity floors for sensitive categories, case ownership.
- AI never makes the final call. AI informs; HR and the workflow engine decide and act.

This is also your judge-facing answer to "why isn't everything a black-box model?" — say it out loud, it's a strength, not a limitation.

## The Accountability Loop (your actual USP)
This is the mechanic the earlier drafts kept losing. Everything else in the product exists to feed this loop:

```
Case Submitted
   ↓ (Owner: AI Intake)
Case Reviewed & Scored
   ↓ (Owner: HR)
Case Assigned to Responsible Party
   ↓ (Owner: Manager/Dept Head)      ⏱ SLA clock starts
   ├─ Action taken in time  →  Employee Verification
   └─ SLA breached  →  AUTO-ESCALATE → Senior Manager → HRBP → Executive HR
                                                            ↓
                                                  Escalation flag stays
                                                  visible permanently
   ↓ (Owner: HR, close-out)
Employee Verification (Yes / Partially / No)
   ↓
Case Closed + Effectiveness Logged
```

The visible, demoable proof point: **"days since assigned, no action taken"** — one number, per manager, on the dashboard. That number is what converts this from an "AI feedback tool" into a "management accountability system."

## Secondary USP: Evidence, not opinion
Instead of an AI deciding if a complaint is true or false, the system corroborates it against organizational evidence (meeting history, attendance, review status, prior similar complaints) and shows *why* it scored the way it did. Never say "validates" — always say "corroborates" or "provides confidence based on evidence." Consistency here matters to judges.

## Personas
- **Employee** — submits a case, answers structured follow-ups, verifies resolution.
- **Manager / Dept Head** — owns assigned cases, must act within SLA, uploads resolution proof.
- **HR** — reviews AI output, approves/modifies scoring and recommendations, assigns ownership.
- **Senior Manager / HRBP / Executive HR** — receive escalated cases when SLA breaches.

## What Makes This Defensible in Front of Judges
1. Explainable scoring (formula, not black box) → shown as a checklist, not just a percentage.
2. A live, demoable escalation (compress SLA to 60 seconds for the demo, show it fire on screen).
3. Clear separation of AI confidence vs. evidence strength — these are not the same number and the system never conflates them.
4. Honest scoping: "future roadmap" items (organizational learning engine, real HRMS integration) are named but explicitly not built, and that's presented as discipline, not a gap.

## Success Metric (what the dashboard proves)
Not "engagement score." Instead: **"Did we actually solve employee problems?"**
- % of cases verified resolved by the employee (not just marked closed by HR/manager)
- Average time-to-resolution
- Escalation rate per manager/department
- Gap between "manager says resolved" and "employee confirms resolved" — this gap is the single most compelling chart you can show a jury.