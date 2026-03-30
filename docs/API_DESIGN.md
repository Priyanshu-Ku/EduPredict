# API Design Specification

## Overview

This document defines the REST API specification for the Student Score Prediction Platform. All APIs follow RESTful principles, use JSON for request/response payloads, and are versioned under `/api/v1/`.

**Base URL**: `https://api.example.com/api/v1`
**Content-Type**: `application/json`
**Authentication**: Bearer Token (JWT)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Predictions API](#predictions-api)
3. [Models API](#models-api)
4. [Training API](#training-api)
5. [Users API](#users-api)
6. [Admin API](#admin-api)
7. [Health & Status API](#health--status-api)
8. [Error Handling](#error-handling)

---

## Authentication

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         JWT AUTHENTICATION FLOW                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   1. Login Request                                                       │
│   ┌──────────┐                    ┌──────────┐                          │
│   │  Client  │ ─── POST /auth/login ──▶ │   API    │                    │
│   │          │     {email, password}    │ Gateway  │                    │
│   └──────────┘                          └────┬─────┘                    │
│                                              │                           │
│   2. Validate Credentials                    │                           │
│                                              ▼                           │
│                                        ┌──────────┐                      │
│                                        │PostgreSQL│                      │
│                                        └────┬─────┘                      │
│                                              │                           │
│   3. Generate Tokens                         │                           │
│                                              ▼                           │
│   ┌──────────┐                    ┌──────────┐                          │
│   │  Client  │ ◀── {access_token, ─── │   API    │                      │
│   │          │     refresh_token}     │ Gateway  │                      │
│   └──────────┘                        └──────────┘                       │
│                                                                          │
│   4. Authenticated Request                                               │
│   ┌──────────┐                    ┌──────────┐                          │
│   │  Client  │ ─── GET /predictions ──▶ │   API    │                    │
│   │          │  Authorization: Bearer   │ Gateway  │                    │
│   └──────────┘  <access_token>          └──────────┘                    │
│                                                                          │
│   5. Token Refresh (when access token expires)                          │
│   ┌──────────┐                    ┌──────────┐                          │
│   │  Client  │ ─── POST /auth/refresh ─▶ │   API    │                   │
│   │          │     {refresh_token}      │ Gateway  │                    │
│   └──────────┘                          └──────────┘                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Token Specifications

| Token Type    | Expiration | Storage                   |
| ------------- | ---------- | ------------------------- |
| Access Token  | 15 minutes | Memory / HTTP-only cookie |
| Refresh Token | 7 days     | HTTP-only cookie          |

### POST /api/v1/auth/register

Register a new user account.

**Authentication**: None

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe"
}
```

**Response (201 Created)**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Error Response (400 Bad Request)**:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email already registered",
    "details": {
      "field": "email",
      "constraint": "unique"
    }
  }
}
```

---

### POST /api/v1/auth/login

Authenticate user and obtain tokens.

**Authentication**: None

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK)**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 900,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

**Error Response (401 Unauthorized)**:

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

---

### POST /api/v1/auth/refresh

Refresh access token using refresh token.

**Authentication**: None (refresh token in body/cookie)

**Request Body**:

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK)**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 900
}
```

---

### POST /api/v1/auth/logout

Invalidate current session.

**Authentication**: Required

**Response (200 OK)**:

```json
{
  "message": "Successfully logged out"
}
```

---

## Predictions API

### POST /api/v1/predictions

Create a new prediction request.

**Authentication**: Optional (anonymous predictions allowed)

**Request Body**:

```json
{
  "gender": "female",
  "race_ethnicity": "group B",
  "parental_level_of_education": "bachelor's degree",
  "lunch": "standard",
  "test_preparation_course": "completed",
  "reading_score": 72,
  "writing_score": 74
}
```

**Field Validations**:

| Field                       | Type   | Required | Constraints                                                                                                           |
| --------------------------- | ------ | -------- | --------------------------------------------------------------------------------------------------------------------- |
| gender                      | string | Yes      | Enum: "male", "female"                                                                                                |
| race_ethnicity              | string | Yes      | Enum: "group A", "group B", "group C", "group D", "group E"                                                           |
| parental_level_of_education | string | Yes      | Enum: "some high school", "high school", "some college", "associate's degree", "bachelor's degree", "master's degree" |
| lunch                       | string | Yes      | Enum: "standard", "free/reduced"                                                                                      |
| test_preparation_course     | string | Yes      | Enum: "none", "completed"                                                                                             |
| reading_score               | number | Yes      | Range: 0-100                                                                                                          |
| writing_score               | number | Yes      | Range: 0-100                                                                                                          |

**Response (201 Created)**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "predicted_math_score": 76.5,
  "confidence_interval": {
    "lower": 71.2,
    "upper": 81.8
  },
  "model": {
    "name": "student-score-predictor",
    "version": "1.2.0",
    "algorithm": "GradientBoostingRegressor"
  },
  "metadata": {
    "latency_ms": 45,
    "request_source": "web",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "input_features": {
    "gender": "female",
    "race_ethnicity": "group B",
    "parental_level_of_education": "bachelor's degree",
    "lunch": "standard",
    "test_preparation_course": "completed",
    "reading_score": 72,
    "writing_score": 74
  }
}
```

**Error Response (422 Unprocessable Entity)**:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "reading_score",
        "message": "Value must be between 0 and 100",
        "received": 150
      }
    ]
  }
}
```

---

### GET /api/v1/predictions

List predictions with pagination and filtering.

**Authentication**: Optional (returns own predictions if authenticated)

**Query Parameters**:

| Parameter  | Type    | Default    | Description                     |
| ---------- | ------- | ---------- | ------------------------------- |
| page       | integer | 1          | Page number                     |
| limit      | integer | 20         | Items per page (max: 100)       |
| sort_by    | string  | created_at | Sort field                      |
| sort_order | string  | desc       | Sort direction: asc, desc       |
| start_date | string  | -          | Filter by start date (ISO 8601) |
| end_date   | string  | -          | Filter by end date (ISO 8601)   |

**Response (200 OK)**:

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "predicted_math_score": 76.5,
      "model_version": "1.2.0",
      "created_at": "2024-01-15T10:30:00Z",
      "input_summary": {
        "gender": "female",
        "reading_score": 72,
        "writing_score": 74
      }
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "predicted_math_score": 82.3,
      "model_version": "1.2.0",
      "created_at": "2024-01-15T09:15:00Z",
      "input_summary": {
        "gender": "male",
        "reading_score": 85,
        "writing_score": 80
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 150,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

---

### GET /api/v1/predictions/{id}

Get a specific prediction by ID.

**Authentication**: Optional

**Path Parameters**:

| Parameter | Type | Description   |
| --------- | ---- | ------------- |
| id        | UUID | Prediction ID |

**Response (200 OK)**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "predicted_math_score": 76.5,
  "confidence_interval": {
    "lower": 71.2,
    "upper": 81.8
  },
  "model": {
    "name": "student-score-predictor",
    "version": "1.2.0",
    "algorithm": "GradientBoostingRegressor"
  },
  "metadata": {
    "latency_ms": 45,
    "request_source": "web",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "input_features": {
    "gender": "female",
    "race_ethnicity": "group B",
    "parental_level_of_education": "bachelor's degree",
    "lunch": "standard",
    "test_preparation_course": "completed",
    "reading_score": 72,
    "writing_score": 74
  },
  "user_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Error Response (404 Not Found)**:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Prediction not found",
    "resource_type": "prediction",
    "resource_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

---

### GET /api/v1/predictions/history

Get prediction history for authenticated user.

**Authentication**: Required

**Query Parameters**: Same as GET /api/v1/predictions

**Response (200 OK)**: Same format as GET /api/v1/predictions

---

### DELETE /api/v1/predictions/{id}

Soft delete a prediction (marks as deleted).

**Authentication**: Required (owner or admin)

**Response (200 OK)**:

```json
{
  "message": "Prediction deleted successfully",
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## Models API

### GET /api/v1/models

List all registered models.

**Authentication**: Required (admin only)

**Query Parameters**:

| Parameter | Type    | Default | Description                                     |
| --------- | ------- | ------- | ----------------------------------------------- |
| status    | string  | -       | Filter by status: staging, production, archived |
| page      | integer | 1       | Page number                                     |
| limit     | integer | 20      | Items per page                                  |

**Response (200 OK)**:

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "student-score-predictor",
      "version": "1.2.0",
      "algorithm": "GradientBoostingRegressor",
      "status": "production",
      "is_active": true,
      "metrics": {
        "r2_score": 0.876,
        "mae": 4.23,
        "rmse": 5.67
      },
      "created_at": "2024-01-10T08:00:00Z",
      "promoted_at": "2024-01-12T14:30:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "student-score-predictor",
      "version": "1.1.0",
      "algorithm": "RandomForestRegressor",
      "status": "archived",
      "is_active": false,
      "metrics": {
        "r2_score": 0.854,
        "mae": 4.89,
        "rmse": 6.12
      },
      "created_at": "2024-01-05T08:00:00Z",
      "promoted_at": "2024-01-07T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 5,
    "total_pages": 1
  }
}
```

---

### GET /api/v1/models/active

Get currently active production model.

**Authentication**: Optional

**Response (200 OK)**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "student-score-predictor",
  "version": "1.2.0",
  "algorithm": "GradientBoostingRegressor",
  "status": "production",
  "metrics": {
    "r2_score": 0.876,
    "mae": 4.23,
    "rmse": 5.67
  },
  "feature_importance": {
    "reading_score": 0.42,
    "writing_score": 0.38,
    "parental_level_of_education": 0.08,
    "test_preparation_course": 0.06,
    "lunch": 0.03,
    "gender": 0.02,
    "race_ethnicity": 0.01
  },
  "training_info": {
    "dataset_version": "v1.0.0",
    "training_samples": 800,
    "test_samples": 200,
    "training_date": "2024-01-10T08:00:00Z"
  }
}
```

