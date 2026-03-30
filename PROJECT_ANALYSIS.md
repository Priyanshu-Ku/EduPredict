# Project Technical Analysis

## 1. Project Overview

This repository is an end-to-end machine learning project for predicting a student's `math_score` from demographic and academic context features. The project combines:

- A training workflow built with scikit-learn style components.
- A prediction workflow that loads serialized artifacts from disk.
- A Flask web UI that accepts user input and returns a predicted math score.
- Containerization and partial CI/CD files for deployment.

The current system is best described as a local/demo-grade ML application with basic MLOps scaffolding, not a production-ready platform.

Core business objective:

- Input: student profile plus `reading_score` and `writing_score`.
- Output: predicted `math_score`.

Dataset characteristics observed in the repository:

- Source file: `notebook/data/stud.csv`
- Shape: 1000 rows, 8 columns
- Features:
  - `gender`
  - `race_ethnicity`
  - `parental_level_of_education`
  - `lunch`
  - `test_preparation_course`
  - `reading_score`
  - `writing_score`
- Target:
  - `math_score`

Current runtime pattern:

- Training is launched from `src/components/data_ingestion.py`.
- Inference is served through Flask in both `app.py` and `application.py`.
- Model and preprocessor are loaded from `artifacts/model.pkl` and `artifacts/preprocessor.pkl`.

Important current-state observations:

- `src/pipeline/train_pipeline.py` exists but is empty.
- `app.py` and `application.py` duplicate the same Flask application logic.
- The checked-in trained artifact currently resolves to `LinearRegression()`.
- The notebook history shows multiple models were compared, but the production code persists whichever model scores best at training time.

## 2. Folder Structure Explanation

Top-level structure:

- `.ebextensions/`
  - Elastic Beanstalk Python WSGI configuration.
- `.github/workflows/`
  - GitHub Actions workflow for build/push/deploy.
- `artifacts/`
  - Generated runtime/training outputs:
    - `data.csv`
    - `train.csv`
    - `test.csv`
    - `preprocessor.pkl`
    - `model.pkl`
- `catboost_info/`
  - CatBoost training metadata generated during experimentation.
- `logs/`
  - Application and pipeline log outputs.
  - Current logger implementation creates timestamped directories named like log files.
- `ml_project.egg-info/`
  - Python packaging metadata from `setup.py`.
- `notebook/`
  - Exploratory notebooks and raw dataset copy.
  - Also contains notebook-local `catboost_info`.
- `src/`
  - Main Python source code.
- `templates/`
  - Flask HTML templates for landing page and prediction form.
- `venv/`
  - Local virtual environment; should not normally be committed.
- `app.py`
  - Flask entrypoint with debug enabled.
- `application.py`
  - Duplicate Flask entrypoint intended for deployment/WGSI usage.
- `Dockerfile`
  - Container image definition.
- `README.md`
  - Project usage and deployment notes.
- `requirements.txt`
  - Python dependency list.
- `setup.py`
  - Package metadata and installation logic.

`src/` structure:

- `src/exception.py`
  - Custom exception wrapper with file and line context.
- `src/logger.py`
  - Logging configuration.
- `src/utils.py`
  - Serialization helpers and model evaluation helper.
- `src/components/`
  - Training pipeline building blocks.
- `src/pipeline/`
  - Prediction pipeline implementation and an empty train pipeline module.

`src/components/`:

- `data_ingestion.py`
  - Reads CSV dataset, writes raw/train/test splits, and orchestrates training when run as a script.
- `data_transformation.py`
  - Builds preprocessing transformer and converts train/test data into transformed arrays.
- `model_trainer.py`
  - Defines candidate regressors, hyperparameter grids, model selection, and model persistence.

`src/pipeline/`:

- `predict_pipeline.py`
  - Loads preprocessor and model artifacts, transforms request data, and predicts.
- `train_pipeline.py`
  - Present but empty; no formal pipeline orchestrator is implemented here.

`templates/`:

- `index.html`
  - Minimal landing page.
- `home.html`
  - HTML form for prediction input and display of predicted score.

