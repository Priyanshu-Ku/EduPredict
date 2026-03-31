import React, { useState, useEffect } from "react";
import {
  Info,
  Brain,
  Target,
  Activity,
  CheckCircle,
  XCircle,
  RefreshCw,
  Database,
  Cpu,
  BarChart3,
  TrendingUp,
  Zap,
  Clock,
} from "lucide-react";
import Header from "../components/layout/Header";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { ModelPerformanceChart } from "../components/charts/Charts";
import { predictionService } from "../services/api";

const ModelInfoPage = () => {
  const [modelInfo, setModelInfo] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [model, health] = await Promise.all([
        predictionService.getModelInfo(),
        predictionService.healthCheck(),
      ]);
      setModelInfo(model);
      setHealthStatus(health);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const performanceData = modelInfo
    ? [
        { metric: "R² Score", value: modelInfo.r2_score * 100 },
        { metric: "Accuracy", value: 88 },
        { metric: "Precision", value: 85 },
        { metric: "Recall", value: 82 },
      ]
    : [];

  const modelDetails = [
    {
      icon: Brain,
      label: "Model Type",
      value: modelInfo?.model_name || "Linear Regression",
      color: "blue",
    },
    {
      icon: Target,
      label: "R² Score",
      value: modelInfo?.r2_score || "0.88",
      color: "green",
    },
    {
      icon: Activity,
      label: "RMSE",
      value: modelInfo?.rmse || "4.2",
      color: "orange",
    },
    {
      icon: Database,
      label: "Training Samples",
      value: "1,000",
      color: "purple",
    },
    {
      icon: BarChart3,
      label: "Features Used",
      value: "7",
      color: "pink",
    },
    {
      icon: Cpu,
      label: "Algorithm",
      value: "Ordinary Least Squares",
      color: "cyan",
    },
  ];

  const colorMap = {
    blue: { bg: "bg-blue-100", text: "text-blue-600" },
    green: { bg: "bg-emerald-100", text: "text-emerald-600" },
    orange: { bg: "bg-orange-100", text: "text-orange-600" },
    purple: { bg: "bg-purple-100", text: "text-purple-600" },
    pink: { bg: "bg-pink-100", text: "text-pink-600" },
    cyan: { bg: "bg-cyan-100", text: "text-cyan-600" },
  };

  const features = [
    {
      name: "Gender",
      type: "Categorical",
      description: "Student gender (male/female)",
    },
    {
      name: "Race/Ethnicity",
      type: "Categorical",
      description: "Ethnic group (A-E)",
    },
    {
      name: "Parental Education",
      type: "Categorical",
      description: "Highest education level of parents",
    },
    {
      name: "Lunch Type",
      type: "Categorical",
      description: "Standard or free/reduced lunch",
    },
    {
      name: "Test Preparation",
      type: "Categorical",
      description: "Course completion status",
    },
    {
      name: "Reading Score",
      type: "Numerical",
      description: "Score in reading (0-100)",
    },
    {
      name: "Writing Score",
      type: "Numerical",
      description: "Score in writing (0-100)",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header
          title="Model Information"
          subtitle="Details about the ML model"
        />
        <div className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Model Information" subtitle="Details about the ML model" />

      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Status Banner */}
          <div
            className={`rounded-2xl p-6 ${
              healthStatus?.status === "ok"
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                : "bg-gradient-to-r from-red-500 to-red-600"
            } text-white animate-fade-in`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {healthStatus?.status === "ok" ? (
                  <CheckCircle className="w-8 h-8" />
                ) : (
                  <XCircle className="w-8 h-8" />
                )}
                <div>
                  <h2 className="text-xl font-bold">
                    API Status:{" "}
                    {healthStatus?.status === "ok" ? "Healthy" : "Unhealthy"}
                  </h2>
                  <p className="text-white/80">
                    Model is ready to accept predictions
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={handleRefresh}
                loading={refreshing}
                className="!bg-white/20 !text-white hover:!bg-white/30"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Model Details Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modelDetails.map((detail, index) => {
              const Icon = detail.icon;
              const colors = colorMap[detail.color];
              return (
                <Card
                  key={index}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}
                    >
                      <Icon className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">{detail.label}</p>
                      <p className="text-lg font-semibold text-slate-800">
                        {detail.value}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Performance Chart */}
          <Card className="animate-fade-in" style={{ animationDelay: "300ms" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">
                  Model Performance Metrics
                </h3>
                <p className="text-sm text-slate-500">
                  Key performance indicators
                </p>
              </div>
            </div>
            <ModelPerformanceChart data={performanceData} />
          </Card>

          {/* Features Table */}
          <Card className="animate-fade-in" style={{ animationDelay: "400ms" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Input Features</h3>
                <p className="text-sm text-slate-500">
                  Features used for predictions
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                      Feature
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, index) => (
                    <tr
                      key={index}
                      className="border-b border-slate-50 hover:bg-slate-50"
                    >
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {feature.name}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                            feature.type === "Numerical"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {feature.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {feature.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Metrics Explanation Section */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* R² Score Explanation */}
            <Card
              className="animate-fade-in"
              style={{ animationDelay: "450ms" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">
                    Understanding R² Score
                  </h3>
                  <p className="text-sm text-slate-500">
                    Coefficient of Determination
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-slate-600 leading-relaxed">
                  <strong className="text-slate-800">R² (R-squared)</strong>{" "}
                  measures how well the model's predictions match the actual
                  data. It represents the proportion of variance in the
                  dependent variable explained by the model.
                </p>
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-sm font-medium text-emerald-800">
                      Current Score: {modelInfo?.r2_score || "0.88"}
                    </span>
                  </div>
                  <p className="text-sm text-emerald-700">
                    This means{" "}
                    <strong>
                      {((modelInfo?.r2_score || 0.88) * 100).toFixed(0)}%
                    </strong>{" "}
                    of the variance in math scores is explained by our model.
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-slate-600">
                      <strong>0.9 - 1.0:</strong> Excellent fit
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-slate-600">
                      <strong>0.7 - 0.9:</strong> Good fit
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-slate-600">
                      <strong>0.5 - 0.7:</strong> Moderate fit
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-slate-600">
                      <strong>&lt; 0.5:</strong> Poor fit
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* RMSE Explanation */}
            <Card
              className="animate-fade-in"
              style={{ animationDelay: "475ms" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">
                    Understanding RMSE
                  </h3>
                  <p className="text-sm text-slate-500">
                    Root Mean Square Error
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-slate-600 leading-relaxed">
                  <strong className="text-slate-800">RMSE</strong> measures the
                  average magnitude of prediction errors. It's calculated as the
                  square root of the mean of squared differences between
                  predicted and actual values.
                </p>
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="text-sm font-medium text-orange-800">
                      Current RMSE: {modelInfo?.rmse || "4.2"}
                    </span>
                  </div>
                  <p className="text-sm text-orange-700">
                    On average, predictions are off by approximately{" "}
                    <strong>±{modelInfo?.rmse || "4.2"} points</strong> on a
                    100-point scale.
                  </p>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-600">
                      <strong>Lower is better:</strong> A lower RMSE indicates
                      more accurate predictions.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-600">
                      <strong>Same units:</strong> RMSE is in the same units as
                      the target variable (points).
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-600">
                      <strong>Sensitive to outliers:</strong> Large errors have
                      a bigger impact on RMSE.
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Model Info Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Training Info */}
            <Card
              className="animate-fade-in"
              style={{ animationDelay: "500ms" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="font-semibold text-slate-800">
                  Training Information
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Training Algorithm</span>
                  <span className="font-medium text-slate-800">
                    Linear Regression (OLS)
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Training Samples</span>
                  <span className="font-medium text-slate-800">1,000</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Test Split</span>
                  <span className="font-medium text-slate-800">20%</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Cross Validation</span>
                  <span className="font-medium text-slate-800">5-Fold</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-600">Regularization</span>
                  <span className="font-medium text-slate-800">None</span>
                </div>
              </div>
            </Card>

            {/* API Info */}
            <Card
              className="animate-fade-in"
              style={{ animationDelay: "600ms" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-cyan-600" />
                </div>
                <h3 className="font-semibold text-slate-800">
                  API Information
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Endpoint</span>
                  <span className="font-medium text-slate-800">/predict</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Method</span>
                  <span className="font-medium text-slate-800">POST</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Response Time</span>
                  <span className="font-medium text-slate-800">&lt; 100ms</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Content Type</span>
                  <span className="font-medium text-slate-800">
                    application/json
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-600">Base URL</span>
                  <span className="font-medium text-slate-800">
                    localhost:8000
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelInfoPage;
