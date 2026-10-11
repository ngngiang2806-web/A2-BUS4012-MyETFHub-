from datetime import date, datetime
from decimal import Decimal
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator

InvestmentGoal = Literal["capital-growth", "income-generation", "capital-preservation"]
RiskPreference = Literal["conservative", "moderate", "aggressive"]
InvestmentTimeframe = Literal["short-term", "medium-term", "long-term"]


def _normalise_text(value: str) -> str:
    return value.strip()


class ProfileCreate(BaseModel):
    email_address: EmailStr
    full_name: str = Field(min_length=1, max_length=200)
    investment_goal: InvestmentGoal
    risk_preference: RiskPreference
    investment_timeframe: InvestmentTimeframe

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, value: str) -> str:
        value = _normalise_text(value)
        if not value:
            raise ValueError("Full name is required.")
        return value


class ProfileUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=200)
    investment_goal: InvestmentGoal | None = None
    risk_preference: RiskPreference | None = None
    investment_timeframe: InvestmentTimeframe | None = None

    @field_validator("full_name")
    @classmethod
    def validate_optional_full_name(cls, value: str | None) -> str | None:
        if value is None:
            return value
        value = _normalise_text(value)
        if not value:
            raise ValueError("Full name is required.")
        return value

    @model_validator(mode="after")
    def require_at_least_one_change(self) -> "ProfileUpdate":
        if not self.model_fields_set:
            raise ValueError("Provide at least one profile field to update.")
        return self


class ProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    email_address: EmailStr
    full_name: str
    investment_goal: InvestmentGoal
    risk_preference: RiskPreference
    investment_timeframe: InvestmentTimeframe
    created_at: datetime
    updated_at: datetime


class HoldingCreate(BaseModel):
    ticker: str = Field(min_length=1, max_length=15)
    units: Decimal = Field(gt=0, max_digits=18, decimal_places=6)
    purchase_price: Decimal = Field(ge=0, max_digits=18, decimal_places=2)
    purchase_date: date

    @field_validator("ticker")
    @classmethod
    def validate_ticker(cls, value: str) -> str:
        value = value.strip().upper()
        if not value:
            raise ValueError("Ticker is required.")
        if not all(character.isalnum() or character in ".-_" for character in value):
            raise ValueError("Ticker contains unsupported characters.")
        return value


class HoldingUpdate(BaseModel):
    ticker: str | None = Field(default=None, min_length=1, max_length=15)
    units: Decimal | None = Field(default=None, gt=0, max_digits=18, decimal_places=6)
    purchase_price: Decimal | None = Field(default=None, ge=0, max_digits=18, decimal_places=2)
    purchase_date: date | None = None

    @field_validator("ticker")
    @classmethod
    def validate_optional_ticker(cls, value: str | None) -> str | None:
        if value is None:
            return value
        return HoldingCreate.validate_ticker(value)

    @model_validator(mode="after")
    def require_at_least_one_change(self) -> "HoldingUpdate":
        if not self.model_fields_set:
            raise ValueError("Provide at least one holding field to update.")
        return self


class HoldingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    holding_id: UUID
    user_id: UUID
    ticker: str
    units: Decimal
    purchase_price: Decimal
    purchase_date: date
    created_at: datetime
    updated_at: datetime


class DeleteResponse(BaseModel):
    message: str