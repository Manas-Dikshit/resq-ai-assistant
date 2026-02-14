import { useEffect, useRef } from "react";
import L from "leaflet";
import { mockDisasters, mockShelters, getDisasterColor } from "@/data/mockDisasters";
import "leaflet/dist/leaflet.css";

const DisasterMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [20, 40],
      zoom: 2,
      zoomControl: false,
    });

    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    }).addTo(map);

    // Disaster markers
    mockDisasters.forEach((d) => {
      const color = getDisasterColor(d.type);
      L.circleMarker([d.lat, d.lng], {
        radius: d.severity * 20 + 8,
        color,
        fillColor: color,
        fillOpacity: 0.35,
        weight: 2,
      })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:Inter,sans-serif;font-size:13px">
            <b>${d.title}</b><br/>
            <span style="color:#999">${d.description}</span><br/>
            <span>Affected: ${d.affected.toLocaleString()}</span><br/>
            <span>Severity: ${(d.severity * 100).toFixed(0)}%</span>
          </div>`
        );
    });

    // Shelters
    mockShelters.forEach((s) => {
      L.circleMarker([s.lat, s.lng], {
        radius: 6,
        color: "#22c55e",
        fillColor: "#22c55e",
        fillOpacity: 0.6,
        weight: 2,
      })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:Inter,sans-serif;font-size:13px">
            <b>${s.name}</b><br/>
            <span>Capacity: ${s.occupancy}/${s.capacity}</span>
          </div>`
        );
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-border">
      <div ref={mapRef} className="w-full h-full" style={{ background: "hsl(220 20% 7%)" }} />
    </div>
  );
};

export default DisasterMap;
