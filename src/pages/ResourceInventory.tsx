import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Plus, Search, Filter, Map, List, BarChart3,
  LogOut, LogIn, Shield, RefreshCw, Download, Truck,
  Wrench, Users, Radio, GraduationCap, Warehouse, CheckCircle,
  Clock, AlertTriangle, ChevronLeft, ChevronRight, Loader2,
  MapPin, Phone, Building2, X, ArrowRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import LanguageToggle from "@/components/LanguageToggle";
import { useEffect as useMapEffect, useRef } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────
interface Resource {
  id: string;
  name: string;
  type: string;
  category: string;
  quantity: number;
  unit: string;
  condition: string;
  status: string;
  state: string;
  location_name: string;
  lat: number | null;
  lng: number | null;
  owner_org: string;
  contact_person: string | null;
  contact_phone: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  available: "text-safe border-safe/30 bg-safe/10",
  reserved: "text-warning border-warning/30 bg-warning/10",
  deployed: "text-flood border-flood/30 bg-flood/10",
  returned: "text-muted-foreground border-border bg-muted/50",
};

const RESOURCE_TYPES = ["Equipment","Vehicle","Medical","Personnel","Supplies","Communication","Shelter","Food & Water"];
const CATEGORIES = ["Search & Rescue","Flood Relief","Fire Fighting","Medical","Logistics","Shelter","CBRN","Communication"];
const CONDITIONS = ["Excellent","Good","Fair","Needs Repair"];
const STATUSES = ["available","reserved","deployed","returned"];
const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala",
  "Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha",
  "Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh","Andaman & Nicobar",
];

// ─── Add Resource Form ───────────────────────────────────────────────────────
function AddResourceModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: "", type: "Equipment", category: "Search & Rescue",
    quantity: 1, unit: "units", condition: "Good", status: "available",
    state: "Odisha", location_name: "", lat: "", lng: "",
    owner_org: "", contact_person: "", contact_phone: "", notes: "",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");
      const { error } = await supabase.from("resources").insert({
        ...form,
        quantity: Number(form.quantity),
        lat: form.lat ? Number(form.lat) : null,
        lng: form.lng ? Number(form.lng) : null,
        created_by: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["resources"] });
      toast({ title: "Resource Added", description: `${form.name} added to inventory.` });
      onClose();
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const f = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-display font-bold text-foreground flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" /> Add Resource to Inventory
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-accent transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">Resource Name *</label>
              <input value={form.name} onChange={e => f("name", e.target.value)}
                className="w-full text-sm bg-muted border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. NDRF Inflatable Boat Mk-4" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Type</label>
              <select value={form.type} onChange={e => f("type", e.target.value)}
                className="w-full text-sm bg-muted border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                {RESOURCE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Category</label>
              <select value={form.category} onChange={e => f("category", e.target.value)}
                className="w-full text-sm bg-muted border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Quantity *</label>
              <input type="number" min="1" value={form.quantity} onChange={e => f("quantity", e.target.value)}
                className="w-full text-sm bg-muted border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Unit</label>
              <input value={form.unit} onChange={e => f("unit", e.target.value)}
                className="w-full text-sm bg-muted border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="units, kits, persons..." />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Condition</label>
              <select value={form.condition} onChange={e => f("condition", e.target.value)}
                className="w-full text-sm bg-muted border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                {CONDITIONS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Status</label>
              <select value={form.status} onChange={e => f("status", e.target.value)}
                className="w-full text-sm bg-muted border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">State *</label>
              <select value={form.state} onChange={e => f("state", e.target.value)}
                className="w-full text-sm bg-muted border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">Location Name *</label>
              <input value={form.location_name} onChange={e => f("location_name", e.target.value)}
                className="w-full text-sm bg-muted border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. NDRF 8th Battalion, Guwahati" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Latitude</label>
              <input type="number" step="0.0001" value={form.lat} onChange={e => f("lat", e.target.value)}
                className="w-full text-sm bg-muted border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. 26.14" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Longitude</label>
              <input type="number" step="0.0001" value={form.lng} onChange={e => f("lng", e.target.value)}
                className="w-full text-sm bg-muted border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. 91.74" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">Owning Organisation *</label>
              <input value={form.owner_org} onChange={e => f("owner_org", e.target.value)}
                className="w-full text-sm bg-muted border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. NDRF, SDRF Odisha, DRDO..." />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Contact Person</label>
              <input value={form.contact_person} onChange={e => f("contact_person", e.target.value)}
                className="w-full text-sm bg-muted border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Contact Phone</label>
              <input value={form.contact_phone} onChange={e => f("contact_phone", e.target.value)}
                className="w-full text-sm bg-muted border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
              <textarea rows={2} value={form.notes} onChange={e => f("notes", e.target.value)}
                className="w-full text-sm bg-muted border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 border-border text-xs">Cancel</Button>
            <Button onClick={() => mutate()} disabled={isPending || !form.name || !form.location_name || !form.owner_org}
              className="flex-1 bg-gradient-primary text-primary-foreground text-xs">
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Plus className="w-3.5 h-3.5 mr-1" />}
              Add Resource
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Resource Card ───────────────────────────────────────────────────────────
function ResourceCard({ r, onStatusChange }: { r: Resource; onStatusChange: (id: string, status: string) => void }) {
  const statusFlow: Record<string, string> = { available: "reserved", reserved: "deployed", deployed: "returned", returned: "available" };
  const typeIcons: Record<string, any> = {
    Equipment: Wrench, Vehicle: Truck, Medical: Plus, Personnel: Users,
    Communication: Radio, Shelter: Warehouse, Supplies: Package, "Food & Water": Package,
  };
  const Icon = typeIcons[r.type] || Package;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-4 space-y-3 hover:border-primary/20 transition-colors border border-border">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 flex-shrink-0">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-sm font-bold text-foreground truncate">{r.name}</p>
            <p className="text-xs text-muted-foreground">{r.type} · {r.category}</p>
          </div>
        </div>
        <span className={`flex-shrink-0 text-[10px] font-display px-2 py-0.5 rounded-full border capitalize ${STATUS_COLORS[r.status] || STATUS_COLORS.returned}`}>
          {r.status}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Package className="w-3 h-3" />
          <span><span className="text-foreground font-bold">{r.quantity}</span> {r.unit}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <CheckCircle className="w-3 h-3" />
          <span>{r.condition}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{r.location_name}, {r.state}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
          <Building2 className="w-3 h-3" />
          <span className="truncate">{r.owner_org}</span>
        </div>
        {r.contact_phone && (
          <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
            <Phone className="w-3 h-3" />
            <span>{r.contact_phone}</span>
          </div>
        )}
      </div>
      <button onClick={() => onStatusChange(r.id, statusFlow[r.status] || "available")}
        className="w-full text-xs font-display py-1.5 rounded-md bg-muted hover:bg-accent border border-border transition-colors flex items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground">
        Move to <span className="capitalize text-primary">{statusFlow[r.status]}</span>
        <ArrowRight className="w-3 h-3" />
      </button>
    </motion.div>
  );
}

