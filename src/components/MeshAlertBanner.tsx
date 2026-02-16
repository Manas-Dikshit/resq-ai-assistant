import { useState, useEffect, useCallback } from "react";
import { Wifi, WifiOff, Radio, Users, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MeshAlert {
  id: string;
  message: string;
  severity: "critical" | "warning" | "info";
  source: "mesh" | "server" | "offline-cache";
  timestamp: number;
  peerCount?: number;
}

const MeshAlertBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [meshAlerts, setMeshAlerts] = useState<MeshAlert[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [peerCount, setPeerCount] = useState(0);

  // Monitor connectivity
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      // Add offline alert
      setMeshAlerts(prev => [{
        id: `offline-${Date.now()}`,
        message: "Network disconnected. Using cached predictions and mesh relay for alerts.",
        severity: "warning" as const,
        source: "offline-cache" as const,
        timestamp: Date.now(),
      }, ...prev].slice(0, 5));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Simulate mesh peer discovery (in production: WebRTC/BLE)
  useEffect(() => {
    const interval = setInterval(() => {
      setPeerCount(Math.floor(Math.random() * 8) + 1);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Listen for broadcast channel messages (simulates mesh)
  useEffect(() => {
    if (!("BroadcastChannel" in window)) return;
    const channel = new BroadcastChannel("resqai-mesh");
    channel.onmessage = (event) => {
      const alert = event.data as MeshAlert;
      setMeshAlerts(prev => [alert, ...prev].slice(0, 5));
    };
    return () => channel.close();
  }, []);

  const dismiss = (id: string) => {
    setDismissed(prev => new Set([...prev, id]));
  };

  const visibleAlerts = meshAlerts.filter(a => !dismissed.has(a.id));

  return (
    <div className="space-y-1">
      {/* Connectivity Status */}
      <div className="flex items-center gap-2 text-xs">
        {isOnline ? (
          <span className="flex items-center gap-1 text-safe">
            <Wifi className="w-3 h-3" /> Online
          </span>
        ) : (
          <span className="flex items-center gap-1 text-warning animate-pulse">
            <WifiOff className="w-3 h-3" /> Offline Mode
          </span>
        )}
        <span className="flex items-center gap-1 text-muted-foreground">
          <Users className="w-3 h-3" /> {peerCount} mesh peers
        </span>
      </div>

      {/* Mesh Alerts */}
      <AnimatePresence>
        {visibleAlerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs ${
              alert.severity === "critical"
                ? "bg-destructive/10 border border-destructive/30 text-destructive"
                : alert.severity === "warning"
                ? "bg-warning/10 border border-warning/30 text-warning"
                : "bg-primary/10 border border-primary/30 text-primary"
            }`}
          >
            {alert.source === "mesh" ? (
              <Radio className="w-3 h-3 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-3 h-3 flex-shrink-0" />
            )}
            <span className="flex-1 truncate">{alert.message}</span>
            <span className="text-[9px] opacity-60 font-display">{alert.source}</span>
            <button onClick={() => dismiss(alert.id)} className="p-0.5 hover:opacity-70">
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default MeshAlertBanner;
