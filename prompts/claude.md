# CLAUDE.md

# Echo - Enterprise AI Powered Employee Grievance Intelligence Platform

## Project Overview

Echo is an enterprise AI-powered employee grievance intelligence platform that helps organizations identify, analyze, prioritize, and resolve employee grievances through AI-driven decision support.

This project is built for a hackathon, but the architecture should follow production-grade software engineering principles.

The backend must be stable, modular, scalable, fault tolerant, and easy to maintain.

---

# Current Status

## Completed

- React frontend
- FastAPI backend
- PostgreSQL
- SQLAlchemy
- Repository Pattern
- DistilBERT Complaint Intelligence
- DistilBERT deployed on JarvisLabs
- Backend communicates with DistilBERT using HTTP API
- Complaint category prediction works

Example

Complaint

↓

DistilBERT

↓

Category

↓

Confidence

This module is COMPLETE.

Do not modify it unless there is a serious issue.

---

# Current Problems

The backend is incomplete.

Some services are placeholders.

Some APIs are incomplete.

Dashboard currently displays fake/demo data.

Business logic is incomplete.

Three AI engines are missing.

Alert workflow is missing.

Knowledge reuse is missing.

The backend must be completed first.

Frontend redesign will happen later.

Ignore frontend until backend is finished.

---

# Primary Objective

Build a production-ready backend.

Everything must work end-to-end.

Nothing should rely on fake/demo data.

All dashboard data should come from PostgreSQL.

---

# Overall Workflow

Employee submits complaint

↓

Store Complaint

↓

DistilBERT Complaint Intelligence

↓

Knowledge Base Search

↓

Evidence Intelligence Engine

↓

Business Impact Engine

↓

Corrective Action Engine

↓

Alert Engine

↓

Notification Engine

↓

Store AI Analysis

↓

Dashboard APIs

↓

Frontend

---

# Requirement 1

## Backend Architecture Review

Analyze the complete backend.

Review

- folder structure
- modules
- services
- repositories
- schemas
- models
- APIs
- dependency flow

Find

- duplicate code
- dead code
- unused modules
- architecture issues
- circular dependencies
- technical debt
- missing implementations
- fake implementations

Do not rewrite everything.

Fix one issue at a time.

---

# Requirement 2

## Database Review

Analyze PostgreSQL schema.

Verify

- normalization
- foreign keys
- indexes
- relationships
- constraints
- transactions

Check if the following tables exist.

If missing, design them.

- complaints
- complaint_history
- ai_analysis
- notifications
- alerts
- audit_logs
- escalations
- resolutions
- knowledge_base
- business_impact
- evidence_analysis

Database should support future scalability.

---

# Requirement 3

## Remove Fake Data

Dashboard currently contains fake data.

Remove every fake implementation.

Every dashboard API should return real PostgreSQL data.

Examples

- complaints by department
- complaints by category
- pending complaints
- resolved complaints
- critical complaints
- average resolution time
- business impact
- financial loss
- notification statistics
- evidence distribution

---

# Requirement 4

## Knowledge Base Engine

Before processing every complaint,

search previously resolved complaints.

Use semantic similarity instead of keyword search.

If a similar complaint exists,

return

- previous resolution
- previous corrective action
- outcome
- lessons learned
- recommendation

If no similar complaint exists,

continue the AI pipeline.

Every resolved complaint should automatically become part of the knowledge base.

The system should continuously learn from organizational history without retraining DistilBERT.

---

# Requirement 5

## Evidence Intelligence Engine

Do NOT use the synthetic XGBoost model.

Instead create an explainable enterprise decision engine.

Purpose

Determine whether the complaint appears genuine.

Inputs

- complaint category
- department
- attendance
- previous complaints
- one-on-one frequency
- manager response time
- uploaded documents
- email evidence
- chat evidence
- calendar evidence
- ERP consistency
- training completion
- employee tenure

Outputs

- evidence score
- evidence label
- confidence
- reasons

The engine must explain WHY every score is assigned.

---

# Requirement 6

## Business Impact Engine

Purpose

Estimate realistic business consequences.

Do NOT generate random values.

Outputs

