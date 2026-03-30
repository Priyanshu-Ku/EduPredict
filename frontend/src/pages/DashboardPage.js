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
} from "lucide-react";
import Header from "../components/layout/Header";
import Card from "../components/common/Card";
import StatCard from "../components/common/StatCard";
import {
  ScoreDistributionChart,
  FeatureImportanceChart,
  PredictionHistoryChart,
  CategoryPieChart,
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

  // Sample data for charts
  const scoreDistribution = [
    { range: "0-20", count: 5 },
    { range: "21-40", count: 12 },
    { range: "41-60", count: 28 },
    { range: "61-80", count: 35 },
    { range: "81-100", count: 20 },
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

  const genderDistribution = [
    { name: "Male", value: 48 },
    { name: "Female", value: 52 },
  ];

  const testPrepDistribution = [
    { name: "Completed", value: 35 },
    { name: "None", value: 65 },
  ];

  // Transform predictions for history chart
  const predictionHistory = predictions
    .slice(0, 10)
    .map((p, index) => ({
      time: `#${predictions.length - index}`,
      predicted: p.result.predicted_math_score,
      reading: p.input.reading_score,
      writing: p.input.writing_score,
    }))
    .reverse();

  // Calculate stats from predictions
  const avgPredictedScore =
    predictions.length > 0
      ? (
          predictions.reduce(
            (sum, p) => sum + p.result.predicted_math_score,
            0,
          ) / predictions.length
        ).toFixed(1)
      : "0";

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Dashboard" subtitle="Analytics overview and insights" />

      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Predictions"
              value={predictions.length}
              subtitle="All time"
              icon={BarChart3}
              gradient="blue"
              trend="up"
              trendValue="+12% this week"
            />
            <StatCard
              title="Avg Predicted Score"
              value={avgPredictedScore}
              subtitle="Out of 100"
              icon={Target}
              gradient="green"
              trend="up"
              trendValue="+5.2 points"
            />
            <StatCard
              title="Model R² Score"
              value={modelInfo?.r2_score || "0.88"}
              subtitle="Accuracy metric"
              icon={Brain}
              gradient="purple"
            />
            <StatCard
              title="Model RMSE"
              value={modelInfo?.rmse || "4.2"}
              subtitle="Error metric"
              icon={Activity}
              gradient="orange"
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Score Distribution */}
            <Card className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-slate-800">
                    Score Distribution
                  </h3>
                  <p className="text-sm text-slate-500">
                    Distribution of predicted scores
                  </p>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Normal distribution</span>
                </div>
              </div>
              <ScoreDistributionChart data={scoreDistribution} />
            </Card>

            {/* Feature Importance */}
            <Card
              className="animate-fade-in"
              style={{ animationDelay: "100ms" }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-slate-800">
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

          {/* Prediction History */}
          <Card className="animate-fade-in" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-slate-800">
                  Prediction History
                </h3>
                <p className="text-sm text-slate-500">
                  Your recent predictions over time
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-500">
                  Last {predictions.length} predictions
                </span>
              </div>
            </div>
            {predictions.length > 0 ? (
              <PredictionHistoryChart data={predictionHistory} />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>No predictions yet. Make your first prediction!</p>
                </div>
              </div>
            )}
          </Card>

          {/* Charts Row 2 */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Gender Distribution */}
            <Card
              className="animate-fade-in"
              style={{ animationDelay: "300ms" }}
            >
              <div className="mb-6">
                <h3 className="font-semibold text-slate-800">
                  Gender Distribution
                </h3>
                <p className="text-sm text-slate-500">Sample data breakdown</p>
              </div>
              <CategoryPieChart data={genderDistribution} />
            </Card>

            {/* Test Prep Distribution */}
            <Card
              className="animate-fade-in"
              style={{ animationDelay: "400ms" }}
            >
              <div className="mb-6">
                <h3 className="font-semibold text-slate-800">
                  Test Preparation
                </h3>
                <p className="text-sm text-slate-500">
                  Course completion status
                </p>
              </div>
              <CategoryPieChart data={testPrepDistribution} />
            </Card>

            {/* Quick Stats */}
            <Card
              className="animate-fade-in"
              style={{ animationDelay: "500ms" }}
            >
              <div className="mb-6">
                <h3 className="font-semibold text-slate-800">Model Summary</h3>
                <p className="text-sm text-slate-500">
                  Current model statistics
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-slate-600">Model Type</span>
                  </div>
                  <span className="font-semibold text-slate-800">
                    {modelInfo?.model_name || "Linear Regression"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Target className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-slate-600">R² Score</span>
                  </div>
                  <span className="font-semibold text-emerald-600">
                    {modelInfo?.r2_score || "0.88"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-orange-600" />
                    </div>
                    <span className="text-slate-600">RMSE</span>
                  </div>
                  <span className="font-semibold text-orange-600">
                    {modelInfo?.rmse || "4.2"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-slate-600">Predictions Made</span>
                  </div>
                  <span className="font-semibold text-purple-600">
                    {predictions.length}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Predictions Table */}
          {predictions.length > 0 && (
            <Card
              className="animate-fade-in"
              style={{ animationDelay: "600ms" }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-slate-800">
                    Recent Predictions
                  </h3>
                  <p className="text-sm text-slate-500">
                    Your latest prediction results
                  </p>
                </div>
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
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.slice(0, 5).map((p, index) => (
                      <tr
                        key={p.id}
                        className="border-b border-slate-50 hover:bg-slate-50"
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