---

### GET /api/v1/models/{id}

Get model details by ID.

**Authentication**: Required (admin only)

**Response (200 OK)**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "student-score-predictor",
  "version": "1.2.0",
  "algorithm": "GradientBoostingRegressor",
  "status": "production",
  "is_active": true,
  "artifact_uri": "s3://mlflow-artifacts/1/abc123/artifacts/model",
  "preprocessor_uri": "s3://mlflow-artifacts/1/abc123/artifacts/preprocessor",
  "metrics": {
    "r2_score": 0.876,
    "mae": 4.23,
    "rmse": 5.67,
    "mape": 0.058
  },
  "hyperparameters": {
    "n_estimators": 200,
    "learning_rate": 0.1,
    "max_depth": 5,
    "subsample": 0.8
  },
  "feature_importance": {
    "reading_score": 0.42,
    "writing_score": 0.38
  },
  "training_run_id": "550e8400-e29b-41d4-a716-446655440099",
  "created_at": "2024-01-10T08:00:00Z",
  "promoted_at": "2024-01-12T14:30:00Z"
}
```

---

### POST /api/v1/models/{id}/promote

Promote a model to production.

**Authentication**: Required (admin only)

**Request Body**:

```json
{
  "target_stage": "production",
  "archive_current": true,
  "notes": "Improved R2 score from 0.854 to 0.876"
}
```

**Response (200 OK)**:

```json
{
  "message": "Model promoted successfully",
  "model": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "version": "1.2.0",
    "previous_stage": "staging",
    "current_stage": "production"
  },
  "archived_model": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "version": "1.1.0",
    "previous_stage": "production",
    "current_stage": "archived"
  }
}
```

---

### POST /api/v1/models/{id}/rollback

Rollback to a previous model version.

**Authentication**: Required (admin only)

**Request Body**:

```json
{
  "reason": "Performance degradation detected in production"
}
```

**Response (200 OK)**:

```json
{
  "message": "Rollback completed successfully",
  "active_model": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "version": "1.1.0"
  },
  "deactivated_model": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "version": "1.2.0"
  }
}
```

---

### GET /api/v1/models/{id}/metrics

Get detailed metrics for a model.

**Authentication**: Required (admin only)

**Query Parameters**:

| Parameter | Type   | Default | Description                   |
| --------- | ------ | ------- | ----------------------------- |
| period    | string | 7d      | Time period: 1d, 7d, 30d, 90d |

**Response (200 OK)**:

```json
{
  "model_id": "550e8400-e29b-41d4-a716-446655440000",
  "period": "7d",
  "training_metrics": {
    "r2_score": 0.876,
    "mae": 4.23,
    "rmse": 5.67
  },
  "production_metrics": {
    "total_predictions": 15420,
    "avg_latency_ms": 42,
    "p95_latency_ms": 78,
    "p99_latency_ms": 95,
    "error_rate": 0.001
  },
  "prediction_distribution": {
    "min": 12.5,
    "max": 98.2,
    "mean": 68.4,
    "median": 70.1,
    "std": 15.3
  }
}
```

---

## Training API

### POST /api/v1/training/runs

Trigger a new training run.

**Authentication**: Required (admin only)

**Request Body**:

```json
{
  "run_name": "experiment-2024-01-15",
  "dataset_version": "v1.0.0",
  "config": {
    "models": ["random_forest", "gradient_boosting", "xgboost"],
    "hyperparameter_tuning": true,
    "cv_folds": 5,
    "test_size": 0.2
  },
  "notify_on_completion": true
}
```

**Response (202 Accepted)**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "run_name": "experiment-2024-01-15",
  "status": "pending",
  "created_at": "2024-01-15T10:30:00Z",
  "estimated_duration_minutes": 25,
  "links": {
    "status": "/api/v1/training/runs/550e8400-e29b-41d4-a716-446655440000",
    "logs": "/api/v1/training/runs/550e8400-e29b-41d4-a716-446655440000/logs"
  }
}
```

