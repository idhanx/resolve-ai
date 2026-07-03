from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.utils.security import hash_password


DEFAULT_USERS = [
    {
        "employee_id": "EMP-2026-CH",
        "username": "sarah.chen",
        "email": "sarah.chen@echo.ai",
        "name": "Sarah Chen",
        "role": "Employee",
        "department": "Technology",
        "reporting_manager_name": "Sophia Rodriguez",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        "password": "Resolve@Employee1",
    },
    {
        "employee_id": "MGR-2026-RO",
        "username": "sophia.rodriguez",
        "email": "sophia.rodriguez@echo.ai",
        "name": "Sophia Rodriguez",
        "role": "Manager",
        "department": "Technology",
        "reporting_manager_name": "Dr. Aris Thorne",
        "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        "password": "Resolve@Manager1",
    },
    {
        "employee_id": "EXEC-2026-TH",
        "username": "aris.thorne",
        "email": "aris.thorne@echo.ai",
        "name": "Dr. Aris Thorne",
        "role": "CTO",
        "department": "Technology",
        "reporting_manager_name": "Victoria Vance",
        "avatar_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
        "password": "Resolve@CTO2026",
    },
    {
        "employee_id": "EXEC-2026-ST",
        "username": "marcus.sterling",
        "email": "marcus.sterling@echo.ai",
        "name": "Marcus Sterling",
        "role": "COO",
        "department": "Operations",
        "reporting_manager_name": "Victoria Vance",
        "avatar_url": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150",
        "password": "Resolve@COO2026",
    },
    {
        "employee_id": "EXEC-2026-VA",
        "username": "victoria.vance",
        "email": "victoria.vance@echo.ai",
        "name": "Victoria Vance",
        "role": "CEO",
        "department": "Enterprise",
        "reporting_manager_name": None,
        "avatar_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150",
        "password": "Resolve@CEO2026",
    },
]


async def seed_default_users(db: AsyncSession) -> None:
    for entry in DEFAULT_USERS:
        existing = (
            await db.execute(
                select(User).where(
                    (User.employee_id == entry["employee_id"]) | (User.username == entry["username"]) | (User.email == entry["email"])
                )
            )
        ).scalar_one_or_none()
        if existing:
            continue

        db.add(
            User(
                employee_id=entry["employee_id"],
                username=entry["username"],
                email=entry["email"],
                name=entry["name"],
                role=entry["role"],
                department=entry["department"],
                reporting_manager_name=entry["reporting_manager_name"],
                avatar_url=entry["avatar_url"],
                hashed_password=hash_password(entry["password"]),
                is_active=True,
            )
        )

    await db.commit()

