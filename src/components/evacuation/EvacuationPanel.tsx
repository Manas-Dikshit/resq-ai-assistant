import { useState, useEffect } from "react";
import { Shield, Users, ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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

interface ShelterWithInfo extends Shelter {
  availableSpots: number;
  utilization: number;
}

interface Props {
  selectedShelterId: string | null;
  onSelectShelter: (id: string | null) => void;
}

const EvacuationPanel = ({ selectedShelterId, onSelectShelter }: Props) => {
  const { t } = useTranslation();
  const [shelters, setShelters] = useState<ShelterWithInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChecklist, setShowChecklist] = useState(false);

  const fetchShelters = async () => {
    const { data } = await supabase.from('shelters').select('*');
    if (data) {
      const mapped: ShelterWithInfo[] = data.map(s => ({
        ...s,
        availableSpots: Math.max(0, s.capacity - s.occupancy),
        utilization: s.capacity > 0 ? s.occupancy / s.capacity : 1,
      }));
      // Sort by availability (available first)
      mapped.sort((a, b) => {
        if (a.availableSpots === 0 && b.availableSpots > 0) return 1;
        if (a.availableSpots > 0 && b.availableSpots === 0) return -1;
        return a.utilization - b.utilization; // Less utilized first
      });
      setShelters(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchShelters();
    const channel = supabase
      .channel('evac-shelters')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shelters' }, () => {
        fetchShelters();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const totalAvailable = shelters.reduce((sum, s) => sum + s.availableSpots, 0);

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
        <Shield className="w-5 h-5 text-primary" />
        <h2 className="font-display text-sm font-bold text-foreground tracking-wider uppercase">
          {t('evacuation.title')}
        </h2>
      </div>

      {/* Emergency Alert */}
      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-display font-bold text-destructive">Shelter Locations</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">View all available evacuation shelters on the map</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-secondary/50 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> {shelters.length} {t('evacuation.shelters')}</span>
        <span className="flex items-center gap-1 text-safe">● {totalAvailable} {t('evacuation.spotsAvailable')}</span>
      </div>

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
                        <MapPin className="w-3 h-3 text-primary-foreground" />
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
