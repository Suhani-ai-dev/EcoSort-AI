"""
POST /scans  — save a scan result + image (multipart/form-data)
GET  /scans  — retrieve paginated scan history (with signed URLs)
"""
import json
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status

from deps.auth import get_current_user
from schemas.scan import BadgeInfo, SaveScanResponse, ScanResponse
from services import points_service, supabase_service

router = APIRouter(prefix="/scans", tags=["Scans"])

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_BYTES = 10 * 1024 * 1024  # 10 MB


@router.post("", response_model=SaveScanResponse, status_code=status.HTTP_201_CREATED)
async def save_scan(
    file: UploadFile = File(...),
    category: str = Form(...),
    sub_category: str = Form(...),
    confidence: float = Form(...),
    carbon_kg: float = Form(...),
    carbon_source_citation: str = Form(...),
    disposal_guidance: str = Form(...),  # JSON string
    current_user: dict = Depends(get_current_user),
) -> SaveScanResponse:
    """Accept an image + classification metadata, persist to Storage and DB,
    award points and badges, and return the full result."""

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported image type. Allowed: jpeg, png, webp.",
        )

    image_bytes = await file.read()
    if len(image_bytes) > MAX_IMAGE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image exceeds 10 MB limit.",
        )

    try:
        guidance_dict = json.loads(disposal_guidance)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid disposal_guidance JSON.",
        )

    user_id = current_user["id"]
    scan_id = str(uuid.uuid4())

    # 1. Upload image to private Storage bucket — stores path, NOT a URL
    image_path = supabase_service.upload_scan_image(user_id, scan_id, image_bytes)

    # 2. Insert scan record (image_path only — signed URL is NEVER stored)
    scan_row = supabase_service.insert_scan(
        user_id=user_id,
        scan_id=scan_id,
        image_path=image_path,
        category=category,
        sub_category=sub_category,
        confidence=confidence,
        carbon_kg=carbon_kg,
        carbon_source_citation=carbon_source_citation,
        disposal_guidance=guidance_dict,
    )

    # 3. Generate ephemeral signed URL for the response (NOT stored in DB)
    signed_url = supabase_service.create_signed_url(image_path)

    # 4. Points: read current total → calculate earned → upsert new total
    prev_total = supabase_service.get_points(user_id)
    earned = points_service.calculate_points(category)
    new_total = prev_total + earned
    supabase_service.upsert_points(user_id, new_total)

    # 5. Check for newly unlocked badges and award them
    new_badge_names = points_service.get_newly_earned_badge_names(prev_total, new_total)
    new_badge_infos = supabase_service.get_badge_ids_by_names(new_badge_names)
    if new_badge_infos:
        supabase_service.award_badges(user_id, [b["id"] for b in new_badge_infos])

    scan_response = ScanResponse(
        id=scan_row["id"],
        user_id=scan_row["user_id"],
        category=scan_row["category"],
        sub_category=scan_row["sub_category"],
        confidence=scan_row["confidence"],
        carbon_kg=scan_row["carbon_kg"],
        carbon_source_citation=scan_row["carbon_source_citation"],
        disposal_guidance=scan_row["disposal_guidance"],
        image_signed_url=signed_url,
        created_at=scan_row["created_at"],
    )

    return SaveScanResponse(
        scan=scan_response,
        points_total=new_total,
        points_earned=earned,
        new_badges=[BadgeInfo(**b) for b in new_badge_infos],
    )


@router.get("", response_model=list[ScanResponse])
async def get_scan_history(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
) -> list[ScanResponse]:
    """Return paginated scan history for the authenticated user.

    Each row includes an ephemeral ``image_signed_url`` generated on demand.
    """
    rows = supabase_service.fetch_scan_history(current_user["id"], page, page_size)
    return [ScanResponse(**row) for row in rows]