## 3. ML Pipeline Explanation Step-by-Step

The implemented ML pipeline follows this sequence:

1. Read the dataset from `notebook/data/stud.csv`.
2. Persist a raw copy into `artifacts/data.csv`.
3. Split the dataset into train and test subsets using `train_test_split(test_size=0.2, random_state=42)`.
4. Save split datasets into `artifacts/train.csv` and `artifacts/test.csv`.
5. Build a preprocessing object with separate numeric and categorical branches.
6. Fit the preprocessor on the training features.
7. Transform both training and test features with the fitted preprocessor.
8. Concatenate transformed features with the target column into NumPy arrays.
9. Evaluate multiple regression algorithms using `GridSearchCV`.
10. Select the model with the highest test `R2` score.
11. Persist the fitted preprocessor and best model to disk with `dill`.
12. During inference, load both artifacts, transform incoming request data, and predict the math score.

Conceptually, this is a classic batch-train, artifact-serialize, online-inference pattern.

## 4. Training Pipeline Flow

Current training flow in code:

1. Entry point is effectively `python src/components/data_ingestion.py`.
2. `DataIngestion.initiate_data_ingestion()`:
   - Reads `notebook/data/stud.csv`.
   - Saves raw copy to `artifacts/data.csv`.
   - Splits data into train and test sets.
   - Saves `artifacts/train.csv` and `artifacts/test.csv`.
3. `DataTransformation.initiate_data_transformation(train_path, test_path)`:
   - Loads train and test CSV files.
   - Separates target `math_score` from input features.
   - Builds a `ColumnTransformer`.
   - Fits on train features.
   - Transforms train and test features.
   - Saves the fitted preprocessor to `artifacts/preprocessor.pkl`.
4. `ModelTrainer.initiate_model_trainer(train_array, test_array)`:
   - Splits transformed arrays into `X_train`, `y_train`, `X_test`, `y_test`.
   - Defines 8 candidate regression models.
   - Defines hyperparameter grids for 7 of them.
   - Calls `evaluate_models()` from `src/utils.py`.
   - `evaluate_models()` runs `GridSearchCV(cv=3)` for each model.
   - Best hyperparameters are applied to each model.
   - Each model is fit on the full training set.
   - Test `R2` values are collected in a report dict.
   - Best-scoring model is selected.
   - If best test `R2 < 0.6`, training fails.
   - Best model is saved to `artifacts/model.pkl`.
   - Final test `R2` is returned.

Training pipeline limitations:

- No dedicated train pipeline module even though one is expected by project structure.
- No CLI interface, config file, or experiment manifest.
- No versioning of datasets, features, or model artifacts.
- No deterministic seed control across all algorithms.
- No train/validation/test separation; model selection uses one held-out test set.
- No proper experiment tracking.
- No automated unit or integration tests for training.

## 5. Prediction Pipeline Flow

Prediction flow in the current Flask app:

1. User opens `/predictdata`.
2. Flask renders `templates/home.html`.
3. User submits form values:
   - `gender`
   - `ethnicity`
   - `parental_level_of_education`
   - `lunch`
   - `test_preparation_course`
   - `reading_score`
   - `writing_score`
4. Flask constructs a `CustomData` object.
5. `CustomData.get_data_as_data_frame()` converts values into a one-row pandas DataFrame.
6. `PredictPipeline.predict(features)` loads:
   - `artifacts/model.pkl`
   - `artifacts/preprocessor.pkl`
7. Preprocessor transforms the request features.
8. Model predicts the output score.
9. Flask injects the first prediction value into the HTML template.

Operational characteristics:

- Inference is synchronous and request-scoped.
- Model and preprocessor are reloaded from disk on every request.
- No request validation layer beyond HTML form constraints.
- No authentication, rate limiting, audit logging, or API contract.

## 6. Data Preprocessing Steps

The preprocessing logic is implemented in `src/components/data_transformation.py`.

Target:

- `math_score`

Numerical features:

- `writing_score`
- `reading_score`

Categorical features:

- `gender`
- `race_ethnicity`
- `parental_level_of_education`
- `lunch`
- `test_preparation_course`

