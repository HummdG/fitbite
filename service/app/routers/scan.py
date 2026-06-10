"""POST /scan — the core endpoint.

Pipeline: load the user's profile (server-side) -> Claude extracts dishes ->
deterministic Python scoring -> persist the scan -> return ranked recommendations.
"""

from fastapi import APIRouter, Depends, HTTPException, status

from app.deps import CurrentUser, get_current_user
from app.models.profile import Targets
from app.models.scan import (
    Remaining,
    ScanRequest,
    ScanResponse,
    ScoringProfile,
    TargetsSnapshot,
)
from app.services import extraction, persistence
from app.services.scoring import score_dishes

router = APIRouter(tags=["scan"])


@router.post("/scan", response_model=ScanResponse)
def post_scan(
    req: ScanRequest,
    user: CurrentUser = Depends(get_current_user),
) -> ScanResponse:
    profile = persistence.get_profile(user.id)
    if profile is None:
        raise HTTPException(
            status.HTTP_409_CONFLICT, "Complete your profile before scanning a menu"
        )

    dishes = extraction.extract_menu(req)

    remaining = Remaining(
        calories_remaining=max(0, profile.calorie_target - req.consumed.calories),
        protein_remaining_g=max(0, profile.protein_target_g - req.consumed.protein_g),
        fibre_remaining_g=max(0, profile.fibre_target_g - req.consumed.fibre_g),
    )
    targets = Targets(
        calorie_target=profile.calorie_target,
        protein_target_g=profile.protein_target_g,
        fibre_target_g=profile.fibre_target_g,
        bmr=0,
        tdee=0,
    )
    scoring_profile = ScoringProfile(
        goal=profile.goal,
        strictness=profile.strictness,
        dietary_prefs=profile.dietary_prefs,
        allergies=profile.allergies,
    )

    result = score_dishes(dishes, targets, remaining, scoring_profile)

    # user.id is the verified JWT subject — never trust a client-supplied id here.
    scan_id = persistence.insert_scan(user.id, req, result)

    snapshot = TargetsSnapshot(
        calorie_target=profile.calorie_target,
        protein_target_g=profile.protein_target_g,
        fibre_target_g=profile.fibre_target_g,
        calories_remaining=remaining.calories_remaining,
        protein_remaining_g=remaining.protein_remaining_g,
        fibre_remaining_g=remaining.fibre_remaining_g,
    )
    return ScanResponse(
        scan_id=scan_id,
        restaurant_name=req.restaurant_name,
        targets_snapshot=snapshot,
        best_match=result.best_match,
        good_options=result.good_options,
        avoid=result.avoid,
        dishes=result.dishes,
    )
