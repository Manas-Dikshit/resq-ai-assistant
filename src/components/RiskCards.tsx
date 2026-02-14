import { Droplets, Flame, Mountain, Wind } from "lucide-react";
import { odishaRiskPredictions } from "@/data/odishaData";
import { useRiskPrediction } from "@/hooks/useDisasterData";
import { motion } from "framer-motion";

const riskIcons = { flood_risk: Droplets, quake_risk: Mountain, fire_risk: Flame };
const riskColors = { flood_risk: "text-flood", quake_risk: "text-quake", fire_risk: "text-fire" };
const riskLabels = { flood_risk: "Flood", quake_risk: "Earthquake", fire_risk: "Fire" };
const barBgColors = { flood_risk: "bg-flood", quake_risk: "bg-quake", fire_risk: "bg-fire" };

const RiskBar = ({ value, color }: { value: number; color: string }) => (
  <div className="w-full h-1.5 rounded-full bg-secondary">
    <motion.div className={`h-full rounded-full ${color}`} initial={{ width: 0 }} animate={{ width: `${value * 100}%` }} transition={{ duration: 1, ease: "easeOut" }} />
  </div>
);

const RiskCards = () => {
  const { data: prediction } = useRiskPrediction();

  return (
    <div className="space-y-3">
      <h3 className="font-display text-xs font-bold text-muted-foreground tracking-widest uppercase">
        Risk Forecast — Odisha
      </h3>
      
      {/* ML Prediction Card */}
      {prediction && (
        <div className="p-3 rounded-lg border border-primary/30 bg-primary/5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-display font-bold text-primary">AI Risk Assessment</p>
            <span className={`text-xs font-display px-2 py-0.5 rounded-full ${prediction.risk_level === 'CRITICAL' ? 'bg-destructive/10 text-destructive' : prediction.risk_level === 'HIGH' ? 'bg-warning/10 text-warning' : 'bg-safe/10 text-safe'}`}>
              {prediction.risk_level}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-1">Model: {prediction.model_version} • {prediction.forecast_hours}h forecast</p>
          <div className="space-y-1 mt-2">
            {prediction.recommended_actions.slice(0, 2).map((a, i) => (
              <p key={i} className="text-xs text-foreground">• {a}</p>
            ))}
          </div>
        </div>
      )}

      {odishaRiskPredictions.map((pred) => (
        <div key={pred.region} className="p-3 rounded-lg border border-border bg-card">
          <p className="text-sm font-display font-bold text-foreground mb-2">{pred.region}</p>
          <div className="space-y-2">
            {(["flood_risk", "quake_risk", "fire_risk"] as const).map((key) => {
              const Icon = riskIcons[key];
              return (
                <div key={key} className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${riskColors[key]}`} />
                  <span className="text-xs text-muted-foreground w-16">{riskLabels[key]}</span>
                  <div className="flex-1"><RiskBar value={pred[key]} color={barBgColors[key]} /></div>
                  <span className="text-xs font-display text-foreground w-10 text-right">{(pred[key] * 100).toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RiskCards;
