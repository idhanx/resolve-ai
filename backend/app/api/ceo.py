from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_roles
from app.models.complaint import Complaint
from app.models.department import Department
from app.models.user import User
from app.repositories.complaint_repository import list_complaints_by_department
from app.services.serializers import complaint_to_dict

router = APIRouter(prefix="/api/ceo", tags=["ceo"])


@router.get("/dashboard")
async def dashboard(current_user: User = Depends(require_roles("CEO")), db: AsyncSession = Depends(get_db)):
    total = await db.scalar(select(func.count()).select_from(Complaint))
    resolved = await db.scalar(
        select(func.count()).select_from(Complaint).where(Complaint.status.in_(["Resolved", "Verified"]))
    )
    return {
        "message": "CEO dashboard",
        "total": int(total or 0),
        "resolved": int(resolved or 0),
    }


@router.get("/submissions")
async def submissions(current_user: User = Depends(require_roles("CEO")), db: AsyncSession = Depends(get_db)):
    rows = await db.execute(select(Complaint).order_by(Complaint.created_at.desc()))
    complaints = rows.scalars().all()
    return {"items": [complaint_to_dict(item) for item in complaints]}


@router.get("/departments")
async def departments(current_user: User = Depends(require_roles("CEO")), db: AsyncSession = Depends(get_db)):
    rows = await db.execute(select(Department).order_by(Department.name.asc()))
    departments = rows.scalars().all()
    items = []
    for department in departments:
      total = await db.scalar(select(func.count()).select_from(Complaint).where(Complaint.department == department.name))
      resolved = await db.scalar(
          select(func.count()).select_from(Complaint).where(
              Complaint.department == department.name,
              Complaint.status.in_(["Resolved", "Verified"]),
          )
      )
      items.append(
          {
              "name": department.name,
              "head_role": department.head_role,
              "health_score": department.health_score,
              "description": department.description,
              "total": int(total or 0),
              "resolved": int(resolved or 0),
          }
      )
    return {"items": items}


@router.get("/analytics")
async def analytics(current_user: User = Depends(require_roles("CEO")), db: AsyncSession = Depends(get_db)):
    tech = await db.scalar(select(func.count()).select_from(Complaint).where(Complaint.department == "Technology"))
    ops = await db.scalar(select(func.count()).select_from(Complaint).where(Complaint.department == "Operations"))
    return {"message": "CEO analytics", "technology": int(tech or 0), "operations": int(ops or 0)}


@router.get("/board")
async def board(current_user: User = Depends(require_roles("CEO")), db: AsyncSession = Depends(get_db)):
    complaints = await list_complaints_by_department(db, "Technology")
    return {"message": "Board view", "items": [complaint_to_dict(item) for item in complaints[:10]]}
