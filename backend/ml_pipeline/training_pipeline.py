"""Training pipeline orchestration."""
# This module can be used to run the full training pipeline
# Import and orchestrate: DataIngestion -> DataTransformation -> ModelTrainer

from backend.ml_pipeline.components.data_ingestion import DataIngestion
from backend.ml_pipeline.components.data_transformation import DataTransformation
from backend.ml_pipeline.components.model_trainer import ModelTrainer


def run_training_pipeline():
    """Execute the complete training pipeline."""
    # Step 1: Data Ingestion
    data_ingestion = DataIngestion()
    train_data, test_data = data_ingestion.initiate_data_ingestion()

    # Step 2: Data Transformation
    data_transformation = DataTransformation()
    train_arr, test_arr, _ = data_transformation.initiate_data_transformation(
        train_data, test_data
    )

    # Step 3: Model Training
    model_trainer = ModelTrainer()
    r2_score = model_trainer.initiate_model_trainer(train_arr, test_arr)

    print(f"Training completed with R² Score: {r2_score}")
    return r2_score


if __name__ == "__main__":
    run_training_pipeline()
