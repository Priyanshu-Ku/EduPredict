# Database Schema Design

## Overview

This document defines the PostgreSQL database schema for the Student Score Prediction Platform. The schema supports user management, prediction tracking, model versioning, training history, and audit logging.

**Database**: PostgreSQL 15+
**Encoding**: UTF-8
**Collation**: en_US.UTF-8

---

## Table of Contents

1. [Entity Relationship Diagram](#entity-relationship-diagram)
2. [Tables](#tables)
3. [Indexes](#indexes)
4. [Constraints](#constraints)
5. [Migrations Strategy](#migrations-strategy)

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     ENTITY RELATIONSHIP DIAGRAM                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐                              ┌──────────────────┐
│      users       │                              │     models       │
├──────────────────┤                              ├──────────────────┤
│ id (PK)          │                              │ id (PK)          │
│ email            │                              │ name             │
│ password_hash    │                              │ version          │
│ name             │                              │ algorithm        │
│ role             │                              │ artifact_uri     │
│ is_active        │                              │ preprocessor_uri │
│ created_at       │                              │ metrics_json     │
│ updated_at       │                              │ status           │
└────────┬─────────┘                              │ is_active        │
         │                                        │ created_at       │
         │                                        │ promoted_at      │
         │ 1                                      └────────┬─────────┘
         │                                                 │
         │                                                 │ 1
         │    ┌────────────────────────────────────────────┤
         │    │                                            │
         │    │ n                                          │ n
         ▼    ▼                                            ▼
┌──────────────────────────────────┐     ┌──────────────────────────────────┐
│       prediction_requests        │     │         training_runs            │
├──────────────────────────────────┤     ├──────────────────────────────────┤
│ id (PK)                          │     │ id (PK)                          │
│ user_id (FK) ────────────────────┼─────│ run_name                         │
│ model_id (FK) ───────────────────┼─────│ dataset_version                  │
│ gender                           │     │ status                           │
│ race_ethnicity                   │     │ params_json                      │
│ parental_level_of_education      │     │ metrics_json                     │
│ lunch                            │     │ artifact_uri                     │
│ test_preparation_course          │     │ logs_uri                         │
│ reading_score                    │     │ started_at                       │
│ writing_score                    │     │ finished_at                      │
│ request_source                   │     │ created_by (FK) ─────────────────┤
│ created_at                       │     │ created_at                       │
└────────────────┬─────────────────┘     └──────────────────────────────────┘
                 │
                 │ 1
                 │
                 │ 1
                 ▼
┌──────────────────────────────────┐     ┌──────────────────────────────────┐
│       prediction_results         │     │         audit_logs               │
├──────────────────────────────────┤     ├──────────────────────────────────┤
│ id (PK)                          │     │ id (PK)                          │
│ prediction_request_id (FK) ──────┤     │ user_id (FK) ────────────────────┤
│ predicted_math_score             │     │ action                           │
│ confidence_lower                 │     │ resource_type                    │
│ confidence_upper                 │     │ resource_id                      │
│ latency_ms                       │     │ metadata_json                    │
│ feature_vector_hash              │     │ ip_address                       │
│ created_at                       │     │ created_at                       │
└──────────────────────────────────┘     └──────────────────────────────────┘


RELATIONSHIP LEGEND:
─────────────────────
    1 ────── n     One-to-Many relationship
    - - - - - -    Optional relationship (nullable FK)
    ═══════════    Required relationship (non-null FK)
```

---

## Tables

### 1. users

Stores user account information for authentication and authorization.

```sql
CREATE TABLE users (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Authentication
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

    -- Profile
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',

    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT users_email_unique UNIQUE (email),
    CONSTRAINT users_role_check CHECK (role IN ('user', 'admin', 'system'))
);
```

| Column        | Type         | Nullable | Default           | Description                    |
| ------------- | ------------ | -------- | ----------------- | ------------------------------ |
| id            | UUID         | No       | gen_random_uuid() | Primary key                    |
| email         | VARCHAR(255) | No       | -                 | User email (unique)            |
| password_hash | VARCHAR(255) | No       | -                 | Bcrypt hashed password         |
| name          | VARCHAR(255) | No       | -                 | Display name                   |
| role          | VARCHAR(50)  | No       | 'user'            | User role: user, admin, system |
| is_active     | BOOLEAN      | No       | true              | Account active status          |
| created_at    | TIMESTAMPTZ  | No       | CURRENT_TIMESTAMP | Creation timestamp             |
| updated_at    | TIMESTAMPTZ  | No       | CURRENT_TIMESTAMP | Last update timestamp          |

**Indexes**:

- `users_pkey` - Primary key on id
- `users_email_unique` - Unique index on email
- `users_role_idx` - Index on role for filtering

---

### 2. models

Stores ML model metadata and versioning information.

```sql
CREATE TABLE models (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Model Identity
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    algorithm VARCHAR(100) NOT NULL,

    -- Artifact Locations
    artifact_uri TEXT NOT NULL,
    preprocessor_uri TEXT NOT NULL,

    -- Training Information
    training_dataset_version VARCHAR(100),
    training_run_id UUID,

    -- Metrics
    metrics_json JSONB,

    -- Lifecycle
    status VARCHAR(50) NOT NULL DEFAULT 'staging',
    is_active BOOLEAN NOT NULL DEFAULT false,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    promoted_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT models_name_version_unique UNIQUE (name, version),
    CONSTRAINT models_status_check CHECK (status IN ('staging', 'production', 'archived'))
);
```

| Column                   | Type         | Nullable | Default           | Description                    |
| ------------------------ | ------------ | -------- | ----------------- | ------------------------------ |
| id                       | UUID         | No       | gen_random_uuid() | Primary key                    |
| name                     | VARCHAR(255) | No       | -                 | Model name                     |
| version                  | VARCHAR(50)  | No       | -                 | Semantic version (e.g., 1.2.0) |
| algorithm                | VARCHAR(100) | No       | -                 | ML algorithm used              |
| artifact_uri             | TEXT         | No       | -                 | S3 URI to model file           |
| preprocessor_uri         | TEXT         | No       | -                 | S3 URI to preprocessor         |
| training_dataset_version | VARCHAR(100) | Yes      | -                 | Dataset version used           |
| training_run_id          | UUID         | Yes      | -                 | Reference to training run      |
| metrics_json             | JSONB        | Yes      | -                 | Evaluation metrics             |
| status                   | VARCHAR(50)  | No       | 'staging'         | Lifecycle stage                |
| is_active                | BOOLEAN      | No       | false             | Currently serving traffic      |
| created_at               | TIMESTAMPTZ  | No       | CURRENT_TIMESTAMP | Creation timestamp             |
| promoted_at              | TIMESTAMPTZ  | Yes      | -                 | Promotion timestamp            |

**Indexes**:

- `models_pkey` - Primary key on id
- `models_name_version_unique` - Unique on (name, version)
- `models_is_active_idx` - Partial index WHERE is_active = true
- `models_status_idx` - Index on status

**Example metrics_json**:

```json
{
  "r2_score": 0.876,
  "mae": 4.23,
  "rmse": 5.67,
  "mape": 0.058,
  "training_samples": 800,
  "test_samples": 200
}
```

---

### 3. prediction_requests

Stores input data for each prediction request.

```sql
CREATE TABLE prediction_requests (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign Keys
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    model_id UUID NOT NULL REFERENCES models(id),

    -- Input Features
    gender VARCHAR(50) NOT NULL,
    race_ethnicity VARCHAR(50) NOT NULL,
    parental_level_of_education VARCHAR(100) NOT NULL,
    lunch VARCHAR(50) NOT NULL,
    test_preparation_course VARCHAR(50) NOT NULL,
    reading_score NUMERIC(5,2) NOT NULL,
    writing_score NUMERIC(5,2) NOT NULL,

    -- Metadata
    request_source VARCHAR(50) DEFAULT 'web',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT prediction_requests_gender_check
        CHECK (gender IN ('male', 'female')),
    CONSTRAINT prediction_requests_ethnicity_check
        CHECK (race_ethnicity IN ('group A', 'group B', 'group C', 'group D', 'group E')),
    CONSTRAINT prediction_requests_education_check
        CHECK (parental_level_of_education IN (
            'some high school', 'high school', 'some college',
            'associate''s degree', 'bachelor''s degree', 'master''s degree'
        )),
    CONSTRAINT prediction_requests_lunch_check
        CHECK (lunch IN ('standard', 'free/reduced')),
    CONSTRAINT prediction_requests_test_prep_check
        CHECK (test_preparation_course IN ('none', 'completed')),
    CONSTRAINT prediction_requests_reading_range
        CHECK (reading_score >= 0 AND reading_score <= 100),
    CONSTRAINT prediction_requests_writing_range
        CHECK (writing_score >= 0 AND writing_score <= 100),
    CONSTRAINT prediction_requests_source_check
        CHECK (request_source IN ('web', 'api', 'batch', 'test'))
);
```

| Column                      | Type         | Nullable | Default           | Description                          |
| --------------------------- | ------------ | -------- | ----------------- | ------------------------------------ |
| id                          | UUID         | No       | gen_random_uuid() | Primary key                          |
| user_id                     | UUID         | Yes      | -                 | FK to users (nullable for anonymous) |
| model_id                    | UUID         | No       | -                 | FK to models                         |
| gender                      | VARCHAR(50)  | No       | -                 | Student gender                       |
| race_ethnicity              | VARCHAR(50)  | No       | -                 | Race/ethnicity group                 |
| parental_level_of_education | VARCHAR(100) | No       | -                 | Parent education level               |
| lunch                       | VARCHAR(50)  | No       | -                 | Lunch program type                   |
| test_preparation_course     | VARCHAR(50)  | No       | -                 | Test prep completion                 |
| reading_score               | NUMERIC(5,2) | No       | -                 | Reading score (0-100)                |
| writing_score               | NUMERIC(5,2) | No       | -                 | Writing score (0-100)                |
| request_source              | VARCHAR(50)  | No       | 'web'             | Request origin                       |
| created_at                  | TIMESTAMPTZ  | No       | CURRENT_TIMESTAMP | Request timestamp                    |

**Indexes**:

- `prediction_requests_pkey` - Primary key on id
- `prediction_requests_user_id_idx` - Index on user_id
- `prediction_requests_model_id_idx` - Index on model_id
- `prediction_requests_created_at_idx` - Index on created_at DESC

---

### 4. prediction_results

Stores prediction outputs and performance metrics.

```sql
CREATE TABLE prediction_results (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign Key
    prediction_request_id UUID NOT NULL REFERENCES prediction_requests(id) ON DELETE CASCADE,

    -- Prediction Output
    predicted_math_score NUMERIC(5,2) NOT NULL,
    confidence_lower NUMERIC(5,2),
    confidence_upper NUMERIC(5,2),

    -- Performance
    latency_ms INTEGER NOT NULL,

    -- Feature Engineering
    feature_vector_hash VARCHAR(64),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT prediction_results_score_range
        CHECK (predicted_math_score >= 0 AND predicted_math_score <= 100),
    CONSTRAINT prediction_results_latency_positive
        CHECK (latency_ms >= 0)
);
```

| Column                | Type         | Nullable | Default           | Description               |
| --------------------- | ------------ | -------- | ----------------- | ------------------------- |
| id                    | UUID         | No       | gen_random_uuid() | Primary key               |
| prediction_request_id | UUID         | No       | -                 | FK to prediction_requests |
| predicted_math_score  | NUMERIC(5,2) | No       | -                 | Predicted score (0-100)   |
| confidence_lower      | NUMERIC(5,2) | Yes      | -                 | Lower confidence bound    |
| confidence_upper      | NUMERIC(5,2) | Yes      | -                 | Upper confidence bound    |
| latency_ms            | INTEGER      | No       | -                 | Inference latency in ms   |
| feature_vector_hash   | VARCHAR(64)  | Yes      | -                 | SHA256 of feature vector  |
| created_at            | TIMESTAMPTZ  | No       | CURRENT_TIMESTAMP | Result timestamp          |

**Indexes**:

- `prediction_results_pkey` - Primary key on id
- `prediction_results_request_id_idx` - Index on prediction_request_id

---

### 5. training_runs

Stores training job history and results.

```sql
CREATE TABLE training_runs (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Run Identity
    run_name VARCHAR(255) NOT NULL,
    dataset_version VARCHAR(100) NOT NULL,

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending',

    -- Configuration
    params_json JSONB,

    -- Results
    metrics_json JSONB,

    -- Artifacts
    artifact_uri TEXT,
    logs_uri TEXT,

    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE,

    -- Audit
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT training_runs_status_check
        CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled'))
);
```

| Column          | Type         | Nullable | Default           | Description             |
| --------------- | ------------ | -------- | ----------------- | ----------------------- |
| id              | UUID         | No       | gen_random_uuid() | Primary key             |
| run_name        | VARCHAR(255) | No       | -                 | Human-readable run name |
| dataset_version | VARCHAR(100) | No       | -                 | Dataset version used    |
| status          | VARCHAR(50)  | No       | 'pending'         | Run status              |
| params_json     | JSONB        | Yes      | -                 | Training configuration  |
| metrics_json    | JSONB        | Yes      | -                 | Final metrics           |
| artifact_uri    | TEXT         | Yes      | -                 | S3 URI to artifacts     |
| logs_uri        | TEXT         | Yes      | -                 | S3 URI to logs          |
| started_at      | TIMESTAMPTZ  | Yes      | -                 | Training start time     |
| finished_at     | TIMESTAMPTZ  | Yes      | -                 | Training end time       |
| created_by      | UUID         | Yes      | -                 | FK to users             |
| created_at      | TIMESTAMPTZ  | No       | CURRENT_TIMESTAMP | Creation timestamp      |

**Indexes**:

- `training_runs_pkey` - Primary key on id
- `training_runs_status_idx` - Index on status
- `training_runs_created_at_idx` - Index on created_at DESC

**Example params_json**:

```json
{
  "models": ["random_forest", "gradient_boosting", "xgboost"],
  "hyperparameter_tuning": true,
  "cv_folds": 5,
  "test_size": 0.2,
  "random_state": 42
}
```

**Example metrics_json**:

```json
{
  "best_model": "gradient_boosting",
  "models": {
    "random_forest": { "r2": 0.854, "mae": 4.89 },
    "gradient_boosting": { "r2": 0.876, "mae": 4.23 },
    "xgboost": { "r2": 0.868, "mae": 4.45 }
  },
  "duration_seconds": 1260
}
```

---

### 6. audit_logs

Stores system audit trail for compliance and debugging.

```sql
CREATE TABLE audit_logs (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Actor
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Action
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),

    -- Details
    metadata_json JSONB,

    -- Source
    ip_address INET,
    user_agent TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

| Column        | Type         | Nullable | Default           | Description                   |
| ------------- | ------------ | -------- | ----------------- | ----------------------------- |
| id            | UUID         | No       | gen_random_uuid() | Primary key                   |
| user_id       | UUID         | Yes      | -                 | FK to users (null for system) |
| action        | VARCHAR(100) | No       | -                 | Action performed              |
| resource_type | VARCHAR(100) | No       | -                 | Type of resource              |
| resource_id   | VARCHAR(255) | Yes      | -                 | ID of affected resource       |
| metadata_json | JSONB        | Yes      | -                 | Additional context            |
| ip_address    | INET         | Yes      | -                 | Client IP address             |
| user_agent    | TEXT         | Yes      | -                 | Client user agent             |
| created_at    | TIMESTAMPTZ  | No       | CURRENT_TIMESTAMP | Event timestamp               |

**Indexes**:

- `audit_logs_pkey` - Primary key on id
- `audit_logs_user_id_idx` - Index on user_id
- `audit_logs_action_idx` - Index on action
- `audit_logs_created_at_idx` - Index on created_at DESC

**Common action values**:

- `user.login` - User logged in
- `user.logout` - User logged out
- `user.register` - New user registered
- `prediction.create` - Prediction made
- `model.promote` - Model promoted to production
- `model.rollback` - Model rolled back
- `training.start` - Training run started
- `training.complete` - Training run completed

**Example metadata_json**:

```json
{
  "from_stage": "staging",
  "to_stage": "production",
  "previous_active_model": "550e8400-e29b-41d4-a716-446655440001",
  "reason": "Improved R2 score"
}
```

---

### 7. refresh_tokens (Optional - for JWT refresh token rotation)

```sql
CREATE TABLE refresh_tokens (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign Key
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Token
    token_hash VARCHAR(255) NOT NULL,

    -- Expiration
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Status
    revoked BOOLEAN NOT NULL DEFAULT false,
    revoked_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT refresh_tokens_token_unique UNIQUE (token_hash)
);
```

---

## Indexes

### Summary of All Indexes

| Table               | Index Name                         | Columns               | Type        | Purpose                  |
| ------------------- | ---------------------------------- | --------------------- | ----------- | ------------------------ |
| users               | users_pkey                         | id                    | PRIMARY     | Primary key              |
| users               | users_email_unique                 | email                 | UNIQUE      | Prevent duplicate emails |
| users               | users_role_idx                     | role                  | B-TREE      | Filter by role           |
| models              | models_pkey                        | id                    | PRIMARY     | Primary key              |
| models              | models_name_version_unique         | (name, version)       | UNIQUE      | Version uniqueness       |
| models              | models_is_active_idx               | is_active             | PARTIAL     | Find active model        |
| models              | models_status_idx                  | status                | B-TREE      | Filter by status         |
| prediction_requests | prediction_requests_pkey           | id                    | PRIMARY     | Primary key              |
| prediction_requests | prediction_requests_user_id_idx    | user_id               | B-TREE      | User's predictions       |
| prediction_requests | prediction_requests_model_id_idx   | model_id              | B-TREE      | Model's predictions      |
| prediction_requests | prediction_requests_created_at_idx | created_at            | B-TREE DESC | Recent predictions       |
| prediction_results  | prediction_results_pkey            | id                    | PRIMARY     | Primary key              |
| prediction_results  | prediction_results_request_id_idx  | prediction_request_id | B-TREE      | Link to request          |
| training_runs       | training_runs_pkey                 | id                    | PRIMARY     | Primary key              |
| training_runs       | training_runs_status_idx           | status                | B-TREE      | Filter by status         |
| training_runs       | training_runs_created_at_idx       | created_at            | B-TREE DESC | Recent runs              |
| audit_logs          | audit_logs_pkey                    | id                    | PRIMARY     | Primary key              |
| audit_logs          | audit_logs_user_id_idx             | user_id               | B-TREE      | User's actions           |
| audit_logs          | audit_logs_action_idx              | action                | B-TREE      | Filter by action         |
| audit_logs          | audit_logs_created_at_idx          | created_at            | B-TREE DESC | Recent logs              |

### Index Creation SQL

```sql
-- Users indexes
CREATE INDEX users_role_idx ON users(role);

-- Models indexes
CREATE INDEX models_is_active_idx ON models(is_active) WHERE is_active = true;
CREATE INDEX models_status_idx ON models(status);

-- Prediction requests indexes
CREATE INDEX prediction_requests_user_id_idx ON prediction_requests(user_id);
CREATE INDEX prediction_requests_model_id_idx ON prediction_requests(model_id);
CREATE INDEX prediction_requests_created_at_idx ON prediction_requests(created_at DESC);

-- Prediction results indexes
CREATE INDEX prediction_results_request_id_idx ON prediction_results(prediction_request_id);

-- Training runs indexes
CREATE INDEX training_runs_status_idx ON training_runs(status);
CREATE INDEX training_runs_created_at_idx ON training_runs(created_at DESC);

-- Audit logs indexes
CREATE INDEX audit_logs_user_id_idx ON audit_logs(user_id);
CREATE INDEX audit_logs_action_idx ON audit_logs(action);
CREATE INDEX audit_logs_resource_type_idx ON audit_logs(resource_type);
CREATE INDEX audit_logs_created_at_idx ON audit_logs(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX prediction_requests_user_created_idx
    ON prediction_requests(user_id, created_at DESC);
CREATE INDEX audit_logs_user_action_idx
    ON audit_logs(user_id, action, created_at DESC);
```

---

## Constraints

### Foreign Key Relationships

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      FOREIGN KEY RELATIONSHIPS                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   prediction_requests.user_id ──────▶ users.id                              │
│       ON DELETE SET NULL (keep predictions if user deleted)                 │
│                                                                              │
│   prediction_requests.model_id ──────▶ models.id                            │
│       ON DELETE RESTRICT (cannot delete model with predictions)             │
│                                                                              │
│   prediction_results.prediction_request_id ──────▶ prediction_requests.id   │
│       ON DELETE CASCADE (delete result if request deleted)                  │
│                                                                              │
│   training_runs.created_by ──────▶ users.id                                 │
│       ON DELETE SET NULL (keep run history if user deleted)                 │
│                                                                              │
│   audit_logs.user_id ──────▶ users.id                                       │
│       ON DELETE SET NULL (keep audit trail if user deleted)                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Check Constraints Summary

| Table               | Constraint          | Rule                                                                 |
| ------------------- | ------------------- | -------------------------------------------------------------------- |
| users               | users_role_check    | role IN ('user', 'admin', 'system')                                  |
| models              | models_status_check | status IN ('staging', 'production', 'archived')                      |
| prediction_requests | gender_check        | gender IN ('male', 'female')                                         |
| prediction_requests | ethnicity_check     | race_ethnicity IN ('group A'...'group E')                            |
| prediction_requests | education_check     | parental_level_of_education IN (...)                                 |
| prediction_requests | lunch_check         | lunch IN ('standard', 'free/reduced')                                |
| prediction_requests | test_prep_check     | test_preparation_course IN ('none', 'completed')                     |
| prediction_requests | reading_range       | reading_score BETWEEN 0 AND 100                                      |
| prediction_requests | writing_range       | writing_score BETWEEN 0 AND 100                                      |
| prediction_requests | source_check        | request_source IN ('web', 'api', 'batch', 'test')                    |
| prediction_results  | score_range         | predicted_math_score BETWEEN 0 AND 100                               |
| prediction_results  | latency_positive    | latency_ms >= 0                                                      |
| training_runs       | status_check        | status IN ('pending', 'running', 'completed', 'failed', 'cancelled') |

---

## Migrations Strategy

### Alembic Setup

```
alembic/
├── alembic.ini
├── env.py
├── script.py.mako
└── versions/
    ├── 001_initial_schema.py
    ├── 002_add_audit_logs.py
    ├── 003_add_training_runs.py
    └── ...
```

### Migration Naming Convention

```
{revision}_{description}.py

Examples:
001_initial_schema.py
002_add_user_role_column.py
003_add_prediction_confidence_columns.py
004_create_audit_logs_table.py
```

### Migration Commands

```bash
# Create new migration
alembic revision --autogenerate -m "add user role column"

# Apply all pending migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# Rollback to specific revision
alembic downgrade 001

# Show current revision
alembic current

# Show migration history
alembic history
```

### Initial Migration Example

```python
"""Initial schema

Revision ID: 001
Create Date: 2024-01-15 10:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True),
                  server_default=sa.text('gen_random_uuid()'),
                  nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('role', sa.String(50), nullable=False,
                  server_default='user'),
        sa.Column('is_active', sa.Boolean(), nullable=False,
                  server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True),
                  server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(timezone=True),
                  server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email', name='users_email_unique'),
        sa.CheckConstraint("role IN ('user', 'admin', 'system')",
                          name='users_role_check')
    )
    op.create_index('users_role_idx', 'users', ['role'])

    # ... continue with other tables

def downgrade():
    op.drop_index('users_role_idx', 'users')
    op.drop_table('users')
    # ... continue with other tables in reverse order
```

---

## Data Retention Policy

| Table               | Retention Period | Archive Strategy                |
| ------------------- | ---------------- | ------------------------------- |
| users               | Indefinite       | Soft delete (is_active = false) |
| models              | Indefinite       | Archive to S3 after 1 year      |
| prediction_requests | 1 year           | Archive to S3, delete from DB   |
| prediction_results  | 1 year           | Archive with requests           |
| training_runs       | 2 years          | Archive to S3                   |
| audit_logs          | 3 years          | Archive to S3                   |

### Archive Job (Example)

```sql
-- Archive predictions older than 1 year
INSERT INTO prediction_archive (
    SELECT * FROM prediction_requests
    WHERE created_at < NOW() - INTERVAL '1 year'
);

DELETE FROM prediction_requests
WHERE created_at < NOW() - INTERVAL '1 year';
```

---

## Document History

| Version | Date       | Author        | Changes         |
| ------- | ---------- | ------------- | --------------- |
| 1.0     | 2024-01-15 | Database Team | Initial version |