---

### GET /api/v1/training/runs

List training runs.

**Authentication**: Required (admin only)

**Query Parameters**:

| Parameter | Type    | Default | Description                                           |
| --------- | ------- | ------- | ----------------------------------------------------- |
| status    | string  | -       | Filter by status: pending, running, completed, failed |
| page      | integer | 1       | Page number                                           |
| limit     | integer | 20      | Items per page                                        |

**Response (200 OK)**:

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "run_name": "experiment-2024-01-15",
      "status": "completed",
      "dataset_version": "v1.0.0",
      "best_model": {
        "algorithm": "GradientBoostingRegressor",
        "r2_score": 0.876
      },
      "started_at": "2024-01-15T10:31:00Z",
      "finished_at": "2024-01-15T10:52:00Z",
      "duration_minutes": 21
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 12,
    "total_pages": 1
  }
}
```

---

### GET /api/v1/training/runs/{id}

Get training run details.

**Authentication**: Required (admin only)

**Response (200 OK)**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "run_name": "experiment-2024-01-15",
  "status": "completed",
  "dataset_version": "v1.0.0",
  "config": {
    "models": ["random_forest", "gradient_boosting", "xgboost"],
    "hyperparameter_tuning": true,
    "cv_folds": 5,
    "test_size": 0.2
  },
  "results": {
    "models_evaluated": 3,
    "best_model": {
      "algorithm": "GradientBoostingRegressor",
      "hyperparameters": {
        "n_estimators": 200,
        "learning_rate": 0.1,
        "max_depth": 5
      },
      "metrics": {
        "r2_score": 0.876,
        "mae": 4.23,
        "rmse": 5.67
      }
    },
    "all_models": [
      {
        "algorithm": "GradientBoostingRegressor",
        "r2_score": 0.876
      },
      {
        "algorithm": "RandomForestRegressor",
        "r2_score": 0.854
      },
      {
        "algorithm": "XGBRegressor",
        "r2_score": 0.868
      }
    ]
  },
  "artifacts": {
    "model_uri": "s3://mlflow-artifacts/1/abc123/artifacts/model",
    "logs_uri": "s3://training-logs/experiment-2024-01-15/"
  },
  "started_at": "2024-01-15T10:31:00Z",
  "finished_at": "2024-01-15T10:52:00Z",
  "duration_minutes": 21,
  "created_by": "admin@example.com"
}
```

