import { useEffect, useRef } from "react";
import L from "leaflet";
import { getDisasterColor } from "@/data/mockDisasters";
import { useRealDisasterData } from "@/hooks/useDisasterData";
import { useGridPredictions, RISK_COLORS, RISK_LABELS, RISK_ICONS, RiskType } from "@/hooks/useGridPredictions";
import { supabase } from "@/integrations/supabase/client";
import { ODISHA_CENTER, ODISHA_ZOOM } from "@/data/odishaData";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

const RISK_KEYS: RiskType[] = ["flood_risk", "cyclone_risk", "fire_risk", "earthquake_risk", "landslide_risk", "heat_wave_risk"];

const DisasterMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const realLayerRef = useRef<L.LayerGroup | null>(null);
  const shelterLayerRef = useRef<L.LayerGroup | null>(null);
  const predictionLayerRef = useRef<L.LayerGroup | null>(null);
  const reportLayerRef = useRef<L.LayerGroup | null>(null);
  const routingControlRef = useRef<any>(null);
  const { data } = useRealDisasterData();
  const { data: predictions } = useGridPredictions();

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [ODISHA_CENTER.lat, ODISHA_CENTER.lng],
      zoom: ODISHA_ZOOM,
      zoomControl: false,
    });

    mapInstanceRef.current = map;
    realLayerRef.current = L.layerGroup().addTo(map);
    shelterLayerRef.current = L.layerGroup().addTo(map);
    predictionLayerRef.current = L.layerGroup().addTo(map);
    reportLayerRef.current = L.layerGroup().addTo(map);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    }).addTo(map);

    L.polyline([
      [21.5, 83.5], [22.5, 84], [22.5, 86], [22, 87.5],
      [21, 87.5], [19, 85], [19.5, 84], [20.5, 83.5], [21.5, 83.5]
    ], { color: '#2dd4bf', weight: 1, opacity: 0.3, dashArray: '5, 10' }).addTo(map);

    // Shelter route events
    const handleShowRoute = (e: Event) => {
      const { userLat, userLng, shelterLat, shelterLng, mode } = (e as CustomEvent).detail;
      if (routingControlRef.current) { map.removeControl(routingControlRef.current); routingControlRef.current = null; }
      const routerProfile = mode === 'walking' ? 'foot' : 'car';
      routingControlRef.current = (L as any).Routing.control({
        waypoints: [L.latLng(userLat, userLng), L.latLng(shelterLat, shelterLng)],
        router: (L as any).Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1', profile: routerProfile }),
        lineOptions: { styles: [{ color: '#2dd4bf', weight: 4, opacity: 0.8 }], extendToWaypoints: true, missingRouteTolerance: 10 },
        createMarker: (i: number, wp: any) => {
          const icon = L.divIcon({ className: '', html: `<div style="width:14px;height:14px;border-radius:50%;background:${i === 0 ? '#3b82f6' : '#22c55e'};border:2px solid white;box-shadow:0 0 8px ${i === 0 ? '#3b82f6' : '#22c55e'}"></div>`, iconSize: [14, 14], iconAnchor: [7, 7] });
          return L.marker(wp.latLng, { icon });
        },
        show: false, addWaypoints: false, fitSelectedRoutes: true, routeWhileDragging: false,
      }).addTo(map);
    };
    const handleClearRoute = () => { if (routingControlRef.current) { map.removeControl(routingControlRef.current); routingControlRef.current = null; } };

    // Focus prediction point
    const handleFocusPrediction = (e: Event) => {
      const { lat, lng } = (e as CustomEvent).detail;
      map.flyTo([lat, lng], 10, { duration: 0.8 });
    };

    window.addEventListener('show-shelter-route', handleShowRoute);
    window.addEventListener('clear-shelter-route', handleClearRoute);
    window.addEventListener('focus-prediction', handleFocusPrediction);

    return () => {
      window.removeEventListener('show-shelter-route', handleShowRoute);
      window.removeEventListener('clear-shelter-route', handleClearRoute);
      window.removeEventListener('focus-prediction', handleFocusPrediction);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Prediction overlay
  useEffect(() => {
    if (!predictionLayerRef.current || !predictions) return;
    predictionLayerRef.current.clearLayers();

    predictions.predictions.forEach((point) => {
      const dominantRisk = RISK_KEYS.reduce((a, b) => point.predictions[a] > point.predictions[b] ? a : b);
      const maxVal = point.predictions[dominantRisk];
      const color = RISK_COLORS[dominantRisk];
      const levelBg = point.risk_level === "CRITICAL" ? "#ef4444" : point.risk_level === "HIGH" ? "#eab308" : point.risk_level === "MEDIUM" ? "#3b82f6" : "#22c55e";

      // Outer glow zone
      if (maxVal > 0.3) {
        L.circle([point.latitude, point.longitude], {
          radius: maxVal * 35000,
          color,
          fillColor: color,
          fillOpacity: 0.08,
          weight: 1,
          opacity: 0.3,
          dashArray: "4,8",
        }).addTo(predictionLayerRef.current!);
      }

      // Inner risk zone
      L.circle([point.latitude, point.longitude], {
        radius: maxVal * 18000,
        color,
        fillColor: color,
        fillOpacity: 0.15 + maxVal * 0.15,
        weight: 2,
        opacity: 0.6,
      }).addTo(predictionLayerRef.current!);

      // Risk bars popup
      const barsHtml = RISK_KEYS.map((key) => {
        const val = point.predictions[key];
        const barColor = RISK_COLORS[key];
        return `<div style="display:flex;align-items:center;gap:4px;margin:2px 0">
          <span style="font-size:10px;width:14px">${RISK_ICONS[key]}</span>
          <span style="font-size:10px;color:#aaa;width:65px">${RISK_LABELS[key]}</span>
          <div style="flex:1;height:4px;background:#333;border-radius:2px"><div style="width:${val*100}%;height:100%;background:${barColor};border-radius:2px"></div></div>
          <span style="font-size:10px;color:white;width:30px;text-align:right">${(val*100).toFixed(0)}%</span>
        </div>`;
      }).join("");

      const actionsHtml = (point.recommended_actions || []).slice(0, 2).map(a =>
        `<p style="font-size:10px;color:#fbbf24;margin:2px 0">⚠ ${a}</p>`
      ).join("");

      // Explainability section
      const explainHtml = point.explainability?.factors?.length
        ? `<div style="border-top:1px solid #333;padding-top:6px;margin-top:6px">
            <p style="font-size:9px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">🔍 Why this prediction</p>
            <p style="font-size:10px;color:#d1d5db;line-height:1.4">${point.explainability.summary}</p>
            ${point.explainability.factors.slice(0, 2).map(f =>
              `<div style="display:flex;align-items:center;gap:4px;margin:2px 0">
                <span style="font-size:9px;color:#fbbf24">↑</span>
                <span style="font-size:9px;color:#aaa;flex:1">${f.factor}</span>
                <span style="font-size:9px;color:#fbbf24">+${(f.impact*100).toFixed(0)}%</span>
              </div>`
            ).join("")}
          </div>`
        : "";

      // Alert tier badge
      const tierColors: Record<string, string> = {
        VERIFIED_CRITICAL: "#ef4444", AI_PREDICTED: "#eab308", MONITORING: "#3b82f6", LOW_WATCH: "#22c55e",
      };
      const tierColor = tierColors[point.alert_tier || "LOW_WATCH"] || "#22c55e";
      const tierLabel = point.alert_tier?.replace("_", " ") || "LOW WATCH";

      // Pulse rings for CRITICAL / HIGH risk
      const isCritical = point.risk_level === "CRITICAL" || point.risk_level === "HIGH";
      const pulseRingsHtml = isCritical
        ? `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none">
            <span style="position:absolute;display:block;width:48px;height:48px;border-radius:50%;border:2px solid ${color};opacity:0;animation:pulse-ring 2s cubic-bezier(0,0,0.2,1) infinite;top:-24px;left:-24px"></span>
            <span style="position:absolute;display:block;width:48px;height:48px;border-radius:50%;border:2px solid ${color};opacity:0;animation:pulse-ring 2s cubic-bezier(0,0,0.2,1) infinite 0.6s;top:-24px;left:-24px"></span>
            <span style="position:absolute;display:block;width:48px;height:48px;border-radius:50%;border:2px solid ${color};opacity:0;animation:pulse-ring 2s cubic-bezier(0,0,0.2,1) infinite 1.2s;top:-24px;left:-24px"></span>
          </div>`
        : "";

      // Marker icon
      const markerHtml = `<div style="position:relative;display:flex;flex-direction:column;align-items:center">
        ${pulseRingsHtml}
        <div style="background:${color};width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,0.3);box-shadow:0 0 ${isCritical ? '24' : '16'}px ${color}${isCritical ? '' : '80'};font-size:14px;position:relative;z-index:1">${RISK_ICONS[dominantRisk]}</div>
        <div style="background:rgba(0,0,0,0.85);border:1px solid ${tierColor};border-radius:4px;padding:1px 6px;margin-top:2px;white-space:nowrap;position:relative;z-index:1">
          <span style="font-size:9px;color:${tierColor};font-family:monospace;font-weight:bold">${tierLabel}</span>
        </div>
      </div>`;

      L.marker([point.latitude, point.longitude], {
        icon: L.divIcon({ className: '', html: markerHtml, iconSize: [64, 64], iconAnchor: [32, 32] }),
      })
        .addTo(predictionLayerRef.current!)
        .bindPopup(
          `<div style="font-family:Inter,sans-serif;min-width:220px;max-width:280px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
              <b style="font-size:13px;color:white">${RISK_ICONS[dominantRisk]} ${point.label}</b>
              <span style="font-size:10px;color:${tierColor};background:${tierColor}20;padding:1px 6px;border-radius:10px;border:1px solid ${tierColor}40">${tierLabel}</span>
            </div>
            <div style="margin:8px 0">${barsHtml}</div>
            ${actionsHtml ? `<div style="border-top:1px solid #333;padding-top:6px;margin-top:6px">${actionsHtml}</div>` : ''}
            ${explainHtml}
            <div style="display:flex;justify-content:space-between;margin-top:8px;padding-top:6px;border-top:1px solid #333">
              <span style="font-size:9px;color:#666">Confidence: ${(point.confidence*100).toFixed(0)}%</span>
              <span style="font-size:9px;color:#666">${point.model_version}</span>
              <span style="font-size:9px;color:#666">${point.forecast_hours}h</span>
            </div>
          </div>`,
          { className: 'prediction-popup' }
        );
    });
  }, [predictions]);

  // Shelters from DB
  useEffect(() => {
    if (!shelterLayerRef.current) return;
    const loadShelters = async () => {
      const { data: shelters } = await supabase.from('shelters').select('*');
      if (!shelters || !shelterLayerRef.current) return;
      shelterLayerRef.current.clearLayers();
      shelters.forEach((s) => {
        const utilization = s.occupancy / s.capacity;
        const shelterColor = utilization > 0.8 ? '#ef4444' : utilization > 0.5 ? '#eab308' : '#22c55e';
        L.circleMarker([s.lat, s.lng], { radius: 7, color: shelterColor, fillColor: shelterColor, fillOpacity: 0.7, weight: 2 })
          .addTo(shelterLayerRef.current!)
          .bindPopup(
            `<div style="font-family:Inter,sans-serif;font-size:13px;min-width:180px">
              <b>🏠 ${s.name}</b>
              <div style="margin-top:6px">
                <div style="display:flex;justify-content:space-between"><span>Capacity:</span><span>${s.occupancy}/${s.capacity}</span></div>
                <div style="width:100%;height:6px;background:#333;border-radius:3px;margin-top:4px">
                  <div style="width:${(utilization * 100)}%;height:100%;background:${shelterColor};border-radius:3px"></div>
                </div>
              </div>
            </div>`
          );
      });
    };
    loadShelters();
    const channel = supabase.channel('shelters-map').on('postgres_changes', { event: '*', schema: 'public', table: 'shelters' }, () => loadShelters()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Real-time events overlay
  useEffect(() => {
    if (!realLayerRef.current || !data) return;
    realLayerRef.current.clearLayers();

    [...(data.earthquakes || []), ...(data.nasaEvents || [])].forEach((e: any) => {
      if (!e.lat || !e.lng) return;
      const color = getDisasterColor(e.type);
      const severity = e.severity || 0.5;
      L.circleMarker([e.lat, e.lng], { radius: severity * 20 + 10, color, fillColor: color, fillOpacity: 0.1, weight: 1 }).addTo(realLayerRef.current!);
      L.circleMarker([e.lat, e.lng], { radius: severity * 12 + 5, color, fillColor: color, fillOpacity: 0.5, weight: 2 })
        .addTo(realLayerRef.current!)
        .bindPopup(
          `<div style="font-family:Inter,sans-serif;font-size:13px;min-width:200px">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
              <span style="width:8px;height:8px;border-radius:50%;background:${color};display:inline-block"></span>
              <b style="font-size:14px">${e.title}</b>
            </div>
            <p style="color:#2dd4bf;font-size:10px;margin:2px 0">📡 ${e.source || 'API'} — LIVE</p>
            <p style="color:#999;margin:4px 0">${e.description}</p>
            ${e.magnitude ? `<p style="color:${color}">Magnitude: ${e.magnitude}</p>` : ''}
            <p style="color:#666;font-size:11px;margin-top:6px">${new Date(e.timestamp).toLocaleString()}</p>
            ${e.url ? `<a href="${e.url}" target="_blank" style="color:#2dd4bf;font-size:11px">View Details →</a>` : ''}
          </div>`
        );
    });

    (data.cityWeather || []).forEach((c: any) => {
      if (!c.lat || !c.lng || c.temperature == null) return;
      const tempColor = c.temperature > 40 ? '#ef4444' : c.temperature > 30 ? '#f97316' : c.temperature > 20 ? '#eab308' : '#3b82f6';
      L.marker([c.lat, c.lng], {
        icon: L.divIcon({
          className: '',
          html: `<div style="background:rgba(0,0,0,0.7);border:1px solid ${tempColor};border-radius:6px;padding:2px 6px;font-size:11px;color:${tempColor};font-family:monospace;white-space:nowrap;transform:translate(-50%,-50%)">${c.temperature.toFixed(0)}°C 💨${c.windSpeed?.toFixed(0)}</div>`,
          iconSize: [0, 0],
        }),
      })
        .addTo(realLayerRef.current!)
        .bindPopup(
          `<div style="font-family:Inter,sans-serif;font-size:13px;min-width:180px">
            <b>🌡 ${c.city}</b>
            <div style="margin-top:6px;line-height:1.8">
              <div>Temperature: <b style="color:${tempColor}">${c.temperature?.toFixed(1)}°C</b> (feels ${c.feelsLike?.toFixed(1)}°C)</div>
              <div>Humidity: ${c.humidity}%</div>
              <div>Wind: ${c.windSpeed?.toFixed(1)} km/h (gusts ${c.windGusts?.toFixed(1)})</div>
              <div>Pressure: ${c.pressure?.toFixed(0)} hPa</div>
              <div>Cloud Cover: ${c.cloudCover}%</div>
            </div>
          </div>`
        );
    });
  }, [data]);

  // Community reports overlay
  useEffect(() => {
    if (!reportLayerRef.current) return;
    const loadReports = async () => {
      const { data: reports } = await supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(30);
      if (!reports || !reportLayerRef.current) return;
      reportLayerRef.current.clearLayers();

      reports.forEach((r: any) => {
        const emoji: Record<string, string> = { flood: "🌊", cyclone: "🌀", fire: "🔥", earthquake: "🏔️", landslide: "⛰️", storm: "⛈️", other: "⚠️" };
        const trustColor = r.verified ? "#22c55e" : r.trust_score >= 0.5 ? "#eab308" : "#888";
        const tierLabel = r.verified ? "VERIFIED" : r.trust_score > 0 ? "COMMUNITY" : "UNCONFIRMED";

        const icon = L.divIcon({
          className: '',
          html: `<div style="display:flex;flex-direction:column;align-items:center">
            <div style="background:rgba(0,0,0,0.8);border:2px solid ${trustColor};width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 0 10px ${trustColor}60">${emoji[r.disaster_type] || "⚠️"}</div>
            <div style="background:rgba(0,0,0,0.85);border:1px solid ${trustColor};border-radius:3px;padding:0 4px;margin-top:1px">
              <span style="font-size:7px;color:${trustColor};font-family:monospace">${tierLabel}</span>
            </div>
          </div>`,
          iconSize: [28, 40],
          iconAnchor: [14, 20],
        });

        L.marker([r.lat, r.lng], { icon })
          .addTo(reportLayerRef.current!)
          .bindPopup(
            `<div style="font-family:Inter,sans-serif;min-width:200px">
              <b style="font-size:13px;color:white">${emoji[r.disaster_type] || "⚠️"} ${r.title}</b>
              <div style="display:flex;align-items:center;gap:4px;margin-top:4px">
                <span style="font-size:9px;color:${trustColor};background:${trustColor}20;padding:1px 6px;border-radius:10px;border:1px solid ${trustColor}40">${tierLabel}</span>
                <span style="font-size:9px;color:#888">${r.confirm_count || 0} 👍 ${r.deny_count || 0} 👎</span>
              </div>
              ${r.description ? `<p style="font-size:11px;color:#aaa;margin-top:4px">${r.description}</p>` : ""}
              <div style="display:flex;justify-content:space-between;margin-top:6px;padding-top:4px;border-top:1px solid #333">
                <span style="font-size:9px;color:#666">Trust: ${r.trust_score > 0 ? (r.trust_score * 100).toFixed(0) + "%" : "—"}</span>
                <span style="font-size:9px;color:#666">${new Date(r.created_at).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}</span>
              </div>
            </div>`,
            { className: 'prediction-popup' }
          );
      });
    };
    loadReports();

    const channel = supabase.channel('reports-map')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => loadReports())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-border">
      <div ref={mapRef} className="w-full h-full" style={{ background: "hsl(220 20% 7%)" }} />
    </div>
  );
};

export default DisasterMap;
