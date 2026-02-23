import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Waves, Mountain, Activity, AlertTriangle, ChevronLeft, ChevronRight,
  LogOut, LogIn, Radio, GraduationCap, Package, Shield, Loader2,
  TrendingUp, TrendingDown, Minus, Droplets, Wind, Thermometer,
  MapPin, Clock, RefreshCw, Volume2, Flame, Satellite, Info
} from "lucide-react";
import { useForestFireData, ForestFireHotspot } from "@/hooks/useDisasterData";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import LanguageToggle from "@/components/LanguageToggle";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, AreaChart, Area
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────
interface FloodStation {
  id: string; name: string; river: string; state: string;
  lat: number; lng: number;
  danger_level: number; warning_level: number; current_level: number;
  forecast_24h: number | null; forecast_48h: number | null; forecast_72h: number | null;
  rainfall_mm: number | null; status: string; last_updated: string;
}
interface LandslideZone {
  id: string; district: string; state: string;
  risk_score: number; risk_level: string;
  rainfall_mm: number | null; soil_saturation: number | null;
  slope_angle: number | null; advisory: string | null; last_updated: string;
}
interface OceanStation {
  id: string; name: string; type: string; state: string;
  lat: number; lng: number;
  sea_level_m: number; wave_height_m: number; wave_period_s: number;
  tsunami_probability: number; alert_level: string; last_updated: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const RISK_COLORS: Record<string, string> = {
  Critical: "text-destructive bg-destructive/10 border-destructive/30",
  High: "text-fire bg-fire/10 border-fire/30",
  Medium: "text-warning bg-warning/10 border-warning/30",
  Low: "text-safe bg-safe/10 border-safe/30",
};
const FLOOD_STATUS_COLORS: Record<string, string> = {
  danger: "text-destructive bg-destructive/10 border-destructive/30",
  warning: "text-warning bg-warning/10 border-warning/30",
  normal: "text-safe bg-safe/10 border-safe/30",
};
const TSUNAMI_COLORS: Record<string, string> = {
  warning: "text-destructive bg-destructive/10 border-destructive/30",
  watch: "text-warning bg-warning/10 border-warning/30",
  normal: "text-safe bg-safe/10 border-safe/30",
};

function generateFloodHistory(station: FloodStation) {
  const points = [];
  const base = station.current_level;
  for (let h = -48; h <= 72; h += 6) {
    const noise = (Math.sin(h * 0.4) * 0.8 + Math.cos(h * 0.2) * 0.5) * (base * 0.08);
    let level: number;
    if (h <= 0) level = base + noise * (h / 48) * -1;
    else if (h === 24) level = station.forecast_24h ?? base;
    else if (h === 48) level = station.forecast_48h ?? base;
    else if (h === 72) level = station.forecast_72h ?? base;
    else {
      const t = h / 72;
      level = base + (((station.forecast_72h ?? base) - base) * t) + noise * 0.5;
    }
    points.push({ h: h === 0 ? "Now" : `${h > 0 ? "+" : ""}${h}h`, level: Math.max(0, parseFloat(level.toFixed(2))), forecast: h > 0 });
  }
  return points;
}

function getFloodForecastLevel(station: FloodStation) {
  const forecasts = [station.forecast_24h, station.forecast_48h, station.forecast_72h].filter(
    (value): value is number => typeof value === "number"
  );
  const maxForecast = forecasts.length > 0 ? Math.max(...forecasts) : null;
  if (maxForecast === null) return "normal";
  if (maxForecast >= station.danger_level) return "danger";
  if (maxForecast >= station.warning_level) return "warning";
  return "normal";
}

function getFloodAlertLevel(station: FloodStation) {
  if (station.current_level >= station.danger_level) return "danger";
  if (station.current_level >= station.warning_level) return "warning";
  return getFloodForecastLevel(station);
}

// ─── Flood Section ────────────────────────────────────────────────────────────
function FloodSection({ stations }: { stations: FloodStation[] }) {
  const [selected, setSelected] = useState<FloodStation | null>(stations[0] || null);
  const enhancedStations = useMemo(
    () =>
      stations.map(station => ({
        ...station,
        derivedStatus: getFloodAlertLevel(station),
        forecastStatus: getFloodForecastLevel(station),
      })),
    [stations]
  );
  const chartData = useMemo(() => (selected ? generateFloodHistory(selected) : []), [selected]);

  if (stations.length === 0) {
    return (
      <div className="glass rounded-xl p-6 border border-border text-center text-sm text-muted-foreground">
        No flood stations available yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {enhancedStations.map(s => {
          const pct = Math.min(100, (s.current_level / s.danger_level) * 100);
          const showForecast = s.forecastStatus !== "normal" && s.current_level < s.warning_level;
          return (
            <motion.button key={s.id} onClick={() => setSelected(s)}
              className={`glass rounded-xl p-4 text-left border transition-all space-y-3 ${selected?.id === s.id ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/20"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-sm font-bold text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.river} · {s.state}</p>
                </div>
                <div className="flex items-center gap-1">
                  {showForecast && (
                    <span className={`text-[10px] font-display px-2 py-0.5 rounded-full border capitalize ${FLOOD_STATUS_COLORS[s.forecastStatus]}`}>
                      Forecast {s.forecastStatus}
                    </span>
                  )}
                  <span className={`text-[10px] font-display px-2 py-0.5 rounded-full border capitalize ${FLOOD_STATUS_COLORS[s.derivedStatus] || FLOOD_STATUS_COLORS.normal}`}>
                    {s.derivedStatus}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Water Level</span>
                  <span className="font-bold text-foreground">{s.current_level.toFixed(1)}m</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-destructive" : pct >= 90 ? "bg-warning" : "bg-safe"}`}
                    style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Warning: {s.warning_level}m</span>
                  <span>Danger: {s.danger_level}m</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Droplets className="w-3 h-3" />
                  <span>{s.rainfall_mm ?? 0}mm</span>
                </div>
                {s.forecast_24h && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    {s.forecast_24h > s.current_level
                      ? <TrendingUp className="w-3 h-3 text-destructive" />
                      : <TrendingDown className="w-3 h-3 text-safe" />}
                    <span>24h: {s.forecast_24h.toFixed(1)}m</span>
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {selected && (
        <div className="glass rounded-xl p-4 border border-border space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-foreground">{selected.name} — Forecast Chart</h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-primary inline-block" /> Actual</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 border-b border-dashed border-warning inline-block" /> Forecast</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="floodGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(210 80% 55%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(210 80% 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
              <XAxis dataKey="h" tick={{ fontSize: 10, fill: "hsl(215 15% 55%)" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215 15% 55%)" }} />
              <Tooltip contentStyle={{ background: "hsl(220 18% 10%)", border: "1px solid hsl(220 15% 18%)", borderRadius: 8, fontSize: 11 }}
                labelStyle={{ color: "hsl(210 20% 92%)" }} itemStyle={{ color: "hsl(210 80% 55%)" }} />
              <ReferenceLine y={selected.danger_level} stroke="hsl(0 72% 51%)" strokeDasharray="4 4" label={{ value: "DANGER", fill: "hsl(0 72% 51%)", fontSize: 9 }} />
              <ReferenceLine y={selected.warning_level} stroke="hsl(38 92% 50%)" strokeDasharray="4 4" label={{ value: "WARNING", fill: "hsl(38 92% 50%)", fontSize: 9 }} />
              <Area type="monotone" dataKey="level" stroke="hsl(210 80% 55%)" fill="url(#floodGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ─── Landslide Section ────────────────────────────────────────────────────────
function LandslideSection({ zones }: { zones: LandslideZone[] }) {
  const sorted = [...zones].sort((a, b) => b.risk_score - a.risk_score);

  if (zones.length === 0) {
    return (
      <div className="glass rounded-xl p-6 border border-border text-center text-sm text-muted-foreground">
        No landslide zones available yet.
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-4 border border-border space-y-2">
        <h3 className="font-display text-sm font-bold text-foreground mb-3">District Risk Map</h3>
        {sorted.map(z => (
          <div key={z.id} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-display border ${RISK_COLORS[z.risk_level] || RISK_COLORS.Low}`}>{z.risk_level}</span>
                <span className="text-foreground font-medium">{z.district}</span>
                <span className="text-muted-foreground">· {z.state}</span>
              </div>
              <span className="font-bold text-foreground">{(z.risk_score * 100).toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${z.risk_score >= 0.8 ? "bg-destructive" : z.risk_score >= 0.6 ? "bg-fire" : z.risk_score >= 0.4 ? "bg-warning" : "bg-safe"}`}
                style={{ width: `${z.risk_score * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sorted.filter(z => z.risk_level === "Critical" || z.risk_level === "High").map(z => (
          <div key={z.id} className={`glass rounded-xl p-4 border space-y-2 ${z.risk_level === "Critical" ? "border-destructive/30" : "border-fire/30"}`}>
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-4 h-4 ${z.risk_level === "Critical" ? "text-destructive" : "text-fire"}`} />
              <div>
                <p className="font-display text-sm font-bold text-foreground">{z.district}</p>
                <p className="text-xs text-muted-foreground">{z.state}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="glass rounded-md p-2 text-center">
                <p className="text-foreground font-bold">{z.rainfall_mm ?? 0}mm</p>
                <p className="text-muted-foreground text-[10px]">Rainfall</p>
              </div>
              <div className="glass rounded-md p-2 text-center">
                <p className="text-foreground font-bold">{((z.soil_saturation ?? 0) * 100).toFixed(0)}%</p>
                <p className="text-muted-foreground text-[10px]">Soil Sat.</p>
              </div>
              <div className="glass rounded-md p-2 text-center">
                <p className="text-foreground font-bold">{z.slope_angle ?? 0}°</p>
                <p className="text-muted-foreground text-[10px]">Slope</p>
              </div>
            </div>
            {z.advisory && <p className="text-xs text-muted-foreground border-l-2 border-warning pl-2 leading-relaxed">{z.advisory}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tsunami Section ──────────────────────────────────────────────────────────
function TsunamiSection({ stations }: { stations: OceanStation[] }) {
  const alerts = stations.filter(s => s.alert_level !== "normal");

  if (stations.length === 0) {
    return (
      <div className="glass rounded-xl p-6 border border-border text-center text-sm text-muted-foreground">
        No ocean stations available yet.
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {alerts.length > 0 && (
        <div className="glass rounded-xl p-4 border border-warning/40 bg-warning/5">
          <div className="flex items-center gap-2 mb-3">
            <Volume2 className="w-4 h-4 text-warning animate-pulse" />
            <h3 className="font-display text-sm font-bold text-warning">Active Coastal Alerts</h3>
          </div>
          {alerts.map(s => (
            <div key={s.id} className="flex items-center justify-between text-sm">
              <span className="text-foreground">{s.name} ({s.state})</span>
              <span className={`text-[10px] font-display px-2 py-0.5 rounded-full border capitalize ${TSUNAMI_COLORS[s.alert_level]}`}>{s.alert_level}</span>
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {stations.map(s => (
          <div key={s.id} className={`glass rounded-xl p-4 border space-y-3 ${s.alert_level !== "normal" ? "border-warning/30" : "border-border"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display text-sm font-bold text-foreground">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.type} · {s.state}</p>
              </div>
              <span className={`text-[10px] font-display px-2 py-0.5 rounded-full border capitalize ${TSUNAMI_COLORS[s.alert_level] || TSUNAMI_COLORS.normal}`}>
                {s.alert_level}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="glass rounded-md p-2 text-center">
                <p className="text-foreground font-bold">{s.wave_height_m.toFixed(1)}m</p>
                <p className="text-muted-foreground text-[10px]">Wave Height</p>
              </div>
              <div className="glass rounded-md p-2 text-center">
                <p className="text-foreground font-bold">{s.wave_period_s.toFixed(0)}s</p>
                <p className="text-muted-foreground text-[10px]">Period</p>
              </div>
              <div className="glass rounded-md p-2 text-center">
                <p className="text-foreground font-bold">{s.sea_level_m.toFixed(1)}m</p>
                <p className="text-muted-foreground text-[10px]">Sea Level</p>
              </div>
              <div className="glass rounded-md p-2 text-center">
                <p className={`font-bold ${s.tsunami_probability > 0.1 ? "text-warning" : "text-safe"}`}>
                  {(s.tsunami_probability * 100).toFixed(0)}%
                </p>
                <p className="text-muted-foreground text-[10px]">Tsunami P.</p>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              Updated {new Date(s.last_updated).toLocaleTimeString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Forest Fire Section ─────────────────────────────────────────────────────
const CONFIDENCE_COLORS: Record<string, string> = {
  high: "text-destructive bg-destructive/10 border-destructive/30",
  nominal: "text-warning bg-warning/10 border-warning/30",
  low: "text-safe bg-safe/10 border-safe/30",
};

function ForestFireSection() {
  const apiKey = import.meta.env.VITE_NASA_FIRMS_API_KEY as string | undefined;
  const isMock = !apiKey || apiKey === "YOUR_FIRMS_MAP_KEY_HERE";
  const [days, setDays] = useState<1 | 2 | 3>(1);
  const { data: hotspots = [], isLoading, isError, refetch } = useForestFireData(days);
  const [selected, setSelected] = useState<ForestFireHotspot | null>(null);

  const highCount = hotspots.filter(h => h.confidence === "high").length;
  const totalFRP = hotspots.reduce((s, h) => s + (h.frp ?? 0), 0);

  return (
    <div className="space-y-4">
      {/* API-key notice */}
      {isMock && (
        <div className="glass rounded-xl p-3 border border-warning/30 bg-warning/5 flex items-start gap-3">
          <Info className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground">
            <span className="text-warning font-bold">Demo mode</span> — showing sample hotspot data.
            {" "}Set <code className="bg-muted px-1 rounded">VITE_NASA_FIRMS_API_KEY</code> in your{" "}
            <code className="bg-muted px-1 rounded">.env</code> file with a free key from{" "}
            <a href="https://firms.modaps.eosdis.nasa.gov/usfs/api/area/" target="_blank" rel="noopener noreferrer"
              className="text-primary underline">
              NASA FIRMS
            </a>{" "}to get live data.
          </div>
        </div>
      )}

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass rounded-xl p-4 border border-border text-center space-y-1">
          <p className="text-2xl font-bold text-destructive">{hotspots.length}</p>
          <p className="text-xs text-muted-foreground font-display">Active Hotspots</p>
        </div>
        <div className="glass rounded-xl p-4 border border-border text-center space-y-1">
          <p className="text-2xl font-bold text-fire">{highCount}</p>
          <p className="text-xs text-muted-foreground font-display">High Confidence</p>
        </div>
        <div className="glass rounded-xl p-4 border border-border text-center space-y-1">
          <p className="text-2xl font-bold text-warning">{totalFRP.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground font-display">Total FRP (MW)</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground font-display">Look-back:</span>
        {([1, 2, 3] as const).map(d => (
          <button key={d} onClick={() => setDays(d)}
            className={`px-3 py-1 rounded-md text-xs font-display border transition-all ${
              days === d ? "bg-primary/10 border-primary/30 text-primary" : "border-border text-muted-foreground hover:border-primary/20"
            }`}>{d}d</button>
        ))}
        <button onClick={() => refetch()}
          className="ml-auto p-1.5 rounded-md hover:bg-accent transition-colors" title="Refresh">
          <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="glass rounded-xl p-6 border border-destructive/30 text-center text-sm text-destructive">
          Failed to fetch fire data. Check your API key or network connection.
        </div>
      ) : hotspots.length === 0 ? (
        <div className="glass rounded-xl p-6 border border-border text-center text-sm text-muted-foreground">
          No active hotspots detected in the selected period.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {hotspots.map((h, i) => (
            <motion.button key={i} onClick={() => setSelected(selected && selected.latitude === h.latitude && selected.longitude === h.longitude ? null : h)}
              className={`glass rounded-xl p-4 text-left border transition-all space-y-3 ${
                selected?.latitude === h.latitude && selected?.longitude === h.longitude
                  ? "border-fire/40 bg-fire/5"
                  : "border-border hover:border-fire/20"
              }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className={`w-4 h-4 ${ h.confidence === "high" ? "text-destructive" : h.confidence === "nominal" ? "text-warning" : "text-muted-foreground"}`} />
                  <div>
                    <p className="font-display text-sm font-bold text-foreground">
                      {h.latitude.toFixed(4)}°N, {h.longitude.toFixed(4)}°E
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {h.acq_date} · {h.acq_time.padStart(4,"0").replace(/(\d{2})(\d{2})/, "$1:$2")} UTC
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-display px-2 py-0.5 rounded-full border capitalize ${
                  CONFIDENCE_COLORS[h.confidence] || CONFIDENCE_COLORS.low
                }`}>
                  {h.confidence}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="glass rounded-md p-2 text-center">
                  <p className="text-foreground font-bold">{h.frp.toFixed(1)}</p>
                  <p className="text-muted-foreground text-[10px]">FRP (MW)</p>
                </div>
                <div className="glass rounded-md p-2 text-center">
                  <p className="text-foreground font-bold">{h.bright_ti4.toFixed(0)}K</p>
                  <p className="text-muted-foreground text-[10px]">Ti4 Temp</p>
                </div>
                <div className="glass rounded-md p-2 text-center">
                  <p className={`font-bold ${h.daynight === "D" ? "text-warning" : "text-primary"}`}>
                    {h.daynight === "D" ? "Day" : "Night"}
                  </p>
                  <p className="text-muted-foreground text-[10px]">Pass</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Satellite className="w-3 h-3" />
                <span>{h.satellite === "N" ? "NOAA-20" : "Suomi NPP"}</span>
                <span className="ml-auto">Scan {h.scan}km × {h.track}km</span>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Detail panel for selected hotspot */}
      {selected && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-4 border border-fire/30 space-y-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-destructive" />
            <h3 className="font-display text-sm font-bold text-foreground">Hotspot Detail</h3>
            <button onClick={() => setSelected(null)} className="ml-auto text-xs text-muted-foreground hover:text-foreground">✕ Close</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {[
              { label: "Latitude", value: `${selected.latitude.toFixed(5)}°N` },
              { label: "Longitude", value: `${selected.longitude.toFixed(5)}°E` },
              { label: "FRP", value: `${selected.frp.toFixed(2)} MW` },
              { label: "Ti4 Brightness", value: `${selected.bright_ti4.toFixed(1)} K` },
              { label: "Ti5 Brightness", value: `${selected.bright_ti5.toFixed(1)} K` },
              { label: "Confidence", value: selected.confidence },
              { label: "Satellite", value: selected.satellite === "N" ? "NOAA-20" : "Suomi NPP" },
              { label: "Day/Night", value: selected.daynight === "D" ? "Daytime" : "Nighttime" },
            ].map(({ label, value }) => (
              <div key={label} className="glass rounded-md p-2 text-center">
                <p className="text-foreground font-bold">{value}</p>
                <p className="text-muted-foreground text-[10px]">{label}</p>
              </div>
            ))}
          </div>
          <a
            href={`https://firms.modaps.eosdis.nasa.gov/map/#d:24hrs;@${selected.longitude},${selected.latitude},10z`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
            <Satellite className="w-3 h-3" /> View on NASA FIRMS Map
          </a>
        </motion.div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
type Tab = "flood" | "landslide" | "tsunami" | "forest_fire";

export default function ForecastCenter() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("flood");
  const queryClient = useQueryClient();

  const {
    data: floodStations = [],
    isLoading: loadFlood,
    refetch: refetchFlood,
    error: floodError,
  } = useQuery({
    queryKey: ["flood_stations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("flood_stations").select("*").order("status", { ascending: false });
      if (error) throw error;
      return data as FloodStation[];
    },
    refetchInterval: 60000,
    staleTime: 30000,
    retry: 2,
    refetchOnWindowFocus: true,
  });

  const {
    data: landslideZones = [],
    isLoading: loadLandslide,
    refetch: refetchLandslide,
    error: landslideError,
  } = useQuery({
    queryKey: ["landslide_zones"],
    queryFn: async () => {
      const { data, error } = await supabase.from("landslide_zones").select("*").order("risk_score", { ascending: false });
      if (error) throw error;
      return data as LandslideZone[];
    },
    refetchInterval: 300000,
    staleTime: 120000,
    retry: 2,
    refetchOnWindowFocus: true,
  });

  const {
    data: oceanStations = [],
    isLoading: loadOcean,
    refetch: refetchOcean,
    error: oceanError,
  } = useQuery({
    queryKey: ["ocean_stations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ocean_stations").select("*").order("tsunami_probability", { ascending: false });
      if (error) throw error;
      return data as OceanStation[];
    },
    refetchInterval: 180000,
    staleTime: 60000,
    retry: 2,
    refetchOnWindowFocus: true,
  });

  const isLoading = loadFlood || loadLandslide || loadOcean;
  const hasError = Boolean(floodError || landslideError || oceanError);
  const criticalFlood = useMemo(
    () => floodStations.filter(s => getFloodAlertLevel(s) === "danger").length,
    [floodStations]
  );
  const criticalLandslide = useMemo(
    () => landslideZones.filter(z => z.risk_level === "Critical").length,
    [landslideZones]
  );
  const tsunamiAlerts = useMemo(
    () => oceanStations.filter(s => s.alert_level !== "normal").length,
    [oceanStations]
  );

  const refetchAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["flood_stations"] });
    queryClient.invalidateQueries({ queryKey: ["landslide_zones"] });
    queryClient.invalidateQueries({ queryKey: ["ocean_stations"] });
    refetchFlood();
    refetchLandslide();
    refetchOcean();
  }, [queryClient, refetchFlood, refetchLandslide, refetchOcean]);

  // Forest fire badge count (uses the same hook, stale-time avoids double fetch)
  const { data: fireBadgeData = [] } = useForestFireData(1);
  const forestFireCount = fireBadgeData.filter(h => h.confidence === "high").length;

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
            <Activity className="w-4 h-4 text-primary" />
            <span className="font-display text-sm font-bold text-foreground">Forecast Center</span>
            <span className="text-[10px] font-display px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">CWC · GSI · INCOIS</span>
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
          <Link to="/control-room" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-display text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <Shield className="w-3.5 h-3.5" /><span className="hidden sm:inline">Control Room</span>
          </Link>
          <button onClick={refetchAll} className="p-1.5 rounded-md hover:bg-accent transition-colors" title="Refresh">
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

      {/* Tab bar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-card/30 flex-shrink-0">
        {([
          { id: "flood", icon: Waves, label: "Flood Watch", badge: criticalFlood, color: "text-flood" },
          { id: "landslide", icon: Mountain, label: "Landslide Forecast", badge: criticalLandslide, color: "text-fire" },
          { id: "tsunami", icon: Activity, label: "Tsunami & Ocean", badge: tsunamiAlerts, color: "text-warning" },
          { id: "forest_fire", icon: Flame, label: "Forest Fire", badge: forestFireCount, color: "text-destructive" },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-display transition-all ${tab === t.id ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}>
            <t.icon className={`w-3.5 h-3.5 ${tab === t.id ? "text-primary" : t.color}`} />
            {t.label}
            {t.badge > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground font-bold">{t.badge}</span>
            )}
          </button>
        ))}
        <div className="flex-1" />
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-safe/10 border border-safe/20 text-xs text-safe font-display">
          <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-safe opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-safe" /></span>
          LIVE
        </span>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-auto p-4 space-y-4">
        {hasError && (
          <div className="glass rounded-xl p-4 border border-destructive/30 bg-destructive/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertTriangle className="w-4 h-4" />
              Failed to load some live feeds. Please retry.
            </div>
            <Button size="sm" variant="outline" onClick={refetchAll} className="text-xs">
              Retry
            </Button>
          </div>
        )}
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {tab === "flood" && <FloodSection stations={floodStations} />}
              {tab === "landslide" && <LandslideSection zones={landslideZones} />}
              {tab === "tsunami" && <TsunamiSection stations={oceanStations} />}
              {tab === "forest_fire" && <ForestFireSection />}
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
