import React from "react";
import clsx from "clsx";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  gradient = "blue",
  className,
}) => {
  const gradients = {
    blue: "from-blue-500 to-blue-600",
    green: "from-emerald-500 to-emerald-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    pink: "from-pink-500 to-pink-600",
    cyan: "from-cyan-500 to-cyan-600",
    red: "from-red-500 to-red-600",
  };

  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up"
      ? "text-emerald-600 bg-emerald-50"
      : trend === "down"
        ? "text-red-600 bg-red-50"
        : "text-slate-500 bg-slate-50";

  return (
    <div
      className={clsx(
        "relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-slate-200",
        className,
      )}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
        <div
          className={clsx(
            "w-full h-full rounded-full bg-gradient-to-br transform translate-x-8 -translate-y-8",
            gradients[gradient],
          )}
        />
      </div>

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-3xl font-bold text-slate-800 mt-2 tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          )}
          {trendValue && (
            <div
              className={clsx(
                "inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-full text-xs font-semibold",
                trendColor,
              )}
            >
              <TrendIcon className="w-3.5 h-3.5" />
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div
            className={clsx(
              "w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg",
              gradients[gradient],
            )}
          >
            <Icon className="w-7 h-7 text-white" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