---

### GET /api/v1/training/runs/{id}/logs

Stream training logs.

**Authentication**: Required (admin only)

**Query Parameters**:

| Parameter | Type    | Default | Description               |
| --------- | ------- | ------- | ------------------------- |
| follow    | boolean | false   | Stream logs in real-time  |
| tail      | integer | 100     | Number of lines to return |

**Response (200 OK)** (non-streaming):

```json
{
  "run_id": "550e8400-e29b-41d4-a716-446655440000",
  "logs": [
    {
      "timestamp": "2024-01-15T10:31:00Z",
      "level": "INFO",
      "message": "Starting training run: experiment-2024-01-15"
    },
    {
      "timestamp": "2024-01-15T10:31:05Z",
      "level": "INFO",
      "message": "Loading dataset version v1.0.0"
    },
    {
      "timestamp": "2024-01-15T10:31:10Z",
      "level": "INFO",
      "message": "Dataset loaded: 1000 rows, 8 columns"
    }
  ]
}
```

---

### POST /api/v1/training/runs/{id}/cancel

Cancel a running training job.

**Authentication**: Required (admin only)

**Response (200 OK)**:

```json
{
  "message": "Training run cancelled",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "cancelled"
}
```

---

## Users API

### GET /api/v1/users/me

Get current user profile.

