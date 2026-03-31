"""Application configuration settings."""
import os
from pathlib import Path

# Project paths - use relative paths for deployment
PROJECT_ROOT = Path(__file__).resolve().parents[2]
ARTIFACTS_DIR = PROJECT_ROOT / "artifacts"
MODEL_PATH = ARTIFACTS_DIR / "model.pkl"
PREPROCESSOR_PATH = ARTIFACTS_DIR / "preprocessor.pkl"
TEST_DATA_PATH = ARTIFACTS_DIR / "test.csv"

# Model configuration
TARGET_COLUMN = "math_score"

# API configuration
API_TITLE = "Student Score Prediction API"
API_VERSION = "1.0.0"

# Environment
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# CORS settings - include production frontend URL
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # Vercel production URLs (update with your actual domain)
    "https://*.vercel.app",
]

# Add custom frontend URL from environment variable
FRONTEND_URL = os.getenv("FRONTEND_URL")
if FRONTEND_URL:
    CORS_ORIGINS.append(FRONTEND_URL)
