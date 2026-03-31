from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.model_loader import get_model_info, load_artifacts
from app.predict import predict_math_score
from app.schemas import (
    HealthResponse,
    ModelInfoResponse,
    PredictionRequest,
    PredictionResponse,
)


@asynccontextmanager
async def lifespan(application: FastAPI):
    artifacts = load_artifacts()
    application.state.model = artifacts.model
    application.state.preprocessor = artifacts.preprocessor
    application.state.model_info = get_model_info(artifacts)
    yield


app = FastAPI(
    title="Student Score Prediction API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware to allow React frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/predict", response_model=PredictionResponse)
def predict(request_data: PredictionRequest) -> PredictionResponse:
    try:
        predicted_score = predict_math_score(
            request_data=request_data,
            model=app.state.model,
            preprocessor=app.state.preprocessor,
        )
        return PredictionResponse(predicted_math_score=predicted_score)
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Prediction failed") from exc


@app.get("/model-info", response_model=ModelInfoResponse)
def model_info() -> ModelInfoResponse:
    return ModelInfoResponse(**app.state.model_info)


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    model_loaded = app.state.model is not None
    preprocessor_loaded = app.state.preprocessor is not None
    all_loaded = model_loaded and preprocessor_loaded
    
    return HealthResponse(
        status="ok" if all_loaded else "error",
        model_loaded=all_loaded
    )
