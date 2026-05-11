"use client";

import { ResponsiveContainer, LineChart, Line, YAxis } from "recharts";

export default function Sparkline({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((v, i) => ({ i, v }));
  const max = Math.max(...data, 1);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
        <YAxis hide domain={[0, max * 1.1]} />
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.8}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
