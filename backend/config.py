from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Supabase
    supabase_url: str = Field(default="", description="Supabase project URL")
    supabase_service_key: str = Field(
        default="", description="Supabase service-role key (server-side only)"
    )

    # Google Gemini
    gemini_api_key: str = Field(default="", description="Google Gemini API key")
    gemini_model: str = Field(
        default="gemini-1.5-flash",
        description="Gemini model name — switch to any available model via this env var",
    )

    # ML Model
    model_path: str = Field(
        default="./models/waste_classifier.h5",
        description="Path to the trained EfficientNetB0 model weights file",
    )


settings = Settings()
