"""POST /classify — waste image classification endpoint."""
from fastapi import APIRouter, UploadFile, File, HTTPException, status

from schemas.classify import ClassifyResponse
from models import model_loader
from models.carbon_map import CARBON_MAP

router = APIRouter(prefix="/classify", tags=["Classification"])

# Default sub-category per category (used when fine-grained model isn't available)
DEFAULT_SUB_CATEGORY = {
    "Paper":        "cardboard",
    "Plastic":      "pet_bottle",
    "Glass":        "clear_glass",
    "Metal":        "aluminium_can",
    "Food/Organic": "fruit_peel",
    "E-Waste":      "battery",
    "Medical":      "medicine_packaging",
    "Hazardous":    "chemical_container",
    "Textile":      "clothing",
    "General":      "mixed",
}

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


@router.post("", response_model=ClassifyResponse)
async def classify_waste(file: UploadFile = File(...)) -> ClassifyResponse:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=(
                f"Unsupported file type '{file.content_type}'. "
                f"Accepted: {sorted(ALLOWED_CONTENT_TYPES)}"
            ),
        )

    image_bytes = await file.read()

    if len(image_bytes) > 10 * 1024 * 1024:  # 10 MB limit
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image must be under 10 MB",
        )

    if not model_loader.is_loaded():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Classification model not ready",
        )

    pred_result = model_loader.predict(image_bytes)
    if len(pred_result) == 3:
        category, confidence, sub_category = pred_result
    else:
        category, confidence = pred_result
        sub_category = ""

    if not sub_category:
        sub_category = DEFAULT_SUB_CATEGORY.get(category, "mixed")

    carbon_info = CARBON_MAP[category]

    return ClassifyResponse(
        category=category,
        sub_category=sub_category,
        confidence=round(confidence, 4),
        carbon_kg=carbon_info["carbon_kg_saved"],
        carbon_source_citation=carbon_info["citation"],
    )