Numeric preprocessing branch:

- `SimpleImputer(strategy="median")`
- `StandardScaler()`

Categorical preprocessing branch:

- `SimpleImputer(strategy="most_frequent")`
- `OneHotEncoder()`
- `StandardScaler(with_mean=False)`

Combined preprocessing:

- `ColumnTransformer` merges numeric and categorical pipelines into a single fitted preprocessor.

Observations:

- Preprocessing is appropriate for structured tabular regression.
- Missing-value handling exists even though the dataset appears clean in practice.
- `OneHotEncoder()` is used without explicit unknown-category handling configuration.
- No feature drift checks or category vocabulary governance exist.
- No schema validation exists before transformation.

## 7. Model Training Algorithm Used

The code does not hard-code a single training algorithm. It performs model selection across multiple regressors:

- `RandomForestRegressor`
- `DecisionTreeRegressor`
- `GradientBoostingRegressor`
- `LinearRegression`
- `KNeighborsRegressor`
- `XGBRegressor`
- `CatBoostRegressor`
- `AdaBoostRegressor`

Selection strategy:

- Hyperparameter search per model via `GridSearchCV(cv=3)`.
- Model comparison by test `R2`.
- Best-performing model is persisted.

Current checked-in artifact:

- `artifacts/model.pkl` currently deserializes to `LinearRegression()`.

Notebook evidence:

- The training notebook compares additional variants such as Ridge and Lasso during experimentation.
- Historical notebook outputs show `Linear Regression` and `Ridge` near the top of the reported scores, with notebook-level test `R2` around `0.88`.

Interpretation:

- The repository is architected as a regression model benchmark project rather than a single-model system.
- The currently deployed artifact appears to be a linear baseline selected from a previous run.

## 8. Model Evaluation Metrics Used

Metrics found in the repository:

- Code path currently used in training:
  - `R2` score only
- Notebook experimentation:
  - Mean Absolute Error (`MAE`)
  - Root Mean Squared Error (`RMSE`)
  - `R2` score

Actual production-code selection metric:

- Highest test `R2` from `evaluate_models()`

Important evaluation weaknesses:

- The held-out test set is reused for model selection.
- No separate validation set exists.
- No confidence interval, variance, or stability analysis exists.
- No fairness or subgroup analysis exists.
- No calibration or residual diagnostics are persisted.

Recommended metric set for this use case:

- `R2`
- `MAE`
- `RMSE`
- MAPE only if business users need percentage-style interpretability
- Residual plots and subgroup error slices by demographic groups

## 9. How Deployment Is Currently Done

The repository shows several deployment paths, but they are not fully aligned.

### A. Local Flask execution

- `app.py` runs Flask on `0.0.0.0:5000` with `debug=True`.
- `application.py` runs Flask on `0.0.0.0:5000` without debug.

### B. Docker container

`Dockerfile`:

- Uses `python:3.8-slim`
- Copies the entire repository into `/app`
- Installs `awscli`
- Installs requirements
- Runs `python application.py`

### C. Elastic Beanstalk

`.ebextensions/python.config` defines:

- `WSGIPath: application:application`

This suggests intended deployment as a WSGI app on AWS Elastic Beanstalk.

### D. GitHub Actions to AWS ECR / self-hosted runner

`.github/workflows/main.yaml` does the following:

1. Placeholder CI job:
   - Echo-only lint step
   - Echo-only unit test step
2. Build and push Docker image to Amazon ECR.
3. Self-hosted deployment job:
   - Logs into ECR
   - Pulls latest image
   - Runs the container

Current deployment issues:

- The workflow runs the container with `-p 8080:8080`, but Flask listens on port `5000`.
- The workflow references both `AWS_ECR_LOGIN_URL` and `AWS_ECR_LOGIN_URI`; naming is inconsistent.
- The job is labeled "Deploy to Amazon ECS" but actually just runs `docker run` on a self-hosted runner.
- CI does not run real linting or tests.
- The Docker image includes build-time AWS CLI even though the app itself does not need it at runtime.
- No production WSGI server such as Gunicorn is configured.
- No reverse proxy, TLS termination, or health check setup is visible.

