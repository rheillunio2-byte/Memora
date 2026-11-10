import { useReducedMotion } from "framer-motion";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ChartPoint } from "../pages/ctx";

const tick = { fill: "var(--muted)", fontSize: 12 };
const tooltip = { background: "var(--raise)", border: "1px solid var(--line2)", borderRadius: 10, color: "var(--text)", fontSize: 13 };

export function AccuracyChart({ data, height = 210 }: { data: ChartPoint[]; height?: number }) {
  const reduce = useReducedMotion();
  return (
    <div role="img" aria-label="Daily average examination accuracy over the last 7 days" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
          <defs><linearGradient id="accFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8B7CF6" stopOpacity={0.3} /><stop offset="95%" stopColor="#8B7CF6" stopOpacity={0} /></linearGradient></defs>
          <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="var(--line)" />
          <XAxis dataKey="day" tickLine={false} axisLine={false} tick={tick} />
          <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={tick} />
          <Tooltip contentStyle={tooltip} formatter={(v) => [`${v}%`, "Accuracy"]} />
          <Area type="monotone" dataKey="accuracy" stroke="#8B7CF6" strokeWidth={2.5} fill="url(#accFill)" isAnimationActive={!reduce} animationDuration={900} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MinutesChart({ data, height = 210 }: { data: ChartPoint[]; height?: number }) {
  const reduce = useReducedMotion();
  return (
    <div role="img" aria-label="Minutes spent in examinations per day over the last 7 days" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="var(--line)" />
          <XAxis dataKey="day" tickLine={false} axisLine={false} tick={tick} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={tick} />
          <Tooltip contentStyle={tooltip} cursor={{ fill: "var(--line)" }} formatter={(v) => [`${v} min`, "Exam time"]} />
          <Bar dataKey="minutes" fill="#6D63E8" radius={[6, 6, 0, 0]} isAnimationActive={!reduce} animationDuration={800} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
