"""Prediction service for making predictions."""
from app.schemas.schemas import PredictionRequest
from ml_pipeline.pipeline.predict_pipeline import CustomData


def predict_math_score(request_data: PredictionRequest, model, preprocessor) -> float:
    """Make a prediction for a student's math score."""
    custom_data = CustomData(
        gender=request_data.gender,
        race_ethnicity=request_data.race_ethnicity,
        parental_level_of_education=request_data.parental_level_of_education,
        lunch=request_data.lunch,
        test_preparation_course=request_data.test_preparation_course,
        reading_score=request_data.reading_score,
        writing_score=request_data.writing_score,
    )

    prediction_df = custom_data.get_data_as_data_frame()
    transformed_data = preprocessor.transform(prediction_df)
    prediction = model.predict(transformed_data)
    return float(prediction[0])
