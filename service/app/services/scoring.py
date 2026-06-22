"""Pure, deterministic Fit Score + verdict + ranking. No I/O, no Claude.

Fit Score (per the spec):
    fit = 0.35*cal + 0.30*protein + 0.15*fibre + 0.10*goal + 0.10*mods

A diet/allergy violation is a HARD FILTER: it forces verdict=not_ideal, drops the
dish to the `avoid` bucket, and excludes it from best_match regardless of score.
"""

import re

from app.models.profile import Targets
from app.models.scan import (
    DietFlags,
    ExtractedDish,
    MacroEstimate,
    Remaining,
    ScanResult,
    ScoredDish,
    ScoringProfile,
)

# ---------------------------------------------------------------------------
# Diet / allergy hard filter
# ---------------------------------------------------------------------------

_MEAT = {
    "chicken", "beef", "pork", "lamb", "bacon", "ham", "gammon", "turkey", "duck",
    "sausage", "steak", "mince", "veal", "prosciutto", "salami", "pepperoni", "chorizo",
}
_SEAFOOD = {
    "fish", "salmon", "tuna", "cod", "prawn", "prawns", "shrimp", "crab", "lobster",
    "squid", "calamari", "anchovy", "scallop", "scallops", "mussel", "mussels", "oyster",
}
_DAIRY = {"cheese", "milk", "butter", "cream", "yogurt", "yoghurt", "paneer", "ghee"}
_EGG = {"egg", "eggs", "mayonnaise", "mayo"}
_PORK = {"pork", "bacon", "ham", "gammon", "prosciutto", "salami", "pepperoni", "chorizo"}
_GLUTEN = {
    "bread", "wheat", "pasta", "flour", "breaded", "batter", "bun", "noodle", "noodles",
    "crouton", "croutons", "tortilla", "pita", "naan", "pastry", "dough",
}
_ALCOHOL = {"wine", "beer", "rum", "vodka", "whisky", "whiskey", "brandy", "liqueur"}

_DIET_RULES: dict[str, set[str]] = {
    "vegetarian": _MEAT | _SEAFOOD,
    "vegan": _MEAT | _SEAFOOD | _DAIRY | _EGG | {"honey"},
    "pescatarian": _MEAT,  # seafood allowed
    "no_pork": _PORK,
    "halal": _PORK | _ALCOHOL,
    "dairy_free": _DAIRY,
    "gluten_free": _GLUTEN,
}


def _dish_text(dish: ExtractedDish) -> str:
    parts = [dish.name, dish.description or "", " ".join(dish.ingredients)]
    return " ".join(parts).lower()


def _contains_word(text: str, token: str) -> bool:
    return re.search(rf"\b{re.escape(token)}\b", text) is not None


def _contains_prefix(text: str, token: str) -> bool:
    # prefix match so "peanut" also catches "peanuts"
    return re.search(rf"\b{re.escape(token)}", text) is not None


def _diet_flags(dish: ExtractedDish, profile: ScoringProfile) -> DietFlags:
    text = _dish_text(dish)
    violates: list[str] = []
    for pref in profile.dietary_prefs:
        forbidden = _DIET_RULES.get(pref, set())
        if any(_contains_word(text, tok) for tok in forbidden):
            violates.append(pref)
    for allergen in profile.allergies:
        a = allergen.strip().lower()
        if a and _contains_prefix(text, a):
            violates.append(allergen)
    return DietFlags(violates=violates, ok=len(violates) == 0)


# ---------------------------------------------------------------------------
# Sub-scores (each 0..1)
# ---------------------------------------------------------------------------

def _clamp(x: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, x))

_IDEAL_HI_FACTOR = {"relaxed": 0.55, "balanced": 0.45, "strict": 0.40}
_OVER_BUDGET_PENALTY = {"relaxed": 0.6, "balanced": 0.4, "strict": 0.2}
_IDEAL_LO_FACTOR = 0.25


def _cal_fit(cal: int, calorie_target: int, calories_remaining: int, strictness: str) -> float:
    if cal <= 0 or calorie_target <= 0:
        return 0.0
    lo = _IDEAL_LO_FACTOR * calorie_target
    hi = _IDEAL_HI_FACTOR[strictness] * calorie_target
    if cal < lo:
        score = 0.6 + 0.4 * (cal / lo)
    elif cal <= hi:
        score = 1.0
    else:
        score = max(0.0, 1.0 - (cal - hi) / hi)
    if calories_remaining > 0 and cal > calories_remaining:
        score *= _OVER_BUDGET_PENALTY[strictness]
    return _clamp(score)


def _density_norm(protein: int, cal: int) -> float:
    # 0.12 g protein per kcal is exceptionally protein-dense -> maps to 1.0
    density = protein / max(cal, 1)
    return _clamp(density / 0.12)


def _coverage(amount: int, remaining: int) -> float:
    if remaining > 0:
        return _clamp(amount / remaining)
    return 1.0 if amount > 0 else 0.0


def _protein_fit(protein: int, protein_remaining: int, density_norm: float, goal: str) -> float:
    cov = _coverage(protein, protein_remaining)
    if goal in ("high_protein", "lose_weight"):
        return _clamp(0.4 * cov + 0.6 * density_norm)
    if goal == "gain_weight":
        return _clamp(0.5 * cov + 0.5 * density_norm)
    return _clamp(0.6 * cov + 0.4 * density_norm)  # eat_healthier