- financial impact
- productivity loss
- employee attrition risk
- customer impact
- compliance risk
- reputation risk
- operational risk
- business priority

Most important

Explain what happens if management ignores the complaint.

Example

Leadership Issue

↓

Employee dissatisfaction

↓

High attrition

↓

Knowledge loss

↓

Hiring cost

↓

Project delay

↓

Customer dissatisfaction

↓

Revenue loss

↓

Brand reputation damage

↓

Business risk

Every business impact should include reasoning.

---

# Requirement 7

## Corrective Action Engine

The AI must NEVER make HR decisions.

The AI only recommends.

Possible recommendations

- No Action
- Manager Discussion
- One-on-One Meeting
- Coaching
- Conflict Resolution
- Training
- Policy Reminder
- Corrective Action Plan
- Performance Improvement Plan
- HR Investigation
- Compliance Review
- Legal Review

Every recommendation must explain WHY.

---

# Requirement 8

## Alert Engine

This is NOT AI.

This is a configurable workflow engine.

Examples

Critical Priority

Notify

- CEO
- COO
- CTO
- CHRO
- HR Head
- Department Head

Financial Loss High

Notify

- CFO

Compliance Risk High

Notify

- Legal Team

Attrition Risk High

Notify

- HR Director

Infrastructure Failure

Notify

- Operations Head

Every alert should include

- reason
- urgency
- estimated impact
- recommended action

---

# Requirement 9

## Notification Engine

Responsible for

- email notifications
- dashboard notifications
- escalation queue
- notification history
- audit logs

Notifications should be role-based.

---

# Requirement 10

## AI Pipeline

Only ONE service should orchestrate all engines.

Pipeline

Complaint

↓

DistilBERT

↓

Knowledge Base

↓

Evidence Engine

↓

Business Impact Engine

↓

Corrective Action Engine

↓

Alert Engine

↓

Notification Engine

↓

Database

↓

Dashboard

No API route should call engines directly.

Everything must go through AI Pipeline.

---

# Requirement 11

## Dashboard APIs

Frontend should never contain business logic.

Dashboard should consume backend APIs.

Backend APIs should provide

- complaint statistics
- department statistics
- evidence distribution
- business impact distribution
- financial impact
- attrition statistics
- critical alerts
- notifications
- pending investigations
- resolution statistics

---

# Requirement 12

## Code Optimization

Review the complete backend.

Find

- duplicate code
- dead code
- slow queries
- blocking calls
- async issues
- poor exception handling
- missing logging
- missing validation
- security issues
- large functions
- hardcoded values
- poor architecture

Refactor only where necessary.

---

# Requirement 13

## Hackathon Stability

The backend must NEVER fail during demo.

Implement

- global exception handling
- graceful error responses
- retry logic
- timeout handling
- database rollback
- health checks
- startup validation
- model availability checks
- JarvisLabs connectivity checks
- structured logging
- fail-safe defaults

The backend should continue functioning even if one component temporarily fails.

---

# Requirement 14

## Implementation Strategy

Never rewrite the project.

Fix one issue at a time.

For every issue

1. Explain the problem.

2. Explain why it is a problem.

3. Explain the best architecture.

4. Modify only the required files.

5. Wait for confirmation.

Then continue.

---

# Coding Standards

Follow

- SOLID Principles
- Clean Architecture
- Repository Pattern
- Service Layer
- Dependency Injection where appropriate
- Single Responsibility Principle
- Meaningful naming
- Type hints
- Modular design
- Reusable components
- Proper logging
- Proper exception handling

Avoid

- duplicate logic
- hardcoded values
- large controllers
- large service methods
- tightly coupled modules

---

# Final Deliverables

The completed backend should contain

- DistilBERT Integration
- Knowledge Base Engine
- Evidence Intelligence Engine
- Business Impact Engine
- Corrective Action Engine
- Alert Engine
- Notification Engine
- AI Pipeline
- PostgreSQL Integration
- Dashboard APIs
- Audit Logs
- Escalation Workflow
- Enterprise Architecture
- Production Ready Code
- Stable Hackathon Demo

The objective is to build a reliable enterprise backend that can be demonstrated confidently during the hackathon and can be extended into a production system after the event.
