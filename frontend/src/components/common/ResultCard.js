import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const ResultCard = ({
  score,
  title = "Predicted Math Score",
  subtitle,
  showTrend = true,
  compareScore,
  size = "large",
  className = "",
}) => {
  const getScoreColor = (s) => {
    if (s >= 80) return { text: "text-emerald-600", bg: "bg-emerald-500" };
    if (s >= 60) return { text: "text-blue-600", bg: "bg-blue-500" };
    if (s >= 40) return { text: "text-orange-600", bg: "bg-orange-500" };
    return { text: "text-red-600", bg: "bg-red-500" };
  };

  const getScoreGradient = (s) => {
    if (s >= 80) return "from-emerald-500 to-emerald-600";
    if (s >= 60) return "from-blue-500 to-blue-600";
    if (s >= 40) return "from-orange-500 to-orange-600";
    return "from-red-500 to-red-600";
  };

  const getScoreLabel = (s) => {
    if (s >= 90) return "Excellent";
    if (s >= 80) return "Very Good";
    if (s >= 70) return "Good";
    if (s >= 60) return "Above Average";
    if (s >= 50) return "Average";
    if (s >= 40) return "Below Average";
    return "Needs Improvement";
  };

  const getTrend = () => {
    if (!compareScore) return null;
    const diff = score - compareScore;
    if (diff > 0)
      return {
        icon: TrendingUp,
        color: "text-emerald-500",
        label: `+${diff.toFixed(1)}`,
      };
    if (diff < 0)
      return {
        icon: TrendingDown,
        color: "text-red-500",
        label: diff.toFixed(1),
      };
    return { icon: Minus, color: "text-slate-500", label: "0" };
  };

  const colors = getScoreColor(score);
  const trend = getTrend();

  const sizeClasses = {
    small: {
      circle: "w-24 h-24",
      inner: "w-20 h-20",
      score: "text-2xl",
      max: "text-sm",
    },
    medium: {
      circle: "w-32 h-32",
      inner: "w-28 h-28",
      score: "text-4xl",
      max: "text-lg",
    },
    large: {
      circle: "w-48 h-48",
      inner: "w-40 h-40",
      score: "text-6xl",
      max: "text-2xl",
    },
  };

  const sizes = sizeClasses[size] || sizeClasses.large;

  return (
    <div
      className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-100 ${className}`}
    >
      <div className="text-center">
        {title && <p className="text-slate-500 mb-4">{title}</p>}

        {/* Score Circle */}
        <div className="relative inline-block">
          <div
            className={`${sizes.circle} rounded-full bg-gradient-to-br ${getScoreGradient(score)} flex items-center justify-center shadow-2xl mx-auto`}
          >
            <div
              className={`${sizes.inner} rounded-full bg-white flex items-center justify-center`}
            >
              <div>
                <span className={`${sizes.score} font-bold ${colors.text}`}>
                  {typeof score === "number" ? score.toFixed(1) : score}
                </span>
                <span className={`${sizes.max} text-slate-400`}>/100</span>
              </div>
            </div>
          </div>

          {/* Animated ring */}
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-slate-100"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${(score / 100) * 283} 283`}
              strokeLinecap="round"
              className={colors.text}
              style={{
                transition: "stroke-dasharray 1s ease-in-out",
              }}
            />
          </svg>
        </div>

        {/* Score Label */}
        <div className="mt-6">
          <span
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${getScoreGradient(score)} text-white font-medium`}
          >
            <TrendingUp className="w-4 h-4" />
            {getScoreLabel(score)}
          </span>
        </div>

        {/* Trend Indicator */}
        {showTrend && trend && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <trend.icon className={`w-4 h-4 ${trend.color}`} />
            <span className={`text-sm font-medium ${trend.color}`}>
              {trend.label} from average
            </span>
          </div>
        )}

        {subtitle && <p className="mt-4 text-sm text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
};

export default ResultCard;
