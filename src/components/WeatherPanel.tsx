import { Thermometer, Droplets, Wind, Eye, Sun, CloudRain, Gauge, Waves } from "lucide-react";
import { useRealDisasterData, getWeatherDescription, getWindDirectionLabel } from "@/hooks/useDisasterData";
import { motion } from "framer-motion";

const WeatherPanel = () => {
  const { data, isLoading } = useRealDisasterData();

  if (isLoading || !data) {
    return (
      <div className="space-y-3">
        <h3 className="font-display text-xs font-bold text-muted-foreground tracking-widest uppercase">Live Weather</h3>
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-secondary rounded-lg" />)}
        </div>
      </div>
    );
  }

  const hourly = data.hourlyWeather;
  const latestIdx = hourly ? hourly.time.length - 1 : -1;
  const currentTemp = hourly?.temperature?.[latestIdx];
  const currentHumidity = hourly?.humidity?.[latestIdx];
  const currentWind = hourly?.windSpeed?.[latestIdx];
  const currentWindDir = hourly?.windDirection?.[latestIdx];
  const currentGusts = hourly?.windGusts?.[latestIdx];
  const currentPressure = hourly?.pressure?.[latestIdx];
  const currentVisibility = hourly?.visibility?.[latestIdx];
  const currentUV = hourly?.uvIndex?.[latestIdx];
  const currentCloud = hourly?.cloudCover?.[latestIdx];
  const currentCode = hourly?.weatherCode?.[latestIdx];

  const airQ = data.airQuality;
  const aqIdx = airQ ? airQ.time.length - 1 : -1;
  const pm25 = airQ?.pm25?.[aqIdx];
  const pm10 = airQ?.pm10?.[aqIdx];

  const marine = data.marine;
  const mIdx = marine ? marine.time.length - 1 : -1;
  const waveH = marine?.waveHeight?.[mIdx];
  const swellH = marine?.swellHeight?.[mIdx];

  const aqiLevel = pm25 != null ? (pm25 <= 12 ? "Good" : pm25 <= 35 ? "Moderate" : pm25 <= 55 ? "Unhealthy (SG)" : "Unhealthy") : null;
  const aqiColor = pm25 != null ? (pm25 <= 12 ? "text-safe" : pm25 <= 35 ? "text-warning" : "text-destructive") : "text-muted-foreground";

  return (
    <div className="space-y-3">
      <h3 className="font-display text-xs font-bold text-muted-foreground tracking-widest uppercase flex items-center gap-2">
        Live Weather — Odisha
        <span className="w-1.5 h-1.5 rounded-full bg-safe animate-pulse" />
      </h3>

      {/* Current conditions */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-display font-bold text-foreground">{currentTemp?.toFixed(1)}°C</span>
          <span className="text-xs text-muted-foreground">{currentCode != null ? getWeatherDescription(currentCode) : ''}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5"><Droplets className="w-3 h-3 text-flood" /><span className="text-muted-foreground">Humidity:</span><span className="text-foreground">{currentHumidity}%</span></div>
          <div className="flex items-center gap-1.5"><Wind className="w-3 h-3 text-primary" /><span className="text-muted-foreground">Wind:</span><span className="text-foreground">{currentWind} km/h {currentWindDir != null ? getWindDirectionLabel(currentWindDir) : ''}</span></div>
          <div className="flex items-center gap-1.5"><Gauge className="w-3 h-3 text-quake" /><span className="text-muted-foreground">Pressure:</span><span className="text-foreground">{currentPressure?.toFixed(0)} hPa</span></div>
          <div className="flex items-center gap-1.5"><Eye className="w-3 h-3 text-muted-foreground" /><span className="text-muted-foreground">Visibility:</span><span className="text-foreground">{currentVisibility ? (currentVisibility / 1000).toFixed(1) + ' km' : 'N/A'}</span></div>
          <div className="flex items-center gap-1.5"><Sun className="w-3 h-3 text-warning" /><span className="text-muted-foreground">UV Index:</span><span className="text-foreground">{currentUV?.toFixed(1)}</span></div>
          <div className="flex items-center gap-1.5"><Wind className="w-3 h-3 text-destructive" /><span className="text-muted-foreground">Gusts:</span><span className="text-foreground">{currentGusts} km/h</span></div>
        </div>
      </motion.div>

      {/* Air Quality */}
      {airQ && (
        <div className="p-3 rounded-lg border border-border bg-card">
          <p className="text-xs font-display font-bold text-muted-foreground mb-2">Air Quality</p>
          <div className="flex items-center justify-between">
            <span className={`text-sm font-display font-bold ${aqiColor}`}>{aqiLevel}</span>
            <span className="text-xs text-muted-foreground">PM2.5: {pm25?.toFixed(1)} µg/m³</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">PM10: {pm10?.toFixed(1)} µg/m³</div>
        </div>
      )}

      {/* Bay of Bengal Marine */}
      {marine && waveH != null && (
        <div className="p-3 rounded-lg border border-border bg-card">
          <p className="text-xs font-display font-bold text-muted-foreground mb-2 flex items-center gap-1.5">
            <Waves className="w-3.5 h-3.5 text-flood" /> Bay of Bengal
          </p>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div><span className="text-muted-foreground">Wave Height:</span> <span className="text-foreground">{waveH?.toFixed(1)}m</span></div>
            <div><span className="text-muted-foreground">Swell:</span> <span className="text-foreground">{swellH?.toFixed(1)}m</span></div>
          </div>
        </div>
      )}

      {/* City-wise temperatures */}
      {data.cityWeather?.length > 0 && (
        <div className="p-3 rounded-lg border border-border bg-card">
          <p className="text-xs font-display font-bold text-muted-foreground mb-2">City Temperatures</p>
          <div className="space-y-1">
            {data.cityWeather.filter(c => c.temperature != null).map(c => (
              <div key={c.city} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{c.city}</span>
                <div className="flex items-center gap-2">
                  <span className="text-foreground font-display">{c.temperature?.toFixed(1)}°C</span>
                  <Wind className="w-3 h-3 text-primary" />
                  <span className="text-muted-foreground">{c.windSpeed?.toFixed(0)} km/h</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data sources */}
      <div className="text-[10px] text-muted-foreground px-1">
        Sources: {data.sources?.join(' • ')}
        <br />Updated: {new Date(data.fetchedAt).toLocaleTimeString('en-IN')}
      </div>
    </div>
  );
};

export default WeatherPanel;
