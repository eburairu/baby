from sqlalchemy.orm import Session

from app.core.exceptions import InvalidRecordTypeError, RecordNotFoundError
from app.models.feeding import Feeding
from app.models.diaper import Diaper
from app.models.growth import Growth
from app.models.note import Note

_RECORD_MODEL_MAP = {
    "feeding": Feeding,
    "diaper": Diaper,
    "growth": Growth,
    "note": Note,
}


def verify_record_ownership(
    db: Session, record_type: str, record_id: int, baby_id: int
) -> None:
    """record_id と baby_id の対応を確認する（なりすまし防止）。

    Raises:
        InvalidRecordTypeError: record_type が不正な場合
        RecordNotFoundError: 対応するレコードが見つからない場合
    """
    model = _RECORD_MODEL_MAP.get(record_type)
    if model is None:
        raise InvalidRecordTypeError(f"Invalid record_type: {record_type}")

    record = db.query(model).filter(
        model.id == record_id,
        model.baby_id == baby_id,
    ).first()

    if not record:
        raise RecordNotFoundError(
            f"{record_type} record {record_id} not found for baby {baby_id}"
        )
