import { useEffect, useRef } from "react";
import L from "leaflet";
import { motion } from "framer-motion";
import type { Training } from "@/hooks/useTrainings";
import "leaflet/dist/leaflet.css";

const THEME_COLORS: Record<string, string> = {
  "Flood Management": "#3b82f6",
  "Earthquake Response": "#a855f7",
  "Cyclone Preparedness": "#f97316",
  "Chemical Safety": "#eab308",
  "Fire Safety": "#ef4444",
  "Landslide Response": "#78716c",
  "Heat Wave Management": "#f59e0b",
  "Medical First Response": "#10b981",
  "Community Awareness": "#06b6d4",
  "Search & Rescue": "#6366f1",
};

const LEVEL_COLORS: Record<string, string> = {
  National: "#3b82f6",
  State: "#f97316",
  District: "#10b981",
  Community: "#a855f7",
};

type ColorMode = "theme" | "level";

interface TrainingMapProps {
  trainings: Training[];
  colorMode?: ColorMode;
}

export default function TrainingMap({ trainings, colorMode = "theme" }: TrainingMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Layer[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    mapRef.current = L.map(containerRef.current, {
      center: [20.5937, 78.9629],
      zoom: 5,
      zoomControl: true,
    });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(mapRef.current);
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const withCoords = trainings.filter(t => t.lat && t.lng);
    const bounds: [number, number][] = [];

    withCoords.forEach(t => {
      const color = colorMode === "theme"
        ? (THEME_COLORS[t.theme] ?? "#10b981")
        : (LEVEL_COLORS[t.level] ?? "#10b981");
      const radius = Math.max(6, Math.min(20, t.participants_total / 20));

      const circle = L.circleMarker([t.lat!, t.lng!], {
        color,
        fillColor: color,
        fillOpacity: 0.7,
        weight: 2,
        radius,
      }).addTo(mapRef.current!);

      circle.bindPopup(`
        <div style="min-width:200px;font-family:Inter,sans-serif;font-size:12px;color:#e2e8f0">
          <b style="font-size:13px">${t.title}</b><br/>
          <span style="opacity:0.7">${t.theme} · ${t.level}</span><br/>
          ${t.location_name}, ${t.state}<br/>
          ${t.start_date} → ${t.end_date}<br/>
          <div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.1)">
            <b>${t.participants_total}</b> total &nbsp;
            <span style="color:#93c5fd"><b>${t.participants_male}</b> M</span> &nbsp;
            <span style="color:#f9a8d4"><b>${t.participants_female}</b> F</span>
          </div>
          <div style="opacity:0.6;margin-top:4px">by ${t.organizer}</div>
          ${t.verified ? '<span style="color:#10b981;font-size:10px">✓ Verified</span>' : ""}
        </div>
      `);

      markersRef.current.push(circle);
      bounds.push([t.lat!, t.lng!]);
    });

    if (bounds.length > 0) {
      mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 });
    }
  }, [trainings, colorMode]);

  const legendEntries = colorMode === "level"
    ? Object.entries(LEVEL_COLORS)
    : Object.entries(THEME_COLORS).slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full rounded-xl overflow-hidden border border-border relative"
    >
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />

      {/* Legend */}
      <div className="absolute bottom-4 right-4 glass-strong rounded-xl p-3 z-[500] text-xs space-y-1 pointer-events-none">
        <p className="font-display font-bold text-muted-foreground mb-2 tracking-wider uppercase" style={{ fontSize: 10 }}>
          {colorMode === "theme" ? "By Theme" : "By Level"}
        </p>
        {legendEntries.map(([k, c]) => (
          <div key={k} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c }} />
            <span className="text-muted-foreground">{k.split(" ")[0]}</span>
          </div>
        ))}
        <p className="text-muted-foreground/50 pt-1" style={{ fontSize: 10 }}>Circle size = participants</p>
      </div>
    </motion.div>
  );
}
