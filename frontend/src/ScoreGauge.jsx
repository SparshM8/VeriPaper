import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export default function ScoreGauge({ score, label, color = "#22c55e" }) {
  const normalizedScore = Math.max(0, Math.min(100, score));
  const data = [
    { name: "Score", value: normalizedScore },
    { name: "Remaining", value: 100 - normalizedScore }
  ];

  const shadowColor = score >= 75 ? "0 4px 15px rgba(16, 185, 129, 0.3)" : score >= 50 ? "0 4px 15px rgba(245, 158, 11, 0.3)" : "0 4px 15px rgba(239, 68, 68, 0.3)";

  return (
    <div className="card-elevated border-0 text-center hover:shadow-lg transition-shadow duration-300" style={{ boxShadow: shadowColor }}>
      <div style={{ width: "100%", height: "100px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={45}
              outerRadius={70}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={color} />
              <Cell fill="#e2e8f0" className="dark:fill-slate-800" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3">
        <p className="text-3xl font-bold transition-all duration-300" style={{ color }}>
          {Math.round(normalizedScore)}%
        </p>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 tracking-wide">{label}</p>
      </div>
    </div>
  );
}
