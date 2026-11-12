import { useState } from "react";
import { Phone, X, MapPin, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

const SOSButton = () => {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [sending, setSending] = useState(false);
  const { t } = useTranslation();

  const sendSOS = async () => {
    if (!user) { toast.error(t('sos.signInRequired')); return; }
    setSending(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { error } = await supabase.from('reports').insert({
          user_id: user.id,
          title: '🆘 SOS Emergency Alert',
          description: `Emergency SOS triggered at coordinates ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}. User needs immediate assistance.`,
          disaster_type: 'other',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        if (error) toast.error(t('sos.failed'));
        else toast.success(t('sos.sent'));
        setSending(false);
        setExpanded(false);
      },
      () => {
        toast.error(t('sos.locationError'));
        setSending(false);
      }
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-[900]">
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="mb-3 p-4 rounded-xl bg-card border border-destructive/30 shadow-lg w-64">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-display text-sm font-bold text-destructive">{t('sos.title')}</h4>
              <button onClick={() => setExpanded(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{t('sos.description')}</p>
            <button onClick={sendSOS} disabled={sending || !user}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-destructive py-2.5 font-display text-sm font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
              {sending ? t('sos.sending') : t('sos.sendNow')}
            </button>
            {!user && <p className="text-xs text-destructive mt-2 text-center">{t('sos.signInRequired')}</p>}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button onClick={() => setExpanded(!expanded)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive shadow-lg transition-colors hover:bg-destructive/90">
        {expanded ? <X className="w-6 h-6 text-foreground" /> : <Phone className="w-6 h-6 text-foreground" />}
      </motion.button>
    </div>
  );
};

export default SOSButton;