Summary:

Deployment is currently demo-grade container deployment with partial AWS wiring, not a robust production deployment.

## 10. What Components Are Missing for a Production-Level System

The project is missing several critical layers.

### Platform and service concerns

- Proper API layer separate from HTML rendering
- WSGI/ASGI production server
- Centralized config management
- Environment-specific settings
- Secrets management
- Health checks and readiness probes
- Structured logging
- Monitoring and alerting
- Distributed tracing
- Request correlation IDs
- Rate limiting
- Authentication and authorization

### ML/MLOps concerns

- Formal train pipeline entrypoint
- Model registry
- Dataset versioning
- Feature schema contracts
- Experiment tracking
- Reproducible training runs
- Drift detection
- Model performance monitoring in production
- Shadow/canary deployment
- Batch retraining orchestration
- Approval workflow for model promotion

### Software quality concerns

- Unit tests
- Integration tests
- Load tests
- Security scans
- Type checking
- Consistent code formatting/linting
- Separation of business logic from framework logic

### Data concerns

- Input validation
- Outlier handling policy
- Data quality checks
- Feature store or at least feature definition management
- PII review and privacy handling

### UX/product concerns

- Proper frontend application
- API error handling
- User feedback and input validation
- Prediction explanation display
- Result history and analytics

## 11. How This Project Can Be Converted Into a Full-Stack Web Application

A pragmatic conversion path:

### Step 1: Separate concerns

- Extract inference logic into a dedicated prediction service.
- Keep training code in a separate offline training service or job.
- Replace Flask template rendering with JSON APIs.

### Step 2: Introduce a proper backend API

- Build REST endpoints such as:
  - `POST /api/v1/predictions`
  - `GET /api/v1/health`
  - `GET /api/v1/model/info`
  - `POST /api/v1/train` for admin/internal use only

### Step 3: Build a real frontend

- Replace server-side HTML templates with a React or Next.js frontend.
- Add forms, validation, model result views, and prediction history UI.

### Step 4: Add persistence

- Store prediction requests, outputs, model version, and user metadata in a database.

### Step 5: Add MLOps and operations

- Model registry
- CI/CD with real test gates
- Container orchestration
- Monitoring and alerting

### Step 6: Add governance

- Auth for admin and internal retraining endpoints
- Audit logging
- Role-based access

End-state full-stack experience:

- Frontend SPA or SSR web app
- Backend API gateway
- Model inference microservice
- Training pipeline jobs
- Metadata database
- Monitoring stack

## 12. Suggested Backend Architecture

Recommended backend approach:

- Framework:
  - FastAPI
- Why:
  - Better validation with Pydantic
  - Automatic OpenAPI docs
  - Better separation for API-first design
  - Easy async support if needed later

Suggested backend modules:

- `api/`
  - route handlers
- `schemas/`
  - request and response DTOs
- `services/`
  - prediction service
  - training service
  - model registry service
- `core/`
  - config
  - logging
  - security
- `repositories/`
  - database access
- `ml/`
  - model loading
  - feature transformation
  - prediction execution
- `jobs/`
  - async retraining and evaluation jobs

Recommended services:

- API service
- Inference service
- Training job runner
- Monitoring/metrics exporter

Recommended runtime stack:

- FastAPI + Uvicorn/Gunicorn
- PostgreSQL
- Redis for caching and lightweight queues
- Celery or a workflow engine for retraining jobs
- S3 for artifact storage
- MLflow or equivalent model registry

## 13. Suggested Frontend Architecture

Recommended frontend:

- Framework:
  - Next.js with React and TypeScript

Why:

- Good DX and maintainability
- Easy form handling
- SSR/CSR flexibility
- Clean deployment to Vercel, containers, or cloud app services

Suggested frontend pages:

- `/`
  - Product landing page
- `/predict`
  - Prediction form
- `/results/[id]`
  - Prediction result details
- `/history`
  - User or admin prediction history
- `/admin/models`
  - Model version and health dashboard

Suggested frontend layers:

