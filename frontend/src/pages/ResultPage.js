import React from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  ArrowLeft,
  RefreshCw,
  Download,
  Share2,
  User,
  Users,
  BookOpen,
  Utensils,
  ClipboardCheck,
  TrendingUp,
} from "lucide-react";
import Header from "../components/layout/Header";
import Card from "../components/common/Card";
import Button from "../components/common/Button";

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { input, result } = location.state || {};

  if (!input || !result) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header title="Result" subtitle="Prediction result details" />
        <div className="p-6">
          <Card className="max-w-2xl mx-auto text-center py-12">
            <p className="text-slate-500 mb-4">No prediction data available.</p>
            <Link to="/predict">
              <Button>Make a Prediction</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreGradient = (score) => {
    if (score >= 80) return "from-emerald-500 to-emerald-600";
    if (score >= 60) return "from-blue-500 to-blue-600";
    if (score >= 40) return "from-orange-500 to-orange-600";
    return "from-red-500 to-red-600";
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Very Good";
    if (score >= 70) return "Good";
    if (score >= 60) return "Above Average";
    if (score >= 50) return "Average";
    if (score >= 40) return "Below Average";
    return "Needs Improvement";
  };

  const predictedScore = result.predicted_math_score;

  const inputDetails = [
    { label: "Gender", value: input.gender, icon: User },
    { label: "Race/Ethnicity", value: input.race_ethnicity, icon: Users },
    {
      label: "Parental Education",
      value: input.parental_level_of_education,
      icon: BookOpen,
    },
    { label: "Lunch Type", value: input.lunch, icon: Utensils },
    {
      label: "Test Preparation",
      value: input.test_preparation_course,
      icon: ClipboardCheck,
    },
  ];

  const scoreComparison = [
    {
      label: "Reading Score",
      value: input.reading_score,
      color: "bg-emerald-500",
    },
    {
      label: "Writing Score",
      value: input.writing_score,
      color: "bg-purple-500",
    },
    { label: "Predicted Math", value: predictedScore, color: "bg-blue-500" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Prediction Result"
        subtitle="View your predicted math score"
      />

      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Success Banner */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white animate-fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8" />
              <div>
                <h2 className="text-xl font-bold">Prediction Successful!</h2>
                <p className="text-emerald-100">
                  Your math score has been predicted based on the input data.
                </p>
              </div>
            </div>
          </div>

          {/* Main Result Card */}
          <Card className="animate-fade-in" style={{ animationDelay: "100ms" }}>
            <div className="text-center py-8">
              <p className="text-slate-500 mb-4">Predicted Math Score</p>
              <div className="relative inline-block">
                <div
                  className={`w-48 h-48 rounded-full bg-gradient-to-br ${getScoreGradient(
                    predictedScore,
                  )} flex items-center justify-center shadow-2xl mx-auto`}
                >
                  <div className="w-40 h-40 rounded-full bg-white flex items-center justify-center">
                    <div>
                      <span
                        className={`text-6xl font-bold ${getScoreColor(predictedScore)}`}
                      >
                        {predictedScore.toFixed(1)}
                      </span>
                      <span className="text-2xl text-slate-400">/100</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${getScoreGradient(
                    predictedScore,
                  )} text-white font-medium`}
                >
                  <TrendingUp className="w-4 h-4" />
                  {getScoreLabel(predictedScore)}
                </span>
              </div>
            </div>
          </Card>

          {/* Score Comparison */}
          <Card className="animate-fade-in" style={{ animationDelay: "200ms" }}>
            <h3 className="font-semibold text-slate-800 mb-6">
              Score Comparison
            </h3>
            <div className="space-y-4">
              {scoreComparison.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-32 text-sm text-slate-600">
                    {item.label}
                  </div>
                  <div className="flex-1">
                    <div className="h-8 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-1000 flex items-center justify-end pr-3`}
                        style={{ width: `${item.value}%` }}
                      >
                        <span className="text-white text-sm font-medium">
                          {item.value}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Input Details */}
          <Card className="animate-fade-in" style={{ animationDelay: "300ms" }}>
            <h3 className="font-semibold text-slate-800 mb-6">Input Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {inputDetails.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">{item.label}</p>
                      <p className="font-medium text-slate-800 capitalize">
                        {item.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Actions */}
          <div
            className="flex flex-col sm:flex-row gap-4 animate-fade-in"
            style={{ animationDelay: "400ms" }}
          >
            <Button onClick={() => navigate("/predict")} className="flex-1">
              <RefreshCw className="w-5 h-5" />
              Make Another Prediction
            </Button>
            <Button variant="secondary">
              <Download className="w-5 h-5" />
              Download Report
            </Button>
            <Button variant="secondary">
              <Share2 className="w-5 h-5" />
              Share
            </Button>
          </div>

          {/* Back Link */}
          <div className="text-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              View Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
