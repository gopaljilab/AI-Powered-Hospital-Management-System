from typing import Optional
from sqlalchemy.orm import Session
from app.models.audit import AuditLog

def log_audit(
    db: Session,
    action: str,
    entity: str,
    actor_id: Optional[int] = None,
    entity_id: Optional[int] = None,
    details: Optional[str] = None
) -> AuditLog:
    """
    Records an administrative or clinical audit trail entry.
    """
    audit = AuditLog(
        actor_id=actor_id,
        action=action,
        entity=entity,
        entity_id=entity_id,
        details=details
    )
    db.add(audit)
    db.commit()
    db.refresh(audit)
    return audit
