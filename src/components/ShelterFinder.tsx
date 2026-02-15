import { useState, useEffect } from "react";
import { MapPin, Navigation, Loader2, Home, Footprints, Car, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface Shelter {
  id: string;
  name: string;
  lat: number;
  lng: number;
  capacity: number;
  occupancy: number;
}

interface ShelterWithDistance extends Shelter {
  distance: number;
}

// Emit a custom event so DisasterMap can draw the route
const emitRouteEvent = (userLat: number, userLng: number, shelterLat: number, shelterLng: number, mode: 'walking' | 'driving') => {
  window.dispatchEvent(new CustomEvent('show-shelter-route', {
    detail: { userLat, userLng, shelterLat, shelterLng, mode }
  }));
};

const emitClearRoute = () => {
  window.dispatchEvent(new CustomEvent('clear-shelter-route'));
};

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const ShelterFinder = () => {
  const { t } = useTranslation();
  const [shelters, setShelters] = useState<ShelterWithDistance[]>([]);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [routeShown, setRouteShown] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<'walking' | 'driving'>('driving');

  useEffect(() => {
    supabase.from('shelters').select('*').then(({ data }) => {
      if (data) setShelters(data.map(s => ({ ...s, distance: Infinity })));
    });
  }, []);

  const findNearest = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const uLat = pos.coords.latitude;
        const uLng = pos.coords.longitude;
        setUserPos({ lat: uLat, lng: uLng });

        const sorted = shelters
          .map(s => ({ ...s, distance: haversineDistance(uLat, uLng, s.lat, s.lng) }))
          .sort((a, b) => a.distance - b.distance);

        setShelters(sorted);
        setLocating(false);
      },
      () => {
        toast.error(t('shelter.locationError'));
        setLocating(false);
      }
    );
  };

  const showRoute = (shelter: ShelterWithDistance) => {
    if (!userPos) return;
    setSelectedId(shelter.id);
    setRouteShown(true);
    emitRouteEvent(userPos.lat, userPos.lng, shelter.lat, shelter.lng, mode);
  };

  const clearRoute = () => {
    setRouteShown(false);
    setSelectedId(null);
    emitClearRoute();
  };

  return (
    <div className="space-y-3">
      <h3 className="font-display text-xs font-bold text-muted-foreground tracking-widest uppercase flex items-center gap-2">
        <Home className="w-3.5 h-3.5" /> {t('shelter.finderTitle')}
      </h3>

      {/* Locate button */}
      <button
        onClick={findNearest}
        disabled={locating}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary/10 text-primary font-display text-xs font-bold hover:bg-primary/20 transition-colors disabled:opacity-50"
      >
        {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
        {locating ? t('shelter.locating') : t('shelter.findNearest')}
      </button>

      {/* Mode toggle */}
      {userPos && (
        <div className="flex gap-1 bg-secondary rounded-md p-0.5">
          <button
            onClick={() => setMode('walking')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-display transition-colors ${mode === 'walking' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
          >
            <Footprints className="w-3 h-3" /> {t('shelter.walking')}
          </button>
          <button
            onClick={() => setMode('driving')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-display transition-colors ${mode === 'driving' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
          >
            <Car className="w-3 h-3" /> {t('shelter.driving')}
          </button>
        </div>
      )}

      {routeShown && (
        <button onClick={clearRoute} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-border text-xs font-display text-muted-foreground hover:bg-accent transition-colors">
          <X className="w-3 h-3" /> {t('shelter.clearRoute')}
        </button>
      )}

      {/* Shelter list */}
      {shelters.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">{t('shelter.noShelters')}</p>
      )}

      {shelters.map((s, i) => {
        const utilization = s.capacity > 0 ? s.occupancy / s.capacity : 0;
        const statusColor = utilization > 0.8 ? 'text-destructive' : utilization > 0.5 ? 'text-warning' : 'text-safe';
        const statusLabel = utilization > 0.8 ? t('shelter.nearFull') : utilization > 0.5 ? t('shelter.moderate') : t('shelter.available');
        const isSelected = selectedId === s.id;

        return (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`p-3 rounded-lg border bg-card transition-colors cursor-pointer ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent/50'}`}
            onClick={() => userPos && showRoute(s)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-display font-bold text-foreground truncate">{s.name}</p>
                <div className="flex items-center gap-3 mt-1 text-xs">
                  {s.distance < Infinity && (
                    <span className="text-primary font-display">{s.distance < 1 ? `${(s.distance * 1000).toFixed(0)}m` : `${s.distance.toFixed(1)}km`}</span>
                  )}
                  <span className="text-muted-foreground">{s.occupancy}/{s.capacity}</span>
                  <span className={`font-display ${statusColor}`}>{statusLabel}</span>
                </div>
                {/* Capacity bar */}
                <div className="w-full h-1 rounded-full bg-secondary mt-1.5">
                  <div
                    className={`h-full rounded-full ${utilization > 0.8 ? 'bg-destructive' : utilization > 0.5 ? 'bg-warning' : 'bg-safe'}`}
                    style={{ width: `${Math.min(utilization * 100, 100)}%` }}
                  />
                </div>
              </div>
              {userPos && (
                <button
                  onClick={(e) => { e.stopPropagation(); showRoute(s); }}
                  className="p-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex-shrink-0"
                  title={t('shelter.showRoute')}
                >
                  <MapPin className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ShelterFinder;
