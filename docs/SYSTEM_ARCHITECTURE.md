# System Architecture

## Overview

The Student Score Prediction Platform is a production-grade machine learning system designed to predict student math scores based on demographic and academic features. This document describes the high-level architecture, system components, and technology decisions.

**System Purpose**: Provide real-time predictions for student math scores using a trained ML model, with support for model versioning, retraining, and monitoring.

**Target Users**:

- End Users: Students, educators, administrators seeking score predictions
- ML Engineers: Managing model training and deployment
- System Administrators: Monitoring and maintaining the platform

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              PRESENTATION LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        Next.js Frontend (Port 3000)                      │   │
│  │   • Landing Page        • Prediction Form       • Results Display       │   │
│  │   • Prediction History  • Admin Dashboard       • Model Management      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ HTTPS/REST
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                 FastAPI Backend / API Gateway (Port 8000)                │   │
│  │   • Authentication & Authorization    • Request Validation              │   │
│  │   • Rate Limiting                     • Request Routing                 │   │
│  │   • Response Aggregation              • Audit Logging                   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
              ┌─────────────────────────┼─────────────────────────┐
              │ HTTP/REST              │ HTTP/REST              │ Celery/Redis
              ▼                         ▼                         ▼
┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐
│   ML Prediction Service │ │     Model Registry      │ │   Training Pipeline     │
│      (Port 8001)        │ │   MLflow (Port 5000)    │ │   Service (Port 8002)   │
│                         │ │                         │ │                         │
│ • Feature Transformation│ │ • Model Versioning     │ │ • Data Ingestion        │
│ • Model Loading/Caching │ │ • Artifact Storage     │ │ • Data Transformation   │
│ • Real-time Inference   │ │ • Stage Management     │ │ • Model Training        │
│ • Metrics Collection    │ │ • Experiment Tracking  │ │ • Model Evaluation      │
└───────────┬─────────────┘ └───────────┬─────────────┘ └───────────┬─────────────┘
            │                           │                           │
            └───────────────────────────┼───────────────────────────┘
                                        │
              ┌─────────────────────────┼─────────────────────────┐
              ▼                         ▼                         ▼
┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐
│      PostgreSQL         │ │         Redis           │ │    Object Storage       │
│     (Port 5432)         │ │      (Port 6379)        │ │   S3/MinIO (Port 9000)  │
│                         │ │                         │ │                         │
│ • User Data             │ │ • Session Cache         │ │ • Model Artifacts       │
│ • Prediction Records    │ │ • Task Queue            │ │ • Preprocessor Files    │
│ • Training Metadata     │ │ • Rate Limiting         │ │ • Training Datasets     │
│ • Audit Logs            │ │ • Model Cache           │ │ • Evaluation Reports    │
└─────────────────────────┘ └─────────────────────────┘ └─────────────────────────┘
```

---

## System Components

### 1. Frontend Application

| Attribute            | Value                                                       |
| -------------------- | ----------------------------------------------------------- |
| **Technology**       | Next.js 14 with React 18, TypeScript                        |
| **Styling**          | Tailwind CSS                                                |
| **State Management** | Zustand / React Query                                       |
| **Purpose**          | User interface for predictions, history, and administration |

**Key Features**:

- Server-side rendering (SSR) for SEO and performance
- Client-side form validation with Zod
- Responsive design for mobile and desktop
- Protected routes for authenticated users
- Admin dashboard for model management

### 2. API Gateway

| Attribute      | Value                                                          |
| -------------- | -------------------------------------------------------------- |
| **Technology** | FastAPI with Python 3.11+                                      |
| **Server**     | Uvicorn (development), Gunicorn + Uvicorn workers (production) |
| **Purpose**    | Central entry point for all API requests                       |

**Key Features**:

- JWT-based authentication
- Request/response validation with Pydantic
- Rate limiting per user/IP
- Automatic OpenAPI documentation
- Health check endpoints
- Request correlation IDs for tracing

### 3. ML Prediction Service

| Attribute        | Value                           |
| ---------------- | ------------------------------- |
| **Technology**   | FastAPI with Python 3.11+       |
| **ML Framework** | scikit-learn, XGBoost, CatBoost |
| **Purpose**      | Real-time model inference       |

**Key Features**:

- Model and preprocessor caching in memory
- Feature transformation pipeline
- Sub-100ms inference latency (p99)
- Automatic model refresh on registry update
- Prometheus metrics endpoint

### 4. Training Pipeline Service

| Attribute      | Value                                      |
| -------------- | ------------------------------------------ |
| **Technology** | FastAPI + Celery with Python 3.11+         |
| **Task Queue** | Redis-backed Celery                        |
| **Purpose**    | Asynchronous model training and evaluation |

**Key Features**:

- Configurable training pipelines
- Hyperparameter tuning with GridSearchCV
- Multi-model comparison
- Automatic model registration to MLflow
- Training run monitoring and logging

### 5. Model Registry (MLflow)

| Attribute          | Value                                     |
| ------------------ | ----------------------------------------- |
| **Technology**     | MLflow 2.9+                               |
| **Backend Store**  | PostgreSQL                                |
| **Artifact Store** | S3/MinIO                                  |
| **Purpose**        | Model versioning and lifecycle management |

**Key Features**:

- Model versioning (v1.0.0, v1.1.0, etc.)
- Stage management (Staging → Production → Archived)
- Experiment tracking
- Artifact storage for models and preprocessors
- Model comparison and rollback support

### 6. Data Stores

#### PostgreSQL (Primary Database)

- Stores all persistent application data
- User accounts and authentication
- Prediction requests and results
- Training run metadata
- Audit logs

#### Redis (Cache and Queue)

- Session caching
- API response caching
- Celery task queue broker
- Rate limiting counters
- Real-time model version cache

#### S3/MinIO (Object Storage)

- Trained model artifacts (.pkl, .joblib)
- Preprocessor objects
- Training datasets (versioned)
- Evaluation reports and visualizations

---

## Data Flow

### Prediction Request Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  User    │────▶│ Frontend │────▶│   API    │────▶│    ML    │────▶│  Model   │
│          │     │          │     │ Gateway  │     │ Service  │     │ Registry │
└──────────┘     └──────────┘     └──────────┘     └──────────┘     └──────────┘
                                        │                │
                                        │                │
                                        ▼                ▼
                                  ┌──────────┐     ┌──────────┐
                                  │PostgreSQL│     │  Redis   │
                                  │(logging) │     │ (cache)  │
                                  └──────────┘     └──────────┘
```

