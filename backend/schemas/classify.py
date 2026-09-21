from pydantic import BaseModel, Field


class ClassifyResponse(BaseModel):
    category: str = Field(..., description="Top-level waste category")
    sub_category: str = Field(..., description="Inferred sub-category (best-guess from category)")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Model confidence score 0-1")
    carbon_kg: float = Field(..., description="kg CO2e saved by proper disposal vs landfill")
    carbon_source_citation: str = Field(..., description="Source citation for the carbon estimate")
