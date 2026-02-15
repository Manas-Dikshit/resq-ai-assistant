import { useEffect, useRef } from "react";
import L from "leaflet";
import { getDisasterColor } from "@/data/mockDisasters";
import { useRealDisasterData } from "@/hooks/useDisasterData";
import { supabase } from "@/integrations/supabase/client";
import { ODISHA_CENTER, ODISHA_ZOOM } from "@/data/odishaData";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

const DisasterMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const realLayerRef = useRef<L.LayerGroup | null>(null);
  const shelterLayerRef = useRef<L.LayerGroup | null>(null);
  const routingControlRef = useRef<any>(null);
  const { data } = useRealDisasterData();

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

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    }).addTo(map);

    L.polyline([
      [21.5, 83.5], [22.5, 84], [22.5, 86], [22, 87.5],
      [21, 87.5], [19, 85], [19.5, 84], [20.5, 83.5], [21.5, 83.5]
    ], { color: '#2dd4bf', weight: 1, opacity: 0.3, dashArray: '5, 10' }).addTo(map);

    // Listen for shelter route events
    const handleShowRoute = (e: Event) => {
      const { userLat, userLng, shelterLat, shelterLng, mode } = (e as CustomEvent).detail;
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }

      const routerProfile = mode === 'walking' ? 'foot' : 'car';
      routingControlRef.current = (L as any).Routing.control({
        waypoints: [
          L.latLng(userLat, userLng),
          L.latLng(shelterLat, shelterLng),
        ],
        router: (L as any).Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1',
          profile: routerProfile,
        }),
        lineOptions: {
          styles: [{ color: '#2dd4bf', weight: 4, opacity: 0.8 }],
          extendToWaypoints: true,
          missingRouteTolerance: 10,
        },
        createMarker: (i: number, wp: any) => {
          const icon = L.divIcon({
            className: '',
            html: `<div style="width:14px;height:14px;border-radius:50%;background:${i === 0 ? '#3b82f6' : '#22c55e'};border:2px solid white;box-shadow:0 0 8px ${i === 0 ? '#3b82f6' : '#22c55e'}"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          });
          return L.marker(wp.latLng, { icon });
        },
        show: false,
        addWaypoints: false,
        fitSelectedRoutes: true,
        routeWhileDragging: false,
      }).addTo(map);
    };

    const handleClearRoute = () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
    };

    window.addEventListener('show-shelter-route', handleShowRoute);
    window.addEventListener('clear-shelter-route', handleClearRoute);

    return () => {
      window.removeEventListener('show-shelter-route', handleShowRoute);
      window.removeEventListener('clear-shelter-route', handleClearRoute);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Fetch shelters from database
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
    const channel = supabase
      .channel('shelters-map')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shelters' }, () => loadShelters())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Overlay real-time events
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

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-border">
      <div ref={mapRef} className="w-full h-full" style={{ background: "hsl(220 20% 7%)" }} />
    </div>
  );
};

export default DisasterMap;