**Step-by-step**:

1. User submits prediction form on frontend
2. Frontend validates input and sends POST to API Gateway
3. API Gateway authenticates request (if required)
4. API Gateway forwards to ML Prediction Service
5. ML Service loads model from cache (or fetches from registry)
6. ML Service transforms features and runs inference
7. Result returns through API Gateway to frontend
8. API Gateway logs prediction to PostgreSQL

### Training Pipeline Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Admin   │────▶│   API    │────▶│  Celery  │────▶│ Training │────▶│  MLflow  │
│          │     │ Gateway  │     │  Worker  │     │ Pipeline │     │ Registry │
└──────────┘     └──────────┘     └──────────┘     └──────────┘     └──────────┘
                                                         │                │
                                                         │                │
                                                         ▼                ▼
                                                   ┌──────────┐     ┌──────────┐
                                                   │PostgreSQL│     │  S3/MinIO│
                                                   │(metadata)│     │(artifacts│
                                                   └──────────┘     └──────────┘
```

**Step-by-step**:

1. Admin triggers training run via API
2. API Gateway enqueues task to Celery
3. Celery worker picks up task
4. Training pipeline executes stages:
   - Data ingestion from source
   - Data transformation and feature engineering
   - Model training with hyperparameter search
   - Model evaluation on test set
5. Best model registered to MLflow
6. Model artifacts uploaded to S3
7. Training metadata logged to PostgreSQL
8. Admin notified of completion

### Model Promotion Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Admin   │────▶│   API    │────▶│  MLflow  │────▶│ ML Svc   │
│ (review) │     │ Gateway  │     │ Registry │     │ (reload) │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
      │                                                  │
      │                                                  │
      ▼                                                  ▼
┌──────────────────────────────────────────────────────────────┐
│                Production Traffic Using New Model             │
└──────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Backend Technologies

| Category          | Technology | Version | Purpose                  |
| ----------------- | ---------- | ------- | ------------------------ |
| **Runtime**       | Python     | 3.11+   | Primary language         |
| **Web Framework** | FastAPI    | 0.109+  | REST API development     |
| **ASGI Server**   | Uvicorn    | 0.27+   | Development server       |
| **WSGI Server**   | Gunicorn   | 21+     | Production server        |
| **ORM**           | SQLAlchemy | 2.0+    | Database access          |
| **Migrations**    | Alembic    | 1.13+   | Database migrations      |
| **Validation**    | Pydantic   | 2.5+    | Request/response schemas |
| **Task Queue**    | Celery     | 5.3+    | Async task processing    |
| **Auth**          | PyJWT      | 2.8+    | JWT token handling       |

### ML/Data Technologies

| Category              | Technology   | Version | Purpose                       |
| --------------------- | ------------ | ------- | ----------------------------- |
| **ML Core**           | scikit-learn | 1.4+    | Model training, preprocessing |
| **Gradient Boosting** | XGBoost      | 2.0+    | Gradient boosting models      |
| **Gradient Boosting** | CatBoost     | 1.2+    | Categorical boosting models   |
| **Data Processing**   | pandas       | 2.1+    | Data manipulation             |
| **Numerical**         | NumPy        | 1.26+   | Numerical operations          |
| **Model Registry**    | MLflow       | 2.9+    | Model versioning              |
| **Serialization**     | joblib/dill  | Latest  | Model persistence             |

### Frontend Technologies

| Category          | Technology      | Version | Purpose                  |
| ----------------- | --------------- | ------- | ------------------------ |
| **Framework**     | Next.js         | 14+     | React framework with SSR |
| **UI Library**    | React           | 18+     | Component library        |
| **Language**      | TypeScript      | 5+      | Type-safe JavaScript     |
| **Styling**       | Tailwind CSS    | 3.4+    | Utility-first CSS        |
| **Forms**         | React Hook Form | 7+      | Form management          |
| **Validation**    | Zod             | 3+      | Schema validation        |
| **State**         | Zustand         | 4+      | Global state             |
| **Data Fetching** | TanStack Query  | 5+      | Server state management  |

### Infrastructure Technologies

| Category             | Technology     | Version | Purpose                    |
| -------------------- | -------------- | ------- | -------------------------- |
| **Database**         | PostgreSQL     | 15+     | Primary data store         |
| **Cache/Queue**      | Redis          | 7+      | Caching and message broker |
| **Object Storage**   | MinIO/S3       | Latest  | Artifact storage           |
| **Containerization** | Docker         | 24+     | Application packaging      |
| **Orchestration**    | Kubernetes     | 1.28+   | Container orchestration    |
| **Reverse Proxy**    | Nginx/Traefik  | Latest  | Load balancing, TLS        |
| **CI/CD**            | GitHub Actions | N/A     | Automation pipeline        |

### Observability Stack

| Category          | Technology    | Purpose                 |
| ----------------- | ------------- | ----------------------- |
| **Metrics**       | Prometheus    | Metrics collection      |
| **Visualization** | Grafana       | Dashboards and alerting |
| **Logging**       | Loki          | Log aggregation         |
| **Tracing**       | OpenTelemetry | Distributed tracing     |

---

## Security Architecture

### Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│   API    │────▶│PostgreSQL│
│          │     │ Gateway  │     │ (users)  │
└──────────┘     └──────────┘     └──────────┘
     │                │
     │                │
     ▼                ▼
┌──────────┐     ┌──────────┐
│   JWT    │     │  Redis   │
│  Token   │     │(sessions)│
└──────────┘     └──────────┘
```

**Security Measures**:

- JWT tokens with short expiry (15 minutes access, 7 days refresh)
- Password hashing with bcrypt
- Rate limiting to prevent brute force
- CORS configuration for frontend domain only
- HTTPS/TLS in production
- Input validation on all endpoints
- SQL injection prevention via ORM
- Secrets management via environment variables

### Network Security

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Public Internet                              │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                         ┌─────▼─────┐
                         │CloudFlare │ ◀── DDoS Protection, WAF
                         │   / CDN   │
                         └─────┬─────┘
                               │
                         ┌─────▼─────┐
                         │    ALB    │ ◀── TLS Termination
                         │           │
                         └─────┬─────┘
                               │
┌──────────────────────────────┼──────────────────────────────────────┐
│                         VPC  │  Private Subnets                      │
│                              │                                       │
│  ┌───────────┐  ┌───────────▼───────────┐  ┌───────────────────┐   │
│  │ Frontend  │  │     API Gateway       │  │   ML Services     │   │
│  │   Pods    │  │        Pods           │  │      Pods         │   │
│  └───────────┘  └───────────────────────┘  └───────────────────┘   │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │              Data Layer (Private Subnet Only)                  │  │
│  │   PostgreSQL │ Redis │ S3/MinIO │ MLflow                      │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Scalability Considerations

### Horizontal Scaling

| Component         | Scaling Strategy                     | Min       | Max        |
| ----------------- | ------------------------------------ | --------- | ---------- |
| Frontend          | Kubernetes HPA based on CPU          | 2         | 10         |
| API Gateway       | Kubernetes HPA based on CPU/requests | 2         | 20         |
| ML Prediction     | Kubernetes HPA based on latency      | 3         | 30         |
| Training Pipeline | Manual scaling (job-based)           | 1         | 5          |
| PostgreSQL        | Vertical + Read Replicas             | 1 primary | 3 replicas |
| Redis             | Cluster mode                         | 3 nodes   | 6 nodes    |

### Performance Targets

| Metric                   | Target     | Measurement             |
| ------------------------ | ---------- | ----------------------- |
| Prediction Latency (p50) | < 50ms     | End-to-end API response |
| Prediction Latency (p99) | < 100ms    | End-to-end API response |
| API Gateway Throughput   | 1000 req/s | Per instance            |
| System Availability      | 99.9%      | Monthly uptime          |
| Training Time            | < 30 min   | Full pipeline execution |

---

## Deployment Environments

| Environment    | Purpose                | Infrastructure         |
| -------------- | ---------------------- | ---------------------- |
| **Local**      | Development            | Docker Compose         |
| **CI/CD**      | Testing                | GitHub Actions runners |
| **Staging**    | Pre-production testing | AWS EKS (small)        |
| **Production** | Live traffic           | AWS EKS (scaled)       |

---

## Document History

| Version | Date       | Author            | Changes         |
| ------- | ---------- | ----------------- | --------------- |
| 1.0     | 2024-01-15 | Architecture Team | Initial version |
