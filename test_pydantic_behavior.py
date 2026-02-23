from pydantic import BaseModel, Field, field_validator
from typing import Optional

class BabyUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)

    @field_validator('name')
    @classmethod
    def name_not_none(cls, v):
        if v is None:
            raise ValueError("Name cannot be null")
        return v

try:
    # 省略 (OKになるべき)
    obj = BabyUpdate()
    print("Omitted: OK", obj.model_dump(exclude_unset=True))
except Exception as e:
    print(f"Omitted: Error {e}")

try:
    # Explicit None (NGになるべき)
    obj = BabyUpdate(name=None)
    print("Explicit None: OK", obj)
except Exception as e:
    print(f"Explicit None: Error {e}")

try:
    # Explicit Value (OKになるべき)
    obj = BabyUpdate(name="Valid Name")
    print("Explicit Value: OK", obj)
except Exception as e:
    print(f"Explicit Value: Error {e}")
