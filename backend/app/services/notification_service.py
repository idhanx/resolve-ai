from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification


async def create_notification(
    db: AsyncSession,
    *,
    role: str,
    title: str,
    message: str,
    read: bool = False,
    target_path: str | None = None,
    employee_id: str | None = None,
) -> Notification:
    notification = Notification(
        role=role,
        title=title,
        message=message,
        read=read,
        target_path=target_path,
        employee_id=employee_id,
    )
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    return notification


async def list_notifications(db: AsyncSession, role: str | None = None) -> list[Notification]:
    stmt = select(Notification).order_by(Notification.created_at.desc())
    if role:
        stmt = stmt.where(Notification.role == role)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def mark_notifications_as_read(db: AsyncSession, role: str) -> int:
    result = await db.execute(select(Notification).where(Notification.role == role, Notification.read.is_(False)))
    notifications = result.scalars().all()
    for notification in notifications:
        notification.read = True
    await db.commit()
    return len(notifications)

