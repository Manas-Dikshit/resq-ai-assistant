import { useState, useEffect } from "react";
import { Navigation, Loader2, MapPin, Footprints, Car, Clock, Route, AlertTriangle, Shield, Users, ChevronDown, ChevronUp } from "lucide-react";
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
}

interface ShelterWithDistance extends Shelter {
  distance: number;
  availableSpots: number;
  utilization: number;
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface Props {
  userPos: { lat: number; lng: number } | null;
  onUserPosChange: (pos: { lat: number; lng: number }) => void;
  selectedShelterId: string | null;
  onSelectShelter: (id: string | null) => void;
  routeInfo: { distance: string; time: string } | null;
}

const EvacuationPanel = ({ userPos, onUserPosChange, selectedShelterId, onSelectShelter, routeInfo }: Props) => {
  const { t } = useTranslation();
  const [shelters, setShelters] = useState<ShelterWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [mode, setMode] = useState<'walking' | 'driving'>('driving');
  const [showChecklist, setShowChecklist] = useState(false);

  const fetchShelters = async (uLat?: number, uLng?: number) => {
    const { data } = await supabase.from('shelters').select('*');
    if (data) {
      const mapped: ShelterWithDistance[] = data.map(s => {
        const dist = uLat != null && uLng != null ? haversineDistance(uLat, uLng, s.lat, s.lng) : Infinity;
        return {
          ...s,
          distance: dist,
          availableSpots: Math.max(0, s.capacity - s.occupancy),
          utilization: s.capacity > 0 ? s.occupancy / s.capacity : 1,
        };
      });
      // Sort: available first, then by distance
      mapped.sort((a, b) => {
        if (a.availableSpots === 0 && b.availableSpots > 0) return 1;
        if (a.availableSpots > 0 && b.availableSpots === 0) return -1;
        return a.distance - b.distance;
      });
      setShelters(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchShelters(userPos?.lat, userPos?.lng);
    const channel = supabase
      .channel('evac-shelters')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shelters' }, () => {
        fetchShelters(userPos?.lat, userPos?.lng);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userPos]);

  const locateMe = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onUserPosChange({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        toast.error(t('evacuation.locationError'));
        setLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // Emit mode change to map
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('evac-mode-change', { detail: { mode } }));
  }, [mode]);

  const totalAvailable = shelters.reduce((sum, s) => sum + s.availableSpots, 0);
  const nearestAvailable = shelters.find(s => s.availableSpots > 0);

  const checklist = [
    t('evacuation.checkId'),
    t('evacuation.checkWater'),
    t('evacuation.checkMeds'),
    t('evacuation.checkPhone'),
    t('evacuation.checkDocs'),
    t('evacuation.checkClothes'),
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Title */}
      <div className="flex items-center gap-2">
        <Route className="w-5 h-5 text-primary" />
        <h2 className="font-display text-sm font-bold text-foreground tracking-wider uppercase">
          {t('evacuation.title')}
        </h2>
      </div>

      {/* Emergency Alert */}
      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-display font-bold text-destructive">{t('evacuation.stayCalm')}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{t('evacuation.stayDesc')}</p>
          </div>
        </div>
      </div>

      {/* Locate Button */}
      <button
        onClick={locateMe}
        disabled={locating}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-primary-foreground font-display text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 glow-primary"
      >
        {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
        {locating ? t('evacuation.locating') : userPos ? t('evacuation.updateLocation') : t('evacuation.detectLocation')}
      </button>

      {/* User location info */}
      {userPos && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 text-xs">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          <span className="text-muted-foreground font-display">
            {userPos.lat.toFixed(4)}, {userPos.lng.toFixed(4)}
          </span>
        </div>
      )}

      {/* Mode toggle */}
      <div className="flex gap-1 bg-secondary rounded-lg p-1">
        <button
          onClick={() => setMode('walking')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-display font-bold transition-all ${
            mode === 'walking' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Footprints className="w-3.5 h-3.5" /> {t('shelter.walking')}
        </button>
        <button
          onClick={() => setMode('driving')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-display font-bold transition-all ${
            mode === 'driving' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Car className="w-3.5 h-3.5" /> {t('shelter.driving')}
        </button>
      </div>

      {/* Route Info */}
      {routeInfo && selectedShelterId && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-safe/10 border border-safe/20"
        >
          <p className="text-xs font-display font-bold text-safe mb-1">{t('evacuation.routeFound')}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Route className="w-3 h-3" /> {routeInfo.distance}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {routeInfo.time}</span>
          </div>
        </motion.div>
      )}

      {/* Summary */}
      <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-secondary/50 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> {shelters.length} {t('evacuation.shelters')}</span>
        <span className="flex items-center gap-1 text-safe">● {totalAvailable} {t('evacuation.spotsAvailable')}</span>
      </div>

      {nearestAvailable && userPos && (
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-[10px] font-display text-muted-foreground uppercase tracking-wider">{t('evacuation.nearest')}</p>
          <p className="text-sm font-display font-bold text-foreground mt-0.5">{nearestAvailable.name}</p>
          <p className="text-xs text-primary font-display mt-0.5">
            📍 {nearestAvailable.distance < 1 ? `${(nearestAvailable.distance * 1000).toFixed(0)}m` : `${nearestAvailable.distance.toFixed(1)}km`}
            <span className="text-muted-foreground ml-2">• {nearestAvailable.availableSpots} spots</span>
          </p>
        </div>
      )}

      {/* Shelter list */}
      <div className="space-y-2">
        <p className="text-[10px] font-display text-muted-foreground uppercase tracking-wider">{t('evacuation.allShelters')}</p>
        {loading ? (
          <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-secondary animate-pulse rounded-lg" />)}</div>
        ) : (
          <AnimatePresence>
            {shelters.map((s, i) => {
              const isFull = s.availableSpots === 0;
              const isSelected = selectedShelterId === s.id;
              const barColor = isFull ? 'bg-destructive' : s.utilization > 0.8 ? 'bg-destructive' : s.utilization > 0.5 ? 'bg-warning' : 'bg-safe';

              return (
                <motion.button
                  key={s.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => !isFull && onSelectShelter(isSelected ? null : s.id)}
                  disabled={isFull}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5 glow-primary'
                      : isFull
                        ? 'border-border bg-card/50 opacity-50 cursor-not-allowed'
                        : 'border-border bg-card hover:border-primary/30 hover:bg-primary/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-display font-bold text-foreground truncate">{s.name}</p>
                        {isFull && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/30 font-display">{t('shelter.full')}</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs">
                        {s.distance < Infinity && (
                          <span className="text-primary font-display font-bold">
                            📍 {s.distance < 1 ? `${(s.distance * 1000).toFixed(0)}m` : `${s.distance.toFixed(1)}km`}
                          </span>
                        )}
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Users className="w-3 h-3" /> {s.occupancy}/{s.capacity}
                        </span>
                        {!isFull && <span className="text-safe font-display">{s.availableSpots} spots</span>}
                      </div>
                      <div className="w-full h-1 rounded-full bg-secondary mt-2">
                        <motion.div
                          className={`h-full rounded-full ${barColor}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(s.utilization * 100, 100)}%` }}
                          transition={{ duration: 0.6 }}
                        />
                      </div>
                    </div>
                    {isSelected && (
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Navigation className="w-3 h-3 text-primary-foreground" />
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Evacuation Checklist */}
      <div className="border border-border rounded-lg overflow-hidden">
        <button
          onClick={() => setShowChecklist(!showChecklist)}
          className="w-full flex items-center justify-between p-3 bg-secondary/30 hover:bg-secondary/50 transition-colors"
        >
          <span className="text-xs font-display font-bold text-muted-foreground uppercase tracking-wider">{t('evacuation.checklist')}</span>
          {showChecklist ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
        </button>
        <AnimatePresence>
          {showChecklist && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3 space-y-2">
                {checklist.map((item, i) => (
                  <label key={i} className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                    <input type="checkbox" className="rounded border-border bg-secondary accent-primary" />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Emergency contacts */}
      <div className="p-3 rounded-lg bg-secondary/30 border border-border">
        <p className="text-[10px] font-display text-muted-foreground uppercase tracking-wider mb-2">{t('evacuation.emergencyContacts')}</p>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">OSDMA</span><a href="tel:1070" className="text-primary font-display font-bold">1070</a></div>
          <div className="flex justify-between"><span className="text-muted-foreground">NDRF</span><a href="tel:01৪-24363260" className="text-primary font-display font-bold">011-24363260</a></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Ambulance</span><a href="tel:108" className="text-primary font-display font-bold">108</a></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Police</span><a href="tel:100" className="text-primary font-display font-bold">100</a></div>
        </div>
      </div>
    </div>
  );
};

export default EvacuationPanel;
