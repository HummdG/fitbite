"""Pure daily-target calculation (Mifflin-St Jeor -> goal-adjusted). No I/O."""

import math

from app.models.profile import Targets, TargetRequest

_ACTIVITY_FACTOR = {
    "sedentary": 1.2,
    "light": 1.375,
    "moderate": 1.55,
    "active": 1.725,
    "very_active": 1.9,
}
_CALORIE_GOAL_FACTOR = {
    "lose_weight": 0.80,
    "gain_weight": 1.10,
    "eat_healthier": 1.0,
    "high_protein": 1.0,
}
_PROTEIN_PER_KG = {
    "lose_weight": 1.8,
    "high_protein": 1.8,
    "gain_weight": 1.6,
    "eat_healthier": 1.4,
}
_CALORIE_FLOOR = 1200
_FIBRE_MIN, _FIBRE_MAX = 20, 38
_FIBRE_PER_1000_KCAL = 14
# Fat ≈ 27% of calories (9 kcal/g). Carbs take the remaining energy budget after
# protein (4 kcal/g) and fat (9 kcal/g). Both are informational, not scored.
_FAT_CALORIE_SHARE = 0.27


def _round_half_up(x: float) -> int:
    return int(math.floor(x + 0.5))


def _round_to(x: float, step: int) -> int:
    return _round_half_up(x / step) * step


def compute_targets(req: TargetRequest) -> Targets:
    if req.gender == "male":
        bmr_raw = 10 * req.current_weight_kg + 6.25 * req.height_cm - 5 * req.age + 5
    else:
        bmr_raw = 10 * req.current_weight_kg + 6.25 * req.height_cm - 5 * req.age - 161

    bmr = _round_half_up(bmr_raw)
    tdee = _round_half_up(bmr * _ACTIVITY_FACTOR[req.activity_level])

    calorie_target = max(_round_to(tdee * _CALORIE_GOAL_FACTOR[req.goal], 10), _CALORIE_FLOOR)
    protein_target_g = _round_to(_PROTEIN_PER_KG[req.goal] * req.current_weight_kg, 5)
    fibre_raw = _round_half_up(_FIBRE_PER_1000_KCAL * calorie_target / 1000)
    fibre_target_g = max(_FIBRE_MIN, min(_FIBRE_MAX, fibre_raw))

    fat_target_g = _round_to(calorie_target * _FAT_CALORIE_SHARE / 9, 5)
    carbs_calories = calorie_target - protein_target_g * 4 - fat_target_g * 9
    carbs_target_g = max(0, _round_to(carbs_calories / 4, 5))

    return Targets(
        calorie_target=calorie_target,
        protein_target_g=protein_target_g,
        fibre_target_g=fibre_target_g,
        carbs_target_g=carbs_target_g,
        fat_target_g=fat_target_g,
        bmr=bmr,
        tdee=tdee,
    )
