"""Model loader for loading ML artifacts."""
from dataclasses import dataclass
from typing import Any, Dict, Union

import numpy as np
import pandas as pd
from sklearn.metrics import mean_squared_error, r2_score

from app.core.config import MODEL_PATH, PREPROCESSOR_PATH, TEST_DATA_PATH, TARGET_COLUMN
from ml_pipeline.utils.common import load_object


@dataclass(frozen=True)
class LoadedArtifacts:
    model: Any
    preprocessor: Any


def load_artifacts() -> LoadedArtifacts:
    """Load model and preprocessor artifacts."""
    model = load_object(file_path=str(MODEL_PATH))
    preprocessor = load_object(file_path=str(PREPROCESSOR_PATH))
    return LoadedArtifacts(model=model, preprocessor=preprocessor)


def get_model_info(artifacts: LoadedArtifacts) -> Dict[str, Union[float, str]]:
    """Get model performance metrics."""
    test_df = pd.read_csv(TEST_DATA_PATH)
    input_features = test_df.drop(columns=[TARGET_COLUMN])
    target = test_df[TARGET_COLUMN]

    transformed_features = artifacts.preprocessor.transform(input_features)
    predictions = artifacts.model.predict(transformed_features)

    return {
        "model_name": type(artifacts.model).__name__,
        "r2_score": float(r2_score(target, predictions)),
        "rmse": float(np.sqrt(mean_squared_error(target, predictions))),
    }
