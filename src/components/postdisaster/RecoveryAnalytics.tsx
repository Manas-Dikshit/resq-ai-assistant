import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import type { DamageAssessment } from "@/pages/PostDisaster";

const COLORS = {
  assessment: "#3b82f6",
  relief: "#eab308",
  rehabilitation: "#a855f7",
  reconstruction: "#2dd4bf",
  completed: "#22c55e",
};

const SEVERITY_COLORS = { minor: "#22c55e", moderate: "#eab308", severe: "#f97316", critical: "#ef4444" };

interface Props {
  assessments: DamageAssessment[];
  phaseColors: Record<string, string>;
}

const RecoveryAnalytics = ({ assessments }: Props) => {
  // Phase distribution
  const phaseData = Object.entries(
    assessments.reduce((acc, a) => {
      acc[a.recovery_phase] = (acc[a.recovery_phase] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Severity distribution
  const severityData = Object.entries(
    assessments.reduce((acc, a) => {
      acc[a.severity] = (acc[a.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // District cost
  const districtCost = Object.entries(
    assessments.reduce((acc, a) => {
      acc[a.district] = (acc[a.district] || 0) + Number(a.estimated_cost_inr);
      return acc;
    }, {} as Record<string, number>)
  ).map(([district, cost]) => ({ district, cost: cost / 100000 })).sort((a, b) => b.cost - a.cost);

  // District affected
  const districtAffected = Object.entries(
    assessments.reduce((acc, a) => {
      acc[a.district] = (acc[a.district] || 0) + a.affected_population;
      return acc;
    }, {} as Record<string, number>)
  ).map(([district, pop]) => ({ district, population: pop })).sort((a, b) => b.population - a.population);

  // Damage type breakdown
  const damageTypeData = Object.entries(
    assessments.reduce((acc, a) => {
      acc[a.damage_type] = (acc[a.damage_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const tooltipStyle = { background: "hsl(220 18% 10%)", border: "1px solid hsl(220 15% 18%)", borderRadius: 8, color: "#fff" };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Card className="bg-card/60 border-border">
        <CardContent className="p-4">
          <h3 className="font-display text-xs font-bold text-foreground mb-3">Recovery Phase Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={phaseData} cx="50%" cy="50%" outerRadius={80} innerRadius={35} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {phaseData.map((entry) => <Cell key={entry.name} fill={COLORS[entry.name as keyof typeof COLORS] || "#666"} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-border">
        <CardContent className="p-4">
          <h3 className="font-display text-xs font-bold text-foreground mb-3">Severity Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={severityData} cx="50%" cy="50%" outerRadius={80} innerRadius={35} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {severityData.map((entry) => <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name as keyof typeof SEVERITY_COLORS] || "#666"} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-border">
        <CardContent className="p-4">
          <h3 className="font-display text-xs font-bold text-foreground mb-3">Estimated Cost by District (₹ Lakh)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={districtCost} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
              <XAxis type="number" stroke="#666" fontSize={10} />
              <YAxis dataKey="district" type="category" stroke="#666" fontSize={10} width={80} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="cost" fill="#eab308" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-border">
        <CardContent className="p-4">
          <h3 className="font-display text-xs font-bold text-foreground mb-3">Affected Population by District</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={districtAffected} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
              <XAxis type="number" stroke="#666" fontSize={10} />
              <YAxis dataKey="district" type="category" stroke="#666" fontSize={10} width={80} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="population" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-border md:col-span-2">
        <CardContent className="p-4">
          <h3 className="font-display text-xs font-bold text-foreground mb-3">Damage Type Analysis</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={damageTypeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
              <XAxis dataKey="name" stroke="#666" fontSize={10} />
              <YAxis stroke="#666" fontSize={10} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecoveryAnalytics;
