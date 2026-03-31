# EduPredict – Student Performance Prediction System

An end-to-end Machine Learning project that predicts student math scores based on various demographic and academic factors. Features a FastAPI backend with ML model serving and a React dashboard frontend.

![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)
![React](https://img.shields.io/badge/React-18+-61DAFB.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)

## 📁 Project Structure

```
EduPredict/
├── backend/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── core/          # Configuration
│   │   ├── models/        # ML model loader
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   └── main.py        # FastAPI application
│   │
│   ├── ml_pipeline/
│   │   ├── components/    # Data ingestion, transformation, training
│   │   ├── pipeline/      # Prediction & training pipelines
│   │   └── utils/         # Logging, exceptions, utilities
│   │
│   ├── artifacts/         # Trained model & preprocessor
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Dashboard, Predict, Model Info
│   │   └── context/       # State management
│   └── package.json
│
├── notebooks/             # EDA & model training notebooks
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── .github/workflows/     # CI/CD pipeline
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- pip & npm

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate
# OR (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
# OR
npm start
```

### Access the Application

- **Frontend Dashboard**: http://localhost:3000
- **FastAPI Backend**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🐳 Docker Deployment

### Using Docker Compose

```bash
cd docker
docker-compose up --build
```

### Manual Docker Build

```bash
# Build image
docker build -f docker/Dockerfile -t edupredict:latest .

# Run container
docker run -d -p 8000:8000 --name edupredict edupredict:latest
```

## 📊 API Endpoints

| Endpoint      | Method | Description           |
| ------------- | ------ | --------------------- |
| `/predict`    | POST   | Make score prediction |
| `/model-info` | GET    | Get model metrics     |
| `/health`     | GET    | Health check          |

### Example Prediction Request

```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "gender": "female",
    "race_ethnicity": "group B",
    "parental_level_of_education": "bachelor'\''s degree",
    "lunch": "standard",
    "test_preparation_course": "completed",
    "reading_score": 72,
    "writing_score": 74
  }'
```

## 🧠 ML Pipeline

The ML pipeline includes:

1. **Data Ingestion** - Load and split data
2. **Data Transformation** - Feature encoding & scaling
3. **Model Training** - Train multiple models, select best performer

### Supported Models

- Linear Regression
- Random Forest
- Gradient Boosting
- XGBoost
- CatBoost
- K-Nearest Neighbors
- Decision Tree
- AdaBoost

### Run Training Pipeline

```bash
cd backend
python -m ml_pipeline.training_pipeline
```

## 🛠️ Development

### Project Commands

```bash
# Backend (from project root)
cd backend && uvicorn app.main:app --reload --port 8000

# Frontend (from project root)
cd frontend && npm run dev
```

### Environment Variables

Create `.env` in `backend/`:

```env
# Optional - for production
MODEL_PATH=artifacts/model.pkl
PREPROCESSOR_PATH=artifacts/preprocessor.pkl
```

## 📦 CI/CD

GitHub Actions workflow handles:

1. **Integration** - Lint & test
2. **Build** - Docker image creation
3. **Deploy** - Push to AWS ECR & deploy to EC2

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ by [Priyanshu Kumar](https://github.com/Priyanshu-Ku)
