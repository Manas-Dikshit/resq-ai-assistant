import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Building2, Users, DollarSign, ChevronDown, ChevronUp, TrendingUp, Edit2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { DamageAssessment } from "@/pages/PostDisaster";

interface Props {
  assessments: DamageAssessment[];
  loading: boolean;
  phaseColors: Record<string, string>;
  severityColors: Record<string, string>;
  onRefresh: () => void;
  userId?: string;
}

const AssessmentList = ({ assessments, loading, phaseColors, severityColors, onRefresh, userId }: Props) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const updatePhase = async (id: string, phase: string) => {
    setUpdating(id);
    const progress = phase === "completed" ? 100 : phase === "reconstruction" ? 75 : phase === "rehabilitation" ? 50 : phase === "relief" ? 25 : 10;
    await supabase.from("damage_assessments").update({ recovery_phase: phase, recovery_progress: progress } as any).eq("id", id);
    toast({ title: `Phase updated to ${phase}` });
    setUpdating(null);
    onRefresh();
  };

  const updateProgress = async (id: string, progress: number) => {
    setUpdating(id);
    const phase = progress >= 100 ? "completed" : progress >= 75 ? "reconstruction" : progress >= 50 ? "rehabilitation" : progress >= 25 ? "relief" : "assessment";
    await supabase.from("damage_assessments").update({ recovery_progress: progress, recovery_phase: phase } as any).eq("id", id);
    setUpdating(null);
    onRefresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground font-display">Loading assessments...</span>
      </div>
    );
  }

  if (!assessments.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Building2 className="w-10 h-10 mb-3 opacity-40" />
        <p className="font-display text-sm">No damage assessments yet</p>
        <p className="text-xs mt-1">Create the first assessment to start tracking recovery</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {assessments.map((a, i) => (
        <motion.div
          key={a.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          className="rounded-lg border border-border bg-card/60 overflow-hidden"
        >
          <button
            onClick={() => setExpanded(expanded === a.id ? null : a.id)}
            className="w-full flex items-center justify-between p-3 hover:bg-accent/30 transition-colors text-left"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-1.5 h-10 rounded-full ${
                a.severity === "critical" ? "bg-destructive" :
                a.severity === "severe" ? "bg-fire" :
                a.severity === "moderate" ? "bg-warning" : "bg-safe"
              }`} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-display font-bold text-foreground truncate">{a.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5" /> {a.district}, {a.location_name}
                  </span>
                  <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${severityColors[a.severity]}`}>
                    {a.severity}
                  </Badge>
                  <Badge className={`text-[9px] px-1.5 py-0 ${phaseColors[a.recovery_phase]}`}>
                    {a.recovery_phase}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-4 text-right">
                <div>
                  <p className="text-xs font-display font-bold text-foreground">{a.affected_population.toLocaleString()}</p>
                  <p className="text-[9px] text-muted-foreground">affected</p>
                </div>
                <div>
                  <p className="text-xs font-display font-bold text-warning">₹{(Number(a.estimated_cost_inr) / 100000).toFixed(1)}L</p>
                  <p className="text-[9px] text-muted-foreground">est. cost</p>
                </div>
                <div className="w-20">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[9px] text-muted-foreground">Recovery</span>
                    <span className="text-[9px] font-display font-bold text-primary">{a.recovery_progress}%</span>
                  </div>
                  <Progress value={a.recovery_progress} className="h-1.5" />
                </div>
              </div>
              {expanded === a.id ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
            </div>
          </button>

          {expanded === a.id && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border px-4 py-3 bg-accent/10"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-flood" />
                  <div>
                    <p className="text-xs font-display font-bold">{a.affected_households}</p>
                    <p className="text-[9px] text-muted-foreground">Households</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-quake" />
                  <div>
                    <p className="text-xs font-display font-bold">{a.affected_population.toLocaleString()}</p>
                    <p className="text-[9px] text-muted-foreground">Population</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-warning" />
                  <div>
                    <p className="text-xs font-display font-bold">₹{Number(a.estimated_cost_inr).toLocaleString()}</p>
                    <p className="text-[9px] text-muted-foreground">Estimated Cost</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-fire" />
                  <div>
                    <p className="text-xs font-display font-bold capitalize">{a.damage_type}</p>
                    <p className="text-[9px] text-muted-foreground">Damage Type</p>
                  </div>
                </div>
              </div>

              {a.description && (
                <p className="text-xs text-muted-foreground mb-3">{a.description}</p>
              )}

              {userId && (
                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <span className="text-[10px] text-muted-foreground font-display">Update Phase:</span>
                  <Select
                    value={a.recovery_phase}
                    onValueChange={(v) => updatePhase(a.id, v)}
                    disabled={updating === a.id}
                  >
                    <SelectTrigger className="h-7 text-[10px] w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["assessment", "relief", "rehabilitation", "reconstruction", "completed"].map(p => (
                        <SelectItem key={p} value={p} className="capitalize text-xs">{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <span className="text-[10px] text-muted-foreground font-display ml-2">Progress:</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={a.recovery_progress}
                    onChange={e => updateProgress(a.id, +e.target.value)}
                    className="w-24 h-1.5 accent-primary"
                  />
                  <span className="text-[10px] font-display font-bold text-primary">{a.recovery_progress}%</span>
                </div>
              )}

              <p className="text-[9px] text-muted-foreground mt-2 font-display">
                Assessed: {new Date(a.assessed_at).toLocaleString()} · Updated: {new Date(a.updated_at).toLocaleString()}
              </p>
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default AssessmentList;
