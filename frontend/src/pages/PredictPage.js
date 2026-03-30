import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Send,
  RefreshCw,
  User,
  Users,
  BookOpen,
  Utensils,
  ClipboardCheck,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Header from "../components/layout/Header";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import ResultCard from "../components/common/ResultCard";
import { predictionService } from "../services/api";
import { usePrediction } from "../context/PredictionContext";

const PredictPage = () => {
  const navigate = useNavigate();
  const { addPrediction } = usePrediction();

  const [formData, setFormData] = useState({
    gender: "",
    race_ethnicity: "",
    parental_level_of_education: "",
    lunch: "",
    test_preparation_course: "",
    reading_score: "",
    writing_score: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [predictionResult, setPredictionResult] = useState(null);

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
  ];

  const ethnicityOptions = [
    { value: "group A", label: "Group A" },
    { value: "group B", label: "Group B" },
    { value: "group C", label: "Group C" },
    { value: "group D", label: "Group D" },
    { value: "group E", label: "Group E" },
  ];

  const educationOptions = [
    { value: "some high school", label: "Some High School" },
    { value: "high school", label: "High School" },
    { value: "some college", label: "Some College" },
    { value: "associate's degree", label: "Associate's Degree" },
    { value: "bachelor's degree", label: "Bachelor's Degree" },
    { value: "master's degree", label: "Master's Degree" },
  ];

  const lunchOptions = [
    { value: "standard", label: "Standard" },
    { value: "free/reduced", label: "Free/Reduced" },
  ];

  const testPrepOptions = [
    { value: "none", label: "None" },
    { value: "completed", label: "Completed" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setPredictionResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPredictionResult(null);

    // Validation
    const requiredFields = Object.keys(formData);
    const emptyFields = requiredFields.filter((field) => !formData[field]);

    if (emptyFields.length > 0) {
      setError("Please fill in all fields");
      return;
    }

    const readingScore = parseFloat(formData.reading_score);
    const writingScore = parseFloat(formData.writing_score);

    if (isNaN(readingScore) || isNaN(writingScore)) {
      setError("Please enter valid numeric scores");
      return;
    }

    if (
      readingScore < 0 ||
      readingScore > 100 ||
      writingScore < 0 ||
      writingScore > 100
    ) {
      setError("Scores must be between 0 and 100");
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        ...formData,
        reading_score: readingScore,
        writing_score: writingScore,
      };

      const result = await predictionService.predict(requestData);
      setPredictionResult({ input: requestData, result });
      addPrediction(requestData, result);
    } catch (err) {
      console.error("Prediction error:", err);
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to make prediction. Please ensure the backend is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      gender: "",
      race_ethnicity: "",
      parental_level_of_education: "",
      lunch: "",
      test_preparation_course: "",
      reading_score: "",
      writing_score: "",
    });
    setError("");
    setPredictionResult(null);
  };

  const handleViewDetails = () => {
    if (predictionResult) {
      navigate("/result", {
        state: {
          input: predictionResult.input,
          result: predictionResult.result,
        },
      });
    }
  };

  const SelectField = ({ label, name, options, icon: Icon }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-400" />
          {label}
        </div>
      </label>
      <select
        name={name}
        value={formData[name]}
        onChange={handleChange}
        disabled={loading}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all bg-white text-slate-800 disabled:bg-slate-100 disabled:cursor-not-allowed"
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  const ScoreInput = ({ label, name, icon: Icon }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-400" />
          {label}
        </div>
      </label>
      <input
        type="number"
        name={name}
        value={formData[name]}
        onChange={handleChange}
        min="0"
        max="100"
        placeholder="0-100"
        disabled={loading}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Make Prediction"
        subtitle="Enter student details to predict math score"
      />

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Result Card - Shows when prediction is successful */}
          {predictionResult && (
            <div className="mb-6 animate-fade-in">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white mb-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-medium">
                    Prediction completed successfully!
                  </span>
                </div>
              </div>
              <ResultCard
                score={predictionResult.result.predicted_math_score}
                title="Predicted Math Score"
                subtitle={`Based on reading score (${predictionResult.input.reading_score}) and writing score (${predictionResult.input.writing_score})`}
                size="medium"
                showTrend={false}
              />
              <div className="flex gap-4 mt-4">
                <Button onClick={handleViewDetails} className="flex-1">
                  View Full Details
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button variant="secondary" onClick={handleReset}>
                  <RefreshCw className="w-5 h-5" />
                  New Prediction
                </Button>
              </div>
            </div>
          )}

          {/* Form Card */}
          <Card className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Student Information
                </h2>
                <p className="text-sm text-slate-500">
                  Fill in the details below
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-700">Error</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Demographics */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-700 pb-2 border-b border-slate-100">
                    Demographics
                  </h3>
                  <SelectField
                    label="Gender"
                    name="gender"
                    options={genderOptions}
                    icon={User}
                  />
                  <SelectField
                    label="Race/Ethnicity"
                    name="race_ethnicity"
                    options={ethnicityOptions}
                    icon={Users}
                  />
                  <SelectField
                    label="Parental Education"
                    name="parental_level_of_education"
                    options={educationOptions}
                    icon={BookOpen}
                  />
                </div>

                {/* Academic Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-700 pb-2 border-b border-slate-100">
                    Academic Information
                  </h3>
                  <SelectField
                    label="Lunch Type"
                    name="lunch"
                    options={lunchOptions}
                    icon={Utensils}
                  />
                  <SelectField
                    label="Test Preparation"
                    name="test_preparation_course"
                    options={testPrepOptions}
                    icon={ClipboardCheck}
                  />
                </div>
              </div>

              {/* Scores Section */}
              <div className="mt-8">
                <h3 className="font-semibold text-slate-700 pb-2 border-b border-slate-100 mb-4">
                  Current Scores
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <ScoreInput
                    label="Reading Score"
                    name="reading_score"
                    icon={BookOpen}
                  />
                  <ScoreInput
                    label="Writing Score"
                    name="writing_score"
                    icon={FileText}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-slate-100">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Predicting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Predict Math Score
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleReset}
                  disabled={loading}
                >
                  <RefreshCw className="w-5 h-5" />
                  Reset Form
                </Button>
              </div>
            </form>
          </Card>

          {/* Tips Card */}
          <Card className="mt-6 bg-blue-50 border-blue-100">
            <h3 className="font-semibold text-blue-800 mb-2">
              💡 Tips for Accurate Predictions
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Ensure all fields are filled accurately</li>
              <li>• Scores should be between 0 and 100</li>
              <li>
                • The model predicts math score based on the provided features
              </li>
              <li>
                • Make sure the FastAPI backend is running at{" "}
                <code className="bg-blue-100 px-1 rounded">
                  http://localhost:8000
                </code>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PredictPage;
