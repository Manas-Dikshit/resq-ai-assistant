import { memo } from "react";
import { AlertTriangle, Clock, Eye, MapPin, Truck, UserPlus, Users, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface IncidentCardIncident {
  id: string;
  title: string;
  type: string;
  severity: string;
  status: string;
  state: string;
  location_name: string;
  affected_population: number;
  responders_deployed: number;
}

interface IncidentCardProps {
  incident: IncidentCardIncident;
  elapsedStr: string;
  statusClass: string;
  severityClass: string;
  onSelect: () => void;
  onAssignTeam: () => void;
  onUpdateStatus: () => void;
}

const severityIconClass = (severity: string) => {
  if (severity === "Critical") return "bg-destructive/15 text-destructive";
  if (severity === "High") return "bg-fire/15 text-fire";
  if (severity === "Medium") return "bg-warning/15 text-warning";
  return "bg-safe/15 text-safe";
};

function IncidentCardComponent({
  incident,
  elapsedStr,
  statusClass,
  severityClass,
  onSelect,
  onAssignTeam,
  onUpdateStatus,
}: IncidentCardProps) {
  return (
    <article
      onClick={onSelect}
      className="group relative h-full cursor-pointer rounded-2xl border border-border/80 bg-card/75 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_10px_30px_rgba(14,165,233,0.12)]"
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-start gap-2.5">
              <div className={`rounded-xl p-2.5 ${severityIconClass(incident.severity)}`}>
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-display text-sm font-bold text-foreground md:text-base">{incident.title}</h3>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {incident.location_name}, {incident.state}
                  </span>
                  <span className="text-muted-foreground/60">•</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {elapsedStr}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-display capitalize ${statusClass}`}>
              {incident.status}
            </span>
            <span className={`rounded border px-2 py-0.5 text-[10px] font-display ${severityClass}`}>
              {incident.severity}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-2">
          <p className="inline-flex items-center gap-1.5 rounded-md bg-muted/30 px-2.5 py-2">
            <Users className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">{incident.affected_population.toLocaleString()}</span>
            affected
          </p>
          <p className="inline-flex items-center gap-1.5 rounded-md bg-muted/30 px-2.5 py-2">
            <Truck className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">{incident.responders_deployed}</span>
            responders
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/60 pt-3">
          <span className="inline-flex items-center rounded-md border border-primary/20 bg-primary/5 px-2 py-1 text-[11px] font-display text-primary">
            {incident.type}
          </span>

          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 px-2 text-[11px]"
              onClick={(event) => {
                event.stopPropagation();
                onSelect();
              }}
            >
              <Eye className="h-3 w-3" />
              View Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 px-2 text-[11px]"
              onClick={(event) => {
                event.stopPropagation();
                onAssignTeam();
              }}
            >
              <UserPlus className="h-3 w-3" />
              Assign Team
            </Button>
            <Button
              size="sm"
              className="h-7 gap-1.5 px-2 text-[11px]"
              onClick={(event) => {
                event.stopPropagation();
                onUpdateStatus();
              }}
            >
              <RefreshCw className="h-3 w-3" />
              Update Status
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

const IncidentCard = memo(IncidentCardComponent);

export default IncidentCard;
