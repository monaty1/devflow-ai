"use client";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

interface CostProjectionChartProps {
  chartData: Record<string, unknown>[];
  topModelNames: string[];
}

export function CostProjectionChart({ chartData, topModelNames }: CostProjectionChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData}>
        <defs>
          {topModelNames.map((name, i) => (
            <linearGradient key={name} id={`color${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.1}/>
              <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0}/>
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tick={{fontSize: 10, fill: 'gray'}}
          interval={6}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{fontSize: 10, fill: 'gray'}}
          tickFormatter={(val: number) => `$${val}`}
        />
        <RechartsTooltip
          contentStyle={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px', color: 'var(--color-foreground)' }}
          itemStyle={{ padding: '2px 0' }}
        />
        {topModelNames.map((name, i) => (
          <Area
            key={name}
            type="monotone"
            dataKey={name}
            stroke={COLORS[i % COLORS.length] as string}
            fillOpacity={1}
            fill={`url(#color${i})`}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
