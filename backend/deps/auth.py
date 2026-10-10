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

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from services.supabase_service import get_client

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    Verifies the Supabase JWT supplied in the Authorization: Bearer header.

    Uses the service-role key to call ``client.auth.get_user(token)`` — the
    correct server-side verification pattern for Supabase (the service-role key
    gives the client the privilege required to introspect arbitrary tokens).

    Returns a minimal user dict ``{"id": str, "email": str}`` on success, or
    raises HTTP 401 on any verification failure.
    """
    token = credentials.credentials
    try:
        client = get_client()
        response = client.auth.get_user(token)
        if response.user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
            )
        return {"id": str(response.user.id), "email": response.user.email}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        ) from exc
