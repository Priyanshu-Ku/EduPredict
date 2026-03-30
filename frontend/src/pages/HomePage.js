import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Zap,
  Server,
  GraduationCap,
} from "lucide-react";
import Button from "../components/common/Button";
import Header from "../components/layout/Header";

const HomePage = () => {
  const features = [
    {
      icon: Zap,
      title: "Real-time Prediction",
      description:
        "Get instant math score predictions with sub-100ms response time using our optimized ML pipeline.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Brain,
      title: "ML Model Analytics",
      description:
        "Linear Regression model with 88% R² accuracy trained on student performance data.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: BarChart3,
      title: "Interactive Dashboard",
      description:
        "Beautiful visualizations with Recharts to explore predictions and model performance.",
      color: "from-emerald-500 to-emerald-600",
    },
    {
      icon: Server,
      title: "FastAPI Backend",
      description:
        "High-performance REST API built with FastAPI, Pydantic validation, and async support.",
      color: "from-orange-500 to-orange-600",
    },
  ];

  const techStack = [
    { name: "React", color: "bg-cyan-100 text-cyan-700" },
    { name: "Tailwind CSS", color: "bg-sky-100 text-sky-700" },
    { name: "FastAPI", color: "bg-emerald-100 text-emerald-700" },
    { name: "Scikit-learn", color: "bg-orange-100 text-orange-700" },
    { name: "Pandas", color: "bg-blue-100 text-blue-700" },
    { name: "NumPy", color: "bg-purple-100 text-purple-700" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        title="Welcome"
        subtitle="Student Performance Prediction Platform"
      />

      {/* Hero Section */}
      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-purple-700 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-6">
                  <GraduationCap className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    ML-Powered Education Analytics
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  EduPredict
                </h1>
                <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-blue-200">
                  Student Performance Prediction System
                </h2>
                <p className="text-lg text-blue-100 mb-8 max-w-lg">
                  Predict student math scores using machine learning based on
                  demographic factors, parental education, and academic
                  indicators. Make data-driven decisions for better educational
                  outcomes.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/predict">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="!text-primary-700 !shadow-none"
                    >
                      Make Prediction
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button
                      variant="outline"
                      size="lg"
                      className="!border-white !text-white hover:!bg-white/10"
                    >
                      View Dashboard
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex-shrink-0">
                <div className="w-64 h-64 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl font-bold">78.5</div>
                    <p className="text-blue-200 mt-2 text-lg">Predicted Score</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Powerful Features
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              A complete ML-powered solution for predicting and analyzing
              student performance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 card-hover animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="px-6 py-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Tech Stack
            </h2>
            <p className="text-slate-600">
              Built with modern technologies for performance and scalability.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {techStack.map((tech, index) => (
              <div
                key={index}
                className={`px-6 py-3 rounded-xl ${tech.color} font-semibold text-lg animate-fade-in`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {tech.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Predict Student Performance?
            </h2>
            <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
              Start using our ML-powered prediction system today. Simply enter
              student details and get accurate math score predictions instantly.
            </p>
            <Link to="/predict">
              <Button size="lg">
                Get Started Now
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-slate-200">
        <div className="max-w-6xl mx-auto text-center text-slate-500 text-sm">
          <p>© 2024 EduPredict – Student Performance Prediction System</p>
          <p className="mt-2">
            Built with React, Tailwind CSS, FastAPI, and Scikit-learn
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
