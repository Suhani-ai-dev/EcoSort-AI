"""GET /leaderboard — public leaderboard endpoint."""
from fastapi import APIRouter, Query

from schemas.scan import LeaderboardEntry
from services import supabase_service

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])


@router.get("", response_model=list[LeaderboardEntry])
def get_leaderboard(
    limit: int = Query(default=50, ge=1, le=100),
) -> list[LeaderboardEntry]:
    """Return the top-N users ranked by total points."""
    rows = supabase_service.fetch_leaderboard(limit)
    return [LeaderboardEntry(**row) for row in rows]
