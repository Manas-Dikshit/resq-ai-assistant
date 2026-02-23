import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio, Shield, AlertTriangle, Clock, Users, Truck,
  Plus, X, LogOut, LogIn, Package, Activity,
  Loader2, Send, FileWarning, Siren, RefreshCw
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import LanguageToggle from "@/components/LanguageToggle";
import IncidentCard from "@/components/IncidentCard";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Incident {
  id: string; title: string; description: string | null;
  type: string; severity: string; status: string;
  state: string; district: string | null; location_name: string;
  lat: number | null; lng: number | null;
  affected_population: number; responders_deployed: number;
  created_by: string; created_at: string; updated_at: string; closed_at: string | null;
}
interface IncidentLog {
  id: string; incident_id: string; message: string; log_type: string;
  created_by: string; created_at: string;
}

const INCIDENT_TYPES = ["Flood","Cyclone","Earthquake","Landslide","Fire","Industrial Accident","Chemical Spill","Tsunami","Drought","Heatwave","Cold Wave","Bridge Collapse"];
const SEVERITY_LEVELS = ["Low","Medium","High","Critical"];
const INDIAN_STATES = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh"];

const SEVERITY_COLORS: Record<string, string> = {
  Critical: "text-destructive border-destructive/30 bg-destructive/10",
  High: "text-fire border-fire/30 bg-fire/10",
  Medium: "text-warning border-warning/30 bg-warning/10",
  Low: "text-safe border-safe/30 bg-safe/10",
};
const STATUS_COLORS: Record<string, string> = {
  open: "text-destructive bg-destructive/10 border-destructive/30",
  investigating: "text-warning bg-warning/10 border-warning/30",
  responding: "text-flood bg-flood/10 border-flood/30",
  resolved: "text-safe bg-safe/10 border-safe/30",
  closed: "text-muted-foreground bg-muted border-border",
};
const STATUS_FLOW = ["open", "investigating", "responding", "resolved", "closed"];