**Authentication**: Required

**Response (200 OK)**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "stats": {
    "total_predictions": 47,
    "last_prediction_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### PUT /api/v1/users/me

Update current user profile.

**Authentication**: Required

**Request Body**:

```json
{
  "name": "John Smith"
}
```

**Response (200 OK)**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "John Smith",
  "role": "user",
  "updated_at": "2024-01-15T11:00:00Z"
}
```

---

### PUT /api/v1/users/me/password

Change password.

**Authentication**: Required

**Request Body**:

```json
{
  "current_password": "OldPassword123!",
  "new_password": "NewSecurePassword456!"
}
```

**Response (200 OK)**:

```json
{
  "message": "Password changed successfully"
}
```

---

## Admin API

### GET /api/v1/admin/users

List all users (admin only).

**Authentication**: Required (admin only)

**Response (200 OK)**:

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "last_login": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 150
  }
}
```

---

### GET /api/v1/admin/audit-logs

Get system audit logs.

**Authentication**: Required (admin only)

**Query Parameters**:

| Parameter  | Type   | Description           |
| ---------- | ------ | --------------------- |
| action     | string | Filter by action type |
| user_id    | UUID   | Filter by user        |
| start_date | string | Start date (ISO 8601) |
| end_date   | string | End date (ISO 8601)   |

