from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ScanCreate(BaseModel):
    """Fields sent from client when saving a scan result."""

    category: str
    sub_category: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    carbon_kg: float
    carbon_source_citation: str
    disposal_guidance: dict  # full GuidanceResponse as JSON


class ScanResponse(BaseModel):
    """Scan record returned to client — includes ephemeral signed URL."""

    id: str
    user_id: str
    category: str
    sub_category: str
    confidence: float
    carbon_kg: float
    carbon_source_citation: str
    disposal_guidance: dict
    image_signed_url: str  # ephemeral, NOT stored in DB
    created_at: datetime


class BadgeInfo(BaseModel):
    id: str
    name: str
    description: str
    threshold_points: int


class SaveScanResponse(BaseModel):
    """Response to POST /scans — includes the scan, new points total, and any new badges."""

    scan: ScanResponse
    points_total: int
    points_earned: int
    new_badges: list[BadgeInfo]


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: str
    username: str
    total_points: int
    avatar_url: Optional[str] = None
