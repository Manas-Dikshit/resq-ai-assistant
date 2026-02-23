import { motion } from "framer-motion";
import { CheckCircle2, Clock, AlertTriangle, ArrowRight, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { DamageAssessment } from "@/pages/PostDisaster";

interface Props {
  assessments: DamageAssessment[];
  phaseColors: Record<string, string>;
  severityColors: Record<string, string>;
}

const phaseOrder = ["assessment", "relief", "rehabilitation", "reconstruction", "completed"];

const phaseIcons: Record<string, typeof Clock> = {
  assessment: Clock,
  relief: AlertTriangle,
  rehabilitation: ArrowRight,
  reconstruction: ArrowRight,
  completed: CheckCircle2,
};

const RecoveryTimeline = ({ assessments, phaseColors, severityColors }: Props) => {
  const sorted = [...assessments].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  if (!sorted.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Clock className="w-10 h-10 mb-3 opacity-40" />
        <p className="font-display text-sm">No timeline data yet</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

      <div className="space-y-1">
        {sorted.map((a, i) => {
          const Icon = phaseIcons[a.recovery_phase] || Clock;
          const phaseIdx = phaseOrder.indexOf(a.recovery_phase);

          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative pl-12 py-3"
            >
              {/* Node */}
              <div className={`absolute left-3 top-4 w-5 h-5 rounded-full flex items-center justify-center ${
                a.recovery_phase === "completed" ? "bg-safe" :
                a.severity === "critical" ? "bg-destructive" :
                "bg-primary"
              }`}>
                <Icon className="w-3 h-3 text-white" />
              </div>

              <div className="rounded-lg border border-border bg-card/60 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-display font-bold text-foreground">{a.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" /> {a.district}
                      </span>
                      <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${severityColors[a.severity]}`}>
                        {a.severity}
                      </Badge>
                      <Badge className={`text-[9px] px-1.5 py-0 ${phaseColors[a.recovery_phase]}`}>
                        {a.recovery_phase}
                      </Badge>
                      <span className="text-[9px] text-muted-foreground capitalize">
                        {a.damage_type}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-muted-foreground font-display">
                      {new Date(a.updated_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs font-display font-bold text-primary">{a.recovery_progress}%</p>
                  </div>
                </div>

                {/* Phase progress bar */}
                <div className="mt-2 flex items-center gap-1">
                  {phaseOrder.map((phase, pi) => (
                    <div key={phase} className="flex-1">
                      <div className={`h-1.5 rounded-full ${
                        pi <= phaseIdx
                          ? pi === phaseIdx ? "bg-primary" : "bg-safe"
                          : "bg-accent/40"
                      }`} />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-0.5">
                  {phaseOrder.map(phase => (
                    <span key={phase} className="text-[7px] text-muted-foreground capitalize">{phase.slice(0, 5)}</span>
                  ))}
                </div>

                {a.description && (
                  <p className="text-[10px] text-muted-foreground mt-2 line-clamp-2">{a.description}</p>
                )}

                <div className="flex items-center gap-4 mt-2 text-[9px] text-muted-foreground">
                  <span>👥 {a.affected_population.toLocaleString()} affected</span>
                  <span>🏠 {a.affected_households} households</span>
                  <span>💰 ₹{(Number(a.estimated_cost_inr) / 100000).toFixed(1)}L</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default RecoveryTimeline;
