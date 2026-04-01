"""AyurMind — App configuration via environment variables."""

import os
from typing import List


class Settings:
    app_name: str = "AyurMind NLP API"
    version: str = "2.0.0"
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"
    allowed_origins: List[str] = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
    ).split(",")
    groq_api_key: str = os.getenv("GROQ_API_KEY", "")


settings = Settings()
