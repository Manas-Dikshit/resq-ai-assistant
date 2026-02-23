import { useEffect, useRef } from "react";
import L from "leaflet";
import { ODISHA_CENTER, ODISHA_ZOOM, odishaShelters } from "@/data/odishaData";
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

const EvacuationMap = ({ selectedShelterId, onSelectShelter }: Props) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const shelterLayerRef = useRef<L.LayerGroup | null>(null);
  const sheltersRef = useRef<Shelter[]>([]);

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

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; CARTO',
    }).addTo(map);

    // Odisha boundary
    L.polyline([
      [21.5, 83.5], [22.5, 84], [22.5, 86], [22, 87.5],
      [21, 87.5], [19, 85], [19.5, 84], [20.5, 83.5], [21.5, 83.5]
    ], { color: '#2dd4bf', weight: 1, opacity: 0.2, dashArray: '5, 10' }).addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Load shelters
  useEffect(() => {
    const loadShelters = () => {
      sheltersRef.current = odishaShelters;
      renderShelters(odishaShelters);
    };

    const renderShelters = (shelters: Shelter[]) => {
      if (!shelterLayerRef.current) return;
      shelterLayerRef.current.clearLayers();

      shelters.forEach(s => {
        const utilization = s.capacity > 0 ? s.occupancy / s.capacity : 1;
        const isFull = utilization >= 1;
        const color = isFull ? '#ef4444' : utilization > 0.8 ? '#ef4444' : utilization > 0.5 ? '#eab308' : '#22c55e';
        const available = Math.max(0, s.capacity - s.occupancy);

        const icon = L.divIcon({
          className: '',
          html: `<div style="position:relative;display:flex;flex-direction:column;align-items:center">
            <div style="background:${color};width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,0.4);box-shadow:0 0 16px ${color}80;font-size:13px;cursor:pointer">🏠</div>
            <div style="background:rgba(0,0,0,0.85);border:1px solid ${color};border-radius:4px;padding:1px 5px;margin-top:2px;white-space:nowrap">
              <span style="font-size:9px;color:${color};font-family:monospace;font-weight:bold">${isFull ? 'FULL' : `${available} spots`}</span>
            </div>
          </div>`,
          iconSize: [40, 50],
          iconAnchor: [20, 25],
        });

        L.marker([s.lat, s.lng], { icon })
          .addTo(shelterLayerRef.current!)
          .on('click', () => onSelectShelter(s.id))
          .bindPopup(
            `<div style="font-family:'JetBrains Mono',monospace;min-width:200px">
              <b style="font-size:13px;color:white">🏠 ${s.name}</b>
              <div style="margin-top:6px">
                <div style="display:flex;justify-content:space-between;font-size:11px;color:#aaa">
                  <span>Capacity</span><span>${s.occupancy}/${s.capacity}</span>
                </div>
                <div style="width:100%;height:6px;background:#333;border-radius:3px;margin-top:4px">
                  <div style="width:${utilization * 100}%;height:100%;background:${color};border-radius:3px"></div>
                </div>
                <p style="font-size:11px;color:${color};margin-top:6px;font-weight:bold">${isFull ? '⛔ FULL — Try another shelter' : `✅ ${available} spots available`}</p>
              </div>
            </div>`,
            { className: 'prediction-popup' }
          );
      });
    };

    loadShelters();
    return () => {};
  }, [onSelectShelter]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full" />

      {/* Legend overlay */}
      <div className="absolute bottom-4 left-4 glass-strong rounded-xl p-4 z-[500] max-w-xs">
        <p className="text-[10px] font-display font-bold text-muted-foreground mb-3 tracking-wider uppercase">Shelter Status</p>
        <div className="space-y-2">
          <div>
            <p className="text-[9px] font-display font-bold text-safe mb-1">🟢 Available</p>
            <p className="text-[9px] text-muted-foreground">Occupancy &lt; 50% • Accepting people</p>
          </div>
          <div>
            <p className="text-[9px] font-display font-bold text-warning mb-1">🟡 Filling</p>
            <p className="text-[9px] text-muted-foreground">Occupancy 50-80% • Limited spaces</p>
          </div>
          <div>
            <p className="text-[9px] font-display font-bold text-destructive mb-1">🔴 Full</p>
            <p className="text-[9px] text-muted-foreground">Occupancy &gt; 80% or at capacity</p>
          </div>
          <hr className="border-border my-2" />
          <p className="text-[9px] font-display font-bold text-primary mb-1">📊 {odishaShelters.length} Shelters</p>
          <p className="text-[9px] text-muted-foreground">Total capacity: {odishaShelters.reduce((sum, s) => sum + s.capacity, 0).toLocaleString()} people</p>
        </div>
      </div>
    </div>
  );
};

export default EvacuationMap;
