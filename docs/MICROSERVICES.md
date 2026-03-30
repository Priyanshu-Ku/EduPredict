# Microservices Architecture

## Overview

The Student Score Prediction Platform follows a microservices architecture pattern, decomposing the system into loosely coupled, independently deployable services. Each service has a single responsibility and communicates via well-defined APIs.

**Architecture Style**: Microservices with API Gateway pattern
**Communication**: Synchronous (REST/HTTP) + Asynchronous (Message Queue)
**Deployment**: Containerized services orchestrated by Kubernetes

---

## Service Inventory

| Service                   | Technology       | Port      | Replicas (Prod) | Health Endpoint      |
| ------------------------- | ---------------- | --------- | --------------- | -------------------- |
| Frontend                  | Next.js 14       | 3000      | 2-10            | `/api/health`        |
| API Gateway               | FastAPI          | 8000      | 2-20            | `/health`            |
| ML Prediction Service     | FastAPI          | 8001      | 3-30            | `/health`            |
| Training Pipeline Service | FastAPI + Celery | 8002      | 1-5             | `/health`            |
| Celery Worker             | Celery           | N/A       | 2-10            | N/A                  |
| Model Registry            | MLflow           | 5000      | 2               | `/health`            |
| PostgreSQL                | PostgreSQL 15    | 5432      | 1+replicas      | pg_isready           |
| Redis                     | Redis 7          | 6379      | 3 (cluster)     | PING                 |
| Object Storage            | MinIO            | 9000/9001 | 3               | `/minio/health/live` |

---

## Service Detailed Specifications

### 1. Frontend Service

