"""API routes for the FastAPI application."""
from fastapi import APIRouter, HTTPException

from backend.app.schemas.schemas import (
    HealthResponse,
    ModelInfoResponse,
    PredictionRequest,
    PredictionResponse,
)
from backend.app.services.prediction import predict_math_score

router = APIRouter()


def get_app_state():
    """Helper to get app state - will be injected via dependency."""
    from backend.app.main import app
    return app.state


@router.post("/predict", response_model=PredictionResponse)
def predict(request_data: PredictionRequest) -> PredictionResponse:
    """Make a prediction for a student's math score."""
    try:
        state = get_app_state()
        predicted_score = predict_math_score(
            request_data=request_data,
            model=state.model,
            preprocessor=state.preprocessor,
        )
        return PredictionResponse(predicted_math_score=predicted_score)
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Prediction failed") from exc


@router.get("/model-info", response_model=ModelInfoResponse)
def model_info() -> ModelInfoResponse:
    """Get model information and metrics."""
    state = get_app_state()
    return ModelInfoResponse(**state.model_info)


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    """Health check endpoint."""
    state = get_app_state()
    model_loaded = state.model is not None
    preprocessor_loaded = state.preprocessor is not None
    all_loaded = model_loaded and preprocessor_loaded

    return HealthResponse(status="ok" if all_loaded else "error", model_loaded=all_loaded)