- `app/` or `pages/`
- `components/`
- `features/predictions/`
- `lib/api/`
- `lib/validation/`
- `styles/`

Suggested frontend capabilities:

- Client-side validation
- API error display
- Loading and retry states
- Explanation cards
- Model version badge
- Prediction confidence and caveats
- Authentication-aware admin views

## 14. Suggested Database Schema

Use PostgreSQL as the primary metadata store.

### `users`

- `id` UUID PK
- `email` VARCHAR unique
- `name` VARCHAR
- `role` VARCHAR
- `created_at` TIMESTAMP
- `updated_at` TIMESTAMP

### `models`

- `id` UUID PK
- `model_name` VARCHAR
- `model_version` VARCHAR
- `algorithm` VARCHAR
- `artifact_uri` TEXT
- `preprocessor_uri` TEXT
- `training_dataset_version` VARCHAR
- `metrics_json` JSONB
- `status` VARCHAR
- `is_active` BOOLEAN
- `created_at` TIMESTAMP
- `promoted_at` TIMESTAMP

### `prediction_requests`

- `id` UUID PK
- `user_id` UUID nullable FK
- `model_id` UUID FK
- `gender` VARCHAR
- `race_ethnicity` VARCHAR
- `parental_level_of_education` VARCHAR
- `lunch` VARCHAR
- `test_preparation_course` VARCHAR
- `reading_score` NUMERIC
- `writing_score` NUMERIC
- `request_source` VARCHAR
- `created_at` TIMESTAMP

### `prediction_results`

- `id` UUID PK
- `prediction_request_id` UUID FK
- `predicted_math_score` NUMERIC
- `latency_ms` INTEGER
- `feature_vector_hash` VARCHAR
- `created_at` TIMESTAMP

### `training_runs`

- `id` UUID PK
- `run_name` VARCHAR
- `dataset_version` VARCHAR
- `status` VARCHAR
- `started_at` TIMESTAMP
- `finished_at` TIMESTAMP
- `metrics_json` JSONB
- `params_json` JSONB
- `artifact_uri` TEXT
- `logs_uri` TEXT

### `data_quality_reports`

- `id` UUID PK
- `dataset_version` VARCHAR
- `report_json` JSONB
- `created_at` TIMESTAMP

### `audit_logs`

- `id` UUID PK
- `actor_user_id` UUID nullable FK
- `action` VARCHAR
- `target_type` VARCHAR
- `target_id` VARCHAR
- `metadata_json` JSONB
- `created_at` TIMESTAMP

## 15. Suggested Microservice Architecture for the ML Model

Recommended service split:

### 1. API Gateway / Backend-for-Frontend

Responsibilities:

- Auth
- Routing
- Input validation
- User-facing business logic
- Aggregation for frontend

### 2. Prediction Service

Responsibilities:

- Load active model and preprocessor
- Serve low-latency inference
- Log request and prediction metadata
- Expose health endpoint

### 3. Training Service

Responsibilities:

- Start training jobs
- Run evaluation
- Publish metrics and artifacts
- Register candidate models

### 4. Model Registry Service

Responsibilities:

- Version management
- Stage transitions
- Active model selection
- Rollback metadata

### 5. Data Service

Responsibilities:

- Dataset ingestion
- Data validation
- Dataset version creation
- Feature contract checks

### 6. Monitoring Service

Responsibilities:

- Prediction latency monitoring
- Error rates
- Drift detection
- Quality dashboards

Suggested request flow:

1. Frontend calls backend API.
2. Backend validates payload and enriches metadata.
3. Backend calls prediction service.
4. Prediction service loads active model from memory or cache.
5. Prediction service returns result and logs metadata.
6. Backend persists transaction and responds to frontend.

Suggested implementation stack:

- API Gateway / BFF: FastAPI
- Prediction service: FastAPI or Flask kept minimal
- Training service: batch worker with Celery, Prefect, Airflow, or Kubeflow
- Registry/artifacts: MLflow + S3
- Observability: Prometheus + Grafana + OpenTelemetry

## 16. Development Plan Step-by-Step

### Phase 1: Stabilize the Current Repository

