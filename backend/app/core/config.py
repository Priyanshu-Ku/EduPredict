"""Application configuration settings."""
from pathlib import Path

# Project paths
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

# CORS settings
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
