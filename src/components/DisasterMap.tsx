import { useEffect, useRef } from "react";
import L from "leaflet";
import { odishaDisasters, odishaShelters, ODISHA_CENTER, ODISHA_ZOOM } from "@/data/odishaData";
import { getDisasterColor } from "@/data/mockDisasters";
import "leaflet/dist/leaflet.css";

const DisasterMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [ODISHA_CENTER.lat, ODISHA_CENTER.lng],
      zoom: ODISHA_ZOOM,
      zoomControl: false,
    });

    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    }).addTo(map);

    // Disaster markers with pulsing effect
    odishaDisasters.forEach((d) => {
      const color = getDisasterColor(d.type);
      
      // Outer glow
      L.circleMarker([d.lat, d.lng], {
        radius: d.severity * 25 + 12,
        color,
        fillColor: color,
        fillOpacity: 0.15,
        weight: 1,
      }).addTo(map);

      // Inner marker
      L.circleMarker([d.lat, d.lng], {
        radius: d.severity * 15 + 6,
        color,
        fillColor: color,
        fillOpacity: 0.4,
        weight: 2,
      })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:Inter,sans-serif;font-size:13px;min-width:200px">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
              <span style="width:8px;height:8px;border-radius:50%;background:${color};display:inline-block"></span>
              <b style="font-size:14px">${d.title}</b>
            </div>
            <p style="color:#999;margin:4px 0">${d.description}</p>
            <div style="display:flex;gap:12px;margin-top:8px">
              <span>👥 ${d.affected.toLocaleString()} affected</span>
              <span style="color:${color}">⚠ ${(d.severity * 100).toFixed(0)}% severity</span>
            </div>
            <p style="color:#666;font-size:11px;margin-top:6px">${new Date(d.timestamp).toLocaleString()}</p>
          </div>`
        );
    });

    // Shelter markers
    odishaShelters.forEach((s) => {
      const utilization = s.occupancy / s.capacity;
      const shelterColor = utilization > 0.8 ? '#ef4444' : utilization > 0.5 ? '#eab308' : '#22c55e';
      
      L.circleMarker([s.lat, s.lng], {
        radius: 7,
        color: shelterColor,
        fillColor: shelterColor,
        fillOpacity: 0.7,
        weight: 2,
      })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:Inter,sans-serif;font-size:13px;min-width:180px">
            <b>🏠 ${s.name}</b>
            <div style="margin-top:6px">
              <div style="display:flex;justify-content:space-between">
                <span>Capacity:</span><span>${s.occupancy}/${s.capacity}</span>
              </div>
              <div style="width:100%;height:6px;background:#333;border-radius:3px;margin-top:4px">
                <div style="width:${(utilization * 100)}%;height:100%;background:${shelterColor};border-radius:3px"></div>
              </div>
              <p style="color:${shelterColor};font-size:11px;margin-top:4px">${utilization > 0.8 ? 'Near Full' : utilization > 0.5 ? 'Moderate' : 'Available'}</p>
            </div>
          </div>`
        );
    });

    // Odisha state boundary hint
    L.polyline([
      [21.5, 83.5], [22.5, 84], [22.5, 86], [22, 87.5],
      [21, 87.5], [19, 85], [19.5, 84], [20.5, 83.5], [21.5, 83.5]
    ], { color: '#2dd4bf', weight: 1, opacity: 0.3, dashArray: '5, 10' }).addTo(map);

    return () => { map.remove(); mapInstanceRef.current = null; };
  }, []);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-border">
      <div ref={mapRef} className="w-full h-full" style={{ background: "hsl(220 20% 7%)" }} />
    </div>
  );
};

export default DisasterMap;
