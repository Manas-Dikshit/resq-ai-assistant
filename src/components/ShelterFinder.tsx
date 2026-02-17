import { useState, useEffect } from "react";
import { MapPin, Navigation, Loader2, Home, Footprints, Car, X, Phone, RefreshCw, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

interface Shelter {
  id: string;
  name: string;
  lat: number;
  lng: number;
  capacity: number;
  occupancy: number;
  verified_at?: string | null;
}

interface ShelterWithDistance extends Shelter {
  distance: number;
}

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
  const [loading, setLoading] = useState(true);
  const [routeShown, setRouteShown] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<'walking' | 'driving'>('driving');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchShelters = async (uLat?: number, uLng?: number) => {
    const { data } = await supabase.from('shelters').select('*');
    if (data) {
      const mapped = data.map(s => ({
        ...s,
        distance: uLat != null && uLng != null
          ? haversineDistance(uLat, uLng, s.lat, s.lng)
          : Infinity
      }));
      const sorted = uLat != null ? mapped.sort((a, b) => a.distance - b.distance) : mapped;
      setShelters(sorted);
      setLastUpdated(new Date());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchShelters();

    // Realtime subscription for live occupancy updates
    const channel = supabase
      .channel('shelters-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shelters' }, (payload) => {
        setShelters(prev => {
          if (payload.eventType === 'UPDATE') {
            return prev.map(s => s.id === (payload.new as Shelter).id
              ? { ...s, ...(payload.new as Shelter) }
              : s
            );
          }
          if (payload.eventType === 'INSERT') {
            const newS = payload.new as Shelter;
            const dist = userPos ? haversineDistance(userPos.lat, userPos.lng, newS.lat, newS.lng) : Infinity;
            return [...prev, { ...newS, distance: dist }].sort((a, b) => a.distance - b.distance);
          }
          if (payload.eventType === 'DELETE') {
            return prev.filter(s => s.id !== (payload.old as Shelter).id);
          }
          return prev;
        });
        setLastUpdated(new Date());
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const findNearest = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const uLat = pos.coords.latitude;
        const uLng = pos.coords.longitude;
        setUserPos({ lat: uLat, lng: uLng });
        fetchShelters(uLat, uLng);
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

  if (loading) {
    return (
      <div className="space-y-3">
        <h3 className="font-display text-xs font-bold text-muted-foreground tracking-widest uppercase flex items-center gap-2">
          <Home className="w-3.5 h-3.5" /> {t('shelter.finderTitle')}
        </h3>
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-secondary animate-pulse rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xs font-bold text-muted-foreground tracking-widest uppercase flex items-center gap-2">
          <Home className="w-3.5 h-3.5" /> {t('shelter.finderTitle')}
        </h3>
        <div className="flex items-center gap-1.5">
          {/* Live indicator */}
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-safe/10 border border-safe/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-safe opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-safe" />
            </span>
            <span className="text-[9px] font-mono text-safe font-bold">{t('shelter.liveUpdates')}</span>
          </span>
          <button
            onClick={() => fetchShelters(userPos?.lat, userPos?.lng)}
            className="p-1 rounded hover:bg-accent transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Last updated */}
      {lastUpdated && (
        <p className="text-[10px] text-muted-foreground font-display">
          {t('shelter.lastUpdated')}: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>
      )}

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

      {/* Summary bar */}
      {shelters.length > 0 && (
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-secondary/50 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {shelters.length} {t('shelter.finderTitle')}</span>
          <span className="flex items-center gap-1 text-safe">
            ● {shelters.filter(s => s.capacity > 0 && s.occupancy / s.capacity <= 0.5).length} {t('shelter.available')}
          </span>
          <span className="flex items-center gap-1 text-destructive">
            ● {shelters.filter(s => s.capacity > 0 && s.occupancy / s.capacity > 0.8).length} {t('shelter.nearFull')}
          </span>
        </div>
      )}

      {/* Shelter list */}
      {shelters.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">{t('shelter.noShelters')}</p>
      )}

      <AnimatePresence>
        {shelters.map((s, i) => {
          const utilization = s.capacity > 0 ? s.occupancy / s.capacity : 0;
          const availableSpots = Math.max(0, s.capacity - s.occupancy);
          const statusColor = utilization >= 1 ? 'text-destructive' : utilization > 0.8 ? 'text-destructive' : utilization > 0.5 ? 'text-warning' : 'text-safe';
          const statusLabel = utilization >= 1 ? t('shelter.full') : utilization > 0.8 ? t('shelter.nearFull') : utilization > 0.5 ? t('shelter.moderate') : t('shelter.available');
          const barColor = utilization >= 1 ? 'bg-destructive' : utilization > 0.8 ? 'bg-destructive' : utilization > 0.5 ? 'bg-warning' : 'bg-safe';
          const isSelected = selectedId === s.id;

          return (
            <motion.div
              key={s.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`p-3 rounded-lg border bg-card transition-all cursor-pointer ${isSelected ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:bg-accent/50'}`}
              onClick={() => userPos && showRoute(s)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {/* Name + status */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-display font-bold text-foreground truncate">{s.name}</p>
                    <span className={`text-[9px] font-display px-1.5 py-0.5 rounded-full border ${
                      utilization >= 1 ? 'bg-destructive/10 text-destructive border-destructive/30'
                      : utilization > 0.8 ? 'bg-destructive/10 text-destructive border-destructive/30'
                      : utilization > 0.5 ? 'bg-warning/10 text-warning border-warning/30'
                      : 'bg-safe/10 text-safe border-safe/30'
                    }`}>
                      {statusLabel}
                    </span>
                  </div>

                  {/* Distance + occupancy counts */}
                  <div className="flex items-center gap-3 mt-1 text-xs flex-wrap">
                    {s.distance < Infinity && (
                      <span className="text-primary font-display font-bold">
                        📍 {s.distance < 1 ? `${(s.distance * 1000).toFixed(0)}m` : `${s.distance.toFixed(1)}km`}
                      </span>
                    )}
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {s.occupancy}/{s.capacity}
                    </span>
                    <span className={`font-display font-bold ${statusColor}`}>
                      {availableSpots} {t('shelter.availableSpots')}
                    </span>
                  </div>

                  {/* Capacity bar */}
                  <div className="w-full h-1.5 rounded-full bg-secondary mt-2 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${barColor}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(utilization * 100, 100)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>

                  {/* Verified timestamp */}
                  {s.verified_at && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      ✓ {t('shelter.lastUpdated')}: {new Date(s.verified_at).toLocaleDateString()}
                    </p>
                  )}

                  {/* Tap to route hint when no userPos */}
                  {!userPos && (
                    <p className="text-[10px] text-muted-foreground/60 mt-1 italic">{t('shelter.tapToRoute')}</p>
                  )}
                </div>

                {userPos && (
                  <button
                    onClick={(e) => { e.stopPropagation(); showRoute(s); }}
                    className={`p-2 rounded-md transition-colors flex-shrink-0 ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                    title={t('shelter.showRoute')}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ShelterFinder;
