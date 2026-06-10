"""Profile and target-calculation models (shared by the /targets router and tests)."""

from typing import Literal

from pydantic import BaseModel, Field

Gender = Literal["male", "female"]
ActivityLevel = Literal["sedentary", "light", "moderate", "active", "very_active"]
Goal = Literal["lose_weight", "gain_weight", "eat_healthier", "high_protein"]
Strictness = Literal["relaxed", "balanced", "strict"]


class TargetRequest(BaseModel):
    """Inputs needed to compute daily macro targets."""

    gender: Gender
    age: int = Field(ge=13, le=100)
    height_cm: float = Field(gt=0)
    current_weight_kg: float = Field(gt=0)
    activity_level: ActivityLevel
    goal: Goal


class Targets(BaseModel):
    """Computed daily targets, plus BMR/TDEE for transparency."""

    calorie_target: int
    protein_target_g: int
    fibre_target_g: int
    bmr: int
    tdee: int


class StoredProfile(BaseModel):
    """The slice of a saved profile that /scan needs (loaded server-side by user id)."""

    goal: Goal
    strictness: Strictness = "balanced"
    dietary_prefs: list[str] = []
    allergies: list[str] = []
    calorie_target: int
    protein_target_g: int
    fibre_target_g: int
