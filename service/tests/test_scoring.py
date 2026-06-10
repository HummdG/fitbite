"""TDD for the pure, deterministic Fit Score.

These assert *behaviour* (orderings, verdicts, hard-filters) rather than exact
float scores, so the weighting constants can be tuned without rewriting tests.
"""

from app.models.profile import Targets
from app.models.scan import ExtractedDish, MacroRange, Remaining, ScoringProfile
from app.services.scoring import score_dishes

TARGETS = Targets(calorie_target=1600, protein_target_g=100, fibre_target_g=25, bmr=1500, tdee=1900)
FULL_REMAINING = Remaining(calories_remaining=1600, protein_remaining_g=100, fibre_remaining_g=25)


def dish(name, cal, prot, fib, *, confidence="high", flags=None, ingredients=None,
         description=None, mods=None):
    """Build an ExtractedDish with narrow ±10% ranges around point estimates."""
    def rng(point):
        return MacroRange(low=int(point * 0.9), high=int(point * 1.1))
    return ExtractedDish(
        name=name, description=description, ingredients=ingredients or [],
        calories=rng(cal), protein_g=rng(prot), fibre_g=rng(fib),
        confidence=confidence, cook_method_flags=flags or [],
        candidate_modifications=mods or [],
    )


def _find(result, name):
    return next(d for d in result.dishes if d.name == name)


def test_best_match_prefers_balanced_high_protein_over_calorie_bomb():
    profile = ScoringProfile(goal="lose_weight", strictness="balanced")
    dishes = [
        dish("Chicken shawarma bowl", 620, 42, 7, ingredients=["chicken", "rice", "salad"]),
        dish("Double bacon cheeseburger & fries", 1350, 48, 4,
             flags=["fried"], ingredients=["beef", "cheese", "bacon", "fries"]),
        dish("Garden side salad", 180, 6, 5, ingredients=["lettuce", "tomato"]),
    ]
    result = score_dishes(dishes, TARGETS, FULL_REMAINING, profile)
    assert result.best_match is not None
    assert result.best_match.name == "Chicken shawarma bowl"
    assert result.best_match.fit_score > _find(result, "Double bacon cheeseburger & fries").fit_score


def test_pork_dish_violates_no_pork_and_is_forced_to_avoid():
    profile = ScoringProfile(goal="high_protein", dietary_prefs=["no_pork"])
    dishes = [
        dish("Pulled pork sandwich", 700, 40, 3, ingredients=["pork", "bun", "bbq sauce"]),
        dish("Grilled chicken & quinoa", 600, 45, 8, ingredients=["chicken", "quinoa", "greens"]),
    ]
    result = score_dishes(dishes, TARGETS, FULL_REMAINING, profile)
    pork = _find(result, "Pulled pork sandwich")
    assert pork.diet_flags.ok is False
    assert "no_pork" in pork.diet_flags.violates
    assert pork.verdict == "not_ideal"
    assert pork in result.avoid
    assert result.best_match.name == "Grilled chicken & quinoa"


def test_allergen_dish_is_flagged_and_avoided():
    profile = ScoringProfile(goal="eat_healthier", allergies=["peanut"])
    dishes = [
        dish("Thai peanut noodles", 650, 20, 6, ingredients=["noodles", "peanut sauce", "vegetables"]),
        dish("Veggie stir-fry rice", 550, 15, 9, ingredients=["rice", "vegetables", "soy"]),
    ]
    result = score_dishes(dishes, TARGETS, FULL_REMAINING, profile)
    peanut = _find(result, "Thai peanut noodles")
    assert peanut.diet_flags.ok is False
    assert peanut.verdict == "not_ideal"
    assert peanut in result.avoid
    assert result.best_match.name == "Veggie stir-fry rice"


def test_low_confidence_dish_is_hard_to_track_and_not_best_match():
    profile = ScoringProfile(goal="lose_weight")
    dishes = [dish("Chef's daily special", 700, 30, 5, confidence="low")]
    result = score_dishes(dishes, TARGETS, FULL_REMAINING, profile)
    d0 = result.dishes[0]
    assert d0.verdict == "hard_to_track"
    assert result.best_match is None
    assert d0 in result.avoid


def test_empty_menu_returns_empty_result():
    result = score_dishes([], TARGETS, FULL_REMAINING, ScoringProfile(goal="lose_weight"))
    assert result.best_match is None
    assert result.good_options == []
    assert result.avoid == []
    assert result.dishes == []


def test_macro_point_is_midpoint_of_range():
    d = ExtractedDish(
        name="X", calories=MacroRange(low=560, high=700),
        protein_g=MacroRange(low=38, high=46), fibre_g=MacroRange(low=5, high=9))
    result = score_dishes([d], TARGETS, FULL_REMAINING, ScoringProfile(goal="high_protein"))
    sd = result.dishes[0]
    assert sd.calories.point == 630
    assert sd.protein_g.point == 42
    assert sd.fibre_g.point == 7


def test_relaxed_scores_over_budget_dish_higher_than_strict():
    dishes = [dish("Big loaded burrito", 1100, 45, 10,
                   ingredients=["beans", "rice", "cheese", "tortilla"])]
    relaxed = score_dishes(dishes, TARGETS, FULL_REMAINING,
                           ScoringProfile(goal="eat_healthier", strictness="relaxed"))
    strict = score_dishes(dishes, TARGETS, FULL_REMAINING,
                          ScoringProfile(goal="eat_healthier", strictness="strict"))
    assert relaxed.dishes[0].fit_score > strict.dishes[0].fit_score


def test_all_fit_scores_within_unit_interval():
    profile = ScoringProfile(goal="lose_weight")
    dishes = [
        dish("Tiny", 200, 5, 2),
        dish("Monstrous fried platter", 3000, 90, 1, flags=["fried", "creamy"]),
        dish("Lean & green", 600, 50, 12),
    ]
    result = score_dishes(dishes, TARGETS, FULL_REMAINING, profile)
    for d in result.dishes:
        assert 0.0 <= d.fit_score <= 1.0


def test_fried_dish_surfaces_modifications():
    profile = ScoringProfile(goal="lose_weight")
    dishes = [dish("Fried chicken & chips", 900, 40, 4, flags=["fried"],
                   ingredients=["chicken", "chips"],
                   mods=["Ask for grilled instead of fried"])]
    result = score_dishes(dishes, TARGETS, FULL_REMAINING, profile)
    assert len(result.dishes[0].modifications) >= 1


def test_why_is_populated_for_every_dish():
    profile = ScoringProfile(goal="high_protein")
    dishes = [dish("Grilled salmon & greens", 550, 40, 8)]
    result = score_dishes(dishes, TARGETS, FULL_REMAINING, profile)
    assert result.dishes[0].why.strip() != ""


def test_dishes_returned_sorted_by_fit_descending():
    profile = ScoringProfile(goal="high_protein")
    dishes = [
        dish("Plain side", 200, 5, 1),
        dish("Protein winner", 600, 48, 9),
        dish("Greasy middle", 900, 25, 5, flags=["fried"]),
    ]
    result = score_dishes(dishes, TARGETS, FULL_REMAINING, profile)
    scores = [d.fit_score for d in result.dishes]
    assert scores == sorted(scores, reverse=True)
