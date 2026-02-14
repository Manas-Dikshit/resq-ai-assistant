import { Droplets, Flame, Mountain, Wind } from "lucide-react";
import { mockRiskPredictions } from "@/data/mockDisasters";
import { motion } from "framer-motion";

const riskIcons = {
  flood_risk: Droplets,
  quake_risk: Mountain,
  fire_risk: Flame,
};

const riskColors = {
  flood_risk: "text-flood",
  quake_risk: "text-quake",
  fire_risk: "text-fire",
};

const riskLabels = {
  flood_risk: "Flood",
  quake_risk: "Earthquake",
  fire_risk: "Fire",
};

const RiskBar = ({ value, color }: { value: number; color: string }) => (
  <div className="w-full h-1.5 rounded-full bg-secondary">
    <motion.div
      className={`h-full rounded-full ${color}`}
      initial={{ width: 0 }}
      animate={{ width: `${value * 100}%` }}
      transition={{ duration: 1, ease: "easeOut" }}
    />
  </div>
);

const barBgColors = {
  flood_risk: "bg-flood",
  quake_risk: "bg-quake",
  fire_risk: "bg-fire",
};

const RiskCards = () => {
  return (
    <div className="space-y-3">
      <h3 className="font-display text-xs font-bold text-muted-foreground tracking-widest uppercase">
        Risk Forecast
      </h3>
      {mockRiskPredictions.map((pred) => (
        <div key={pred.region} className="p-3 rounded-lg border border-border bg-card">
          <p className="text-sm font-display font-bold text-foreground mb-2">{pred.region}</p>
          <div className="space-y-2">
            {(["flood_risk", "quake_risk", "fire_risk"] as const).map((key) => {
              const Icon = riskIcons[key];
              return (
                <div key={key} className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${riskColors[key]}`} />
                  <span className="text-xs text-muted-foreground w-16">{riskLabels[key]}</span>
                  <div className="flex-1">
                    <RiskBar value={pred[key]} color={barBgColors[key]} />
                  </div>
                  <span className="text-xs font-display text-foreground w-10 text-right">
                    {(pred[key] * 100).toFixed(0)}%
                  </span>
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
