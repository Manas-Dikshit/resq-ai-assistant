import { useRealDisasterData } from "@/hooks/useDisasterData";
import { odishaDisasters } from "@/data/odishaData";
import { getDisasterColor } from "@/data/mockDisasters";
import { Droplets, Flame, Mountain, CloudLightning, Satellite, ExternalLink, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const typeIcons: Record<string, any> = { flood: Droplets, fire: Flame, earthquake: Mountain, storm: CloudLightning };

const LiveEventsPanel = () => {
  const { data, isLoading } = useRealDisasterData();
  const { t } = useTranslation();

  const realEvents = [...(data?.earthquakes || []), ...(data?.nasaEvents || [])];
  const allEvents = [
    ...realEvents.map((e: any) => ({
      id: e.id, type: e.type as 'flood' | 'fire' | 'earthquake' | 'storm', title: e.title,
      description: e.description, severity: e.severity || e.magnitude / 8, affected: 0,
      timestamp: e.timestamp, source: e.source, url: e.url,
    })),
    ...odishaDisasters,
  ].slice(0, 15);

  return (
    <div className="space-y-3">
      <h3 className="font-display text-xs font-bold text-muted-foreground tracking-widest uppercase flex items-center gap-2">
        {t('events.title')}
        {isLoading && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
        {!isLoading && <span className="w-1.5 h-1.5 rounded-full bg-safe animate-pulse" />}
      </h3>

      {allEvents.map((d, i) => {
        const Icon = typeIcons[d.type] || CloudLightning;
        const color = getDisasterColor(d.type);
        return (
          <motion.div key={d.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
            <div className="p-1.5 rounded-md mt-0.5" style={{ backgroundColor: color + "20" }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-display font-bold text-foreground truncate">{d.title}</p>
                {(d as any).source && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-display flex-shrink-0">
                    {(d as any).source === 'NASA EONET' ? <Satellite className="w-2.5 h-2.5 inline mr-0.5" /> : null}
                    {(d as any).source}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{d.description}</p>
              <div className="flex items-center gap-3 mt-1.5">
                {d.affected > 0 && <span className="text-xs text-muted-foreground">{d.affected.toLocaleString()} {t('events.affected')}</span>}
                <span className="text-xs font-display font-bold" style={{ color }}>{(d.severity * 100).toFixed(0)}%</span>
                <span className="text-[10px] text-muted-foreground">{new Date(d.timestamp).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</span>
              </div>
              {(d as any).url && (
                <a href={(d as any).url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary flex items-center gap-0.5 mt-1 hover:underline">
                  {t('events.details')} <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default LiveEventsPanel;
