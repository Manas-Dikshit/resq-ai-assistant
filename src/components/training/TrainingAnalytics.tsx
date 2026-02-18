import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Users, BookOpen, MapPin, TrendingUp, CheckCircle, Award } from "lucide-react";
import type { Training } from "@/hooks/useTrainings";

const COLORS = ["#10b981", "#3b82f6", "#f97316", "#a855f7", "#eab308", "#ef4444", "#06b6d4", "#6366f1", "#78716c", "#f59e0b"];

interface TrainingAnalyticsProps {
  trainings: Training[];
}

function SummaryCard({ icon: Icon, label, value, sub, color }: {
  icon: any; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="glass rounded-xl p-4 flex items-center gap-3">
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xl font-display font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {sub && <p className="text-xs text-primary mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-lg p-3 border border-border text-xs">
      <p className="font-display font-bold text-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function TrainingAnalytics({ trainings }: TrainingAnalyticsProps) {
  const stats = useMemo(() => {
    const totalParticipants = trainings.reduce((s, t) => s + t.participants_total, 0);
    const verified = trainings.filter(t => t.verified).length;
    const states = new Set(trainings.map(t => t.state)).size;

    // By theme
    const themeMap = trainings.reduce((acc, t) => {
      acc[t.theme] = (acc[t.theme] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const byTheme = Object.entries(themeMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name: name.split(" ")[0], value, full: name }));

    // By state
    const stateMap = trainings.reduce((acc, t) => {
      acc[t.state] = (acc[t.state] ?? 0) + t.participants_total;
      return acc;
    }, {} as Record<string, number>);
    const byState = Object.entries(stateMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));

    // By level
    const levelMap = trainings.reduce((acc, t) => {
      acc[t.level] = (acc[t.level] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const byLevel = Object.entries(levelMap).map(([name, value]) => ({ name, value }));

    // Gender split
    const totalMale = trainings.reduce((s, t) => s + t.participants_male, 0);
    const totalFemale = trainings.reduce((s, t) => s + t.participants_female, 0);

    // Monthly trend (last 6 months)
    const now = new Date();
    const monthly = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const label = d.toLocaleString("default", { month: "short" });
      const count = trainings.filter(t => {
        const td = new Date(t.start_date);
        return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
      }).length;
      return { name: label, Trainings: count };
    });

    return { totalParticipants, verified, states, byTheme, byState, byLevel, totalMale, totalFemale, monthly };
  }, [trainings]);

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <SummaryCard icon={BookOpen} label="Total Trainings" value={trainings.length} color="bg-primary/10 text-primary" />
        <SummaryCard icon={Users} label="Total Participants" value={stats.totalParticipants.toLocaleString()} color="bg-flood/10 text-flood" />
        <SummaryCard icon={MapPin} label="States Covered" value={stats.states} color="bg-safe/10 text-safe" />
        <SummaryCard icon={CheckCircle} label="Verified" value={stats.verified} sub={`${Math.round(stats.verified / Math.max(1, trainings.length) * 100)}% verified`} color="bg-safe/10 text-safe" />
        <SummaryCard icon={TrendingUp} label="Male Participants" value={stats.totalMale.toLocaleString()} color="bg-flood/10 text-flood" />
        <SummaryCard icon={Award} label="Female Participants" value={stats.totalFemale.toLocaleString()} color="bg-quake/10 text-quake" />
      </div>

      {/* Monthly trend */}
      <div className="glass rounded-xl p-4">
        <h3 className="font-display text-sm font-bold text-foreground mb-3">Monthly Training Trend</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={stats.monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
            <XAxis dataKey="name" tick={{ fill: "hsl(215 15% 55%)", fontSize: 11 }} />
            <YAxis tick={{ fill: "hsl(215 15% 55%)", fontSize: 11 }} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="Trainings" fill="hsl(168 80% 45%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* By Theme */}
        <div className="glass rounded-xl p-4">
          <h3 className="font-display text-sm font-bold text-foreground mb-3">Trainings by Theme</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.byTheme} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
              <XAxis type="number" tick={{ fill: "hsl(215 15% 55%)", fontSize: 10 }} />
              <YAxis dataKey="name" type="category" width={70} tick={{ fill: "hsl(215 15% 55%)", fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Trainings" radius={[0, 4, 4, 0]}>
                {stats.byTheme.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By Level Pie */}
        <div className="glass rounded-xl p-4">
          <h3 className="font-display text-sm font-bold text-foreground mb-3">Training Levels</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={stats.byLevel}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: "hsl(215 15% 55%)" }}
              >
                {stats.byLevel.map((_, i) => (
                  <Cell key={i} fill={["#3b82f6", "#f97316", "#10b981", "#a855f7"][i % 4]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* By State */}
      {stats.byState.length > 0 && (
        <div className="glass rounded-xl p-4">
          <h3 className="font-display text-sm font-bold text-foreground mb-3">Participants by State (Top 8)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stats.byState}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
              <XAxis dataKey="name" tick={{ fill: "hsl(215 15% 55%)", fontSize: 10 }} />
              <YAxis tick={{ fill: "hsl(215 15% 55%)", fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Participants" radius={[4, 4, 0, 0]}>
                {stats.byState.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
