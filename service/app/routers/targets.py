from fastapi import APIRouter, Depends

from app.deps import CurrentUser, get_current_user
from app.models.profile import TargetRequest, Targets
from app.services.targets import compute_targets

router = APIRouter(tags=["targets"])


@router.post("/targets", response_model=Targets)
def post_targets(
    req: TargetRequest,
    _user: CurrentUser = Depends(get_current_user),
) -> Targets:
    """Compute daily calorie/protein/fibre targets. Pure + deterministic; no Claude."""
    return compute_targets(req)
