# ResolveAI Deployment Guide

This guide covers production deployment to popular cloud platforms.

## Prerequisites

1. **PostgreSQL database** — Neon, Supabase, Railway, AWS RDS, etc.
2. **Groq API key** — Get it at [console.groq.com](https://console.groq.com/)
3. **Domain name** (optional) — For custom URLs and HTTPS

## Quick Start with Docker Compose

### 1. Clone the repository

```bash
git clone https://github.com/your-org/resolve-ai.git
cd resolve-ai
```

### 2. Create `.env` from template

```bash
cp .env.example .env
```

Edit `.env` and set:
- `DATABASE_URL` — Your PostgreSQL connection string
- `GROQ_API_KEY` — Your Groq API key
- `VITE_API_URL` — Backend URL (leave as `http://localhost:8000` for local Docker)
- `CORS_ORIGINS` (optional) — Production frontend URLs like `https://resolveai.com`

### 3. Build and run

```bash
docker-compose up --build -d
```

Services:
- **Backend**: `http://localhost:8000`
- **Frontend**: `http://localhost:80`

### 4. Seed demo users

```bash
docker exec -it resolveai-backend python scripts/seed_auth_users.py
```

### 5. Stop services

```bash
docker-compose down
```

---

## Platform-Specific Deployments

### ☁️ Railway

Railway provides zero-config deployments from GitHub.

**Steps:**

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app)
3. Create a new project from GitHub repo
4. Add a Postgres database service
5. Configure environment variables in Railway dashboard:
   ```
   DATABASE_URL=<railway-postgres-url>
   GROQ_API_KEY=<your-key>
   GROQ_MODEL=llama-3.3-70b-versatile
   AI_SERVICE_URL=http://localhost:9000/predict
   CORS_ORIGINS=<your-frontend-domain>
   ```
6. Deploy both services:
   - **Backend**: Root directory = `backend-ai`, start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Frontend**: Root directory = `frontend`, build command: `npm run build`, start: `npx serve -s dist -l $PORT`

Railway auto-detects the Dockerfile if present.

**Frontend environment:**
Set `VITE_API_URL` to your Railway backend URL (e.g., `https://resolveai-backend.railway.app`).

---

### 🌐 Vercel (Frontend) + Render (Backend)

**Frontend on Vercel:**

1. Import GitHub repo to Vercel
2. Set root directory: `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Environment variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```

**Backend on Render:**

1. Create new Web Service
2. Root directory: `backend-ai`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 2`
5. Add Postgres database in Render
6. Environment variables:
   ```
   DATABASE_URL=<render-postgres-url>
   GROQ_API_KEY=<your-key>
   GROQ_MODEL=llama-3.3-70b-versatile
   CORS_ORIGINS=https://your-app.vercel.app
   ```

---

### 🐳 AWS (ECS + RDS)

**Setup:**

1. **RDS PostgreSQL**: Create a database in AWS RDS
2. **ECR**: Push Docker images to Elastic Container Registry
3. **ECS/Fargate**: Deploy backend and frontend as services
4. **ALB**: Use Application Load Balancer for routing
5. **Route 53**: Configure DNS

**Environment Variables:**

Set in ECS task definitions:
```
DATABASE_URL=postgresql+asyncpg://user:password@rds-endpoint:5432/resolveai
GROQ_API_KEY=<your-key>
CORS_ORIGINS=https://resolveai.example.com
```

**Frontend:**
Build with `VITE_API_URL=https://api.resolveai.example.com` then deploy to S3 + CloudFront or as a container.

---

### 🔵 Azure (Container Apps + PostgreSQL)

**Steps:**

1. Create Azure Container Registry (ACR)
2. Build and push images:
   ```bash
   az acr build --registry myregistry --image resolveai-backend:latest ./backend-ai
   az acr build --registry myregistry --image resolveai-frontend:latest ./frontend
   ```
3. Create Azure Database for PostgreSQL
4. Deploy as Container Apps:
   ```bash
   az containerapp create \
     --name resolveai-backend \
     --resource-group mygroup \
     --image myregistry.azurecr.io/resolveai-backend:latest \
     --environment myenv \
     --ingress external \
     --target-port 8000 \
     --env-vars \
       DATABASE_URL=<postgres-url> \
       GROQ_API_KEY=<key> \
       CORS_ORIGINS=https://resolveai.azurewebsites.net
   ```

5. Deploy frontend similarly

---

### 🟢 Google Cloud (Cloud Run + Cloud SQL)

**Steps:**

