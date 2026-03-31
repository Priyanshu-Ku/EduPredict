import React from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f97316",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const total = payload[0]?.payload?.total || 0;
    const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : "0.0";
    return (
      <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-slate-100">
        <p className="text-sm font-semibold text-slate-800">{data.name}</p>
        <p className="text-sm text-slate-600 mt-1">
          Count: <span className="font-medium">{data.value}</span>
        </p>
        <p className="text-sm text-slate-600">
          Percentage:{" "}
          <span className="font-medium">
            {percentage}%
          </span>
        </p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-slate-600">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return percent > 0.05 ? (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-semibold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
};

const PieChart = ({
  data = [],
  dataKey = "value",
  nameKey = "name",
  height = 300,
  innerRadius = 60,
  outerRadius = 100,
  showLegend = true,
  title,
  subtitle,
  colors = COLORS,
}) => {
  // Normalize data: ensure array and numeric values
  const safeData = Array.isArray(data) ? data : [];
  const total = safeData.reduce((sum, item) => {
    const value = Number(item?.[dataKey]) || 0;
    return sum + value;
  }, 0);
  const dataWithTotal = safeData.map((item) => ({
    ...item,
    [dataKey]: Number(item?.[dataKey]) || 0,
    total,
  }));

  return (
    <div className="w-full">
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="font-semibold text-slate-800">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={dataWithTotal}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={3}
            dataKey={dataKey}
            nameKey={nameKey}
            labelLine={false}
            label={renderCustomizedLabel}
          >
            {dataWithTotal.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
                stroke="white"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend content={<CustomLegend />} />}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChart;
