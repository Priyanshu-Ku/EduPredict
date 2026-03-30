import React from "react";
import {
  Github,
  Linkedin,
  Mail,
  Database,
  Brain,
  Server,
  Layout,
  GraduationCap,
  Upload,
  Shuffle,
  Activity,
  CheckSquare,
  Rocket,
  Monitor,
  Target,
  TrendingDown,
} from "lucide-react";
import Header from "../components/layout/Header";
import Card from "../components/common/Card";
import Button from "../components/common/Button";

const AboutPage = () => {
  const pipelineSteps = [
    {
      step: 1,
      title: "Data Ingestion",
      description:
        "Load raw student performance data from CSV, validate schema, and split into train/test sets (80/20).",
      icon: Upload,
      color: "from-blue-500 to-blue-600",
    },
    {
      step: 2,
      title: "Data Transformation",
      description:
        "Apply StandardScaler for numerical features, OneHotEncoder for categorical features via ColumnTransformer pipeline.",
      icon: Shuffle,
      color: "from-purple-500 to-purple-600",
    },
    {
      step: 3,
      title: "Model Training",
      description:
        "Train Linear Regression model with scikit-learn. Hyperparameter tuning via GridSearchCV with 5-fold cross-validation.",
      icon: Brain,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      step: 4,
      title: "Model Evaluation",
      description:
        "Evaluate on test set using R² Score (0.88) and RMSE (4.2). Compare multiple algorithms to select best performer.",
      icon: CheckSquare,
      color: "from-orange-500 to-orange-600",
    },
    {
      step: 5,
      title: "FastAPI Deployment",
      description:
        "Wrap trained model in FastAPI with Pydantic validation. RESTful endpoints: /predict, /model-info, /health.",
      icon: Rocket,
      color: "from-pink-500 to-pink-600",
    },
    {
      step: 6,
      title: "React Frontend",
      description:
        "Modern dashboard UI with React, Tailwind CSS, and Recharts. Real-time predictions and interactive visualizations.",
      icon: Monitor,
      color: "from-cyan-500 to-cyan-600",
    },
  ];

  const dataset = {
    name: "Student Performance Dataset",
    records: "1,000 students",
    features: "8 input attributes",
    target: "Math Score (0-100)",
    source: "Educational Institution",
  };

  const inputFeatures = [
    { name: "gender", type: "Categorical", values: "male, female" },
    { name: "race_ethnicity", type: "Categorical", values: "group A-E" },
    { name: "parental_level_of_education", type: "Categorical", values: "6 levels" },
    { name: "lunch", type: "Categorical", values: "standard, free/reduced" },
    { name: "test_preparation_course", type: "Categorical", values: "none, completed" },
    { name: "reading_score", type: "Numerical", values: "0-100" },
    { name: "writing_score", type: "Numerical", values: "0-100" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="About Project"
        subtitle="Learn about EduPredict architecture and ML pipeline"
      />

      <div className="p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Hero Section */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white animate-fade-in">
            <div className="flex flex-col md:flex-row items-center gap-8 py-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  EduPredict – Student Performance Prediction System
                </h1>
                <p className="text-slate-300 text-lg mb-4">
                  An end-to-end machine learning application that predicts
                  student math scores based on demographic and academic factors.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://github.com/Priyanshu-Ku/mlproject"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    View on GitHub
                  </a>
                </div>
              </div>
            </div>
          </Card>

          {/* Problem Statement */}
          <Card className="animate-fade-in" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Problem Statement</h2>
                <p className="text-sm text-slate-500">Why this project exists</p>
              </div>
            </div>
            <p className="text-slate-700 leading-relaxed">
              Educational institutions need data-driven insights to identify students who may
              need additional support. Traditional assessment methods are reactive, identifying
              struggling students only after they've fallen behind. This project provides a
              <strong> proactive prediction system</strong> that forecasts student math performance
              based on demographic factors (gender, ethnicity, parental education) and academic
              indicators (reading/writing scores, test preparation). Early identification enables
              timely interventions to improve educational outcomes.
            </p>
          </Card>

          {/* Dataset Description */}
          <Card className="animate-fade-in" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Dataset Description</h2>
                <p className="text-sm text-slate-500">Training data overview</p>
              </div>
            </div>
            <div className="grid md:grid-cols-5 gap-4 mb-6">
              {Object.entries(dataset).map(([key, value], index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-xl text-center">
                  <p className="text-sm text-slate-500 mb-1 capitalize">
                    {key.replace(/_/g, " ")}
                  </p>
                  <p className="font-semibold text-slate-800">{value}</p>
                </div>
              ))}
            </div>
            <h3 className="font-semibold text-slate-800 mb-3">Input Features</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 font-medium text-slate-600">Feature</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-600">Type</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-600">Values</th>
                  </tr>
                </thead>
                <tbody>
                  {inputFeatures.map((feature, index) => (
                    <tr key={index} className="border-b border-slate-100">
                      <td className="py-2 px-3 font-mono text-slate-800">{feature.name}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            feature.type === "Numerical"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {feature.type}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-600">{feature.values}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* ML Pipeline */}
          <Card className="animate-fade-in" style={{ animationDelay: "300ms" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">ML Pipeline Steps</h2>
                <p className="text-sm text-slate-500">End-to-end workflow</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pipelineSteps.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-xs text-slate-500">Step {item.step}</span>
                        <h4 className="font-semibold text-slate-800">{item.title}</h4>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Model & Metrics */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="animate-fade-in" style={{ animationDelay: "400ms" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Model Used</h2>
                  <p className="text-sm text-slate-500">Algorithm details</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Algorithm</p>
                  <p className="font-semibold text-slate-800">Linear Regression (OLS)</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Library</p>
                  <p className="font-semibold text-slate-800">scikit-learn</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Cross-Validation</p>
                  <p className="font-semibold text-slate-800">5-Fold CV</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Train/Test Split</p>
                  <p className="font-semibold text-slate-800">80% / 20%</p>
                </div>
              </div>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: "500ms" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Evaluation Metrics</h2>
                  <p className="text-sm text-slate-500">Model performance</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-emerald-800">R² Score</span>
                    <span className="text-2xl font-bold text-emerald-600">0.88</span>
                  </div>
                  <p className="text-sm text-emerald-700">
                    88% of variance in math scores explained by the model
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-blue-800">RMSE</span>
                    <span className="text-2xl font-bold text-blue-600">4.2</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Average prediction error of ±4.2 points on 0-100 scale
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Architecture Diagram */}
          <Card className="animate-fade-in" style={{ animationDelay: "600ms" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                <Server className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">System Architecture</h2>
                <p className="text-sm text-slate-500">High-level overview</p>
              </div>
            </div>
            <div className="bg-slate-900 rounded-xl p-6 font-mono text-sm overflow-x-auto">
              <pre className="text-slate-300">
{`┌─────────────────────────────────────────────────────────────────────┐
│                         EduPredict Architecture                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────────┐        ┌──────────────┐        ┌──────────────┐  │
│   │    React     │  HTTP  │   FastAPI    │  Load  │  ML Model    │  │
│   │   Frontend   │───────▶│   Backend    │───────▶│  (sklearn)   │  │
│   │  (Port 3000) │◀───────│  (Port 8000) │◀───────│  .pkl file   │  │
│   └──────────────┘  JSON  └──────────────┘ Predict└──────────────┘  │
│         │                        │                       │          │
│         │                        │                       │          │
│   ┌─────▼─────┐            ┌─────▼─────┐          ┌─────▼─────┐    │
│   │ Tailwind  │            │  Pydantic │          │  Pandas   │    │
│   │ Recharts  │            │  Uvicorn  │          │  NumPy    │    │
│   │  Axios    │            │   CORS    │          │ Joblib    │    │
│   └───────────┘            └───────────┘          └───────────┘    │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                          Data Flow                                   │
│                                                                      │
│   User Input ──▶ Form Validation ──▶ API Request ──▶ Preprocessing  │
│        │                                                     │      │
│        │                                                     ▼      │
│   Result Display ◀── JSON Response ◀── Model Inference ◀────┘      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘`}
              </pre>
            </div>
          </Card>

          {/* Contact */}
          <Card className="animate-fade-in" style={{ animationDelay: "700ms" }}>
            <div className="text-center py-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Get In Touch</h2>
              <p className="text-slate-600 mb-6 max-w-lg mx-auto">
                Questions, feedback, or contributions welcome!
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="https://github.com/Priyanshu-Ku"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="secondary">
                    <Github className="w-5 h-5" />
                    GitHub
                  </Button>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="secondary">
                    <Linkedin className="w-5 h-5" />
                    LinkedIn
                  </Button>
                </a>
                <a href="mailto:contact@example.com">
                  <Button variant="secondary">
                    <Mail className="w-5 h-5" />
                    Email
                  </Button>
                </a>
              </div>
            </div>
          </Card>

          {/* Footer */}
          <div className="text-center text-slate-500 text-sm py-4">
            <p>Built with ❤️ using React, FastAPI, and Scikit-learn</p>
            <p className="mt-1">
              © 2024 EduPredict – Student Performance Prediction System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