// ─── Analytics Panel ─────────────────────────────────────────────────────────
function ResourceAnalytics({ resources }: { resources: Resource[] }) {
  const byStatus = STATUSES.map(s => ({ label: s, count: resources.filter(r => r.status === s).length }));
  const byType = RESOURCE_TYPES.map(t => ({ label: t, count: resources.filter(r => r.type === t).length })).filter(t => t.count > 0);
  const byState = Array.from(new Set(resources.map(r => r.state)))
    .map(s => ({ state: s, count: resources.filter(r => r.state === s).length }))
    .sort((a, b) => b.count - a.count).slice(0, 8);

  const statusColors: Record<string, string> = {
    available: "bg-safe", reserved: "bg-warning", deployed: "bg-flood", returned: "bg-muted-foreground"
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {byStatus.map(s => (
          <div key={s.label} className={`glass rounded-xl p-4 border border-border`}>
            <p className={`text-2xl font-display font-bold ${s.label === 'available' ? 'text-safe' : s.label === 'deployed' ? 'text-flood' : s.label === 'reserved' ? 'text-warning' : 'text-muted-foreground'}`}>{s.count}</p>
            <p className="text-xs text-muted-foreground capitalize mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass rounded-xl p-4 border border-border space-y-3">
          <h3 className="font-display text-sm font-bold text-foreground">Resources by Type</h3>
          {byType.map(t => (
            <div key={t.label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{t.label}</span>
                <span className="font-bold text-foreground">{t.count}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(t.count / resources.length) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="glass rounded-xl p-4 border border-border space-y-3">
          <h3 className="font-display text-sm font-bold text-foreground">Resources by State</h3>
          {byState.map(s => (
            <div key={s.state} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground truncate">{s.state}</span>
                <span className="font-bold text-foreground">{s.count}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-flood rounded-full transition-all" style={{ width: `${(s.count / Math.max(...byState.map(x => x.count))) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function ResourceInventory() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterState, setFilterState] = useState("");
  const [view, setView] = useState<"grid" | "analytics">("grid");
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const { data: resources = [], isLoading, refetch } = useQuery({
    queryKey: ["resources", filterType, filterStatus, filterState],
    queryFn: async () => {
      let q = supabase.from("resources").select("*").order("created_at", { ascending: false });
      if (filterType) q = q.eq("type", filterType);
      if (filterStatus) q = q.eq("status", filterStatus);
      if (filterState) q = q.eq("state", filterState);
      const { data, error } = await q;
      if (error) throw error;
      return data as Resource[];
    },
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("resources").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ["resources"] });
      toast({ title: "Status Updated", description: `Resource moved to ${status}.` });
    },
  });

  const filtered = resources.filter(r =>
    !search || r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.owner_org.toLowerCase().includes(search.toLowerCase()) ||
    r.location_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    const rows = [
      ["Name","Type","Category","Qty","Unit","Condition","Status","State","Location","Owner","Contact"],
      ...filtered.map(r => [r.name, r.type, r.category, r.quantity, r.unit, r.condition, r.status, r.state, r.location_name, r.owner_org, r.contact_phone || ""])
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "idrn-resources.csv"; a.click();
    URL.revokeObjectURL(url);
  };

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
            <Package className="w-4 h-4 text-primary" />
            <span className="font-display text-sm font-bold text-foreground">Resource Inventory</span>
            <span className="text-[10px] font-display px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">IDRN · National</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <Link to="/dashboard" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-display text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <Radio className="w-3.5 h-3.5" /><span className="hidden sm:inline">Dashboard</span>
          </Link>
          <Link to="/training" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-display text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <GraduationCap className="w-3.5 h-3.5" /><span className="hidden sm:inline">Training</span>
          </Link>
          <Link to="/control-room" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-display text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <Shield className="w-3.5 h-3.5" /><span className="hidden sm:inline">Control Room</span>
          </Link>
          <Link to="/forecast" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-display text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <BarChart3 className="w-3.5 h-3.5" /><span className="hidden sm:inline">Forecasts</span>
          </Link>
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

      {/* Stats bar */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-border bg-card/30 overflow-x-auto flex-shrink-0">
        {[
          { icon: Package, label: "Total", value: resources.length, color: "text-primary" },
          { icon: CheckCircle, label: "Available", value: resources.filter(r => r.status === "available").length, color: "text-safe" },
          { icon: Truck, label: "Deployed", value: resources.filter(r => r.status === "deployed").length, color: "text-flood" },
          { icon: Clock, label: "Reserved", value: resources.filter(r => r.status === "reserved").length, color: "text-warning" },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2 flex-shrink-0">
            <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
            <span className="font-display text-xs font-bold text-foreground">{s.value}</span>
            <span className="text-xs text-muted-foreground">{s.label}</span>
            <div className="w-px h-4 bg-border ml-2" />
          </div>
        ))}
        <div className="flex-1" />
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {([{ id: "grid", icon: List, label: "Inventory" }, { id: "analytics", icon: BarChart3, label: "Analytics" }] as const).map(v => (
            <button key={v.id} onClick={() => setView(v.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-display transition-all ${view === v.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}>
              <v.icon className="w-3.5 h-3.5" /><span className="hidden sm:inline">{v.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 260, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }} className="border-r border-border bg-card/30 overflow-hidden flex-shrink-0 hidden lg:flex flex-col">
              <div className="p-4 space-y-4 overflow-y-auto flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-primary" /> Filters
                  </h2>
                  <button onClick={() => { setFilterType(""); setFilterStatus(""); setFilterState(""); }}
                    className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resources..."
                    className="w-full text-xs bg-muted border border-border rounded-md pl-8 pr-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                {[
                  { label: "Type", value: filterType, set: setFilterType, opts: ["", ...RESOURCE_TYPES] },
                  { label: "Status", value: filterStatus, set: setFilterStatus, opts: ["", ...STATUSES] },
                  { label: "State", value: filterState, set: setFilterState, opts: ["", ...INDIAN_STATES] },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-xs text-muted-foreground mb-1 block">{f.label}</label>
                    <select value={f.value} onChange={e => f.set(e.target.value)}
                      className="w-full text-xs bg-muted border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                      {f.opts.map(o => <option key={o} value={o}>{o || `All ${f.label}s`}</option>)}
                    </select>
                  </div>
                ))}
                <div className="space-y-2 pt-2 border-t border-border">
                  <p className="text-xs font-display font-bold text-muted-foreground">Actions</p>
                  {user && (
                    <Button onClick={() => setShowForm(true)} className="w-full text-xs h-9 bg-gradient-primary text-primary-foreground">
                      <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Resource
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleExport} className="w-full text-xs h-9 border-border">
                    <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
                  </Button>
                  <Button variant="outline" onClick={() => refetch()} className="w-full text-xs h-9 border-border">
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
                  </Button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
        <button onClick={() => setShowFilters(!showFilters)}
          className="hidden lg:flex items-center justify-center w-5 border-r border-border bg-card/50 hover:bg-accent transition-colors group flex-shrink-0">
          {showFilters ? <ChevronLeft className="w-3 h-3 text-muted-foreground group-hover:text-foreground" />
            : <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-foreground" />}
        </button>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : view === "analytics" ? (
            <ResourceAnalytics resources={resources} />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground font-display">
                  Showing <span className="text-foreground font-bold">{filtered.length}</span> of {resources.length} resources
                </p>
                {user && (
                  <Button size="sm" onClick={() => setShowForm(true)} className="text-xs h-8 bg-gradient-primary text-primary-foreground lg:hidden">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add
                  </Button>
                )}
              </div>
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Package className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground font-display text-sm">No resources found</p>
                  <p className="text-muted-foreground/60 text-xs mt-1">Add your first resource using the button above</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filtered.map(r => (
                    <ResourceCard key={r.id} r={r} onStatusChange={(id, status) => updateStatus({ id, status })} />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {showForm && <AddResourceModal onClose={() => setShowForm(false)} />}
    </div>
  );
}