**Response (200 OK)**:

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "550e8400-e29b-41d4-a716-446655440001",
      "user_email": "admin@example.com",
      "action": "model.promote",
      "resource_type": "model",
      "resource_id": "550e8400-e29b-41d4-a716-446655440002",
      "metadata": {
        "from_stage": "staging",
        "to_stage": "production"
      },
      "ip_address": "192.168.1.100",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total_items": 1250
  }
}
```

---

### POST /api/v1/admin/cache/clear

Clear API cache.

**Authentication**: Required (admin only)

**Request Body**:

```json
{
  "cache_type": "all"
}
```

**Response (200 OK)**:

```json
{
  "message": "Cache cleared successfully",
  "cleared": ["predictions", "models", "sessions"]
}
```

---

## Health & Status API

### GET /health

Basic liveness check.

**Authentication**: None

**Response (200 OK)**:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### GET /ready

Readiness check with dependency status.

**Authentication**: None

**Response (200 OK)**:

```json
{
  "status": "ready",
  "checks": {
    "database": {
      "status": "ok",
      "latency_ms": 5
    },
    "cache": {
      "status": "ok",
      "latency_ms": 2
    },
    "ml_service": {
      "status": "ok",
      "latency_ms": 15
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Response (503 Service Unavailable)**:

```json
{
  "status": "not_ready",
  "checks": {
    "database": {
      "status": "ok",
      "latency_ms": 5
    },
    "cache": {
      "status": "error",
      "error": "Connection refused"
    },
    "ml_service": {
      "status": "ok",
      "latency_ms": 15
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### GET /api/v1/status

System status dashboard.

**Authentication**: Optional (more details if authenticated as admin)

**Response (200 OK)**:

```json
{
  "system": {
    "status": "operational",
    "version": "1.2.0",
    "environment": "production"
  },
  "services": {
    "api_gateway": "operational",
    "ml_prediction": "operational",
    "training_pipeline": "operational",
    "model_registry": "operational"
  },
  "active_model": {
    "name": "student-score-predictor",
    "version": "1.2.0"
  },
  "metrics": {
    "predictions_today": 1542,
    "avg_latency_ms": 42,
    "uptime_percentage": 99.98
  }
}
```

---

## Error Handling

### Error Response Format

All errors follow a consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {},
    "request_id": "req_abc123xyz"
  }
}
```

### Error Codes

| HTTP Status | Error Code           | Description                           |
| ----------- | -------------------- | ------------------------------------- |
| 400         | VALIDATION_ERROR     | Request validation failed             |
| 400         | BAD_REQUEST          | Malformed request                     |
| 401         | UNAUTHORIZED         | Authentication required               |
| 401         | INVALID_CREDENTIALS  | Login failed                          |
| 401         | TOKEN_EXPIRED        | JWT token expired                     |
| 403         | FORBIDDEN            | Insufficient permissions              |
| 404         | RESOURCE_NOT_FOUND   | Requested resource not found          |
| 409         | CONFLICT             | Resource conflict (e.g., duplicate)   |
| 422         | UNPROCESSABLE_ENTITY | Request understood but cannot process |
| 429         | RATE_LIMIT_EXCEEDED  | Too many requests                     |
| 500         | INTERNAL_ERROR       | Unexpected server error               |
| 502         | BAD_GATEWAY          | Upstream service error                |
| 503         | SERVICE_UNAVAILABLE  | Service temporarily unavailable       |

### Rate Limiting

Rate limits are applied per user/IP:

| Endpoint                 | Limit         | Window   |
| ------------------------ | ------------- | -------- |
| POST /api/v1/predictions | 100 requests  | 1 minute |
| POST /api/v1/auth/login  | 5 requests    | 1 minute |
| GET /api/v1/\*           | 1000 requests | 1 minute |
| POST /api/v1/training/\* | 10 requests   | 1 hour   |

Rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705315800
```

---

## API Versioning

The API uses URL-based versioning:

- Current version: `/api/v1/`
- Deprecated versions receive 6 months support after deprecation notice

Deprecation headers:

```
Deprecation: true
Sunset: Sat, 15 Jul 2024 00:00:00 GMT
Link: </api/v2/predictions>; rel="successor-version"
```

---

## Document History

| Version | Date       | Author   | Changes         |
| ------- | ---------- | -------- | --------------- |
| 1.0     | 2024-01-15 | API Team | Initial version |