1. Create Cloud SQL PostgreSQL instance
2. Build and push to Container Registry:
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT_ID/resolveai-backend ./backend-ai
   gcloud builds submit --tag gcr.io/PROJECT_ID/resolveai-frontend ./frontend
   ```
3. Deploy backend to Cloud Run:
   ```bash
   gcloud run deploy resolveai-backend \
     --image gcr.io/PROJECT_ID/resolveai-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars DATABASE_URL=<cloud-sql-url>,GROQ_API_KEY=<key>,CORS_ORIGINS=<frontend-url>
   ```
4. Deploy frontend similarly

---

### 🐙 DigitalOcean App Platform

**Steps:**

1. Create App from GitHub
2. Add two components:
   - **Backend** (Dockerfile: `backend-ai/Dockerfile`)
   - **Frontend** (Dockerfile: `frontend/Dockerfile`)
3. Add DigitalOcean Managed PostgreSQL
4. Environment variables:
   ```
   DATABASE_URL=${db.DATABASE_URL}
   GROQ_API_KEY=<your-key>
   CORS_ORIGINS=https://your-app.ondigitalocean.app
   ```

---

## Post-Deployment Checklist

- [ ] **Seed demo users**: Run `python scripts/seed_auth_users.py` in backend container
- [ ] **Update passwords**: Change demo passwords or disable them in production
- [ ] **HTTPS**: Ensure SSL/TLS is enabled (most platforms do this automatically)
- [ ] **Environment variables**: Verify `DATABASE_URL`, `GROQ_API_KEY`, `VITE_API_URL`, and `CORS_ORIGINS`
- [ ] **Database backups**: Enable automated backups
- [ ] **Monitoring**: Set up logging and error tracking (Sentry, LogRocket, etc.)
- [ ] **Rate limiting**: Add API rate limiting for production
- [ ] **Policy pack**: Replace `knowledge/policy_faq.json` with your company's actual policy

---

## Scaling Considerations

### Backend

- **Horizontal scaling**: Add more Uvicorn workers (`--workers 4`)
- **Database connection pooling**: Use pgBouncer or similar
- **Caching**: Add Redis for session caching if needed
- **CDN**: Serve static assets through CloudFlare or CloudFront

### Frontend

- **CDN**: Deploy static build to Vercel, Netlify, or CloudFlare Pages
- **Code splitting**: Use dynamic imports for large route chunks
- **Image optimization**: Use next-gen formats (WebP, AVIF)

### Database

- **Indexes**: Add indexes on frequently queried columns (`category`, `status`, `department`)
- **Read replicas**: Use read replicas for analytics queries
- **Archiving**: Move resolved complaints older than 1 year to an archive table

---

## Troubleshooting

### CORS errors

**Symptom**: Browser console shows `blocked by CORS policy`

**Solution**: Add your frontend domain to `CORS_ORIGINS` env var:
```bash
CORS_ORIGINS=https://your-frontend.com,https://www.your-frontend.com
```

### Database connection fails

**Symptom**: `could not connect to server` or `SSL required`

**Solution**: Ensure `DATABASE_URL` uses `postgresql+asyncpg://` scheme and includes SSL params if required by your provider:
```
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db?ssl=require
```

### AI predictor fails

**Symptom**: Backend logs show `404 Not Found` for `AI_SERVICE_URL`

**Solution**: The DistilBERT sidecar is optional. The backend gracefully falls back to keyword-based routing. To use the ML model:
1. Deploy the classifier service separately
2. Update `AI_SERVICE_URL` to point to it

### Environment variables not loading

**Symptom**: App uses default values instead of your `.env`

**Solution**:
- Docker: Pass via `-e` flag or `docker-compose.yml`
- Cloud platforms: Set in their dashboard/CLI, not `.env` file

---

## Security Best Practices

1. **Never commit `.env`**: Add to `.gitignore`
2. **Rotate secrets**: Change `GROQ_API_KEY` and database passwords periodically
3. **Use secrets management**: AWS Secrets Manager, Azure Key Vault, GCP Secret Manager
4. **Enable HTTPS**: Use platform-provided SSL or Let's Encrypt
5. **Input validation**: Sanitize all user inputs (already implemented in schemas)
6. **Rate limiting**: Use nginx/CloudFlare rate limiting on public endpoints
7. **Database access**: Restrict database access to backend IPs only

---

## Cost Optimization

### Free Tier Options

- **Neon**: Free PostgreSQL with 10 GB storage
- **Railway**: $5/month for 512 MB RAM services
- **Vercel**: Free for hobby projects
- **Render**: Free tier for web services
- **Groq**: Free tier with rate limits

### Production Cost Estimates

**Small deployment** (~1000 users):
- Database: $25-50/month (DigitalOcean, Railway)
- Backend: $10-20/month (1 container, 512 MB)
- Frontend: $0-10/month (CDN hosting)
- **Total**: ~$35-80/month

**Medium deployment** (~10,000 users):
- Database: $100-200/month (managed PostgreSQL)
- Backend: $50-100/month (2-4 containers, 1 GB each)
- Frontend: $0-20/month (CDN with custom domain)
- **Total**: ~$150-320/month

---

## Support

- **Issues**: https://github.com/your-org/resolve-ai/issues
- **Docs**: https://github.com/your-org/resolve-ai/blob/main/README.md
- **Email**: support@resolveai.com