def _goal_fit(goal: str, density_norm: float, cal_fit: float, fibre_fit: float,
              cal: int, calories_remaining: int, flags: list[str]) -> float:
    share = _coverage(cal, calories_remaining)
    if goal == "lose_weight":
        return _clamp(0.5 * density_norm + 0.3 * (1 - share) + 0.2 * fibre_fit)
    if goal == "high_protein":
        return _clamp(density_norm)
    if goal == "gain_weight":
        return _clamp(0.6 * share + 0.4 * density_norm)
    # eat_healthier
    clean = 0.4 if ("fried" in flags or "creamy" in flags) else 1.0
    return _clamp(0.4 * fibre_fit + 0.3 * cal_fit + 0.3 * clean)


def _detect_modifications(dish: ExtractedDish) -> list[str]:
    flags = [f.lower() for f in dish.cook_method_flags]
    ingredients = " ".join(dish.ingredients).lower()
    detected: list[str] = []
    if "fried" in flags:
        detected.append("Ask for it grilled instead of fried")
    if "creamy" in flags or any(k in ingredients for k in ("cream", "mayo", "sauce", "dressing")):
        detected.append("Ask for sauce/dressing on the side")
    if any(k in ingredients for k in ("chip", "fries")):
        detected.append("Swap chips for salad")
    # dedupe while preserving order, Claude's suggestions appended
    out: list[str] = []
    for m in detected + dish.candidate_modifications:
        if m not in out:
            out.append(m)
    return out[:4]


# ---------------------------------------------------------------------------
# Verdict + why
# ---------------------------------------------------------------------------

def _range_width_ratio(est: MacroEstimate) -> float:
    return (est.high - est.low) / max(est.point, 1)


def _verdict(fit: float, cal_fit: float, confidence: str, wide: bool,
             has_violation: bool, num_mods: int) -> str:
    if has_violation:
        return "not_ideal"
    if confidence == "low" or wide:
        return "hard_to_track"
    if fit >= 0.72:
        return "great"
    if cal_fit < 0.35 and fit >= 0.40:
        return "calorie_dense"
    if fit >= 0.50:
        return "good_with_mods"
    return "not_ideal"


def _why(verdict: str, subs: dict[str, float], diet: DietFlags, modifications: list[str]) -> str:
    if not diet.ok:
        return f"Doesn't fit your preferences ({', '.join(diet.violates)})."
    bits: list[str] = []
    if subs["protein"] >= 0.6:
        bits.append("high protein")
    if subs["cal"] >= 0.8:
        bits.append("fits your calorie budget")
    elif subs["cal"] < 0.35:
        bits.append("calorie-heavy for one meal")
    if subs["fibre"] >= 0.5:
        bits.append("good fibre")
    if not bits:
        bits.append("a balanced option")
    why = ", ".join(bits)
    why = why[0].upper() + why[1:] + "."
    if modifications:
        why += f" Smart order: {modifications[0][0].lower() + modifications[0][1:]}."
    return why


# ---------------------------------------------------------------------------
# Public entrypoint
# ---------------------------------------------------------------------------

def score_dishes(
    dishes: list[ExtractedDish],
    targets: Targets,
    remaining: Remaining,
    profile: ScoringProfile,
) -> ScanResult:
    scored: list[ScoredDish] = []

    for d in dishes:
        cal = MacroEstimate.from_range(d.calories)
        prot = MacroEstimate.from_range(d.protein_g)
        fib = MacroEstimate.from_range(d.fibre_g)
        # carbs/fat are informational only — surfaced in the UI, never scored.
        carbs = MacroEstimate.from_range(d.carbs_g)
        fat = MacroEstimate.from_range(d.fat_g)

        diet = _diet_flags(d, profile)

        density_norm = _density_norm(prot.point, cal.point)
        cal_fit = _cal_fit(cal.point, targets.calorie_target,
                           remaining.calories_remaining, profile.strictness)
        protein_fit = _protein_fit(prot.point, remaining.protein_remaining_g,
                                   density_norm, profile.goal)
        fibre_fit = _coverage(fib.point, remaining.fibre_remaining_g)
        goal_fit = _goal_fit(profile.goal, density_norm, cal_fit, fibre_fit,
                             cal.point, remaining.calories_remaining, d.cook_method_flags)

        modifications = _detect_modifications(d)
        mod_fit = _clamp(len(modifications) / 2)

        fit = _clamp(
            0.35 * cal_fit + 0.30 * protein_fit + 0.15 * fibre_fit
            + 0.10 * goal_fit + 0.10 * mod_fit
        )

        wide = _range_width_ratio(cal) > 0.6
        verdict = _verdict(fit, cal_fit, d.confidence, wide, not diet.ok, len(modifications))
        subs = {"cal": cal_fit, "protein": protein_fit, "fibre": fibre_fit,
                "goal": goal_fit, "mods": mod_fit}

        scored.append(ScoredDish(
            name=d.name,
            description=d.description,
            ingredients=d.ingredients,
            calories=cal,
            protein_g=prot,
            fibre_g=fib,
            carbs_g=carbs,
            fat_g=fat,
            fit_score=round(fit, 4),
            verdict=verdict,
            why=_why(verdict, subs, diet, modifications),
            modifications=modifications,
            diet_flags=diet,
        ))

    scored.sort(key=lambda d: d.fit_score, reverse=True)

    # best_match: best recommendable dish; fall back to calorie_dense only if nothing better.
    recommendable = [d for d in scored if d.diet_flags.ok and d.verdict in ("great", "good_with_mods")]
    best = recommendable[0] if recommendable else None
    if best is None:
        dense = [d for d in scored if d.diet_flags.ok and d.verdict == "calorie_dense"]
        best = dense[0] if dense else None

    good_options = [d for d in recommendable if d is not best]
    avoid = [
        d for d in scored
        if d is not best and (not d.diet_flags.ok
                              or d.verdict in ("not_ideal", "hard_to_track", "calorie_dense"))
    ]

    return ScanResult(best_match=best, good_options=good_options, avoid=avoid, dishes=scored)
