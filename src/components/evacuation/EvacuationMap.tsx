import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { ODISHA_CENTER, ODISHA_ZOOM, odishaShelters } from "@/data/odishaData";
import { getCartoTileUrl, CARTO_ATTRIBUTION } from "@/lib/mapUtils";
import { supabase } from "@/integrations/supabase/client";
import DemoDataBadge from "@/components/DemoDataBadge";
import "leaflet/dist/leaflet.css";

interface Shelter {
  id: string;
  name: string;
  lat: number;
  lng: number;
  capacity: number;
  occupancy: number;
}

interface Props {
  selectedShelterId: string | null;
  onSelectShelter: (id: string | null) => void;
}

type ShelterSource = "live" | "seed";

const EvacuationMap = ({ selectedShelterId, onSelectShelter }: Props) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const shelterLayerRef = useRef<L.LayerGroup | null>(null);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [source, setSource] = useState<ShelterSource>("live");
  const [loading, setLoading] = useState(true);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [ODISHA_CENTER.lat, ODISHA_CENTER.lng],
      zoom: ODISHA_ZOOM,
      zoomControl: false,
    });

    mapInstanceRef.current = map;
    shelterLayerRef.current = L.layerGroup().addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer(getCartoTileUrl("dark_all"), {
      attribution: CARTO_ATTRIBUTION,
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    // Odisha boundary
    L.polyline([
      [21.5, 83.5], [22.5, 84], [22.5, 86], [22, 87.5],
      [21, 87.5], [19, 85], [19.5, 84], [20.5, 83.5], [21.5, 83.5]
    ], { color: '#2dd4bf', weight: 1, opacity: 0.2, dashArray: '5, 10' }).addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      shelterLayerRef.current = null;
    };
  }, []);

  // Load live shelters; fall back to clearly-labelled seed data only when empty.
  useEffect(() => {
    let cancelled = false;

    const loadShelters = async () => {
      const { data, error } = await supabase.from("shelters").select("*").order("name");
      if (cancelled) return;

      if (!error && data && data.length > 0) {
        setShelters(data);
        setSource("live");
      } else {
        setShelters(odishaShelters);
        setSource("seed");
      }
      setLoading(false);
    };

    loadShelters();

    const channel = supabase
      .channel("evac-map-shelters")
      .on("postgres_changes", { event: "*", schema: "public", table: "shelters" }, () => {
        loadShelters();
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  // Render shelters whenever data or selection changes.
  useEffect(() => {
    const shelterLayer = shelterLayerRef.current;
    if (!shelterLayer) return;
    shelterLayer.clearLayers();

    shelters.forEach(s => {
      const utilization = s.capacity > 0 ? s.occupancy / s.capacity : 1;
      const isFull = utilization >= 1;
      const color = isFull ? '#ef4444' : utilization > 0.8 ? '#ef4444' : utilization > 0.5 ? '#eab308' : '#22c55e';
      const available = Math.max(0, s.capacity - s.occupancy);
      const isSelected = selectedShelterId === s.id;

      const icon = L.divIcon({
        className: '',
        html: `<div style="position:relative;display:flex;flex-direction:column;align-items:center">
          <div style="background:${color};width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid ${isSelected ? '#fff' : 'rgba(255,255,255,0.4)'};box-shadow:0 0 16px ${color}80;cursor:pointer">
            <div style="width:8px;height:8px;border-radius:50%;background:#fff"></div>
          </div>
          <div style="background:rgba(0,0,0,0.85);border:1px solid ${color};border-radius:4px;padding:1px 5px;margin-top:2px;white-space:nowrap">
            <span style="font-size:9px;color:${color};font-family:monospace;font-weight:bold">${isFull ? 'FULL' : `${available} spots`}</span>
          </div>
        </div>`,
        iconSize: [40, 50],
        iconAnchor: [20, 25],
      });

      L.marker([s.lat, s.lng], { icon })
        .addTo(shelterLayer)
        .on('click', () => onSelectShelter(s.id))
        .bindPopup(
          `<div style="font-family:'JetBrains Mono',monospace;min-width:200px">
            <b style="font-size:13px;color:white">${s.name}</b>
            <div style="margin-top:6px">
              <div style="display:flex;justify-content:space-between;font-size:11px;color:#aaa">
                <span>Capacity</span><span>${s.occupancy}/${s.capacity}</span>
              </div>
              <div style="width:100%;height:6px;background:#333;border-radius:3px;margin-top:4px">
                <div style="width:${utilization * 100}%;height:100%;background:${color};border-radius:3px"></div>
              </div>
              <p style="font-size:11px;color:${color};margin-top:6px;font-weight:bold">${isFull ? 'FULL — try another shelter' : `${available} spots available`}</p>
            </div>
          </div>`,
          { className: 'prediction-popup' }
        );
    });
  }, [shelters, selectedShelterId, onSelectShelter]);

  const totalCapacity = shelters.reduce((sum, s) => sum + s.capacity, 0);

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full" />

      {/* Legend overlay */}
      <div className="absolute bottom-4 left-4 z-[500] max-w-xs rounded-lg border border-border bg-card/95 p-3 shadow-lg backdrop-blur-sm">
        <p className="mb-2 font-display text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Shelter status</p>
        <div className="space-y-2">
          <div>
            <p className="mb-1 flex items-center gap-1.5 font-display text-[9px] font-bold text-safe">
              <span className="h-1.5 w-1.5 rounded-full bg-safe" />Available
            </p>
            <p className="text-[9px] text-muted-foreground">Occupancy &lt; 50% · accepting people</p>
          </div>
          <div>
            <p className="mb-1 flex items-center gap-1.5 font-display text-[9px] font-bold text-warning">
              <span className="h-1.5 w-1.5 rounded-full bg-warning" />Filling
            </p>
            <p className="text-[9px] text-muted-foreground">Occupancy 50–80% · limited spaces</p>
          </div>
          <div>
            <p className="mb-1 flex items-center gap-1.5 font-display text-[9px] font-bold text-destructive">
              <span className="h-1.5 w-1.5 rounded-full bg-destructive" />Full
            </p>
            <p className="text-[9px] text-muted-foreground">Occupancy &gt; 80% or at capacity</p>
          </div>
          <hr className="my-2 border-border" />
          <p className="mb-1 font-display text-[9px] font-bold text-foreground">
            {loading ? "Loading shelters…" : `${shelters.length} shelters`}
          </p>
          <p className="text-[9px] text-muted-foreground">
            Total capacity: {totalCapacity.toLocaleString()} people
          </p>
          {source === "seed" && (
            <DemoDataBadge label="Seed shelter data" className="mt-1" />
          )}
        </div>
      </div>
    </div>
  );
};

export default EvacuationMap;
