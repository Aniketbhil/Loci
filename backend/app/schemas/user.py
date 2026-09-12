import uuid
from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, model_validator


class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None


class ChangePassword(BaseModel):
    current_password: str
    new_password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    email: str
    created_at: datetime
    has_password: bool = False

    @model_validator(mode="before")
    @classmethod
    def set_has_password(cls, data: Any) -> Any:
        if hasattr(data, "hashed_password"):
            return {
                "id": data.id,
                "name": data.name,
                "email": data.email,
                "created_at": data.created_at,
                "has_password": data.hashed_password is not None,
            }
        if isinstance(data, dict) and "hashed_password" in data:
            data["has_password"] = data["hashed_password"] is not None
        return data