// ─── Add Incident Modal ───────────────────────────────────────────────────────
function AddIncidentModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: "", description: "", type: "Flood", severity: "Medium",
    state: "Odisha", district: "", location_name: "",
    lat: "", lng: "", affected_population: "", responders_deployed: "",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");
      const { error } = await supabase.from("incidents").insert({
        ...form,
        lat: form.lat ? Number(form.lat) : null,
        lng: form.lng ? Number(form.lng) : null,
        affected_population: Number(form.affected_population) || 0,
        responders_deployed: Number(form.responders_deployed) || 0,
        created_by: user.id,
        status: "open",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["incidents"] });
      toast({ title: "Incident Logged", description: `${form.title} has been opened.` });
      onClose();
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const f = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-display font-bold text-foreground flex items-center gap-2">
            <Siren className="w-4 h-4 text-destructive" /> Log New Incident
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-accent transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">Incident Title *</label>
              <input value={form.title} onChange={e => f("title", e.target.value)}
                className="w-full text-sm bg-muted border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. Major Flood — Patna District" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Type</label>
              <select value={form.type} onChange={e => f("type", e.target.value)}
                className="w-full text-sm bg-muted border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                {INCIDENT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Severity</label>
              <select value={form.severity} onChange={e => f("severity", e.target.value)}
                className="w-full text-sm bg-muted border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                {SEVERITY_LEVELS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">State *</label>
              <select value={form.state} onChange={e => f("state", e.target.value)}
                className="w-full text-sm bg-muted border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">District</label>
              <input value={form.district} onChange={e => f("district", e.target.value)}
                className="w-full text-sm bg-muted border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. Patna" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">Location Name *</label>
              <input value={form.location_name} onChange={e => f("location_name", e.target.value)}
                className="w-full text-sm bg-muted border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. Gandak Barrage area, Muzaffarpur" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Latitude</label>
              <input type="number" step="0.0001" value={form.lat} onChange={e => f("lat", e.target.value)}
                className="w-full text-sm bg-muted border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. 25.59" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Longitude</label>
              <input type="number" step="0.0001" value={form.lng} onChange={e => f("lng", e.target.value)}
                className="w-full text-sm bg-muted border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. 85.13" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Affected Population</label>
              <input type="number" value={form.affected_population} onChange={e => f("affected_population", e.target.value)}
                className="w-full text-sm bg-muted border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="0" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Responders Deployed</label>
              <input type="number" value={form.responders_deployed} onChange={e => f("responders_deployed", e.target.value)}
                className="w-full text-sm bg-muted border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="0" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">Description</label>
              <textarea rows={3} value={form.description} onChange={e => f("description", e.target.value)}
                className="w-full text-sm bg-muted border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                placeholder="Detailed situation report..." />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 border-border text-xs">Cancel</Button>
            <Button onClick={() => mutate()} disabled={isPending || !form.title || !form.location_name}
              className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs">
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Siren className="w-3.5 h-3.5 mr-1" />}
              Open Incident
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Incident Detail Panel ────────────────────────────────────────────────────
function IncidentDetail({ incident, onClose, onStatusChange }: {
  incident: Incident; onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
}) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [logMsg, setLogMsg] = useState("");
  const statusFlow = ["open", "investigating", "responding", "resolved", "closed"];

  const { data: logs = [] } = useQuery({
    queryKey: ["incident_logs", incident.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("incident_logs").select("*")
        .eq("incident_id", incident.id).order("created_at", { ascending: true });
      if (error) throw error;
      return data as IncidentLog[];
    },
  });

  const { mutate: addLog, isPending } = useMutation({
    mutationFn: async () => {
      if (!user || !logMsg.trim()) return;
      const { error } = await supabase.from("incident_logs").insert({
        incident_id: incident.id, message: logMsg.trim(),
        log_type: "update", created_by: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["incident_logs", incident.id] });
      setLogMsg("");
    },
  });

  const nextStatus = statusFlow[statusFlow.indexOf(incident.status) + 1];

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-display px-2 py-0.5 rounded-full border capitalize ${SEVERITY_COLORS[incident.severity]}`}>{incident.severity}</span>
            <h2 className="font-display font-bold text-foreground text-sm truncate max-w-xs">{incident.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            {nextStatus && user && (
              <Button size="sm" onClick={() => { onStatusChange(incident.id, nextStatus); onClose(); }}
                className="text-xs h-7 bg-primary text-primary-foreground capitalize">
                → {nextStatus}
              </Button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-accent">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {[
              { label: "Type", value: incident.type },
              { label: "Status", value: incident.status },
              { label: "State", value: incident.state },
              { label: "Location", value: incident.location_name },
            ].map(i => (
              <div key={i.label} className="glass rounded-lg p-2.5">
                <p className="text-muted-foreground text-[10px] mb-0.5">{i.label}</p>
                <p className="text-foreground font-medium capitalize truncate">{i.value}</p>
              </div>
            ))}
          </div>
          {[
            { icon: Users, label: "Affected Population", value: incident.affected_population.toLocaleString() },
            { icon: Truck, label: "Responders Deployed", value: incident.responders_deployed },
          ].filter(i => i.value).map(i => (
            <div key={i.label} className="flex items-center gap-2 text-sm">
              <i.icon className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">{i.label}:</span>
              <span className="text-foreground font-bold">{i.value}</span>
            </div>
          ))}
          {incident.description && <p className="text-sm text-muted-foreground border-l-2 border-primary/30 pl-3">{incident.description}</p>}

          {/* Incident Timeline */}
          <div className="space-y-2">
            <h3 className="font-display text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Incident Timeline
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              <div className="flex gap-2 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-foreground font-medium">Incident opened</p>
                  <p className="text-muted-foreground">{new Date(incident.created_at).toLocaleString()}</p>
                </div>
              </div>
              {logs.map(log => (
                <div key={log.id} className="flex gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-foreground">{log.message}</p>
                    <p className="text-muted-foreground">{new Date(log.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            {user && (
              <div className="flex gap-2 pt-2 border-t border-border">
                <input value={logMsg} onChange={e => setLogMsg(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && addLog()}
                  placeholder="Add situation update..."
                  className="flex-1 text-xs bg-muted border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                <Button size="sm" onClick={() => addLog()} disabled={isPending || !logMsg.trim()} className="h-9 w-9 p-0 bg-primary text-primary-foreground flex-shrink-0">
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function IncidentCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/70 p-4">
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-2/3 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted/80" />
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="h-8 rounded bg-muted/70" />
          <div className="h-8 rounded bg-muted/70" />
        </div>
        <div className="h-8 w-full rounded bg-muted/70" />
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function ControlRoom() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");

  const getElapsed = useCallback((createdAt: string) => {
    const elapsed = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    if (elapsed < 60) return `${elapsed}m ago`;
    if (elapsed < 1440) return `${Math.floor(elapsed / 60)}h ago`;
    return `${Math.floor(elapsed / 1440)}d ago`;
  }, []);

  const { data: incidents = [], isLoading, refetch } = useQuery({
    queryKey: ["incidents", filterStatus, filterSeverity],
    queryFn: async () => {
      let q = supabase.from("incidents").select("*").order("created_at", { ascending: false });
      if (filterStatus) q = q.eq("status", filterStatus);
      if (filterSeverity) q = q.eq("severity", filterSeverity);
      const { data, error } = await q;
      if (error) throw error;
      return data as Incident[];
    },
    refetchInterval: 30000,
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase.channel("incidents-rt").on("postgres_changes", { event: "*", schema: "public", table: "incidents" }, () => {
      qc.invalidateQueries({ queryKey: ["incidents"] });
      toast({ title: "Incident Update", description: "An incident status has changed." });
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc]);

  const { mutate: updateStatus } = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("incidents").update({ status, ...(status === "closed" ? { closed_at: new Date().toISOString() } : {}) }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ["incidents"] });
      toast({ title: "Status Updated", description: `Incident moved to ${status}.` });
    },
  });

  const getNextStatus = useCallback((status: string) => {
    const currentIndex = STATUS_FLOW.indexOf(status);
    if (currentIndex === -1 || currentIndex >= STATUS_FLOW.length - 1) return null;
    return STATUS_FLOW[currentIndex + 1];
  }, []);

  const handleSelectIncident = useCallback((incident: Incident) => {
    setSelectedIncident(incident);
  }, []);

  const handleAssignTeam = useCallback((incident: Incident) => {
    setSelectedIncident(incident);
    toast({ title: "Assign Team", description: `Review incident "${incident.title}" and assign responders from detail panel.` });
  }, []);

  const handleQuickStatusUpdate = useCallback((incident: Incident) => {
    const nextStatus = getNextStatus(incident.status);
    if (!nextStatus) {
      toast({ title: "Status Locked", description: "This incident is already in its final status." });
      return;
    }
    updateStatus({ id: incident.id, status: nextStatus });
  }, [getNextStatus, updateStatus]);

  const incidentCards = useMemo(
    () => incidents.map((incident) => (
      <motion.div
        key={incident.id}
        layout
        initial={{ opacity: 0, y: 16, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.985 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
      >
        <IncidentCard
          incident={incident}
          elapsedStr={getElapsed(incident.created_at)}
          statusClass={STATUS_COLORS[incident.status] || STATUS_COLORS.open}
          severityClass={SEVERITY_COLORS[incident.severity] || SEVERITY_COLORS.Low}
          onSelect={() => handleSelectIncident(incident)}
          onAssignTeam={() => handleAssignTeam(incident)}
          onUpdateStatus={() => handleQuickStatusUpdate(incident)}
        />
      </motion.div>
    )),
    [getElapsed, handleAssignTeam, handleQuickStatusUpdate, handleSelectIncident, incidents],
  );

  const open = incidents.filter(i => i.status === "open").length;
  const responding = incidents.filter(i => i.status === "responding" || i.status === "investigating").length;
  const critical = incidents.filter(i => i.severity === "Critical").length;
  const totalAffected = incidents.reduce((s, i) => s + i.affected_population, 0);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-border glass-strong z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/" className="font-display text-lg font-bold">
            <span className="text-foreground">Res</span><span className="text-gradient-primary">Q</span><span className="text-foreground">AI</span>
          </Link>
          <div className="w-px h-5 bg-border mx-1" />
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-destructive" />
            <span className="font-display text-sm font-bold text-foreground">Control Room</span>
            <span className="text-[10px] font-display px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">ICR-ER · NDMA</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <Link to="/dashboard" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-display text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <Radio className="w-3.5 h-3.5" /><span className="hidden sm:inline">Dashboard</span>
          </Link>
          <Link to="/resources" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-display text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <Package className="w-3.5 h-3.5" /><span className="hidden sm:inline">Resources</span>
          </Link>
          <Link to="/forecast" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-display text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <Activity className="w-3.5 h-3.5" /><span className="hidden sm:inline">Forecasts</span>
          </Link>
          <button onClick={() => refetch()} className="p-1.5 rounded-md hover:bg-accent transition-colors">
            <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          {user ? (
            <button onClick={signOut} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-display text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          ) : (
            <Button size="sm" onClick={() => navigate("/auth")} className="text-xs font-display h-8">
              <LogIn className="w-3.5 h-3.5 mr-1" /> Sign In
            </Button>
          )}
        </div>
      </header>

      {/* Stats + controls */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-border bg-card/30 overflow-x-auto flex-shrink-0">
        {[
          { icon: AlertTriangle, label: "Open", value: open, color: "text-destructive" },
          { icon: Radio, label: "Responding", value: responding, color: "text-flood" },
          { icon: Siren, label: "Critical", value: critical, color: "text-fire" },
          { icon: Users, label: "Affected", value: totalAffected.toLocaleString(), color: "text-warning" },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2 flex-shrink-0">
            <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
            <span className="font-display text-xs font-bold text-foreground">{s.value}</span>
            <span className="text-xs text-muted-foreground">{s.label}</span>
            <div className="w-px h-4 bg-border ml-2" />
          </div>
        ))}
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="text-xs bg-muted border border-border rounded-md px-2 py-1.5 text-foreground focus:outline-none h-8">
            <option value="">All Status</option>
            {["open","investigating","responding","resolved","closed"].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
          <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}
            className="text-xs bg-muted border border-border rounded-md px-2 py-1.5 text-foreground focus:outline-none h-8">
            <option value="">All Severity</option>
            {SEVERITY_LEVELS.map(s => <option key={s}>{s}</option>)}
          </select>
          {user && (
            <Button size="sm" onClick={() => setShowForm(true)} className="text-xs h-8 bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              <Plus className="w-3.5 h-3.5 mr-1" /> Log Incident
            </Button>
          )}
        </div>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/10 border border-destructive/20 text-xs text-destructive font-display flex-shrink-0">
          <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-destructive" /></span>
          LIVE
        </span>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => <IncidentCardSkeleton key={index} />)}
          </div>
        ) : incidents.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-border/80 bg-card/50 p-8 text-center">
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-safe/10 text-safe">
              <FileWarning className="h-7 w-7 opacity-70" />
            </div>
            <p className="text-safe font-display text-base">No incidents match current filters</p>
            <p className="text-muted-foreground text-xs mt-1">Try changing status/severity filters or log a new incident.</p>
            {user && (
              <Button size="sm" onClick={() => setShowForm(true)} className="mt-4 text-xs h-8 bg-destructive text-destructive-foreground">
                <Plus className="w-3.5 h-3.5 mr-1" /> Log New Incident
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground font-display px-1">
              <span className="text-foreground font-bold">{incidents.length}</span> incidents tracked
            </p>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${filterStatus}-${filterSeverity}`}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.24 }}
                className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
              >
                {incidentCards}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </main>

      {showForm && <AddIncidentModal onClose={() => setShowForm(false)} />}
      {selectedIncident && (
        <IncidentDetail
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onStatusChange={(id, status) => updateStatus({ id, status })}
        />
      )}
    </div>
  );
}
