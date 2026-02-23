import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Plus, BarChart3, MapPin, List, ClipboardCheck,
  TrendingUp, AlertTriangle, Building2, DollarSign, Users,
  CheckCircle2, Clock, XCircle, Filter, Search, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LanguageToggle from "@/components/LanguageToggle";
import AddAssessmentForm from "@/components/postdisaster/AddAssessmentForm";
import AssessmentList from "@/components/postdisaster/AssessmentList";
import RecoveryAnalytics from "@/components/postdisaster/RecoveryAnalytics";
import RecoveryTimeline from "@/components/postdisaster/RecoveryTimeline";

export type DamageAssessment = {
  id: string;
  incident_id: string | null;
  assessor_id: string;
  title: string;
  description: string | null;
  district: string;
  state: string;
  location_name: string;
  lat: number | null;
  lng: number | null;
  damage_type: string;
  severity: string;
  status: string;
  affected_households: number;
  affected_population: number;
  estimated_cost_inr: number;
  infrastructure_damage: Record<string, any>;
  photo_urls: string[];
  recovery_phase: string;
  recovery_progress: number;
  priority: string;
  notes: string | null;
  assessed_at: string;
  created_at: string;
  updated_at: string;
};

const PostDisaster = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [assessments, setAssessments] = useState<DamageAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterPhase, setFilterPhase] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAssessments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("damage_assessments")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setAssessments(data as unknown as DamageAssessment[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAssessments();
    const channel = supabase
      .channel("damage_assessments_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "damage_assessments" }, () => {
        fetchAssessments();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = assessments.filter(a => {
    if (filterSeverity !== "all" && a.severity !== filterSeverity) return false;
    if (filterPhase !== "all" && a.recovery_phase !== filterPhase) return false;
    if (searchQuery && !a.title.toLowerCase().includes(searchQuery.toLowerCase()) && !a.district.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: assessments.length,
    critical: assessments.filter(a => a.severity === "critical").length,
    totalCost: assessments.reduce((s, a) => s + Number(a.estimated_cost_inr), 0),
    totalAffected: assessments.reduce((s, a) => s + a.affected_population, 0),
    avgRecovery: assessments.length ? Math.round(assessments.reduce((s, a) => s + a.recovery_progress, 0) / assessments.length) : 0,
    phases: {
      assessment: assessments.filter(a => a.recovery_phase === "assessment").length,
      relief: assessments.filter(a => a.recovery_phase === "relief").length,
      rehabilitation: assessments.filter(a => a.recovery_phase === "rehabilitation").length,
      reconstruction: assessments.filter(a => a.recovery_phase === "reconstruction").length,
      completed: assessments.filter(a => a.recovery_phase === "completed").length,
    }
  };

  const phaseColors: Record<string, string> = {
    assessment: "bg-flood text-white",
    relief: "bg-warning text-warning-foreground",
    rehabilitation: "bg-quake text-white",
    reconstruction: "bg-primary text-primary-foreground",
    completed: "bg-safe text-white",
  };

  const severityColors: Record<string, string> = {
    minor: "border-safe/40 text-safe",
    moderate: "border-warning/40 text-warning",
    severe: "border-fire/40 text-fire",
    critical: "border-destructive/40 text-destructive",
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-border glass-strong z-20">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="p-1.5 rounded-md hover:bg-accent transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="font-display text-sm font-bold flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-primary" />
              Post-Disaster Management
            </h1>
            <p className="text-xs text-muted-foreground font-display">Damage Assessment · Recovery Tracker</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <Badge variant="outline" className="text-xs font-display border-primary/30 text-primary">
            <span className="relative flex h-2 w-2 mr-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            LIVE
          </Badge>
          {user && (
            <Button size="sm" onClick={() => setShowForm(true)} className="gap-1.5 text-xs font-display">
              <Plus className="w-3.5 h-3.5" /> New Assessment
            </Button>
          )}
        </div>
      </header>

      {/* Stats Row */}
      <div className="px-4 py-3 grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Assessments", value: stats.total, icon: ClipboardCheck, color: "text-primary" },
          { label: "Critical", value: stats.critical, icon: AlertTriangle, color: "text-destructive" },
          { label: "Affected Population", value: stats.totalAffected.toLocaleString(), icon: Users, color: "text-flood" },
          { label: "Est. Cost (₹ Cr)", value: (stats.totalCost / 10000000).toFixed(1), icon: DollarSign, color: "text-warning" },
          { label: "Avg Recovery", value: `${stats.avgRecovery}%`, icon: TrendingUp, color: "text-safe" },
        ].map((s) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="bg-card/60 border-border">
              <CardContent className="p-3 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-accent/50 ${s.color}`}>
                  <s.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-lg font-display font-bold text-foreground">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground font-display">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recovery Phase Progress */}
      <div className="px-4 pb-3">
        <Card className="bg-card/60 border-border">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-display font-bold text-foreground">Recovery Pipeline</p>
              <p className="text-[10px] text-muted-foreground font-display">{stats.total} total assessments</p>
            </div>
            <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-accent/30">
              {(["assessment", "relief", "rehabilitation", "reconstruction", "completed"] as const).map(phase => {
                const count = stats.phases[phase];
                const pct = stats.total ? (count / stats.total) * 100 : 0;
                if (pct === 0) return null;
                return (
                  <motion.div
                    key={phase}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`${phaseColors[phase]} rounded-sm`}
                    title={`${phase}: ${count}`}
                  />
                );
              })}
            </div>
            <div className="flex gap-3 mt-2 flex-wrap">
              {(["assessment", "relief", "rehabilitation", "reconstruction", "completed"] as const).map(phase => (
                <div key={phase} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${phaseColors[phase]}`} />
                  <span className="text-[10px] text-muted-foreground font-display capitalize">{phase} ({stats.phases[phase]})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex-1 px-4 pb-4 overflow-hidden flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <TabsList className="bg-accent/30">
              <TabsTrigger value="overview" className="text-xs font-display gap-1.5">
                <List className="w-3.5 h-3.5" /> Assessments
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs font-display gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" /> Analytics
              </TabsTrigger>
              <TabsTrigger value="timeline" className="text-xs font-display gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Timeline
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs w-40"
                />
              </div>
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="h-8 text-xs w-28">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="minor">Minor</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPhase} onValueChange={setFilterPhase}>
                <SelectTrigger className="h-8 text-xs w-32">
                  <SelectValue placeholder="Phase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Phases</SelectItem>
                  <SelectItem value="assessment">Assessment</SelectItem>
                  <SelectItem value="relief">Relief</SelectItem>
                  <SelectItem value="rehabilitation">Rehabilitation</SelectItem>
                  <SelectItem value="reconstruction">Reconstruction</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={fetchAssessments}>
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <TabsContent value="overview" className="flex-1 overflow-auto mt-0">
            <AssessmentList
              assessments={filtered}
              loading={loading}
              phaseColors={phaseColors}
              severityColors={severityColors}
              onRefresh={fetchAssessments}
              userId={user?.id}
            />
          </TabsContent>
          <TabsContent value="analytics" className="flex-1 overflow-auto mt-0">
            <RecoveryAnalytics assessments={assessments} phaseColors={phaseColors} />
          </TabsContent>
          <TabsContent value="timeline" className="flex-1 overflow-auto mt-0">
            <RecoveryTimeline assessments={assessments} phaseColors={phaseColors} severityColors={severityColors} />
          </TabsContent>
        </Tabs>
      </div>

      <AnimatePresence>
        {showForm && <AddAssessmentForm onClose={() => setShowForm(false)} onSuccess={() => { setShowForm(false); fetchAssessments(); }} userId={user?.id || ""} />}
      </AnimatePresence>
    </div>
  );
};

export default PostDisaster;
