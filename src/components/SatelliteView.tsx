import { Satellite, ExternalLink, Flame, CloudRain, Sun } from "lucide-react";
import { useRealDisasterData } from "@/hooks/useDisasterData";
import { useTranslation } from "react-i18next";

const SatelliteView = () => {
  const { data, isLoading, isError } = useRealDisasterData();
  const { t } = useTranslation();

  const fallbackLinks = {
    trueColor: "https://worldview.earthdata.nasa.gov/",
    thermalAnomalies: "https://firms.modaps.eosdis.nasa.gov/map/",
    precipitation: "https://www.gpm.nasa.gov/data/imerg",
    aerosol: "https://earthobservatory.nasa.gov/global-maps/MODAL2_M_AER_OD",
  };

  const mergedLinks = {
    ...fallbackLinks,
    ...(data?.satelliteLinks || {}),
  };

  const links = [
    { label: t('satellite.trueColor'), icon: Satellite, url: mergedLinks.trueColor, desc: t('satellite.trueColorDesc') },
    { label: t('satellite.fireThermal'), icon: Flame, url: mergedLinks.thermalAnomalies, desc: t('satellite.fireThermalDesc') },
    { label: t('satellite.precipitation'), icon: CloudRain, url: mergedLinks.precipitation, desc: t('satellite.precipitationDesc') },
    { label: t('satellite.aerosol'), icon: Sun, url: mergedLinks.aerosol, desc: t('satellite.aerosolDesc') },
  ];

  const windySrc = data?.windyEmbed || "https://embed.windy.com/embed2.html?lat=20.95&lon=85.09&detailLat=20.95&detailLon=85.09&width=650&height=300&zoom=6&level=surface&overlay=wind&product=ecmwf&menu=&message=true";

  return (
    <div className="space-y-3">
      <h3 className="font-display text-xs font-bold text-muted-foreground tracking-widest uppercase flex items-center gap-2">
        <Satellite className="w-3.5 h-3.5" /> {t('satellite.title')}
      </h3>

      {isError && (
        <div className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2">
          <p className="text-[11px] text-warning font-display">Live satellite feed is temporarily unavailable. Showing fallback sources.</p>
        </div>
      )}

      <div className="rounded-lg overflow-hidden border border-border" style={{ height: 200 }}>
        {isLoading ? (
          <div className="h-full w-full animate-pulse bg-secondary" />
        ) : (
          <iframe src={windySrc} width="100%" height="100%" frameBorder="0" title="Live Wind Map - Odisha" style={{ border: 0 }} />
        )}
      </div>

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
