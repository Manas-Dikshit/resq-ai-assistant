import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Plus, List, Map, BarChart3, Filter, RefreshCw,
  LogOut, LogIn, Shield, ChevronLeft, ChevronRight, Radio, Download,
  Bell, CheckCircle, Clock, Users, BookOpen, MapPin, Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTrainings, useTrainingThemes } from "@/hooks/useTrainings";
import TrainingMap from "@/components/training/TrainingMap";
import TrainingList from "@/components/training/TrainingList";
import TrainingAnalytics from "@/components/training/TrainingAnalytics";
import AddTrainingForm from "@/components/training/AddTrainingForm";
import LanguageToggle from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

const INDIAN_STATES = [
  "All States","Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala",
  "Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha",
  "Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh",
];

type View = "list" | "map" | "analytics";
type ColorMode = "theme" | "level";

export default function TrainingDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState<View>("list");
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [colorMode, setColorMode] = useState<ColorMode>("theme");

  const [filterState, setFilterState] = useState("");
  const [filterTheme, setFilterTheme] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const { data: themes = [] } = useTrainingThemes();
  const { data: trainings = [], isLoading, refetch } = useTrainings({
    state: filterState || undefined,
    theme: filterTheme || undefined,
    level: filterLevel || undefined,
    dateFrom: filterDateFrom || undefined,
    dateTo: filterDateTo || undefined,
  });

  const totalParticipants = trainings.reduce((s, t) => s + t.participants_total, 0);
  const verified = trainings.filter(t => t.verified).length;
  const statesCount = new Set(trainings.map(t => t.state)).size;

  const handleExport = () => {
    const rows = [
      ["Title","Theme","Level","State","Location","Start","End","Total","Male","Female","Organizer","Verified"],
      ...trainings.map(t => [
        t.title, t.theme, t.level, t.state, t.location_name,
        t.start_date, t.end_date, t.participants_total,
        t.participants_male, t.participants_female, t.organizer, t.verified ? "Yes" : "No",
      ])
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ndma-trainings-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-border glass-strong z-20">
        <div className="flex items-center gap-3">
          <Link to="/" className="font-display text-lg font-bold">
            <span className="text-foreground">Res</span>
            <span className="text-gradient-primary">Q</span>
            <span className="text-foreground">AI</span>
          </Link>
          <div className="w-px h-5 bg-border mx-1" />
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary" />
            <span className="font-display text-sm font-bold text-foreground">Training Monitoring</span>
            <span className="text-[10px] font-display px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">NDMA · CBT</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-display text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <Radio className="w-3.5 h-3.5" /> Disaster Dashboard
          </Link>
          {/* Live indicator */}
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-safe/10 border border-safe/20 text-xs text-safe font-display">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-safe opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-safe" />
            </span>
            LIVE
          </span>
          {user ? (
            <>
              <Link to="/admin" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-display text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                <Shield className="w-3.5 h-3.5" /> Admin
              </Link>
              <button onClick={signOut} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-display text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </>
          ) : (
            <Button size="sm" onClick={() => navigate("/auth")} className="text-xs font-display h-8">
              <LogIn className="w-3.5 h-3.5 mr-1" /> Sign In
            </Button>
          )}
        </div>
      </header>

      {/* Quick stats bar */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-border bg-card/30 overflow-x-auto">
        {[
          { icon: BookOpen, label: "Trainings", value: trainings.length, color: "text-primary" },
          { icon: Users, label: "Participants", value: totalParticipants.toLocaleString(), color: "text-flood" },
          { icon: MapPin, label: "States", value: statesCount, color: "text-safe" },
          { icon: CheckCircle, label: "Verified", value: verified, color: "text-safe" },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2 flex-shrink-0">
            <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
            <span className="font-display text-xs font-bold text-foreground">{s.value}</span>
            <span className="text-xs text-muted-foreground">{s.label}</span>
            <div className="w-px h-4 bg-border ml-2" />
          </div>
        ))}
        <div className="flex-1" />
        {/* View toggles */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {([
            { id: "list", icon: List, label: "List" },
            { id: "map", icon: Map, label: "Map" },
            { id: "analytics", icon: BarChart3, label: "Analytics" },
          ] as const).map(v => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-display transition-all ${
                view === v.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <v.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{v.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="border-r border-border bg-card/30 overflow-hidden flex-shrink-0 hidden lg:flex flex-col"
            >
              <div className="p-4 space-y-4 overflow-y-auto flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-primary" /> Filters
                  </h2>
                  <button
                    onClick={() => {
                      setFilterState(""); setFilterTheme("");
                      setFilterLevel(""); setFilterDateFrom(""); setFilterDateTo("");
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear all
                  </button>
                </div>

                <div className="space-y-3">
                  <Select value={filterState} onValueChange={v => setFilterState(v === "All States" ? "" : v)}>
                    <SelectTrigger className="bg-muted border-border text-xs h-9">
                      <SelectValue placeholder="All States" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  <Select value={filterTheme} onValueChange={v => setFilterTheme(v === "all" ? "" : v)}>
                    <SelectTrigger className="bg-muted border-border text-xs h-9">
                      <SelectValue placeholder="All Themes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Themes</SelectItem>
                      {themes.map(t => <SelectItem key={t.id} value={t.theme_name}>{t.theme_name}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  <Select value={filterLevel} onValueChange={v => setFilterLevel(v === "all" ? "" : v)}>
                    <SelectTrigger className="bg-muted border-border text-xs h-9">
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      {["National","State","District","Community"].map(l => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">From Date</label>
                    <input
                      type="date"
                      value={filterDateFrom}
                      onChange={e => setFilterDateFrom(e.target.value)}
                      className="w-full text-xs bg-muted border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">To Date</label>
                    <input
                      type="date"
                      value={filterDateTo}
                      onChange={e => setFilterDateTo(e.target.value)}
                      className="w-full text-xs bg-muted border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                {view === "map" && (
                  <div className="space-y-2">
                    <p className="text-xs font-display font-bold text-muted-foreground">Map Color Mode</p>
                    <div className="flex gap-2">
                      {(["theme", "level"] as ColorMode[]).map(m => (
                        <button
                          key={m}
                          onClick={() => setColorMode(m)}
                          className={`flex-1 py-1.5 rounded-md text-xs font-display capitalize transition-all ${
                            colorMode === m ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <p className="text-xs font-display font-bold text-muted-foreground">Quick Actions</p>
                  {user && (
                    <Button
                      onClick={() => setShowForm(true)}
                      className="w-full text-xs h-9 bg-gradient-primary text-primary-foreground"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Training
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={handleExport}
                    className="w-full text-xs h-9 border-border"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => refetch()}
                    className="w-full text-xs h-9 border-border"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
                  </Button>
                </div>

                {/* Recent activity feed */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <p className="text-xs font-display font-bold text-muted-foreground flex items-center gap-1.5">
                    <Bell className="w-3 h-3" /> Recent Activity
                  </p>
                  {trainings.slice(0, 5).map(t => (
                    <div key={t.id} className="glass rounded-lg p-2.5 space-y-0.5">
                      <p className="text-xs font-display text-foreground line-clamp-1">{t.title}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(t.created_at).toLocaleDateString()} · {t.state}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Collapse toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="hidden lg:flex items-center justify-center w-5 border-r border-border bg-card/50 hover:bg-accent transition-colors group flex-shrink-0"
        >
          {showFilters
            ? <ChevronLeft className="w-3 h-3 text-muted-foreground group-hover:text-foreground" />
            : <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-foreground" />
          }
        </button>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                <p className="text-sm text-muted-foreground font-display">Loading training data...</p>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {view === "list" && (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground font-display">
                      Showing <span className="text-foreground font-bold">{trainings.length}</span> training records
                    </p>
                    {user && (
                      <Button
                        size="sm"
                        onClick={() => setShowForm(true)}
                        className="text-xs h-8 bg-gradient-primary text-primary-foreground lg:hidden"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Training
                      </Button>
                    )}
                  </div>
                  <TrainingList trainings={trainings} isAdmin={false} />
                </motion.div>
              )}

              {view === "map" && (
                <motion.div
                  key="map"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[500px] relative"
                >
                  <TrainingMap trainings={trainings} colorMode={colorMode} />
                  <div className="absolute top-3 left-3 glass-strong rounded-lg px-3 py-1.5 z-[500] text-xs text-muted-foreground font-display">
                    {trainings.filter(t => t.lat && t.lng).length} of {trainings.length} events mapped
                  </div>
                </motion.div>
              )}

              {view === "analytics" && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <TrainingAnalytics trainings={trainings} />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* Add Training Form Modal */}
      <AnimatePresence>
        {showForm && <AddTrainingForm onClose={() => setShowForm(false)} />}
      </AnimatePresence>
    </div>
  );
}
