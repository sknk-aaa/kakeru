"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

interface Props {
  data: number[];
  today: string;
  color?: string;
  unit?: string;
  height?: number;
}

export default function DailyBarChart({
  data, today, color = "#FF6B00", unit, height = 280,
}: Props) {
  const days = data.length;
  const interval = days <= 7 ? 0 : 4;

  const chartData = data.map((v, i) => {
    const msOffset = (days - 1 - i) * 86400000;
    const d = new Date(Date.parse(today + "T00:00:00+09:00") - msOffset);
    return { label: `${d.getMonth() + 1}/${d.getDate()}`, v };
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 4, left: unit === "¥" ? 20 : 0 }}>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#9AA1B1" }}
          interval={interval}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#9AA1B1" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
          tickFormatter={unit === "¥" ? (v: number) => `¥${v}` : undefined}
        />
        <Tooltip
          formatter={(v) =>
            unit === "¥"
              ? [`¥${(v as number).toLocaleString()}`, "金額"]
              : [`${v}`, "件数"]
          }
          contentStyle={{ fontSize: "12px", borderRadius: "8px", border: "1px solid #E7E9EE" }}
          cursor={{ fill: "rgba(0,0,0,0.04)" }}
        />
        <Bar dataKey="v" fill={color} radius={[3, 3, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}
