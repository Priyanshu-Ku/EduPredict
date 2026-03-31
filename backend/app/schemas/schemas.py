from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    gender: str = Field(..., min_length=1)
    race_ethnicity: str = Field(..., min_length=1)
    parental_level_of_education: str = Field(..., min_length=1)
    lunch: str = Field(..., min_length=1)
    test_preparation_course: str = Field(..., min_length=1)
    reading_score: float = Field(..., ge=0, le=100)
    writing_score: float = Field(..., ge=0, le=100)

    model_config = {"extra": "forbid"}


class PredictionResponse(BaseModel):
    predicted_math_score: float


class ModelInfoResponse(BaseModel):
    model_name: str
    r2_score: float
    rmse: float

    model_config = {"protected_namespaces": ()}


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool

    model_config = {"protected_namespaces": ()}