**Purpose**: Serve the user interface for the prediction platform.

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND SERVICE                             │
├─────────────────────────────────────────────────────────────────┤
│  Technology: Next.js 14, React 18, TypeScript                   │
│  Port: 3000                                                      │
│  Protocol: HTTP/HTTPS                                            │
├─────────────────────────────────────────────────────────────────┤
│  RESPONSIBILITIES:                                               │
│  • Render user interface (SSR + CSR)                            │
│  • Handle user interactions                                      │
│  • Client-side form validation                                  │
│  • Session management (client-side)                             │
│  • API communication with backend                               │
├─────────────────────────────────────────────────────────────────┤
│  PAGES SERVED:                                                   │
│  • /                  - Landing page                            │
│  • /predict           - Prediction form                         │
│  • /results/[id]      - Prediction result                       │
│  • /history           - User history                            │
│  • /login             - Authentication                          │
│  • /register          - User registration                       │
│  • /admin/*           - Admin dashboard                         │
├─────────────────────────────────────────────────────────────────┤
│  DEPENDENCIES:                                                   │
│  • API Gateway (for all backend communication)                  │
├─────────────────────────────────────────────────────────────────┤
│  ENVIRONMENT VARIABLES:                                          │
│  • NEXT_PUBLIC_API_URL - API Gateway URL                        │
│  • NEXT_PUBLIC_APP_ENV - Environment name                       │
└─────────────────────────────────────────────────────────────────┘
```

**Scaling Triggers**:

- CPU utilization > 70%
- Memory utilization > 80%

---

### 2. API Gateway Service

**Purpose**: Central entry point for all API requests. Handles authentication, routing, and request aggregation.

```
┌─────────────────────────────────────────────────────────────────┐
│                     API GATEWAY SERVICE                          │
├─────────────────────────────────────────────────────────────────┤
│  Technology: FastAPI, Python 3.11+, Uvicorn                     │
│  Port: 8000                                                      │
│  Protocol: HTTP/HTTPS (REST)                                     │
├─────────────────────────────────────────────────────────────────┤
│  RESPONSIBILITIES:                                               │
│  • Authentication & Authorization (JWT)                         │
│  • Request validation (Pydantic schemas)                        │
│  • Rate limiting (per user, per IP)                             │
│  • Request routing to downstream services                       │
│  • Response aggregation                                         │
│  • Audit logging                                                │
│  • CORS handling                                                │
│  • API versioning (/api/v1/*)                                   │
├─────────────────────────────────────────────────────────────────┤
│  API ROUTES:                                                     │
│  • /api/v1/predictions/*  - Prediction operations               │
│  • /api/v1/models/*       - Model management                    │
│  • /api/v1/training/*     - Training operations                 │
│  • /api/v1/users/*        - User management                     │
│  • /api/v1/auth/*         - Authentication                      │
│  • /api/v1/admin/*        - Admin operations                    │
│  • /health                - Health check                        │
│  • /ready                 - Readiness check                     │
│  • /docs                  - OpenAPI documentation               │
├─────────────────────────────────────────────────────────────────┤
│  DEPENDENCIES:                                                   │
│  • PostgreSQL (user data, predictions, audit logs)              │
│  • Redis (session cache, rate limiting)                         │
│  • ML Prediction Service (inference requests)                   │
│  • Training Pipeline Service (training triggers)                │
│  • MLflow (model metadata)                                      │
├─────────────────────────────────────────────────────────────────┤
│  ENVIRONMENT VARIABLES:                                          │
│  • DATABASE_URL          - PostgreSQL connection                │
│  • REDIS_URL             - Redis connection                     │
│  • ML_SERVICE_URL        - ML Prediction Service URL            │
│  • TRAINING_SERVICE_URL  - Training Pipeline URL                │
│  • MLFLOW_TRACKING_URI   - MLflow server URL                    │
│  • JWT_SECRET_KEY        - JWT signing key                      │
│  • JWT_ALGORITHM         - JWT algorithm (HS256)                │
│  • CORS_ORIGINS          - Allowed origins                      │
└─────────────────────────────────────────────────────────────────┘
```

**Scaling Triggers**:

- Request rate > 500 req/s per instance
- CPU utilization > 70%
- Response latency p99 > 200ms

---

### 3. ML Prediction Service

**Purpose**: Execute real-time model inference. Optimized for low-latency predictions.

```
┌─────────────────────────────────────────────────────────────────┐
│                   ML PREDICTION SERVICE                          │
├─────────────────────────────────────────────────────────────────┤
│  Technology: FastAPI, Python 3.11+, scikit-learn                │
│  Port: 8001                                                      │
│  Protocol: HTTP (REST)                                           │
├─────────────────────────────────────────────────────────────────┤
│  RESPONSIBILITIES:                                               │
│  • Load trained ML models from registry                         │
│  • Cache models in memory for fast inference                    │
│  • Transform input features using preprocessor                  │
│  • Execute model predictions                                    │
│  • Return prediction results with metadata                      │
│  • Expose Prometheus metrics                                    │
│  • Automatic model refresh on version change                    │
├─────────────────────────────────────────────────────────────────┤
│  API ROUTES:                                                     │
│  • POST /predict         - Execute prediction                   │
│  • GET  /health          - Health check                         │
│  • GET  /model-info      - Current model metadata               │
│  • GET  /metrics         - Prometheus metrics                   │
├─────────────────────────────────────────────────────────────────┤
│  INTERNAL COMPONENTS:                                            │
│  • ModelLoader           - Loads model from MLflow/S3           │
│  • FeatureTransformer    - Applies preprocessing pipeline       │
│  • Predictor             - Executes inference                   │
│  • ModelCache            - In-memory model caching              │
│  • MetricsCollector      - Prometheus metrics                   │
├─────────────────────────────────────────────────────────────────┤
│  DEPENDENCIES:                                                   │
│  • MLflow (model artifacts)                                     │
│  • S3/MinIO (model files)                                       │
│  • Redis (model version cache)                                  │
├─────────────────────────────────────────────────────────────────┤
│  ENVIRONMENT VARIABLES:                                          │
│  • MLFLOW_TRACKING_URI   - MLflow server URL                    │
│  • MODEL_NAME            - Registered model name                │
│  • S3_ENDPOINT_URL       - S3/MinIO endpoint                    │
│  • AWS_ACCESS_KEY_ID     - S3 access key                        │
│  • AWS_SECRET_ACCESS_KEY - S3 secret key                        │
│  • REDIS_URL             - Redis for model version cache        │
│  • MODEL_REFRESH_INTERVAL- Cache refresh interval (seconds)    │
├─────────────────────────────────────────────────────────────────┤
│  PERFORMANCE REQUIREMENTS:                                       │
│  • Prediction latency p50: < 20ms                               │
│  • Prediction latency p99: < 50ms                               │
│  • Model load time: < 5s                                        │
│  • Memory footprint: < 512MB per instance                       │
└─────────────────────────────────────────────────────────────────┘
```

**Scaling Triggers**:

- Prediction latency p99 > 50ms
- CPU utilization > 60%
- Request queue depth > 100

---

### 4. Training Pipeline Service

**Purpose**: Execute asynchronous model training jobs. Manages the full training lifecycle.

```
┌─────────────────────────────────────────────────────────────────┐
│                  TRAINING PIPELINE SERVICE                       │
├─────────────────────────────────────────────────────────────────┤
│  Technology: FastAPI + Celery, Python 3.11+                     │
│  Port: 8002 (API), N/A (workers)                                │
│  Protocol: HTTP (REST), AMQP/Redis (task queue)                 │
├─────────────────────────────────────────────────────────────────┤
│  RESPONSIBILITIES:                                               │
│  • Accept training job requests                                 │
│  • Queue training tasks to Celery                               │
│  • Execute training pipeline stages                             │
│  • Track training progress and status                           │
│  • Register trained models to MLflow                            │
│  • Store training artifacts to S3                               │
│  • Notify on training completion                                │
├─────────────────────────────────────────────────────────────────┤
│  API ROUTES:                                                     │
│  • POST /train           - Start training job                   │
│  • GET  /status/{job_id} - Get job status                       │
│  • POST /cancel/{job_id} - Cancel training job                  │
│  • GET  /health          - Health check                         │
├─────────────────────────────────────────────────────────────────┤
│  CELERY TASKS:                                                   │
│  • data_ingestion_task   - Load and validate dataset            │
│  • data_transform_task   - Feature engineering                  │
│  • model_training_task   - Train candidate models               │
│  • model_evaluation_task - Evaluate on test set                 │
│  • model_registration_task - Register to MLflow                 │
├─────────────────────────────────────────────────────────────────┤
│  PIPELINE STAGES:                                                │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐ │
│  │   Data     │─▶│   Data     │─▶│   Model    │─▶│   Model   │ │
│  │ Ingestion  │  │ Transform  │  │  Training  │  │ Evaluation│ │
│  └────────────┘  └────────────┘  └────────────┘  └─────┬─────┘ │
│                                                         │       │
│                                                         ▼       │
│                                                  ┌───────────┐  │
│                                                  │   Model   │  │
│                                                  │Registration│ │
│                                                  └───────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  DEPENDENCIES:                                                   │
│  • PostgreSQL (training metadata, run history)                  │
│  • Redis (Celery broker, task results)                          │
│  • S3/MinIO (datasets, artifacts)                               │
│  • MLflow (model registration, experiment tracking)             │
├─────────────────────────────────────────────────────────────────┤
│  ENVIRONMENT VARIABLES:                                          │
│  • DATABASE_URL          - PostgreSQL connection                │
│  • CELERY_BROKER_URL     - Redis broker URL                     │
│  • CELERY_RESULT_BACKEND - Redis result backend                 │
│  • MLFLOW_TRACKING_URI   - MLflow server URL                    │
│  • S3_ENDPOINT_URL       - S3/MinIO endpoint                    │
│  • S3_BUCKET_DATASETS    - Dataset bucket name                  │
│  • S3_BUCKET_ARTIFACTS   - Artifact bucket name                 │
└─────────────────────────────────────────────────────────────────┘
```

**Scaling Triggers**:

- Manual scaling based on training queue depth
- Worker CPU utilization > 80%

---

### 5. Model Registry (MLflow)

**Purpose**: Manage model versions, artifacts, and lifecycle stages.

```
┌─────────────────────────────────────────────────────────────────┐
│                     MODEL REGISTRY (MLFLOW)                      │
├─────────────────────────────────────────────────────────────────┤
│  Technology: MLflow 2.9+                                         │
│  Port: 5000                                                      │
│  Protocol: HTTP (REST)                                           │
├─────────────────────────────────────────────────────────────────┤
│  RESPONSIBILITIES:                                               │
│  • Store and version ML models                                  │
│  • Track experiments and runs                                   │
│  • Manage model stages (Staging/Production/Archived)            │
│  • Store model artifacts to S3                                  │
│  • Provide model lineage and metadata                           │
│  • Enable model comparison                                      │
├─────────────────────────────────────────────────────────────────┤
│  MODEL STAGES:                                                   │
│  • None       - Newly registered, not staged                    │
│  • Staging    - Under review/testing                            │
│  • Production - Active in production                            │
│  • Archived   - Deprecated, kept for history                    │
├─────────────────────────────────────────────────────────────────┤
│  STORED ARTIFACTS:                                               │
│  • model.pkl / model.joblib  - Trained model file               │
│  • preprocessor.pkl          - Feature preprocessor             │
│  • requirements.txt          - Python dependencies              │
│  • MLmodel                   - MLflow model metadata            │
│  • metrics.json              - Evaluation metrics               │
├─────────────────────────────────────────────────────────────────┤
│  DEPENDENCIES:                                                   │
│  • PostgreSQL (backend store - experiments, runs, metrics)      │
│  • S3/MinIO (artifact store - model files)                      │
├─────────────────────────────────────────────────────────────────┤
│  ENVIRONMENT VARIABLES:                                          │
│  • MLFLOW_BACKEND_STORE_URI - PostgreSQL connection             │
│  • MLFLOW_ARTIFACT_ROOT     - S3 artifact location              │
│  • AWS_ACCESS_KEY_ID        - S3 access key                     │
│  • AWS_SECRET_ACCESS_KEY    - S3 secret key                     │
└─────────────────────────────────────────────────────────────────┘
```

---

### 6. Data Services (PostgreSQL, Redis, MinIO)

```
┌─────────────────────────────────────────────────────────────────┐
│                      POSTGRESQL DATABASE                         │
├─────────────────────────────────────────────────────────────────┤
│  Technology: PostgreSQL 15                                       │
│  Port: 5432                                                      │
│  Protocol: PostgreSQL wire protocol                              │
├─────────────────────────────────────────────────────────────────┤
│  STORES:                                                         │
│  • users              - User accounts                           │
│  • prediction_requests- Prediction input data                   │
│  • prediction_results - Prediction outputs                      │
│  • models             - Model metadata                          │
│  • training_runs      - Training job history                    │
│  • audit_logs         - System audit trail                      │
├─────────────────────────────────────────────────────────────────┤
│  CONFIGURATION:                                                  │
│  • Max connections: 200                                         │
│  • Shared buffers: 256MB                                        │
│  • Connection pooling: PgBouncer                                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         REDIS CACHE                              │
├─────────────────────────────────────────────────────────────────┤
│  Technology: Redis 7 (Cluster mode)                              │
│  Port: 6379                                                      │
│  Protocol: Redis protocol (RESP)                                 │
├─────────────────────────────────────────────────────────────────┤
│  USE CASES:                                                      │
│  • Session caching (TTL: 24 hours)                              │
│  • API response caching (TTL: 5 minutes)                        │
│  • Rate limiting counters (sliding window)                      │
│  • Celery message broker                                        │
│  • Celery result backend                                        │
│  • Model version cache (TTL: 60 seconds)                        │
├─────────────────────────────────────────────────────────────────┤
│  CONFIGURATION:                                                  │
│  • Memory limit: 1GB per node                                   │
│  • Eviction policy: allkeys-lru                                 │
│  • Persistence: AOF (appendonly)                                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      OBJECT STORAGE (MINIO/S3)                   │
├─────────────────────────────────────────────────────────────────┤
│  Technology: MinIO (dev) / AWS S3 (prod)                         │
│  Port: 9000 (API), 9001 (Console)                               │
│  Protocol: S3-compatible REST API                                │
├─────────────────────────────────────────────────────────────────┤
│  BUCKETS:                                                        │
│  • mlflow-artifacts   - Model files, preprocessors              │
│  • datasets           - Training datasets (versioned)           │
│  • training-logs      - Training run logs                       │
│  • evaluation-reports - Evaluation visualizations               │
├─────────────────────────────────────────────────────────────────┤
│  LIFECYCLE POLICIES:                                             │
│  • Archived models: Move to Glacier after 90 days               │
│  • Training logs: Delete after 30 days                          │
│  • Evaluation reports: Retain for 1 year                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Service Communication

### Communication Matrix

| From \ To             | Frontend | API Gateway | ML Prediction | Training Pipeline | MLflow | PostgreSQL | Redis | S3     |
| --------------------- | -------- | ----------- | ------------- | ----------------- | ------ | ---------- | ----- | ------ |
| **Frontend**          | -        | REST        | -             | -                 | -      | -          | -     | -      |
| **API Gateway**       | -        | -           | REST          | REST              | REST   | SQL        | TCP   | -      |
| **ML Prediction**     | -        | -           | -             | -                 | REST   | -          | TCP   | S3 API |
| **Training Pipeline** | -        | -           | -             | -                 | REST   | SQL        | TCP   | S3 API |
| **Celery Worker**     | -        | -           | -             | -                 | REST   | SQL        | TCP   | S3 API |
| **MLflow**            | -        | -           | -             | -                 | -      | SQL        | -     | S3 API |

### Communication Patterns

#### Synchronous Communication (REST/HTTP)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    SYNCHRONOUS REQUEST FLOW                               │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   Frontend ─────────▶ API Gateway ─────────▶ ML Prediction Service       │
│                            │                                              │
│                            │                                              │
│                            └─────────────▶ MLflow (model info)           │
│                                                                           │
│   Characteristics:                                                        │
│   • Request-response pattern                                             │
│   • Timeout: 30 seconds (configurable)                                   │
│   • Retry policy: 3 attempts with exponential backoff                    │
│   • Circuit breaker: Opens after 5 consecutive failures                  │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

#### Asynchronous Communication (Message Queue)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    ASYNCHRONOUS TASK FLOW                                 │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   API Gateway                                                            │
│        │                                                                  │
│        │ (1) Enqueue task                                                │
│        ▼                                                                  │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                     REDIS (Celery Broker)                        │   │
│   │   Queue: training_tasks                                          │   │
│   │   Format: JSON serialized task                                   │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│        │                                                                  │
│        │ (2) Consume task                                                │
│        ▼                                                                  │
│   Celery Worker ────────────▶ Execute Pipeline ────────▶ Store Results  │
│        │                                                                  │
│        │ (3) Store result                                                │
│        ▼                                                                  │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                   REDIS (Celery Result Backend)                  │   │
│   │   Key: celery-task-meta-{task_id}                               │   │
│   │   TTL: 24 hours                                                  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│   Characteristics:                                                        │
│   • Fire-and-forget pattern                                              │
│   • Task visibility timeout: 1 hour                                      │
│   • Max retries: 3                                                       │
│   • Dead letter queue for failed tasks                                   │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

### Internal Service Discovery

In Kubernetes, services discover each other via DNS:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    KUBERNETES SERVICE DISCOVERY                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   Service DNS Names (within cluster):                                    │
│                                                                          │
│   • frontend.ml-platform.svc.cluster.local:3000                         │
│   • api-gateway.ml-platform.svc.cluster.local:8000                      │
│   • ml-prediction.ml-platform.svc.cluster.local:8001                    │
│   • training-pipeline.ml-platform.svc.cluster.local:8002                │
│   • mlflow.ml-platform.svc.cluster.local:5000                           │
│   • postgres.ml-platform.svc.cluster.local:5432                         │
│   • redis.ml-platform.svc.cluster.local:6379                            │
│                                                                          │
│   Short names (within same namespace):                                   │
│                                                                          │
│   • frontend:3000                                                        │
│   • api-gateway:8000                                                     │
│   • ml-prediction:8001                                                   │
│   • training-pipeline:8002                                               │
│   • mlflow:5000                                                          │
│   • postgres:5432                                                        │
│   • redis:6379                                                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Docker Compose Service Discovery

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    DOCKER COMPOSE NETWORKING                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   Network: ml-platform-network (bridge)                                  │
│                                                                          │
│   Service hostnames (within network):                                    │
│                                                                          │
│   • frontend:3000                                                        │
│   • api-gateway:8000                                                     │
│   • ml-prediction:8001                                                   │
│   • training-pipeline:8002                                               │
│   • mlflow:5000                                                          │
│   • postgres:5432                                                        │
│   • redis:6379                                                           │
│   • minio:9000                                                           │
│                                                                          │
│   Host-exposed ports:                                                    │
│                                                                          │
│   • localhost:3000  → frontend                                          │
│   • localhost:8000  → api-gateway                                       │
│   • localhost:5000  → mlflow                                            │
│   • localhost:5432  → postgres                                          │
│   • localhost:6379  → redis                                             │
│   • localhost:9000  → minio (API)                                       │
│   • localhost:9001  → minio (Console)                                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Health Checks and Probes

### Kubernetes Probe Configuration

| Service           | Liveness Probe  | Readiness Probe | Startup Probe   |
| ----------------- | --------------- | --------------- | --------------- |
| Frontend          | GET /api/health | GET /api/health | GET /api/health |
| API Gateway       | GET /health     | GET /ready      | GET /health     |
| ML Prediction     | GET /health     | GET /health     | GET /health     |
| Training Pipeline | GET /health     | GET /health     | GET /health     |
| MLflow            | GET /health     | GET /health     | GET /health     |

### Probe Timing

| Probe Type | Initial Delay | Period | Timeout | Failure Threshold |
| ---------- | ------------- | ------ | ------- | ----------------- |
| Liveness   | 30s           | 10s    | 5s      | 3                 |
| Readiness  | 5s            | 5s     | 3s      | 3                 |
| Startup    | 0s            | 5s     | 3s      | 30                |

### Readiness Check Dependencies

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    API GATEWAY READINESS                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   GET /ready                                                             │
│                                                                          │
│   Checks:                                                                │
│   ✓ PostgreSQL connection                                               │
│   ✓ Redis connection                                                    │
│   ✓ ML Prediction Service reachable                                     │
│                                                                          │
│   Response (healthy):                                                    │
│   {                                                                      │
│     "status": "healthy",                                                 │
│     "checks": {                                                          │
│       "database": "ok",                                                  │
│       "cache": "ok",                                                     │
│       "ml_service": "ok"                                                 │
│     }                                                                    │
│   }                                                                      │
│                                                                          │
│   Response (unhealthy):                                                  │
│   {                                                                      │
│     "status": "unhealthy",                                               │
│     "checks": {                                                          │
│       "database": "ok",                                                  │
│       "cache": "error: connection refused",                              │
│       "ml_service": "ok"                                                 │
│     }                                                                    │
│   }                                                                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Error Handling and Resilience

### Circuit Breaker Pattern

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CIRCUIT BREAKER STATES                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────┐        5 failures       ┌──────────┐                     │
│   │  CLOSED  │ ─────────────────────▶ │   OPEN   │                     │
│   │ (normal) │                         │ (failing)│                     │
│   └────┬─────┘                         └────┬─────┘                     │
│        │                                    │                            │
│        │                                    │ 30 second timeout          │
│        │                                    ▼                            │
│        │                              ┌──────────┐                       │
│        │         success              │HALF-OPEN │                       │
│        └──────────────────────────────│ (testing)│                       │
│                                       └──────────┘                       │
│                                             │                            │
│                                             │ failure                    │
│                                             ▼                            │
│                                       ┌──────────┐                       │
│                                       │   OPEN   │                       │
│                                       └──────────┘                       │
│                                                                          │
│   Configuration:                                                         │
│   • Failure threshold: 5 consecutive failures                           │
│   • Recovery timeout: 30 seconds                                        │
│   • Half-open max calls: 3                                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Retry Policy

| Service Call  | Max Retries | Backoff                           | Timeout |
| ------------- | ----------- | --------------------------------- | ------- |
| ML Prediction | 3           | Exponential (1s, 2s, 4s)          | 10s     |
| Database      | 3           | Exponential (100ms, 200ms, 400ms) | 5s      |
| Redis         | 2           | Fixed (100ms)                     | 1s      |
| MLflow        | 3           | Exponential (1s, 2s, 4s)          | 30s     |
| S3            | 3           | Exponential (1s, 2s, 4s)          | 60s     |

---

## Resource Limits

### Kubernetes Resource Allocation

| Service           | CPU Request | CPU Limit | Memory Request | Memory Limit |
| ----------------- | ----------- | --------- | -------------- | ------------ |
| Frontend          | 100m        | 500m      | 128Mi          | 512Mi        |
| API Gateway       | 200m        | 1000m     | 256Mi          | 1Gi          |
| ML Prediction     | 500m        | 2000m     | 512Mi          | 2Gi          |
| Training Pipeline | 200m        | 500m      | 256Mi          | 512Mi        |
| Celery Worker     | 1000m       | 4000m     | 1Gi            | 4Gi          |
| MLflow            | 200m        | 500m      | 256Mi          | 1Gi          |

---

## Document History

| Version | Date       | Author            | Changes         |
| ------- | ---------- | ----------------- | --------------- |
| 1.0     | 2024-01-15 | Architecture Team | Initial version |
