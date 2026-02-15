import { Satellite, ExternalLink, Flame, CloudRain, Sun } from "lucide-react";
import { useRealDisasterData } from "@/hooks/useDisasterData";
import { useTranslation } from "react-i18next";

const SatelliteView = () => {
  const { data } = useRealDisasterData();
  const { t } = useTranslation();

  if (!data) return null;

  const links = [
    { label: t('satellite.trueColor'), icon: Satellite, url: data.satelliteLinks?.trueColor, desc: t('satellite.trueColorDesc') },
    { label: t('satellite.fireThermal'), icon: Flame, url: data.satelliteLinks?.thermalAnomalies, desc: t('satellite.fireThermalDesc') },
    { label: t('satellite.precipitation'), icon: CloudRain, url: data.satelliteLinks?.precipitation, desc: t('satellite.precipitationDesc') },
    { label: t('satellite.aerosol'), icon: Sun, url: data.satelliteLinks?.aerosol, desc: t('satellite.aerosolDesc') },
  ];

  return (
    <div className="space-y-3">
      <h3 className="font-display text-xs font-bold text-muted-foreground tracking-widest uppercase flex items-center gap-2">
        <Satellite className="w-3.5 h-3.5" /> {t('satellite.title')}
      </h3>

      {data.windyEmbed && (
        <div className="rounded-lg overflow-hidden border border-border" style={{ height: 200 }}>
          <iframe src={data.windyEmbed} width="100%" height="100%" frameBorder="0" title="Live Wind Map - Odisha" style={{ border: 0 }} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {links.map(l => (
          <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors group">
            <div className="flex items-center gap-1.5 mb-1">
              <l.icon className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-display font-bold text-foreground">{l.label}</span>
              <ExternalLink className="w-2.5 h-2.5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-[10px] text-muted-foreground">{l.desc}</p>
          </a>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground">{t('satellite.sourceNote')}</p>
    </div>
  );
};

export default SatelliteView;
