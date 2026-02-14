import { useState } from "react";
import { X, Camera, MapPin, Send, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open: boolean;
  onClose: () => void;
}

const DISASTER_TYPES = ['flood', 'cyclone', 'fire', 'earthquake', 'landslide', 'storm', 'lightning', 'other'];

const ReportForm = ({ open, onClose }: Props) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [disasterType, setDisasterType] = useState("flood");
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const detectLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLat(pos.coords.latitude); setLng(pos.coords.longitude); setLocating(false); toast.success("Location detected"); },
      () => { setLocating(false); toast.error("Could not detect location. Enter manually."); }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Sign in to report"); return; }
    if (!lat || !lng) { toast.error("Location is required"); return; }
    setLoading(true);

    const { error } = await supabase.from('reports').insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim(),
      disaster_type: disasterType,
      lat, lng,
    });

    if (error) toast.error("Failed to submit report");
    else { toast.success("Report submitted! It will be verified shortly."); onClose(); setTitle(""); setDescription(""); }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold text-foreground">Report Incident</h3>
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-accent"><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-display text-muted-foreground">Disaster Type</label>
              <select value={disasterType} onChange={e => setDisasterType(e.target.value)} className="w-full mt-1 bg-secondary rounded-lg px-3 py-2.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary capitalize">
                {DISASTER_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-display text-muted-foreground">Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} required maxLength={100} placeholder="e.g. Road flooded near Cuttack bridge" className="w-full mt-1 bg-secondary rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-xs font-display text-muted-foreground">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} maxLength={1000} placeholder="Describe the situation..." className="w-full mt-1 bg-secondary rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary resize-none" />
            </div>
            <div>
              <label className="text-xs font-display text-muted-foreground">Location</label>
              <div className="flex gap-2 mt-1">
                <input type="number" step="any" value={lat || ''} onChange={e => setLat(Number(e.target.value))} placeholder="Latitude" className="flex-1 bg-secondary rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
                <input type="number" step="any" value={lng || ''} onChange={e => setLng(Number(e.target.value))} placeholder="Longitude" className="flex-1 bg-secondary rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
                <button type="button" onClick={detectLocation} disabled={locating} className="p-2.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50">
                  {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading || !user} className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-primary text-primary-foreground font-display font-bold text-sm glow-primary hover:opacity-90 disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReportForm;
