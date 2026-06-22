"""Scan / recommendation models.

Two macro shapes on purpose:
- `MacroRange` (low/high) is what Claude EXTRACTS — see services/extraction.py.
- `MacroEstimate` (low/high/point) is what Python emits after deriving the midpoint.

`ExtractedDish` is Claude's output (no scoring, no targets). `ScoredDish` is the
result of the deterministic Fit Score in services/scoring.py.
"""

from typing import Literal, Optional

from pydantic import BaseModel, Field

from app.models.profile import Goal, Strictness

Verdict = Literal["great", "good_with_mods", "calorie_dense", "hard_to_track", "not_ideal"]
Confidence = Literal["high", "medium", "low"]


class MacroRange(BaseModel):
    low: int = Field(ge=0)
    high: int = Field(ge=0)


class MacroEstimate(BaseModel):
    low: int
    high: int
    point: int

    @classmethod
    def from_range(cls, r: MacroRange) -> "MacroEstimate":
        lo, hi = sorted((r.low, r.high))
        return cls(low=lo, high=hi, point=round((lo + hi) / 2))


def _zero_range() -> "MacroRange":
    return MacroRange(low=0, high=0)


class ExtractedDish(BaseModel):
    """A single dish as read off the menu by Claude. Macros are ranges.

    carbs_g / fat_g are informational (surfaced in the UI) — they default to a
    zero range so older extractions/fixtures that predate them still validate.
    """

    name: str
    description: Optional[str] = None
    ingredients: list[str] = Field(default_factory=list)
    calories: MacroRange
    protein_g: MacroRange
    fibre_g: MacroRange
    carbs_g: MacroRange = Field(default_factory=_zero_range)
    fat_g: MacroRange = Field(default_factory=_zero_range)
    confidence: Confidence = "medium"
    cook_method_flags: list[str] = Field(default_factory=list)
    candidate_modifications: list[str] = Field(default_factory=list)


class DietFlags(BaseModel):
    violates: list[str] = Field(default_factory=list)
    ok: bool = True


class ScoredDish(BaseModel):
    name: str
    description: Optional[str] = None
    ingredients: list[str] = Field(default_factory=list)
    calories: MacroEstimate
    protein_g: MacroEstimate
    fibre_g: MacroEstimate
    carbs_g: MacroEstimate
    fat_g: MacroEstimate
    fit_score: float
    verdict: Verdict
    why: str
    modifications: list[str] = Field(default_factory=list)
    diet_flags: DietFlags = Field(default_factory=DietFlags)


class Remaining(BaseModel):
    """How much of today's budget is left when the user scans."""

    calories_remaining: int
    protein_remaining_g: int
    fibre_remaining_g: int


class ScoringProfile(BaseModel):
    goal: Goal
    strictness: Strictness = "balanced"
    dietary_prefs: list[str] = Field(default_factory=list)
    allergies: list[str] = Field(default_factory=list)


class ScanResult(BaseModel):
    """Pure output of scoring — the router wraps this with scan_id + targets_snapshot."""

    best_match: Optional[ScoredDish] = None
    good_options: list[ScoredDish] = Field(default_factory=list)
    avoid: list[ScoredDish] = Field(default_factory=list)
    dishes: list[ScoredDish] = Field(default_factory=list)


# --------------------------------------------------------------------------
# /scan request + response wrappers
# --------------------------------------------------------------------------

Source = Literal["photo", "upload", "text"]


class Consumed(BaseModel):
    """What the user has already eaten today (from the Today tab)."""

    calories: int = 0
    protein_g: int = 0
    fibre_g: int = 0
    carbs_g: int = 0
    fat_g: int = 0


class ScanRequest(BaseModel):
    source: Source
    restaurant_name: Optional[str] = None
    image_base64: Optional[str] = None  # for source = photo | upload
    menu_text: Optional[str] = None     # for source = text (pasted menu / typed name)
    consumed: Consumed = Field(default_factory=Consumed)


class TargetsSnapshot(BaseModel):
    calorie_target: int
    protein_target_g: int
    fibre_target_g: int
    carbs_target_g: int = 0
    fat_target_g: int = 0
    calories_remaining: int
    protein_remaining_g: int
    fibre_remaining_g: int
    carbs_remaining_g: int = 0
    fat_remaining_g: int = 0


class ScanResponse(BaseModel):
    scan_id: str
    restaurant_name: Optional[str] = None
    targets_snapshot: TargetsSnapshot
    best_match: Optional[ScoredDish] = None
    good_options: list[ScoredDish] = Field(default_factory=list)
    avoid: list[ScoredDish] = Field(default_factory=list)
    dishes: list[ScoredDish] = Field(default_factory=list)
