"""POST /guidance — waste disposal guidance endpoint."""
from fastapi import APIRouter

from schemas.guidance import GuidanceRequest, GuidanceResponse
from services import gemini_service

router = APIRouter(prefix="/guidance", tags=["Guidance"])


@router.post("", response_model=GuidanceResponse)
async def get_disposal_guidance(request: GuidanceRequest) -> GuidanceResponse:
    result = gemini_service.get_guidance(
        category=request.category,
        sub_category=request.sub_category,
        location_hint=request.location_hint,
    )
    return GuidanceResponse(**result)
