import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export default function ScoreGauge({ score, label, color = "#22c55e" }) {
  const normalizedScore = Math.max(0, Math.min(100, score));
  const data = [
    { name: "Score", value: normalizedScore },
    { name: "Remaining", value: 100 - normalizedScore }
  ];

  return (
    <div className="card text-center">
      <div style={{ width: "100%", height: "80px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={40}
              outerRadius={60}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={color} />
              <Cell fill="#e2e8f0" className="dark:fill-slate-800" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold" style={{ color }}>
          {Math.round(normalizedScore)}%
        </p>
        <p className="text-xs text-slate-500 mt-1">{label}</p>
      </div>
    </div>
  );
}
