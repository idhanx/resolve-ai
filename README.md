# ResolveAI

[![Deploy with Docker](https://img.shields.io/badge/deploy-docker-blue)](https://docs.docker.com/compose/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-green)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue)](https://www.typescriptlang.org/)

An AI-powered employee feedback accountability platform with a FastAPI backend, React role-based frontend, and production-ready deployment configurations.

## What Is ResolveAI

ResolveAI routes employee concerns, feedback, and suggestions to the right executives and managers, grounds AI recommendations in company policy, and turns failed resolutions into a governed relearning queue. The system features:

- **Role-based workspaces**: Employee, Manager, CTO/COO, and CEO views
- **AI-powered routing**: DistilBERT classification + Groq reasoning
- **RAG with policy grounding**: Retrieves from policy FAQ, resolved cases, and approved corrections
- **Governed relearning**: Employee verifications create review candidates for executives
- **Real authentication**: Neon-backed sessions with bcrypt password hashing
- **Production-ready**: Docker, docker-compose, and cloud platform guides

---

## 🚀 Quick Start (3 Steps)

### Option A: Docker Compose (Recommended)

**Prerequisites**: Docker and Docker Compose installed

```bash
# 1. Clone and configure
git clone https://github.com/idhanx/resolve-ai.git
cd resolve-ai
cp .env.example .env

# 2. Edit .env and set:
#    DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dbname
#    GROQ_API_KEY=your_groq_key_here
#    (Get Groq key at https://console.groq.com/)

# 3. Start everything
docker-compose up --build -d

# 4. Seed demo users
docker exec -it resolveai-backend python scripts/seed_auth_users.py

# ✅ Access the app:
#    Frontend: http://localhost:80
#    Backend:  http://localhost:8000
#    API Docs: http://localhost:8000/docs
```

**Default login credentials**: See `backend-ai/app/repositories/auth_repository.py` or [Demo Accounts](#demo-accounts)

---

### Option B: Local Development

**Prerequisites**:
- Python 3.11+
- Node.js 20+
- PostgreSQL database (Neon, Supabase, local, etc.)

#### Backend Setup

```bash
cd backend-ai

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << 'EOF'
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/dbname
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
AI_SERVICE_URL=http://localhost:9000/predict
DB_ECHO=false
EOF

# Seed demo users
python3 scripts/seed_auth_users.py

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at `http://localhost:8000`

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env (optional)
echo "VITE_API_URL=http://localhost:8000" > .env

# Start dev server
npm run dev
```

Frontend runs at `http://localhost:5173` (or next available port)

---

## 📋 Demo Accounts

After seeding, you can log in with these accounts:

| Role | Username | Password | Description |
|------|----------|----------|-------------|
| **Employee** | `sarah.chen` | `ResolveAI!Sarah2026` | Technology Senior Engineer |
| **Employee** | `priya.patel` | `ResolveAI!Priya2026` | Operations Specialist |
| **Manager** | `sophia.rodriguez` | `ResolveAI!Sophia2026` | Engineering Manager (Tech) |
| **Manager** | `emily.chen` | `ResolveAI!Emily2026` | Operations Manager (Ops) |
| **CTO** | `aris.thorne` | `ResolveAI!Aris2026` | Technology Executive |
| **COO** | `marcus.sterling` | `ResolveAI!MarcusS2026` | Operations Executive |
| **CEO** | `victoria.vance` | `ResolveAI!Victoria2026` | Enterprise Executive |

> **Security Note**: Change these passwords before production deployment.

---

## 🎯 Feature Walkthrough

### 1. Submit a Complaint (Employee View)

**As Employee** (`sarah.chen`):

1. Log in at `/login`
2. Navigate to **Dashboard** → **Submit Feedback**
3. Fill in the form:
   - **Type**: Concern
   - **Title**: "Staging database timeout blocking deployments"
   - **Description**: "The staging DB hasn't synced with production in 6 months. Every deployment fails."
4. Click **Submit**

**What happens**:
- DistilBERT classifier predicts category (or falls back to keyword matching)
- RAG retrieves policy evidence from `knowledge/policy_faq.json`, resolved cases CSV, and approved corrections
- Groq generates executive summary, business impact, and recommendations
- System routes to appropriate manager (based on department/category)
- Confidence scores are floored: Concern ≥90%, Feedback ≥80%, Suggestion ≥85%

---

### 2. Review & Assign Action Plan (CTO/COO View)

**As CTO** (`aris.thorne`):

1. Log in and go to **Feedback Queue**
2. Click **Inspect** on the new complaint
3. Review:
   - AI Category & Priority
   - Evidence Score with breakdown
   - Routing Reason
   - Intelligence Summary
4. Select an **AI Recommended Action Plan** template
5. Assign to a manager (e.g., Sophia Rodriguez)
6. Set deadline and priority
7. Click **Confirm Assignment**

**What happens**:
- Status changes to "In Progress"
- Manager receives the action plan
- Frontend syncs with backend via `PATCH /complaints/{id}/lifecycle`

---

### 3. Execute Action Plan (Manager View)

**As Manager** (`sophia.rodriguez`):

1. Log in to **Manager Dashboard**
2. View **Active Actions** queue
3. Open the assigned action
4. Mark checklist items as complete:
   - ✅ Audit staging schema differences
   - ✅ Write replication script
   - ✅ Deploy cron job
5. Upload proof (optional screenshot/doc)
6. Enter completion notes
7. Click **Mark Complete**

**What happens**:
- Status changes to "Resolved"
- Employee receives notification to verify
- Action plan progress is tracked and persisted

---

### 4. Verify Resolution (Employee View)

**As Employee** (`sarah.chen`):

1. Go to **My Submissions**
2. Open the resolved complaint
3. Review manager's completion proof
4. Rate the resolution:
   - **Improvement**: Yes / Partially / No
   - **Score**: 1-5 stars
   - **Comments**: "The staging DB is now fast, thanks!"
5. Click **Submit Verification**

**What happens**:
- If rating is `No`, `Partially`, or score < 4:
  - Status returns to "Pending Review"
  - A learning candidate is created with `status: Needs Review`
  - Routed to CTO/COO for approval
- If rating is `Yes` and score ≥ 4:
  - Status changes to "Verified"
  - Complaint is archived as successfully resolved

---

### 5. Approve/Reject Relearning (CTO/COO View)

**As CTO** (`aris.thorne`):

1. Navigate to **Plans** (AI Risk & Routing Center)
2. Review **Needs Review** queue
3. For each learning candidate:
   - See original category vs. employee feedback
   - Read employee comments
   - Decide: **Approve** or **Reject**

**Approve**:
- The correction becomes a retrievable source (type: `approved_correction`)
- Future similar complaints will cite this approved correction
- RAG gives it higher trust score than resolved cases

**Reject**:
- The correction is marked as rejected but remains auditable
- It won't be used in future retrieval

---

### 6. Escalation Alerts (CEO View)

**As CEO** (`victoria.vance`):

1. Log in to **CEO Dashboard**
2. View **Escalation Alerts** section
3. See repeated unresolved issues grouped by category
4. Each alert shows:
   - Risk score (82-90%)
   - Issue count
   - Department
   - Productivity loss & reputation risk
   - Recommended executive action

**What triggers alerts**:
- 2+ complaints in the same category with "Pending Review" or "In Progress" status
- System calculates risk score based on count and average confidence

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │ Employee │ Manager  │ CTO/COO  │   CEO    │  Login   │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
│              ↕ Axios (auth + complaint APIs)                 │
└─────────────────────────────────────────────────────────────┘
                              ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                     Backend (FastAPI)                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Routes: /auth, /complaints, /learning, /alerts      │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ AI Pipeline:                                          │   │
│  │  1. DistilBERT Classifier (optional, falls back)     │   │
│  │  2. RAG Service (policy + cases + corrections)       │   │
│  │  3. Groq Reasoning Engine (llama-3.3-70b)           │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Repositories: complaint, auth, learning, alert       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↕ SQLAlchemy (asyncpg)
┌─────────────────────────────────────────────────────────────┐
│           PostgreSQL (Neon, Supabase, RDS, etc.)            │
│   Tables: users, sessions, complaints, learning_candidates  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Repository Structure

```
resolve-ai/
├── backend-ai/
│   ├── app/
│   │   ├── ai/
│   │   │   ├── complaint_intelligence/   # DistilBERT client
│   │   │   ├── pipeline/                  # Groq reasoning
│   │   │   └── rag_service.py             # Hybrid retrieval
│   │   ├── api/routes/                    # FastAPI endpoints
│   │   ├── core/                          # Config, database, security
│   │   ├── models/                        # SQLAlchemy ORM
│   │   ├── repositories/                  # Data access layer
│   │   └── schemas/                       # Pydantic models
│   ├── knowledge/
│   │   └── policy_faq.json                # Structured policy source
│   ├── scripts/
│   │   ├── seed_auth_users.py             # Demo account seeder
│   │   └── generate_policy_pdf.py         # Policy doc generator
│   ├── Dockerfile                         # Production container
│   ├── requirements.txt                   # Python dependencies
│   └── .env.example                       # Environment template
├── frontend/
│   ├── src/
│   │   ├── api/                           # Axios clients
│   │   ├── components/                    # Reusable UI components
│   │   ├── pages/                         # Role-based modules
│   │   │   ├── EmployeeModule.tsx
│   │   │   ├── ManagerModule.tsx
│   │   │   ├── DepartmentHeadModule.tsx
│   │   │   └── CEOModule.tsx
│   │   └── ResolveContext.tsx             # Global state + backend sync
│   ├── Dockerfile                         # Multi-stage: build + nginx
│   ├── nginx.conf                         # SPA routing, gzip, caching
│   └── package.json
├── docker-compose.yml                     # Single-command deployment
├── synthetic_rag_data.csv                 # Resolved case examples
├── DEPLOYMENT.md                          # Cloud platform guides
└── README.md                              # This file
```

---

## 🔌 API Endpoints

All routes (except `/auth/login`) require `Authorization: Bearer <token>` header.

### Authentication

```http
POST /auth/login
Body: {"username": "sarah.chen", "password": "ResolveAI!Sarah2026"}
Response: {"access_token": "...", "user": {...}}

GET /auth/me
Response: {"id": 1, "username": "...", "role": "Employee", ...}

POST /auth/logout
Response: {"detail": "Logged out successfully."}
```

### Complaints

```http
POST /complaints/
Body: {
  "employee_name": "Sarah Chen",
  "employee_email": "sarah.chen@resolveai.local",
  "department": "Technology",
  "designation": "Senior Engineer",
  "manager": "Sophia Rodriguez",
  "title": "Database timeout issue",
  "description": "Staging DB blocks deployments...",
  "submission_type": "Concern"
}
Response: ComplaintResponse with AI analysis

GET /complaints/
Response: [ComplaintResponse, ...]

GET /complaints/{id}
Response: ComplaintResponse

PATCH /complaints/{id}/lifecycle
Body: {
  "status": "In Progress",
  "manager": "Sophia Rodriguez",
  "assigned_manager_id": "mgr-1",
  "priority": "High",
  "action_plan": {...},
  "verification": {...}
}
Response: Updated ComplaintResponse
```

### Learning Candidates

```http
POST /learning/candidates
Body: {
  "complaint_id": 1,
  "complaint_title": "...",
  "original_category": "Developer Experience",
  "verification_rating": "Partially",
  "verification_score": 3,
  "employee_comments": "Needs more work"
}
Response: LearningCandidateResponse

GET /learning/candidates?status=Needs Review
Response: [LearningCandidateResponse, ...]

PATCH /learning/candidates/{id}/decision
Body: {
  "action": "approve",
  "reviewer_notes": "Good correction",
  "corrected_category": "Infrastructure",
  ...
}
Response: Updated LearningCandidateResponse
```

### Alerts

```http
GET /alerts/escalations
Response: [
  {
    "id": "technology-developer-experience",
    "department": "Technology",
    "category": "Developer Experience & Infrastructure",
    "issue_count": 3,
    "risk_score": 88,
    "severity": "High",
    "notify": ["CTO", "CEO"],
    ...
  }
]
```

### Health Check

```http
GET /health
Response: {"status": "healthy"}

GET /
Response: {"status": "running", "service": "ResolveAI Backend", "version": "1.0.0"}
```

**Interactive docs**: `http://localhost:8000/docs` (Swagger UI)

---

## 🧪 Testing

### Backend Tests

```bash
cd backend-ai

# Test RAG retrieval
python3 testing/test_rag.py

# Test Groq reasoning (requires GROQ_API_KEY)
python3 testing/test_groq.py

# Test predictor (requires AI_SERVICE_URL)
python3 testing/test_predictor.py

# Test all
python3 -m pytest testing/ -v
```

### Frontend Tests

```bash
cd frontend

# Lint
npm run lint

# Type check
npm run build

# Preview production build
npm run preview
```

---

## 🔐 Security Features

✅ **Password hashing**: bcrypt with per-user salts  
✅ **Session tokens**: SHA-256 hashed, stored in PostgreSQL  
✅ **Token expiry**: 7-day session lifetime, auto-refresh on activity  
✅ **CORS**: Configurable allowed origins via `CORS_ORIGINS` env var  
✅ **Input validation**: Pydantic schemas on all endpoints  
✅ **SQL injection protection**: SQLAlchemy parameterized queries  
✅ **XSS protection**: React's built-in escaping + CSP headers in nginx  

**Production checklist**:
- Change demo passwords or disable seed accounts
- Set `CORS_ORIGINS` to your production domain
- Enable HTTPS (handled by platforms like Vercel, Railway, etc.)
- Add rate limiting (nginx, CloudFlare, Kong)
- Rotate `GROQ_API_KEY` periodically
- Enable database backups
- Set up error monitoring (Sentry, LogRocket)

---

## 🚢 Deployment

### Quick Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

1. Connect GitHub repo
2. Add PostgreSQL database
3. Set environment variables:
   - `DATABASE_URL` (auto-populated from database)
   - `GROQ_API_KEY`
   - `CORS_ORIGINS` (e.g., `https://resolveai.railway.app`)
4. Deploy backend (root: `backend-ai`)
5. Deploy frontend (root: `frontend`, build arg: `VITE_API_URL=https://your-backend.railway.app`)

### Deploy to Vercel + Render

**Frontend (Vercel)**:
```bash
vercel --prod
# Set VITE_API_URL to your Render backend URL
```

**Backend (Render)**:
- Create Web Service from GitHub
- Root: `backend-ai`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Add PostgreSQL database
- Set env vars: `DATABASE_URL`, `GROQ_API_KEY`, `CORS_ORIGINS`

### Other Platforms

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for step-by-step guides:
- AWS (ECS + RDS)
- Azure (Container Apps)
- Google Cloud (Cloud Run)
- DigitalOcean App Platform
- Docker Compose on any VPS

---

## 🔧 Configuration

### Backend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ Yes | - | PostgreSQL connection string (async format) |
| `GROQ_API_KEY` | ✅ Yes | - | Groq API key from console.groq.com |
| `GROQ_MODEL` | No | `llama-3.3-70b-versatile` | Groq model to use |
| `AI_SERVICE_URL` | No | `http://localhost:9000/predict` | DistilBERT classifier endpoint (optional) |
| `CORS_ORIGINS` | No | localhost ports | Comma-separated allowed origins |
| `DB_ECHO` | No | `false` | Log SQL queries (use for debugging only) |

### Frontend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No | `http://localhost:8000` | Backend API base URL |

**Build-time injection**: For Docker deployments, `VITE_API_URL` is injected as a build arg in the Dockerfile.

---

## 📊 RAG Knowledge Sources

The AI retrieves from 3 sources (in priority order):

### 1. Approved Corrections (Highest Trust)
- Source: `learning_candidates` table with `status = 'Approved'`
- Created when: Executive approves a failed employee verification
- Trust score: +2.0

### 2. Structured Policy FAQ (High Trust)
- Source: `backend-ai/knowledge/policy_faq.json`
- 11 policy entries covering career growth, compensation, infrastructure, etc.
- Trust score: +1.5

### 3. Resolved Cases (Medium Trust)
- Source: `synthetic_rag_data.csv`
- 156 historical resolved complaints
- Trust score: +0.5

**How retrieval works**:
1. Tokenize complaint text (remove stopwords)
2. Match keywords and phrases
3. Boost score for category/department match
4. Sort by trust score + lexical overlap
5. Return top 6 matches

**To use your own policy**:
- Replace `backend-ai/knowledge/policy_faq.json` with your company policy
- Run `python3 scripts/generate_policy_pdf.py` to create human-readable version

---

## 🎨 Customization

### Add a New Role

1. **Backend**: Update `User.role` enum in `app/models/auth.py`
2. **Frontend**: Add to `UserRole` type in `ResolveContext.tsx`
3. **Create route**: Add `<Route path="/newrole/*" element={<NewRoleModule />} />` in `App.tsx`
4. **Add auth guard**: Wrap with `<RequireAuth allowedRoles={['NewRole']}>`
5. **Seed users**: Add to `DEMO_USER_SEEDS` in `auth_repository.py`

### Add a New Complaint Field

1. **Backend**:
   - Add column to `Complaint` model
   - Add field to `ComplaintCreate` and `ComplaintResponse` schemas
   - Update `create_complaint` route to handle new field
2. **Frontend**:
   - Add to `Submission` interface in `ResolveContext.tsx`
   - Update submission form UI
   - Map in `mapComplaintToSubmission` function

### Change AI Models

**Replace DistilBERT**:
- Update `AI_SERVICE_URL` to your classifier endpoint
- Modify `complaint_intelligence/client.py` request format if needed

**Replace Groq**:
- Change `GROQ_MODEL` env var (e.g., `mixtral-8x7b-32768`)
- Or replace `reasoning_engine.py` with OpenAI/Anthropic client

---

## 🐛 Troubleshooting

### "Unable to reach the auth server"

**Cause**: Backend not running or wrong `VITE_API_URL`

**Fix**:
```bash
# Check backend is running
curl http://localhost:8000/health

# Check frontend env
cat frontend/.env
# Should show: VITE_API_URL=http://localhost:8000
```

### "Session expired or invalid"

**Cause**: Token expired or database session was revoked

**Fix**: Log out and log back in. Sessions expire after 7 days of inactivity.

### "CORS policy blocked"

**Cause**: Frontend domain not in `CORS_ORIGINS`

**Fix**:
```bash
# Add your frontend domain to backend env
export CORS_ORIGINS=https://resolveai.vercel.app,https://www.resolveai.com
# Restart backend
```

### Predictor returns 404

**Cause**: `AI_SERVICE_URL` points to a dead endpoint

**Fix**: The backend gracefully falls back to keyword-based routing. To use ML classification:
1. Deploy a DistilBERT model service
2. Update `AI_SERVICE_URL` to point to it

### Database connection fails

**Cause**: Wrong `DATABASE_URL` or missing SSL params

**Fix**:
```bash
# Ensure URL uses asyncpg scheme
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db?ssl=require

# For Neon, SSL is required:
?ssl=require or ?sslmode=require
```

### Manager assignment not persisting

**Cause**: Fixed in this version (infinite loop in CRUD sync)

**Verify**:
1. Assign action plan as CTO
2. Refresh page
3. Check manager's dashboard — action should appear

---

## 📈 Performance Tips

### Backend

- **Use connection pooling**: Add PgBouncer for high-traffic deployments
- **Scale workers**: `uvicorn app.main:app --workers 4`
- **Cache policies**: Load `policy_faq.json` once at startup (already implemented)
- **Index database**: Add indexes on `status`, `category`, `department` columns

### Frontend

- **Code splitting**: Use React lazy loading for route components
- **Image optimization**: Convert to WebP/AVIF
- **CDN**: Deploy static build to Vercel, Netlify, or CloudFlare Pages
- **Bundle analysis**: Run `npm run build --analyze`

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

**Contribution areas**:
- Additional language support (i18n)
- More RAG sources (Confluence, Notion, SharePoint)
- Enhanced analytics dashboards
- Mobile app (React Native)
- Slack/Teams bot integration

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- **FastAPI** for the backend framework
- **React** + **TailwindCSS** for the UI
- **Groq** for blazing-fast LLM inference
- **Neon** for serverless PostgreSQL
- **Recharts** for beautiful data visualization

---

## 📞 Support

- **Issues**: https://github.com/idhanx/resolve-ai/issues
- **Documentation**: This README + [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Email**: support@resolveai.com

---

## 🗺️ Roadmap

- [ ] Multi-tenant support (org-level isolation)
- [ ] Slack/Teams integration for notifications
- [ ] Advanced analytics (trend detection, sentiment analysis)
- [ ] Mobile app
- [ ] SSO integration (Okta, Azure AD, Google Workspace)
- [ ] Audit trail export (compliance reports)
- [ ] Custom policy upload via UI
- [ ] Real-time dashboard with WebSockets

---

**Built with ❤️ for better workplace accountability**
