"""
Integration verification script for EcoSort AI FastAPI Backend.
Tests:
- Lifespan startup and GET /
- POST /classify with real image
- POST /guidance with Gemini integration
- GET /leaderboard
"""
import asyncio
import io
import json
from PIL import Image
import httpx
from httpx import ASGITransport

from main import app


async def run_tests():
    print("=== Starting EcoSort AI Backend Integration Tests ===")
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Health Check
        print("\n[1/4] Testing GET / ...")
        res = await client.get("/")
        print(f"Status: {res.status_code}")
        print(f"Body: {res.json()}")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        assert res.json().get("model_loaded") is True, "Model was not loaded at startup!"
        print("  --> GET / PASSED")

        # 2. Classify Endpoint
        print("\n[2/4] Testing POST /classify ...")
        img = Image.new("RGB", (224, 224), color="lightblue")
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        buf.seek(0)
        files = {"file": ("test_waste.jpg", buf.read(), "image/jpeg")}
        res = await client.post("/classify", files=files)
        print(f"Status: {res.status_code}")
        data = res.json()
        print(f"Body: {data}")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        assert "category" in data and "confidence" in data
        assert data["confidence"] > 0.0
        assert data["carbon_kg"] is not None
        assert data["carbon_source_citation"] != ""
        print("  --> POST /classify PASSED")

        # 3. Guidance Endpoint
        print("\n[3/4] Testing POST /guidance ...")
        guidance_req = {
            "category": data["category"],
            "sub_category": data["sub_category"],
            "location_hint": "New York, USA"
        }
        res = await client.post("/guidance", json=guidance_req)
        print(f"Status: {res.status_code}")
        g_data = res.json()
        print(f"Facility Type: {g_data.get('facility_type')}")
        print(f"Disposal Steps count: {len(g_data.get('disposal_steps', []))}")
        print(f"Explanation: {g_data.get('explanation')[:80]}...")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        assert len(g_data.get("disposal_steps", [])) > 0
        print("  --> POST /guidance PASSED")

        # 4. Leaderboard Endpoint
        print("\n[4/5] Testing GET /leaderboard ...")
        res = await client.get("/leaderboard")
        print(f"Status: {res.status_code}")
        print(f"Entries: {len(res.json())}")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        print("  --> GET /leaderboard PASSED")

        # 5. Scans Endpoint (Guest Mode, No Auth Required)
        print("\n[5/5] Testing POST /scans & GET /scans (Guest Mode) ...")
        scan_data = {
            "category": "Plastic",
            "sub_category": "pet_bottle",
            "confidence": "0.92",
            "carbon_kg": "1.4",
            "carbon_source_citation": "US EPA WARM v16",
            "disposal_guidance": json.dumps({"disposal_steps": ["Rinse", "Recycle"]}),
        }
        res_post = await client.post(
            "/scans",
            data=scan_data,
            files={"file": ("bottle.jpg", buf.getvalue(), "image/jpeg")},
            headers={"X-User-Id": "test-guest-123"}
        )
        print(f"Save status: {res_post.status_code}")
        assert res_post.status_code == 201, f"Expected 201, got {res_post.status_code}"
        save_json = res_post.json()
        assert save_json["points_earned"] > 0
        print(f"Points earned: {save_json['points_earned']}, total: {save_json['points_total']}")

        res_get = await client.get("/scans", headers={"X-User-Id": "test-guest-123"})
        print(f"History status: {res_get.status_code}")
        assert res_get.status_code == 200, f"Expected 200, got {res_get.status_code}"
        assert len(res_get.json()) >= 1
        print(f"History records found: {len(res_get.json())}")
        print("  --> POST & GET /scans PASSED")

    print("\n========================================================")
    print("ALL BACKEND INTEGRATION TESTS PASSED SUCCESSFULLY!")
    print("========================================================")


if __name__ == "__main__":
    asyncio.run(run_tests())
