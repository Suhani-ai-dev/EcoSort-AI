"""
EcoSort AI — Gemini Guidance Service

Calls Google Gemini to generate structured waste disposal guidance.
Model is configurable via GEMINI_MODEL env var (default: gemini-1.5-flash).
Falls back to static data if Gemini is unavailable.
"""
import json
import re
import functools
from pathlib import Path

import google.generativeai as genai

from config import settings

# Initialise Gemini client with API key from settings
if settings.gemini_api_key:
    genai.configure(api_key=settings.gemini_api_key)

_FALLBACK_PATH = Path(__file__).parent.parent / "data" / "fallback_guidance.json"
_fallback_data: dict | None = None


def _load_fallback(category: str) -> dict:
    global _fallback_data
    if _fallback_data is None:
        with open(_FALLBACK_PATH, "r", encoding="utf-8") as f:
            _fallback_data = json.load(f)
    return _fallback_data.get(category, _fallback_data["General"])


def _build_prompt(category: str, sub_category: str, location_hint: str | None) -> str:
    location_clause = f" The user is located in {location_hint}." if location_hint else ""
    return f"""You are an expert in sustainable waste management and recycling.{location_clause}

A user has scanned a waste item identified as: **{category}** (sub-category: {sub_category}).

Respond with EXACTLY this structure — first a JSON block, then a plain-text explanation:

```json
{{
  "disposal_steps": ["step 1", "step 2", "step 3"],
  "sustainability_tips": ["tip 1", "tip 2"],
  "facility_type": "e.g. Recycling Centre",
  "recyclable": true,
  "hazardous": false
}}
```

Then write 2-3 sentences explaining in plain language how to handle this item and why it matters for the environment. Do not use markdown in the explanation paragraph.
"""


def _parse_response(text: str) -> dict:
    """Extract JSON block and explanation paragraph from Gemini response."""
    json_match = re.search(r"```json\s*(\{.*?\})\s*```", text, re.DOTALL)
    if not json_match:
        raise ValueError("No JSON block found in Gemini response")
    structured = json.loads(json_match.group(1))
    # Everything after the closing ``` is the explanation
    after_fence = text[json_match.end():].strip()
    explanation = after_fence if after_fence else "Please dispose of this item responsibly by following your local waste management guidelines."
    structured["explanation"] = explanation
    return structured


@functools.lru_cache(maxsize=128)
def _cached_gemini_call(category: str, sub_category: str, location_hint: str | None) -> str:
    """Cached Gemini API call. Returns raw response text."""
    model = genai.GenerativeModel(model_name=settings.gemini_model)
    prompt = _build_prompt(category, sub_category, location_hint)
    response = model.generate_content(prompt)
    return response.text


def get_guidance(category: str, sub_category: str, location_hint: str | None = None) -> dict:
    """
    Get disposal guidance for a waste item.
    Returns structured dict with disposal_steps, sustainability_tips,
    facility_type, recyclable, hazardous, explanation.
    Falls back to static data on any error.
    """
    try:
        raw_text = _cached_gemini_call(category, sub_category, location_hint)
        result = _parse_response(raw_text)
        result["category"] = category
        result["sub_category"] = sub_category
        return result
    except Exception:
        fallback = _load_fallback(category)
        fallback["category"] = category
        fallback["sub_category"] = sub_category
        return fallback
