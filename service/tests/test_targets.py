"""TDD for the pure Mifflin-St Jeor target calculator.

Expected values are hand-computed:
  BMR (male)   = 10*kg + 6.25*cm - 5*age + 5
  BMR (female) = 10*kg + 6.25*cm - 5*age - 161
  TDEE         = round(BMR * activity_factor)
  calories     = round_to_10(TDEE * goal_factor), floored at 1200
  protein      = round_to_5(per_kg[goal] * weight)
  fibre        = clamp(round(14 * calories / 1000), 20, 38)
All rounding is half-up.
"""

import pytest

from app.models.profile import TargetRequest
from app.services.targets import compute_targets

CASES = [
    # male, moderate(1.55), lose_weight(0.80) — no clamps triggered
    (
        dict(gender="male", age=30, height_cm=180, current_weight_kg=80,
             activity_level="moderate", goal="lose_weight"),
        dict(bmr=1780, tdee=2759, calorie_target=2210, protein_target_g=145, fibre_target_g=31),
    ),
    # female, light(1.375), high_protein(1.0)
    (
        dict(gender="female", age=28, height_cm=165, current_weight_kg=60,
             activity_level="light", goal="high_protein"),
        dict(bmr=1330, tdee=1829, calorie_target=1830, protein_target_g=110, fibre_target_g=26),
    ),
    # female, sedentary(1.2), lose_weight — hits calorie FLOOR (1200) and fibre LOWER clamp (20)
    (
        dict(gender="female", age=70, height_cm=150, current_weight_kg=45,
             activity_level="sedentary", goal="lose_weight"),
        dict(bmr=877, tdee=1052, calorie_target=1200, protein_target_g=80, fibre_target_g=20),
    ),
    # male, active(1.725), gain_weight(1.10) — hits fibre UPPER clamp (38)
    (
        dict(gender="male", age=25, height_cm=175, current_weight_kg=70,
             activity_level="active", goal="gain_weight"),
        dict(bmr=1674, tdee=2888, calorie_target=3180, protein_target_g=110, fibre_target_g=38),
    ),
    # male, very_active(1.9), eat_healthier(1.0)
    (
        dict(gender="male", age=35, height_cm=178, current_weight_kg=82,
             activity_level="very_active", goal="eat_healthier"),
        dict(bmr=1763, tdee=3350, calorie_target=3350, protein_target_g=115, fibre_target_g=38),
    ),
]


@pytest.mark.parametrize("req, expected", CASES)
def test_compute_targets(req, expected):
    t = compute_targets(TargetRequest(**req))
    assert t.bmr == expected["bmr"]
    assert t.tdee == expected["tdee"]
    assert t.calorie_target == expected["calorie_target"]
    assert t.protein_target_g == expected["protein_target_g"]
    assert t.fibre_target_g == expected["fibre_target_g"]


def test_calorie_target_never_below_floor():
    # tiny sedentary person on a deficit must still be clamped up to 1200
    t = compute_targets(TargetRequest(
        gender="female", age=65, height_cm=148, current_weight_kg=42,
        activity_level="sedentary", goal="lose_weight"))
    assert t.calorie_target >= 1200
