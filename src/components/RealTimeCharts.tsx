import { useRealDisasterData } from "@/hooks/useDisasterData";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Loader2 } from "lucide-react";

const RealTimeCharts = () => {
  const { data, isLoading } = useRealDisasterData();

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading real-time data...
      </div>
    );
  }

  const hourly = data.hourlyWeather;
  const airQ = data.airQuality;

  // Format hourly data for charts
  const tempWindData = hourly?.time?.map((t: string, i: number) => ({
    time: new Date(t).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    temperature: hourly.temperature?.[i],
    windSpeed: hourly.windSpeed?.[i],
    windGusts: hourly.windGusts?.[i],
    humidity: hourly.humidity?.[i],
  })) || [];

  const precipPressureData = hourly?.time?.map((t: string, i: number) => ({
    time: new Date(t).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    precipitation: hourly.precipitation?.[i],
    pressure: hourly.pressure?.[i],
    cloudCover: hourly.cloudCover?.[i],
    uvIndex: hourly.uvIndex?.[i],
  })) || [];

  const aqData = airQ?.time?.map((t: string, i: number) => ({
    time: new Date(t).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    pm25: airQ.pm25?.[i],
    pm10: airQ.pm10?.[i],
    ozone: airQ.ozone?.[i],
    dust: airQ.dust?.[i],
  })) || [];

  const marineData = data.marine?.time?.map((t: string, i: number) => ({
    time: new Date(t).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    waveHeight: data.marine?.waveHeight?.[i],
    swellHeight: data.marine?.swellHeight?.[i],
  })) || [];

  // Daily forecast data
  const dailyData = data.weather?.dates?.map((d: string, i: number) => ({
    date: new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    maxTemp: data.weather.maxTemp?.[i],
    minTemp: data.weather.minTemp?.[i],
    precipitation: data.weather.precipitation?.[i],
    maxWind: data.weather.maxWind?.[i],
    uvMax: data.weather.uvIndexMax?.[i],
  })) || [];

  const chartStyle = { fontSize: 10, fill: 'hsl(215 15% 55%)' };

  return (
    <div className="space-y-6">
      {/* Temperature & Wind (24h) */}
      <div>
        <h4 className="text-xs font-display font-bold text-muted-foreground tracking-wider uppercase mb-3">Temperature & Wind — 24h Live</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={tempWindData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
            <XAxis dataKey="time" tick={chartStyle} interval={3} />
            <YAxis tick={chartStyle} />
            <Tooltip contentStyle={{ background: 'hsl(220 18% 10%)', border: '1px solid hsl(220 15% 18%)', borderRadius: 8, fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Line type="monotone" dataKey="temperature" stroke="hsl(15 90% 55%)" strokeWidth={2} dot={false} name="Temp (°C)" />
            <Line type="monotone" dataKey="windSpeed" stroke="hsl(168 80% 45%)" strokeWidth={2} dot={false} name="Wind (km/h)" />
            <Line type="monotone" dataKey="windGusts" stroke="hsl(0 72% 51%)" strokeWidth={1} strokeDasharray="4 4" dot={false} name="Gusts" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Precipitation & UV */}
      <div>
        <h4 className="text-xs font-display font-bold text-muted-foreground tracking-wider uppercase mb-3">Precipitation & Cloud Cover — 24h</h4>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={precipPressureData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
            <XAxis dataKey="time" tick={chartStyle} interval={3} />
            <YAxis tick={chartStyle} />
            <Tooltip contentStyle={{ background: 'hsl(220 18% 10%)', border: '1px solid hsl(220 15% 18%)', borderRadius: 8, fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Area type="monotone" dataKey="precipitation" fill="hsl(210 80% 55%)" fillOpacity={0.3} stroke="hsl(210 80% 55%)" name="Rain (mm)" />
            <Area type="monotone" dataKey="cloudCover" fill="hsl(215 15% 55%)" fillOpacity={0.1} stroke="hsl(215 15% 55%)" name="Cloud %" />
            <Line type="monotone" dataKey="uvIndex" stroke="hsl(38 92% 50%)" strokeWidth={2} dot={false} name="UV Index" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Air Quality */}
      {aqData.length > 0 && (
        <div>
          <h4 className="text-xs font-display font-bold text-muted-foreground tracking-wider uppercase mb-3">Air Quality — 24h</h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={aqData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
              <XAxis dataKey="time" tick={chartStyle} interval={3} />
              <YAxis tick={chartStyle} />
              <Tooltip contentStyle={{ background: 'hsl(220 18% 10%)', border: '1px solid hsl(220 15% 18%)', borderRadius: 8, fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="pm25" fill="hsl(0 72% 51%)" name="PM2.5" radius={[2, 2, 0, 0]} />
              <Bar dataKey="pm10" fill="hsl(38 92% 50%)" name="PM10" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bay of Bengal Wave Height */}
      {marineData.length > 0 && (
        <div>
          <h4 className="text-xs font-display font-bold text-muted-foreground tracking-wider uppercase mb-3">Bay of Bengal Waves — 24h</h4>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={marineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
              <XAxis dataKey="time" tick={chartStyle} interval={3} />
              <YAxis tick={chartStyle} />
              <Tooltip contentStyle={{ background: 'hsl(220 18% 10%)', border: '1px solid hsl(220 15% 18%)', borderRadius: 8, fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Area type="monotone" dataKey="waveHeight" fill="hsl(210 80% 55%)" fillOpacity={0.4} stroke="hsl(210 80% 55%)" strokeWidth={2} name="Wave (m)" />
              <Area type="monotone" dataKey="swellHeight" fill="hsl(280 60% 55%)" fillOpacity={0.2} stroke="hsl(280 60% 55%)" strokeWidth={2} name="Swell (m)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 14-Day Forecast */}
      {dailyData.length > 0 && (
        <div>
          <h4 className="text-xs font-display font-bold text-muted-foreground tracking-wider uppercase mb-3">14-Day Forecast</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
              <XAxis dataKey="date" tick={chartStyle} />
              <YAxis tick={chartStyle} />
              <Tooltip contentStyle={{ background: 'hsl(220 18% 10%)', border: '1px solid hsl(220 15% 18%)', borderRadius: 8, fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="maxTemp" fill="hsl(15 90% 55%)" name="Max °C" radius={[2, 2, 0, 0]} />
              <Bar dataKey="minTemp" fill="hsl(210 80% 55%)" name="Min °C" radius={[2, 2, 0, 0]} />
              <Bar dataKey="precipitation" fill="hsl(168 80% 45%)" name="Rain mm" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default RealTimeCharts;
