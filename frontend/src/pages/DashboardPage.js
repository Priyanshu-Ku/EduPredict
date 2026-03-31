import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Activity,
  Brain,
  Calendar,
  ArrowUpRight,
  Gauge,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Header from "../components/layout/Header";
import Card from "../components/common/Card";
import {
  StatCard,
  BarChart,
  PieChart,
  LineChart,
} from "../components/dashboard";
import {
  FeatureImportanceChart,
  ModelPerformanceChart,
} from "../components/charts/Charts";
import { usePrediction } from "../context/PredictionContext";
import { predictionService } from "../services/api";

const DashboardPage = () => {
  const { predictions } = usePrediction();
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModelInfo = async () => {
      try {
        const data = await predictionService.getModelInfo();
        setModelInfo(data);
      } catch (error) {
        console.error("Failed to fetch model info:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchModelInfo();
  }, []);

  // Mock data for student predicted scores (Bar Chart)
  const studentScores = [
    { name: "Student A", value: 78 },
    { name: "Student B", value: 85 },
    { name: "Student C", value: 62 },
    { name: "Student D", value: 91 },
    { name: "Student E", value: 73 },
    { name: "Student F", value: 88 },
    { name: "Student G", value: 55 },
    { name: "Student H", value: 82 },
  ];

  // Pass vs Fail distribution (Pie Chart) - Pass >= 60
  const passFailData = [
    { name: "Pass (≥60)", value: 68 },
    { name: "Fail (<60)", value: 32 },
  ];

  // Score trend over time (Line Chart)
  const scoreTrend = [
    { name: "Week 1", avgScore: 65, predictedAvg: 67 },
    { name: "Week 2", avgScore: 68, predictedAvg: 70 },
    { name: "Week 3", avgScore: 72, predictedAvg: 74 },
    { name: "Week 4", avgScore: 70, predictedAvg: 73 },
    { name: "Week 5", avgScore: 75, predictedAvg: 77 },
    { name: "Week 6", avgScore: 78, predictedAvg: 80 },
    { name: "Week 7", avgScore: 82, predictedAvg: 83 },
    { name: "Week 8", avgScore: 85, predictedAvg: 86 },
  ];

  // Model Performance data (R² vs RMSE comparison)
  const modelPerformanceData = [
    { metric: "R² Score (%)", value: (modelInfo?.r2_score || 0.88) * 100 },
    { metric: "Accuracy (%)", value: 88 },
    { metric: "RMSE", value: modelInfo?.rmse || 4.2 },
    { metric: "MAE", value: 3.1 },
  ];

  const featureImportance = [
    { feature: "Reading Score", importance: 0.42 },
    { feature: "Writing Score", importance: 0.38 },
    { feature: "Parental Education", importance: 0.08 },
    { feature: "Test Preparation", importance: 0.06 },
    { feature: "Lunch Type", importance: 0.03 },
    { feature: "Gender", importance: 0.02 },
    { feature: "Race/Ethnicity", importance: 0.01 },
  ];

  // Calculate stats from predictions
  const avgPredictedScore =
    predictions.length > 0
      ? (
          predictions.reduce(
            (sum, p) => sum + p.result.predicted_math_score,
            0,
          ) / predictions.length
        ).toFixed(1)
      : "72.5";

  const totalPredictions = predictions.length > 0 ? predictions.length : 156;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Header
        title="EduPredict Dashboard"
        subtitle="Analytics overview and ML model insights"
      />

      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Stats Grid - 4 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Model R² Score"
              value={modelInfo?.r2_score?.toFixed(2) || "0.88"}
              subtitle="Accuracy metric"
              icon={Target}
              gradient="green"
              trend="up"
              trendValue="+2.3% improved"
            />
            <StatCard
              title="Model RMSE"
              value={modelInfo?.rmse?.toFixed(1) || "4.2"}
              subtitle="Error metric (lower is better)"
              icon={Activity}
              gradient="orange"
              trend="down"
              trendValue="-0.5 reduced"
            />
            <StatCard
              title="Avg Predicted Score"
              value={avgPredictedScore}
              subtitle="Out of 100 points"
              icon={Gauge}
              gradient="purple"
              trend="up"
              trendValue="+5.2 points"
            />
            <StatCard
              title="Total Predictions"
              value={totalPredictions}
              subtitle="All time predictions"
              icon={BarChart3}
              gradient="blue"
              trend="up"
              trendValue="+12% this week"
            />
          </div>

          {/* Charts Row 1 - Bar Chart & Pie Chart */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Bar Chart - Student Predicted Scores */}
            <Card className="animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">
                    Student Predicted Scores
                  </h3>
                  <p className="text-sm text-slate-500">
                    Sample predictions for recent students
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
                  <ArrowUpRight className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">
                    8 students
                  </span>
                </div>
              </div>
              <BarChart
                data={studentScores}
                xKey="name"
                yKey="value"
                height={280}
                colorful={true}
              />
            </Card>

            {/* Pie Chart - Pass vs Fail */}
            <Card
              className="animate-fade-in"
              style={{ animationDelay: "100ms" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">
                    Pass vs Fail Distribution
                  </h3>
                  <p className="text-sm text-slate-500">
                    Students scoring ≥60 vs &lt;60
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-full text-xs font-medium text-emerald-700">
                    <CheckCircle className="w-3.5 h-3.5" /> 68% Pass
                  </span>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 rounded-full text-xs font-medium text-red-700">
                    <XCircle className="w-3.5 h-3.5" /> 32% Fail
                  </span>
                </div>
              </div>
              <PieChart
                data={passFailData}
                dataKey="value"
                nameKey="name"
                height={280}
                innerRadius={50}
                outerRadius={90}
                colors={["#10b981", "#ef4444"]}
              />
            </Card>
          </div>

          {/* Charts Row 2 - Line Chart (Full Width) */}
          <Card className="animate-fade-in" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-800 text-lg">
                  Score Trend Over Time
                </h3>
                <p className="text-sm text-slate-500">
                  Average actual vs predicted scores by week
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-500">Last 8 weeks</span>
              </div>
            </div>
            <LineChart
              data={scoreTrend}
              xKey="name"
              lines={[
                { key: "avgScore", name: "Actual Avg Score", color: "#3b82f6" },
                {
                  key: "predictedAvg",
                  name: "Predicted Avg Score",
                  color: "#10b981",
                },
              ]}
              height={320}
              yDomain={[50, 100]}
              showLegend={true}
              showDots={true}
            />
          </Card>

          {/* Charts Row 3 - Model Performance & Feature Importance */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Model Performance Chart */}
            <Card
              className="animate-fade-in"
              style={{ animationDelay: "300ms" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">
                    Model Performance Metrics
                  </h3>
                  <p className="text-sm text-slate-500">
                    R² Score, Accuracy, RMSE & MAE comparison
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-full">
                  <Brain className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">
                    {modelInfo?.model_name || "Linear Regression"}
                  </span>
                </div>
              </div>
              <ModelPerformanceChart data={modelPerformanceData} />
            </Card>

            {/* Feature Importance */}
            <Card
              className="animate-fade-in"
              style={{ animationDelay: "400ms" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">
                    Feature Importance
                  </h3>
                  <p className="text-sm text-slate-500">
                    Impact of each feature on predictions
                  </p>
                </div>
              </div>
              <FeatureImportanceChart data={featureImportance} />
            </Card>
          </div>

          {/* Model Summary Card */}
          <Card className="animate-fade-in" style={{ animationDelay: "500ms" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-lg">
                  Model Summary
                </h3>
                <p className="text-sm text-slate-500">
                  Current model configuration and statistics
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-slate-600">Model Type</span>
                </div>
                <p className="font-semibold text-slate-800">
                  {modelInfo?.model_name || "Linear Regression"}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm text-slate-600">R² Score</span>
                </div>
                <p className="font-semibold text-emerald-600 text-xl">
                  {modelInfo?.r2_score?.toFixed(2) || "0.88"}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl border border-orange-100">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-orange-600" />
                  <span className="text-sm text-slate-600">RMSE</span>
                </div>
                <p className="font-semibold text-orange-600 text-xl">
                  {modelInfo?.rmse?.toFixed(1) || "4.2"}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-slate-600">Predictions</span>
                </div>
                <p className="font-semibold text-purple-600 text-xl">
                  {totalPredictions}
                </p>
              </div>
            </div>
          </Card>

          {/* Recent Predictions Table */}
          {predictions.length > 0 && (
            <Card
              className="animate-fade-in"
              style={{ animationDelay: "600ms" }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">
                    Recent Predictions
                  </h3>
                  <p className="text-sm text-slate-500">
                    Your latest prediction results
                  </p>
                </div>
                <span className="px-3 py-1.5 bg-blue-50 rounded-full text-sm font-medium text-blue-600">
                  {predictions.length} total
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                        Time
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                        Gender
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                        Reading
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                        Writing
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                        Predicted Math
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.slice(0, 5).map((p, index) => (
                      <tr
                        key={p.id}
                        className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {new Date(p.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600 capitalize">
                          {p.input.gender}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {p.input.reading_score}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {p.input.writing_score}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                            {p.result.predicted_math_score.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {p.result.predicted_math_score >= 60 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                              <CheckCircle className="w-3.5 h-3.5" /> Pass
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                              <XCircle className="w-3.5 h-3.5" /> At Risk
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
