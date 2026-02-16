import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { 
  LayoutDashboard, Users, AlertTriangle, Shield, BarChart3, 
  Bell, MapPin, LogOut, Activity, Radio, Send, Megaphone
} from "lucide-react";
import { toast } from "sonner";
import {
  DisasterDistributionPie, MonthlyTrendsChart, DistrictBarChart,
  AffectedPopulationChart, ShelterUtilizationChart, RiskTrendLineChart,
  MonthlyAffectedChart, RiskRadarChart
} from "@/components/AnalyticsCharts";
import { odishaDisasters, odishaShelters } from "@/data/odishaData";

type Tab = 'overview' | 'analytics' | 'alerts' | 'shelters' | 'reports' | 'users' | 'validation';

const Admin = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("warning");
  const [alertRegion, setAlertRegion] = useState("");

  // Check admin role
  const { data: isAdmin, isLoading: roleLoading } = useQuery({
    queryKey: ['admin-role', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      return !!data;
    },
    enabled: !!user,
  });

  const { data: reports } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(50);
      return data || [];
    },
    enabled: isAdmin === true,
  });

  const { data: validations } = useQuery({
    queryKey: ['admin-validations'],
    queryFn: async () => {
      const { data } = await supabase.from('report_validations').select('*').order('created_at', { ascending: false }).limit(100);
      return data || [];
    },
    enabled: isAdmin === true,
  });

  const { data: profiles } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      return data || [];
    },
    enabled: isAdmin === true,
  });

  const broadcastAlert = async () => {
    if (!alertMessage.trim()) { toast.error("Enter alert message"); return; }
    const { error } = await supabase.from('alerts').insert({
      type: 'broadcast',
      severity: alertSeverity,
      message: alertMessage,
      region: alertRegion || 'Odisha',
      source: 'admin',
    });
    if (error) toast.error("Failed to broadcast");
    else { toast.success("Alert broadcasted to all users"); setAlertMessage(""); }
  };

  if (!user) { navigate('/auth'); return null; }
  if (roleLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><Activity className="w-8 h-8 text-primary animate-spin" /></div>;
  if (!isAdmin) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center p-8 border border-destructive/30 rounded-xl bg-card">
        <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="font-display text-xl font-bold text-foreground mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-4">You don't have admin privileges.</p>
        <Link to="/dashboard" className="text-primary hover:underline font-display text-sm">← Back to Dashboard</Link>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview' as Tab, icon: LayoutDashboard, label: 'Overview' },
    { id: 'analytics' as Tab, icon: BarChart3, label: 'Analytics' },
    { id: 'validation' as Tab, icon: Shield, label: 'Validation' },
    { id: 'alerts' as Tab, icon: Bell, label: 'Broadcast' },
    { id: 'shelters' as Tab, icon: MapPin, label: 'Shelters' },
    { id: 'reports' as Tab, icon: AlertTriangle, label: 'Reports' },
    { id: 'users' as Tab, icon: Users, label: 'Users' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/50 flex flex-col">
        <div className="p-4 border-b border-border">
          <Link to="/" className="font-display text-lg font-bold">
            <span className="text-foreground">Res</span><span className="text-gradient-primary">Q</span><span className="text-foreground">AI</span>
          </Link>
          <p className="text-xs text-muted-foreground font-display mt-1">ADMIN CONTROL CENTER</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-display transition-colors ${activeTab === t.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'}`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border space-y-2">
          <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent transition-colors font-display">
            <Radio className="w-4 h-4" />Live Dashboard
          </Link>
          <button onClick={() => signOut()} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent transition-colors font-display">
            <LogOut className="w-4 h-4" />Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Odisha Disaster Overview</h2>
            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Active Events', value: odishaDisasters.length, color: 'text-destructive', bg: 'bg-destructive/10' },
                { label: 'Total Affected', value: odishaDisasters.reduce((a, d) => a + d.affected, 0).toLocaleString(), color: 'text-warning', bg: 'bg-warning/10' },
                { label: 'Active Shelters', value: odishaShelters.length, color: 'text-safe', bg: 'bg-safe/10' },
                { label: 'Reports Filed', value: reports?.length || 0, color: 'text-primary', bg: 'bg-primary/10' },
              ].map(s => (
                <div key={s.label} className={`p-4 rounded-xl border border-border bg-card`}>
                  <p className="text-xs font-display text-muted-foreground">{s.label}</p>
                  <p className={`text-2xl font-display font-bold mt-1 ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RiskRadarChart />
              <RiskTrendLineChart />
              <DisasterDistributionPie />
              <MonthlyAffectedChart />
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Detailed Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MonthlyTrendsChart />
              <DistrictBarChart />
              <AffectedPopulationChart />
              <ShelterUtilizationChart />
              <RiskTrendLineChart />
              <DisasterDistributionPie />
              <RiskRadarChart />
              <MonthlyAffectedChart />
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="font-display text-2xl font-bold text-foreground">Broadcast Alert</h2>
            <div className="p-6 rounded-xl border border-border bg-card space-y-4">
              <div>
                <label className="text-xs font-display text-muted-foreground">Severity</label>
                <select value={alertSeverity} onChange={e => setAlertSeverity(e.target.value)} className="w-full mt-1.5 bg-secondary rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary">
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-display text-muted-foreground">Region</label>
                <input value={alertRegion} onChange={e => setAlertRegion(e.target.value)} placeholder="e.g. Puri, Cuttack, Coastal Odisha" className="w-full mt-1.5 bg-secondary rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-xs font-display text-muted-foreground">Alert Message</label>
                <textarea value={alertMessage} onChange={e => setAlertMessage(e.target.value)} rows={4} placeholder="Enter the alert message to broadcast..." className="w-full mt-1.5 bg-secondary rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary resize-none" />
              </div>
              <button onClick={broadcastAlert} className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-emergency text-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity">
                <Megaphone className="w-4 h-4" />Broadcast Alert
              </button>
            </div>
          </div>
        )}

        {activeTab === 'shelters' && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Shelter Management</h2>
            <ShelterUtilizationChart />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-display text-xs text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 font-display text-xs text-muted-foreground">Capacity</th>
                    <th className="text-left py-3 px-4 font-display text-xs text-muted-foreground">Occupancy</th>
                    <th className="text-left py-3 px-4 font-display text-xs text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {odishaShelters.map(s => (
                    <tr key={s.id} className="border-b border-border/50 hover:bg-accent/30">
                      <td className="py-3 px-4 text-foreground">{s.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{s.capacity}</td>
                      <td className="py-3 px-4 text-muted-foreground">{s.occupancy}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-display ${s.occupancy / s.capacity > 0.8 ? 'bg-destructive/10 text-destructive' : s.occupancy / s.capacity > 0.5 ? 'bg-warning/10 text-warning' : 'bg-safe/10 text-safe'}`}>
                          {s.occupancy / s.capacity > 0.8 ? 'Near Full' : s.occupancy / s.capacity > 0.5 ? 'Moderate' : 'Available'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Incident Reports</h2>
            {reports && reports.length > 0 ? (
              <div className="space-y-3">
                {reports.map((r: any) => (
                  <div key={r.id} className="p-4 rounded-xl border border-border bg-card flex items-start justify-between">
                    <div>
                      <p className="font-display text-sm font-bold text-foreground">{r.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{r.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">Type: {r.disaster_type} • {new Date(r.created_at).toLocaleString()}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-display ${r.verified ? 'bg-safe/10 text-safe' : 'bg-warning/10 text-warning'}`}>
                      {r.verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No reports filed yet.</p>
            )}
          </div>
        )}

        {activeTab === 'validation' && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Community Validation Dashboard</h2>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Reports', value: reports?.length || 0, color: 'text-primary', bg: 'bg-primary/10' },
                { label: 'Verified', value: reports?.filter((r: any) => r.verified).length || 0, color: 'text-safe', bg: 'bg-safe/10' },
                { label: 'Pending', value: reports?.filter((r: any) => !r.verified).length || 0, color: 'text-warning', bg: 'bg-warning/10' },
                { label: 'Total Votes', value: validations?.length || 0, color: 'text-primary', bg: 'bg-primary/10' },
              ].map(s => (
                <div key={s.label} className="p-4 rounded-xl border border-border bg-card">
                  <p className="text-xs font-display text-muted-foreground">{s.label}</p>
                  <p className={`text-2xl font-display font-bold mt-1 ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Reports with trust scores */}
            <div className="space-y-3">
              <h3 className="font-display text-lg font-bold text-foreground">Reports by Trust Score</h3>
              {(reports || []).sort((a: any, b: any) => b.trust_score - a.trust_score).map((r: any) => (
                <div key={r.id} className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-display text-sm font-bold text-foreground">{r.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.disaster_type} • {new Date(r.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-display ${r.verified ? 'bg-safe/10 text-safe' : r.trust_score >= 0.5 ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'}`}>
                        {r.verified ? '✓ Verified' : r.trust_score > 0 ? `${(r.trust_score * 100).toFixed(0)}% trust` : 'Unvalidated'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>👍 {r.confirm_count} confirms</span>
                    <span>👎 {r.deny_count} denies</span>
                    <div className="flex-1 h-1.5 rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-safe" style={{ width: `${r.trust_score * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Registered Users</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-display text-xs text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 font-display text-xs text-muted-foreground">Language</th>
                    <th className="text-left py-3 px-4 font-display text-xs text-muted-foreground">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {(profiles || []).map((p: any) => (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-accent/30">
                      <td className="py-3 px-4 text-foreground">{p.name || 'Unnamed'}</td>
                      <td className="py-3 px-4 text-muted-foreground">{p.language}</td>
                      <td className="py-3 px-4 text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
