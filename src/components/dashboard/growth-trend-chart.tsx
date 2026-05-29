"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type GrowthTrendItem = {
  year: number;
  athletes: number;
  teams: number;
};

interface GrowthTrendChartProps {
  data: GrowthTrendItem[];
}

export function GrowthTrendChart({ data }: GrowthTrendChartProps) {
  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle>Growth trend</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No growth data available yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="year" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="teams" stroke="#2563eb" strokeWidth={3} dot />
              <Line type="monotone" dataKey="athletes" stroke="#16a34a" strokeWidth={3} dot />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
