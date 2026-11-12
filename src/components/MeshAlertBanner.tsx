import { useState, useEffect, useRef } from "react";
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

interface PresenceMessage {
  type: "presence";
  peerId: string;
  sentAt: number;
}

const CHANNEL_NAME = "resqai-mesh";
const PRESENCE_INTERVAL_MS = 10_000;
const PEER_TTL_MS = 30_000;

const createPeerId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `peer-${Date.now()}`;
};

const MeshAlertBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [meshAlerts, setMeshAlerts] = useState<MeshAlert[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [localPeerCount, setLocalPeerCount] = useState(0);
  const [relayAvailable, setRelayAvailable] = useState(false);
  const peerIdRef = useRef<string>(createPeerId());
  const peersRef = useRef<Map<string, number>>(new Map());

  // Monitor connectivity
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setMeshAlerts(prev => [{
        id: `offline-${Date.now()}`,
        message: "Network disconnected. Using cached predictions and local relay for alerts.",
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

  // Same-browser relay presence. This is intentionally labelled as local tabs,
  // not a real mesh: BroadcastChannel cannot reach other devices.
  useEffect(() => {
    if (!("BroadcastChannel" in window)) {
      setRelayAvailable(false);
      return;
    }

    setRelayAvailable(true);
    const channel = new BroadcastChannel(CHANNEL_NAME);
    const peers = peersRef.current;

    const prunePeers = () => {
      const now = Date.now();
      peers.forEach((lastSeen, id) => {
        if (now - lastSeen > PEER_TTL_MS) peers.delete(id);
      });
      setLocalPeerCount(Math.max(0, peers.size - 1));
    };

    const announce = () => {
      peers.set(peerIdRef.current, Date.now());
      const presence: PresenceMessage = {
        type: "presence",
        peerId: peerIdRef.current,
        sentAt: Date.now(),
      };
      channel.postMessage(presence);
      prunePeers();
    };

    channel.onmessage = (event) => {
      const data = event.data as Partial<PresenceMessage & MeshAlert> | undefined;
      if (!data) return;

      if (data.type === "presence" && typeof data.peerId === "string") {
        peers.set(data.peerId, Date.now());
        prunePeers();
        return;
      }

      if (typeof data.message === "string" && typeof data.severity === "string") {
        setMeshAlerts(prev => [data as MeshAlert, ...prev].slice(0, 5));
      }
    };

    announce();
    const interval = setInterval(announce, PRESENCE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      channel.close();
      peers.clear();
      setLocalPeerCount(0);
    };
  }, []);

  const dismiss = (id: string) => {
    setDismissed(prev => new Set([...prev, id]));
  };

  const visibleAlerts = meshAlerts.filter(a => !dismissed.has(a.id));

  return (
    <div className="space-y-1">
      {/* Connectivity status */}
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
        <span
          className="flex items-center gap-1 text-muted-foreground"
          title="Same-browser relay only (BroadcastChannel). Not WebRTC/BLE."
        >
          <Users className="w-3 h-3" />
          {relayAvailable
            ? localPeerCount === 0
              ? "No other local tabs"
              : `${localPeerCount} local tab${localPeerCount === 1 ? "" : "s"}`
            : "Local relay unavailable"}
        </span>
        <span className="text-[9px] text-muted-foreground/60 font-display uppercase tracking-wide">
          local relay
        </span>
      </div>

      {/* Relay alerts */}
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
