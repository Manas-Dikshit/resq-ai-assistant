import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import { supabase } from "@/integrations/supabase/client";
import { ODISHA_CENTER, ODISHA_ZOOM } from "@/data/odishaData";
import { useGridPredictions, RISK_COLORS, RISK_ICONS, RiskType } from "@/hooks/useGridPredictions";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

interface Shelter {
  id: string;
  name: string;
  lat: number;
  lng: number;
  capacity: number;
  occupancy: number;
}

interface Props {
  userPos: { lat: number; lng: number } | null;
  onUserPosChange: (pos: { lat: number; lng: number }) => void;
  selectedShelterId: string | null;
  onSelectShelter: (id: string | null) => void;
  onRouteFound: (info: { distance: string; time: string } | null) => void;
}

const RISK_KEYS: RiskType[] = ["flood_risk", "cyclone_risk", "fire_risk", "earthquake_risk", "landslide_risk", "heat_wave_risk"];

const EvacuationMap = ({ userPos, onUserPosChange, selectedShelterId, onSelectShelter, onRouteFound }: Props) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const shelterLayerRef = useRef<L.LayerGroup | null>(null);
  const hazardLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routingControlRef = useRef<any>(null);
  const sheltersRef = useRef<Shelter[]>([]);
  const modeRef = useRef<'walking' | 'driving'>('driving');

  const { data: predictions } = useGridPredictions();

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
    hazardLayerRef.current = L.layerGroup().addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; CARTO',
    }).addTo(map);

    // Odisha boundary
    L.polyline([
      [21.5, 83.5], [22.5, 84], [22.5, 86], [22, 87.5],
      [21, 87.5], [19, 85], [19.5, 84], [20.5, 83.5], [21.5, 83.5]
    ], { color: '#2dd4bf', weight: 1, opacity: 0.2, dashArray: '5, 10' }).addTo(map);

    // Listen for mode changes
    const handleModeChange = (e: Event) => {
      modeRef.current = (e as CustomEvent).detail.mode;
    };
    window.addEventListener('evac-mode-change', handleModeChange);

    return () => {
      window.removeEventListener('evac-mode-change', handleModeChange);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Load shelters
  useEffect(() => {
    const loadShelters = async () => {
      const { data } = await supabase.from('shelters').select('*');
      if (data) {
        sheltersRef.current = data;
        renderShelters(data);
      }
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
    const channel = supabase
      .channel('evac-shelters-map')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shelters' }, () => loadShelters())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [onSelectShelter]);

  // Render hazard zones from predictions
  useEffect(() => {
    if (!hazardLayerRef.current || !predictions) return;
    hazardLayerRef.current.clearLayers();

    predictions.predictions.forEach(point => {
      const dominantRisk = RISK_KEYS.reduce((a, b) => point.predictions[a] > point.predictions[b] ? a : b);
      const maxVal = point.predictions[dominantRisk];
      if (maxVal < 0.3) return;

      const color = RISK_COLORS[dominantRisk];

      // Danger zone circle
      L.circle([point.latitude, point.longitude], {
        radius: maxVal * 25000,
        color,
        fillColor: color,
        fillOpacity: 0.08,
        weight: 1.5,
        opacity: 0.4,
        dashArray: '6,6',
      }).addTo(hazardLayerRef.current!)
        .bindPopup(
          `<div style="font-family:'JetBrains Mono',monospace">
            <b style="color:${color}">${RISK_ICONS[dominantRisk]} ${point.label}</b>
            <p style="font-size:11px;color:#ef4444;margin-top:4px">⚠ HAZARD ZONE — AVOID</p>
            <p style="font-size:10px;color:#aaa;margin-top:2px">Risk: ${(maxVal * 100).toFixed(0)}%</p>
          </div>`,
          { className: 'prediction-popup' }
        );
    });
  }, [predictions]);

  // Update user marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userPos) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userPos.lat, userPos.lng]);
    } else {
      const icon = L.divIcon({
        className: '',
        html: `<div style="position:relative">
          <div style="width:18px;height:18px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 20px #3b82f6"></div>
          <div style="position:absolute;width:40px;height:40px;border-radius:50%;border:2px solid #3b82f680;top:-11px;left:-11px;animation:pulse-ring 2s infinite"></div>
        </div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      userMarkerRef.current = L.marker([userPos.lat, userPos.lng], { icon }).addTo(map);
    }

    map.flyTo([userPos.lat, userPos.lng], 10, { duration: 0.8 });
  }, [userPos]);

  // Show route when shelter selected
  const showRoute = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map || !userPos || !selectedShelterId) {
      if (routingControlRef.current && map) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
        onRouteFound(null);
      }
      return;
    }

    const shelter = sheltersRef.current.find(s => s.id === selectedShelterId);
    if (!shelter) return;

    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }

    const profile = modeRef.current === 'walking' ? 'foot' : 'car';

    routingControlRef.current = (L as any).Routing.control({
      waypoints: [L.latLng(userPos.lat, userPos.lng), L.latLng(shelter.lat, shelter.lng)],
      router: (L as any).Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        profile,
      }),
      lineOptions: {
        styles: [
          { color: '#000', weight: 8, opacity: 0.4 },
          { color: '#2dd4bf', weight: 5, opacity: 0.9 },
        ],
        extendToWaypoints: true,
        missingRouteTolerance: 10,
      },
      createMarker: () => null, // We handle markers ourselves
      show: false,
      addWaypoints: false,
      fitSelectedRoutes: true,
      routeWhileDragging: false,
    }).addTo(map);

    routingControlRef.current.on('routesfound', (e: any) => {
      const route = e.routes[0];
      const distKm = (route.summary.totalDistance / 1000).toFixed(1);
      const timeMins = Math.ceil(route.summary.totalTime / 60);
      const timeStr = timeMins >= 60 ? `${Math.floor(timeMins / 60)}h ${timeMins % 60}m` : `${timeMins} min`;
      onRouteFound({ distance: `${distKm} km`, time: timeStr });
    });
  }, [userPos, selectedShelterId, onRouteFound]);

  useEffect(() => {
    showRoute();
  }, [showRoute]);

  // Listen for mode changes to recalculate
  useEffect(() => {
    const handler = () => {
      // Small delay to let modeRef update
      setTimeout(showRoute, 50);
    };
    window.addEventListener('evac-mode-change', handler);
    return () => window.removeEventListener('evac-mode-change', handler);
  }, [showRoute]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full" />

      {/* Legend overlay */}
      <div className="absolute bottom-4 left-4 glass-strong rounded-xl p-3 z-[500]">
        <p className="text-[10px] font-display font-bold text-muted-foreground mb-2 tracking-wider uppercase">Evacuation Legend</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" /><span className="text-[10px] text-muted-foreground">Your Location</span></div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-safe" /><span className="text-[10px] text-muted-foreground">Shelter (Available)</span></div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-warning" /><span className="text-[10px] text-muted-foreground">Shelter (Filling)</span></div>
          <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-destructive" /><span className="text-[10px] text-muted-foreground">Shelter (Full)</span></div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full border border-dashed border-destructive/60" />
            <span className="text-[10px] text-muted-foreground">Hazard Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-0.5 bg-primary rounded" />
            <span className="text-[10px] text-muted-foreground">Evacuation Route</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvacuationMap;
