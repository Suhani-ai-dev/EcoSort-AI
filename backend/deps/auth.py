"""
deps/auth.py
FastAPI dependency for Supabase JWT verification.

Usage:
    from deps.auth import get_current_user
    from fastapi import Depends

    @router.get("/protected")
    async def protected(user: dict = Depends(get_current_user)):
        return {"user_id": user["id"]}
"""

from typing import Optional
from fastapi import Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from services.supabase_service import get_client

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
) -> dict:
    """
    Verifies the Supabase JWT if present. If absent, expired, or invalid,
    seamlessly falls back to an anonymous/guest session identified by X-User-Id.
    This guarantees 100% friction-free use without mandatory sign-in.
    """
    fallback_id = x_user_id or "guest-user"
    guest_dict = {"id": fallback_id, "email": "eco_sorter@ecosort.ai", "is_guest": True}

    if not credentials or not credentials.credentials:
        return guest_dict

    token = credentials.credentials
    try:
        client = get_client()
        response = client.auth.get_user(token)
        if response and response.user:
            return {"id": str(response.user.id), "email": response.user.email, "is_guest": False}
    except Exception as exc:
        print(f"[deps/auth] Auth check failed, using guest mode: {exc}")

    return guest_dict
