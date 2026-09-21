from pydantic import BaseModel, Field
from typing import Optional


class GuidanceRequest(BaseModel):
    category: str = Field(..., description="Waste category (e.g. 'Plastic')")
    sub_category: str = Field(..., description="Sub-category (e.g. 'pet_bottle')")
    location_hint: Optional[str] = Field(None, description="Optional city/country for localised advice")


class GuidanceResponse(BaseModel):
    category: str
    sub_category: str
    disposal_steps: list[str] = Field(..., description="Ordered list of disposal actions")
    sustainability_tips: list[str] = Field(..., description="Eco tips for reducing this waste type")
    facility_type: str = Field(..., description="Type of facility to use (e.g. 'Recycling Centre', 'Hazardous Waste Drop-off')")
    recyclable: bool
    hazardous: bool
    explanation: str = Field(..., description="2-3 sentence plain-language explanation of how to handle this item")
