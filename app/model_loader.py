from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Union

import numpy as np
import pandas as pd
from sklearn.metrics import mean_squared_error, r2_score

from src.utils import load_object

PROJECT_ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = PROJECT_ROOT / "artifacts" / "model.pkl"
PREPROCESSOR_PATH = PROJECT_ROOT / "artifacts" / "preprocessor.pkl"
TEST_DATA_PATH = PROJECT_ROOT / "artifacts" / "test.csv"
TARGET_COLUMN = "math_score"


@dataclass(frozen=True)
class LoadedArtifacts:
    model: Any
    preprocessor: Any


def load_artifacts() -> LoadedArtifacts:
    model = load_object(file_path=str(MODEL_PATH))
    preprocessor = load_object(file_path=str(PREPROCESSOR_PATH))
    return LoadedArtifacts(model=model, preprocessor=preprocessor)


def get_model_info(artifacts: LoadedArtifacts) -> Dict[str, Union[float, str]]:
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
