"""
EcoSort AI — Supabase Service

All database and storage operations using the service-role client.
The service-role key bypasses RLS — appropriate for server-side operations.
"""
from datetime import datetime, timezone
from typing import Any

from supabase import create_client, Client

from config import settings

_client: Client | None = None


def get_client() -> Client:
    """Return the singleton Supabase client initialised with the service-role key."""
    global _client
    if _client is None:
        _client = create_client(settings.supabase_url, settings.supabase_service_key)
    return _client


# ---------------------------------------------------------------------------
# Storage
# ---------------------------------------------------------------------------


def upload_scan_image(user_id: str, scan_id: str, image_bytes: bytes) -> str:
    """Upload image bytes to the private scan-images bucket.

    Returns the object path string (e.g. ``{user_id}/{scan_id}.jpg``).
    This path is stored in ``scans.image_path`` — NOT a URL.
    """
    client = get_client()
    path = f"{user_id}/{scan_id}.jpg"
    client.storage.from_("scan-images").upload(
        path, image_bytes, file_options={"content-type": "image/jpeg"}
    )
    return path


def create_signed_url(image_path: str, ttl: int = 3600) -> str:
    """Generate a short-lived signed URL for the given storage object path.

    The returned URL is ephemeral and must NEVER be written to the database.
    supabase-py v2 returns a dict with key ``signedURL`` (older builds may use
    ``signedUrl`` — both are tried for forward compatibility).
    """
    client = get_client()
    result = client.storage.from_("scan-images").create_signed_url(image_path, ttl)
    return result.get("signedURL") or result.get("signedUrl") or ""


# ---------------------------------------------------------------------------
# Scans table
# ---------------------------------------------------------------------------


def insert_scan(
    user_id: str,
    scan_id: str,
    image_path: str,
    category: str,
    sub_category: str,
    confidence: float,
    carbon_kg: float,
    carbon_source_citation: str,
    disposal_guidance: dict,
) -> dict:
    """Insert a scan record and return the inserted row."""
    client = get_client()
    row = {
        "id": scan_id,
        "user_id": user_id,
        "image_path": image_path,
        "category": category,
        "sub_category": sub_category,
        "confidence": confidence,
        "carbon_kg": carbon_kg,
        "carbon_source_citation": carbon_source_citation,
        "disposal_guidance": disposal_guidance,
    }
    result = client.table("scans").insert(row).execute()
    return result.data[0]


def fetch_scan_history(user_id: str, page: int = 1, page_size: int = 20) -> list[dict]:
    """Return paginated scan history for a user with a signed URL per row.

    ``image_signed_url`` is generated on demand and is NOT stored in the DB.
    """
    client = get_client()
    offset = (page - 1) * page_size
    result = (
        client.table("scans")
        .select(
            "id, user_id, image_path, category, sub_category, confidence, "
            "carbon_kg, carbon_source_citation, disposal_guidance, created_at"
        )
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .range(offset, offset + page_size - 1)
        .execute()
    )
    rows = result.data or []
    for row in rows:
        row["image_signed_url"] = create_signed_url(row["image_path"])
    return rows


# ---------------------------------------------------------------------------
# Points table
# ---------------------------------------------------------------------------


def get_points(user_id: str) -> int:
    """Return the current total_points for a user, or 0 if no row exists."""
    client = get_client()
    result = (
        client.table("points")
        .select("total_points")
        .eq("user_id", user_id)
        .execute()
    )
    if result.data:
        return result.data[0]["total_points"]
    return 0


def upsert_points(user_id: str, new_total: int) -> None:
    """Upsert the points row for a user with the new total."""
    client = get_client()
    client.table("points").upsert(
        {
            "user_id": user_id,
            "total_points": new_total,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
        on_conflict="user_id",
    ).execute()


# ---------------------------------------------------------------------------
# Badges / user_badges tables
# ---------------------------------------------------------------------------


def get_badge_ids_by_names(names: list[str]) -> list[dict]:
    """Query the badges table for rows matching the given names.

    Returns a list of dicts with keys: ``id``, ``name``, ``description``,
    ``threshold_points``.
    """
    if not names:
        return []
    client = get_client()
    result = (
        client.table("badges")
        .select("id, name, description, threshold_points")
        .in_("name", names)
        .execute()
    )
    return result.data or []


def award_badges(user_id: str, badge_ids: list[str]) -> None:
    """Insert user_badges rows, ignoring duplicates (idempotent)."""
    if not badge_ids:
        return
    client = get_client()
    rows = [{"user_id": user_id, "badge_id": bid} for bid in badge_ids]
    client.table("user_badges").upsert(rows, on_conflict="user_id,badge_id").execute()


# ---------------------------------------------------------------------------
# Leaderboard
# ---------------------------------------------------------------------------


def fetch_leaderboard(limit: int = 50) -> list[dict]:
    """Return top-N users ranked by total_points, merged with profile data.

    Performs two queries:
    1. Top-N rows from ``points`` ordered by ``total_points DESC``.
    2. Matching rows from ``profiles`` to resolve username and avatar_url.
    """
    client = get_client()

    pts_result = (
        client.table("points")
        .select("user_id, total_points")
        .order("total_points", desc=True)
        .limit(limit)
        .execute()
    )
    pts_rows = pts_result.data or []
    if not pts_rows:
        return []

    user_ids = [r["user_id"] for r in pts_rows]
    prof_result = (
        client.table("profiles")
        .select("id, username, avatar_url")
        .in_("id", user_ids)
        .execute()
    )
    profile_map: dict[str, dict[str, Any]] = {
        p["id"]: p for p in (prof_result.data or [])
    }

    entries = []
    for rank, row in enumerate(pts_rows, start=1):
        profile = profile_map.get(row["user_id"], {})
        entries.append(
            {
                "rank": rank,
                "user_id": row["user_id"],
                "username": profile.get("username", "Anonymous"),
                "total_points": row["total_points"],
                "avatar_url": profile.get("avatar_url"),
            }
        )
    return entries
