import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { districtAnalytics, monthlyTrends, shelterUtilization, riskHistory } from "@/data/odishaData";

const COLORS = {
  flood: '#3b82f6',
  storm: '#ef4444',
  fire: '#f97316',
  earthquake: '#a855f7',
  safe: '#22c55e',
  warning: '#eab308',
  primary: '#2dd4bf',
};

const PIE_COLORS = ['#3b82f6', '#ef4444', '#f97316', '#a855f7', '#22c55e', '#eab308'];

export const DisasterDistributionPie = () => {
  const totals = districtAnalytics.reduce((acc, d) => ({
    floods: acc.floods + d.floods,
    storms: acc.storms + d.storms,
    fires: acc.fires + d.fires,
    earthquakes: acc.earthquakes + d.earthquakes,
  }), { floods: 0, storms: 0, fires: 0, earthquakes: 0 });

  const data = [
    { name: 'Floods', value: totals.floods },
    { name: 'Cyclones/Storms', value: totals.storms },
    { name: 'Fires', value: totals.fires },
    { name: 'Earthquakes', value: totals.earthquakes },
  ];

  return (
    <div className="p-4 rounded-xl border border-border bg-card">
      <h3 className="font-display text-sm font-bold text-foreground mb-3">Disaster Type Distribution</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={90} innerRadius={40} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
            {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
          </Pie>
          <Tooltip contentStyle={{ background: 'hsl(220 18% 10%)', border: '1px solid hsl(220 15% 18%)', borderRadius: 8, color: '#fff' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const MonthlyTrendsChart = () => (
  <div className="p-4 rounded-xl border border-border bg-card">
    <h3 className="font-display text-sm font-bold text-foreground mb-3">Monthly Disaster Trends (2025)</h3>
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={monthlyTrends}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
        <XAxis dataKey="month" stroke="#666" fontSize={11} />
        <YAxis stroke="#666" fontSize={11} />
        <Tooltip contentStyle={{ background: 'hsl(220 18% 10%)', border: '1px solid hsl(220 15% 18%)', borderRadius: 8, color: '#fff' }} />
        <Legend />
        <Area type="monotone" dataKey="floods" stackId="1" stroke={COLORS.flood} fill={COLORS.flood} fillOpacity={0.4} />
        <Area type="monotone" dataKey="storms" stackId="1" stroke={COLORS.storm} fill={COLORS.storm} fillOpacity={0.4} />
        <Area type="monotone" dataKey="fires" stackId="1" stroke={COLORS.fire} fill={COLORS.fire} fillOpacity={0.4} />
        <Area type="monotone" dataKey="earthquakes" stackId="1" stroke={COLORS.earthquake} fill={COLORS.earthquake} fillOpacity={0.4} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export const DistrictBarChart = () => (
  <div className="p-4 rounded-xl border border-border bg-card">
    <h3 className="font-display text-sm font-bold text-foreground mb-3">District-wise Disaster Events</h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={districtAnalytics} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
        <XAxis type="number" stroke="#666" fontSize={11} />
        <YAxis dataKey="district" type="category" stroke="#666" fontSize={10} width={80} />
        <Tooltip contentStyle={{ background: 'hsl(220 18% 10%)', border: '1px solid hsl(220 15% 18%)', borderRadius: 8, color: '#fff' }} />
        <Legend />
        <Bar dataKey="floods" fill={COLORS.flood} stackId="a" />
        <Bar dataKey="storms" fill={COLORS.storm} stackId="a" />
        <Bar dataKey="fires" fill={COLORS.fire} stackId="a" />
        <Bar dataKey="earthquakes" fill={COLORS.earthquake} stackId="a" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export const AffectedPopulationChart = () => (
  <div className="p-4 rounded-xl border border-border bg-card">
    <h3 className="font-display text-sm font-bold text-foreground mb-3">Affected Population by District</h3>
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={districtAnalytics}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
        <XAxis dataKey="district" stroke="#666" fontSize={10} angle={-35} textAnchor="end" height={60} />
        <YAxis stroke="#666" fontSize={11} />
        <Tooltip contentStyle={{ background: 'hsl(220 18% 10%)', border: '1px solid hsl(220 15% 18%)', borderRadius: 8, color: '#fff' }} formatter={(v: number) => v.toLocaleString()} />
        <Bar dataKey="affected" fill={COLORS.warning} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export const ShelterUtilizationChart = () => (
  <div className="p-4 rounded-xl border border-border bg-card">
    <h3 className="font-display text-sm font-bold text-foreground mb-3">Shelter Utilization (%)</h3>
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={shelterUtilization}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
        <XAxis dataKey="name" stroke="#666" fontSize={9} angle={-40} textAnchor="end" height={80} />
        <YAxis stroke="#666" fontSize={11} domain={[0, 100]} />
        <Tooltip contentStyle={{ background: 'hsl(220 18% 10%)', border: '1px solid hsl(220 15% 18%)', borderRadius: 8, color: '#fff' }} />
        <Bar dataKey="utilization" radius={[4, 4, 0, 0]}>
          {shelterUtilization.map((entry, i) => (
            <Cell key={i} fill={entry.utilization > 80 ? COLORS.storm : entry.utilization > 50 ? COLORS.warning : COLORS.safe} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export const RiskTrendLineChart = () => (
  <div className="p-4 rounded-xl border border-border bg-card">
    <h3 className="font-display text-sm font-bold text-foreground mb-3">7-Day Risk Trend</h3>
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={riskHistory}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
        <XAxis dataKey="date" stroke="#666" fontSize={11} />
        <YAxis stroke="#666" fontSize={11} domain={[0, 1]} />
        <Tooltip contentStyle={{ background: 'hsl(220 18% 10%)', border: '1px solid hsl(220 15% 18%)', borderRadius: 8, color: '#fff' }} />
        <Legend />
        <Line type="monotone" dataKey="floodRisk" stroke={COLORS.flood} strokeWidth={2} dot={{ r: 4 }} name="Flood Risk" />
        <Line type="monotone" dataKey="cycloneRisk" stroke={COLORS.storm} strokeWidth={2} dot={{ r: 4 }} name="Cyclone Risk" />
        <Line type="monotone" dataKey="fireRisk" stroke={COLORS.fire} strokeWidth={2} dot={{ r: 4 }} name="Fire Risk" />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export const MonthlyAffectedChart = () => (
  <div className="p-4 rounded-xl border border-border bg-card">
    <h3 className="font-display text-sm font-bold text-foreground mb-3">Monthly Affected Population</h3>
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={monthlyTrends}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
        <XAxis dataKey="month" stroke="#666" fontSize={11} />
        <YAxis stroke="#666" fontSize={11} />
        <Tooltip contentStyle={{ background: 'hsl(220 18% 10%)', border: '1px solid hsl(220 15% 18%)', borderRadius: 8, color: '#fff' }} formatter={(v: number) => v.toLocaleString()} />
        <Area type="monotone" dataKey="totalAffected" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.2} name="Affected" />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export const RiskRadarChart = () => {
  const radarData = [
    { risk: 'Flood', value: 0.89, fullMark: 1 },
    { risk: 'Cyclone', value: 0.92, fullMark: 1 },
    { risk: 'Fire', value: 0.15, fullMark: 1 },
    { risk: 'Earthquake', value: 0.05, fullMark: 1 },
    { risk: 'Landslide', value: 0.12, fullMark: 1 },
    { risk: 'Heat Wave', value: 0.08, fullMark: 1 },
  ];

  return (
    <div className="p-4 rounded-xl border border-border bg-card">
      <h3 className="font-display text-sm font-bold text-foreground mb-3">Current Risk Radar - Odisha</h3>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="hsl(220 15% 18%)" />
          <PolarAngleAxis dataKey="risk" stroke="#888" fontSize={11} />
          <PolarRadiusAxis angle={30} domain={[0, 1]} stroke="#666" fontSize={10} />
          <Radar name="Risk Level" dataKey="value" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.3} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
