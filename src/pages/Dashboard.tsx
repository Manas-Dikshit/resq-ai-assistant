import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageSquare, Map, BarChart3, Radio, ChevronLeft, ChevronRight, LogIn, LogOut, AlertTriangle, Shield, FileWarning, Satellite, CloudRain, Thermometer } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import DisasterMap from "@/components/DisasterMap";
import AIChatPanel from "@/components/AIChatPanel";
import RiskCards from "@/components/RiskCards";
import AlertBanner from "@/components/AlertBanner";
import LiveEventsPanel from "@/components/LiveEventsPanel";
import WeatherPanel from "@/components/WeatherPanel";
import SatelliteView from "@/components/SatelliteView";
import RealTimeCharts from "@/components/RealTimeCharts";
import SOSButton from "@/components/SOSButton";
import ReportForm from "@/components/ReportForm";

type SidebarTab = 'events' | 'weather' | 'satellite' | 'charts';

const Dashboard = () => {
  const [showChat, setShowChat] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('events');
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const sidebarTabs: { id: SidebarTab; label: string; icon: any }[] = [
    { id: 'events', label: 'Events', icon: AlertTriangle },
    { id: 'weather', label: 'Weather', icon: Thermometer },
    { id: 'satellite', label: 'Satellite', icon: Satellite },
    { id: 'charts', label: 'Charts', icon: BarChart3 },
  ];

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/80 backdrop-blur-sm z-20">
        <div className="flex items-center gap-3">
          <Link to="/" className="font-display text-lg font-bold">
            <span className="text-foreground">Res</span>
            <span className="text-gradient-primary">Q</span>
            <span className="text-foreground">AI</span>
          </Link>
          <span className="text-xs text-muted-foreground font-display hidden sm:inline">ODISHA COMMAND CENTER</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-safe font-display">
            <Radio className="w-3.5 h-3.5 animate-pulse-glow" />
            LIVE
          </span>
          {user && (
            <button onClick={() => setShowReport(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-display bg-warning/10 text-warning hover:bg-warning/20 transition-colors">
              <FileWarning className="w-3.5 h-3.5" />
              Report
            </button>
          )}
          <button onClick={() => setShowChat(!showChat)} className="p-2 rounded-md hover:bg-accent transition-colors" title="Toggle AI Chat">
            <MessageSquare className="w-4 h-4 text-primary" />
          </button>
          {user ? (
            <>
              <Link to="/admin" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-display text-muted-foreground hover:bg-accent transition-colors">
                <Shield className="w-3.5 h-3.5" />Admin
              </Link>
              <button onClick={() => signOut()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-display text-muted-foreground hover:bg-accent transition-colors">
                <LogOut className="w-3.5 h-3.5" />Out
              </button>
            </>
          ) : (
            <button onClick={() => navigate("/auth")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-display bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
              <LogIn className="w-3.5 h-3.5" />Sign In
            </button>
          )}
        </div>
      </header>

      {/* Alert banner */}
      <div className="px-4 py-2">
        <AlertBanner />
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {showSidebar && (
          <aside className="w-96 border-r border-border overflow-y-auto bg-card/30 hidden lg:flex flex-col">
            {/* Sidebar tabs */}
            <div className="flex border-b border-border">
              {sidebarTabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSidebarTab(t.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-xs font-display transition-colors ${
                    sidebarTab === t.id ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {sidebarTab === 'events' && (
                <>
                  <LiveEventsPanel />
                  <RiskCards />
                </>
              )}
              {sidebarTab === 'weather' && <WeatherPanel />}
              {sidebarTab === 'satellite' && <SatelliteView />}
              {sidebarTab === 'charts' && <RealTimeCharts />}
            </div>
          </aside>
        )}
        <button onClick={() => setShowSidebar(!showSidebar)} className="hidden lg:flex items-center justify-center w-5 border-r border-border bg-card/50 hover:bg-accent transition-colors">
          {showSidebar ? <ChevronLeft className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
        </button>

        <main className="flex-1 relative">
          <DisasterMap />
          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 z-[500]">
            <p className="text-xs font-display font-bold text-muted-foreground mb-2 tracking-wider">ODISHA — LEGEND</p>
            <div className="space-y-1.5">
              {[
                { color: "bg-flood", label: "Flood Zone" },
                { color: "bg-fire", label: "Wildfire / Fire" },
                { color: "bg-quake", label: "Earthquake" },
                { color: "bg-destructive", label: "Cyclone / Storm" },
                { color: "bg-safe", label: "Shelter (Available)" },
                { color: "bg-warning", label: "Shelter (Moderate)" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile stats */}
          <div className="lg:hidden absolute top-4 left-4 right-4 flex gap-2 z-[500]">
            {[
              { label: "Events", value: "Live", icon: BarChart3 },
              { label: "Shelters", value: "10", icon: Map },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2">
                <s.icon className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-display text-foreground">{s.value} {s.label}</span>
              </div>
            ))}
          </div>
        </main>

        {showChat && (
          <aside className="w-96 border-l border-border bg-card/30">
            <AIChatPanel />
          </aside>
        )}
      </div>

      <SOSButton />
      <ReportForm open={showReport} onClose={() => setShowReport(false)} />
    </div>
  );
};

export default Dashboard;
