import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Clock, MapPin, Users, Calendar, Building, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useVerifyTraining, type Training } from "@/hooks/useTrainings";
import { Button } from "@/components/ui/button";

const LEVEL_COLORS: Record<string, string> = {
  National: "bg-flood/10 text-flood border-flood/20",
  State: "bg-warning/10 text-warning border-warning/20",
  District: "bg-safe/10 text-safe border-safe/20",
  Community: "bg-quake/10 text-quake border-quake/20",
};

interface TrainingListProps {
  trainings: Training[];
  isAdmin?: boolean;
}

export default function TrainingList({ trainings, isAdmin }: TrainingListProps) {
  const verifyTraining = useVerifyTraining();

  if (trainings.length === 0) {
    return (
      <div className="glass rounded-xl p-10 text-center text-muted-foreground">
        <p className="font-display text-sm">No training records found.</p>
        <p className="text-xs mt-1">Try adjusting the filters or add a new training event.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {trainings.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ delay: i * 0.03 }}
            className="glass rounded-xl p-4 border border-border hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-display text-sm font-bold text-foreground truncate">{t.title}</h3>
                  {t.verified && (
                    <span className="flex items-center gap-1 text-[10px] bg-safe/10 text-safe border border-safe/20 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-2.5 h-2.5" /> Verified
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-display ${LEVEL_COLORS[t.level] ?? "bg-muted text-muted-foreground border-border"}`}>
                    {t.level}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-border bg-muted text-muted-foreground font-display">
                    {t.theme}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Building className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{t.organizer}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{t.location_name}, {t.state}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 flex-shrink-0" />
                    {t.start_date} → {t.end_date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3 h-3 flex-shrink-0" />
                    {t.participants_total} participants
                    {(t.participants_male > 0 || t.participants_female > 0) && (
                      <span className="text-muted-foreground/60">({t.participants_male}M / {t.participants_female}F)</span>
                    )}
                  </span>
                </div>
                {t.outcome_summary && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2 italic">"{t.outcome_summary}"</p>
                )}
              </div>

              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {new Date(t.created_at).toLocaleDateString()}
                </span>
                {isAdmin && !t.verified && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 border-safe/30 text-safe hover:bg-safe/10"
                    onClick={() => verifyTraining.mutate({ id: t.id, verified: true })}
                    disabled={verifyTraining.isPending}
                  >
                    <ShieldCheck className="w-3 h-3 mr-1" /> Verify
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