1. Remove duplicated application entrypoints and keep one canonical runtime module.
2. Implement `src/pipeline/train_pipeline.py` as the formal training orchestration layer.
3. Fix logging configuration so logs write to files, not nested timestamped directories.
4. Move dataset path, artifact paths, host, and port to configuration.
5. Add `Gunicorn` or `Uvicorn` production server configuration.
6. Fix deployment port mismatch between app and workflow.
7. Remove unnecessary `awscli` from runtime image unless truly required.

### Phase 2: Improve Code Quality

1. Add `pytest`.
2. Add unit tests for:
   - preprocessing
   - prediction pipeline
   - model loading
   - schema validation
3. Add linting and formatting:
   - `ruff`
   - `black`
   - optional `mypy`
4. Replace placeholder GitHub Actions steps with real checks.
5. Add `.env.example` and typed settings management.

### Phase 3: Make ML Training Reproducible

1. Introduce a dedicated config for training runs.
2. Version datasets and artifacts.
3. Separate train, validation, and test sets properly.
4. Track experiments with MLflow.
5. Persist full evaluation reports, not only the best model.
6. Add residual analysis and subgroup evaluation.
7. Add deterministic seeds where possible.

### Phase 4: Build a Real Prediction API

1. Introduce FastAPI.
2. Create request/response schemas with Pydantic.
3. Keep the model loaded in memory at startup.
4. Add:
   - `POST /predictions`
   - `GET /health`
   - `GET /model-info`
5. Add request logging and latency measurement.
6. Add graceful error handling and structured responses.

### Phase 5: Add Persistence

1. Add PostgreSQL.
2. Store prediction inputs, outputs, model version, and timestamps.
3. Add Alembic migrations.
4. Add repository/service layers for DB access.

### Phase 6: Build the Frontend

1. Create a Next.js frontend.
2. Build a prediction form with validation.
3. Add result pages and history views.
4. Add admin pages for model/version visibility.
5. Connect frontend to backend APIs.

### Phase 7: Introduce MLOps

1. Add model registry and artifact storage.
2. Add scheduled retraining pipeline.
3. Add staging and production model promotion flow.
4. Add drift and model-quality monitoring.
5. Add rollback support for model versions.

### Phase 8: Harden Deployment

1. Containerize backend and frontend separately.
2. Deploy behind a reverse proxy or ingress.
3. Add health checks and readiness probes.
4. Add secrets management.
5. Add monitoring, dashboards, and alerts.
6. Add autoscaling if traffic requires it.

### Phase 9: Governance and Security

1. Add authentication and role-based access control.
2. Protect admin and training endpoints.
3. Add audit logging.
4. Review data privacy and fairness implications.
5. Add dependency and image vulnerability scanning.

## Current Architecture Summary

Current architecture:

- Monolithic Flask app
- Disk-based artifacts
- Offline training embedded in component script
- HTML form UI
- Basic Docker support
- Partial AWS deployment scaffolding

Recommended target architecture:

- Next.js frontend
- FastAPI backend/BFF
- Dedicated inference service
- Separate training and model management workflows
- PostgreSQL metadata store
- Object storage for artifacts
- MLflow model registry
- Production CI/CD with tests and observability

## Key Risks in the Current Repository

- Training and evaluation are not production-reproducible.
- Deployment configuration is internally inconsistent.
- CI does not validate code quality or correctness.
- The app reloads model artifacts on each request.
- There is no schema enforcement for inference payloads.
- There is no model registry or traceable model promotion flow.
- Test-set leakage risk exists because model selection uses the held-out test split.
- Logging implementation is flawed.

## Final Assessment

This repository is a solid educational ML project and a reasonable prototype for student score prediction. It demonstrates the standard building blocks of a tabular ML app: ingestion, preprocessing, model comparison, serialization, inference, and a simple UI. However, it stops well short of a production-grade architecture.

To move it to production, the main work is not inventing better models. The main work is system design:

- API-first backend design
- frontend separation
- database-backed metadata
- model lifecycle management
- observability
- secure deployment
- reliable CI/CD
- reproducible MLOps

That is the correct next step for this repository.
