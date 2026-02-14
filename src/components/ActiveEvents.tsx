import { mockDisasters, getDisasterColor } from "@/data/mockDisasters";
import { Droplets, Flame, Mountain, CloudLightning } from "lucide-react";

const typeIcons = {
  flood: Droplets,
  fire: Flame,
  earthquake: Mountain,
  storm: CloudLightning,
};

const ActiveEvents = () => {
  return (
    <div className="space-y-3">
      <h3 className="font-display text-xs font-bold text-muted-foreground tracking-widest uppercase">
        Active Events
      </h3>
      {mockDisasters.map((d) => {
        const Icon = typeIcons[d.type];
        return (
          <div
            key={d.id}
            className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
          >
            <div
              className="p-1.5 rounded-md mt-0.5"
              style={{ backgroundColor: getDisasterColor(d.type) + "20" }}
            >
              <Icon className="w-4 h-4" style={{ color: getDisasterColor(d.type) }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-display font-bold text-foreground truncate">{d.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{d.description}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-xs text-muted-foreground">
                  {d.affected.toLocaleString()} affected
                </span>
                <span
                  className="text-xs font-display font-bold"
                  style={{ color: getDisasterColor(d.type) }}
                >
                  {(d.severity * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActiveEvents;
