import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, GraduationCap, CheckCircle, Users, MapPin, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Training } from "@/hooks/useTrainings";
import { toast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  training: Training;
  timestamp: Date;
  read: boolean;
}

export default function TrainingNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const initialLoadRef = useRef(true);

  const unread = notifications.filter(n => !n.read).length;

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  useEffect(() => {
    setMounted(true);

    const channel = supabase
      .channel("training-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "trainings" },
        (payload) => {
          if (initialLoadRef.current) return; // skip on first mount
          const training = payload.new as Training;

          const notif: Notification = {
            id: crypto.randomUUID(),
            training,
            timestamp: new Date(),
            read: false,
          };

          setNotifications(prev => [notif, ...prev].slice(0, 20));

          // Show toast
          toast({
            title: "📋 New Training Submitted",
            description: `"${training.title}" — ${training.state} · ${training.participants_total} participants`,
          });
        }
      )
      .subscribe(() => {
        // Mark initial load done after subscription is active
        setTimeout(() => { initialLoadRef.current = false; }, 500);
      });

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!mounted) return null;

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => { setOpen(o => !o); if (!open) markAllRead(); }}
        className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-display transition-all ${
          open
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        }`}
      >
        <Bell className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Alerts</span>

        {/* Unread badge */}
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground"
            >
              {unread > 9 ? "9+" : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 glass-strong rounded-xl border border-border shadow-2xl z-[9999]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-primary" />
                <span className="font-display text-sm font-bold text-foreground">Training Alerts</span>
                {unread > 0 && (
                  <span className="text-[10px] bg-destructive/10 text-destructive border border-destructive/20 px-1.5 py-0.5 rounded-full font-display">
                    {unread} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs font-display text-muted-foreground">No notifications yet</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-1">New training submissions will appear here in real time</p>
                </div>
              ) : (
                <AnimatePresence>
                  {notifications.map(n => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      className={`px-4 py-3 border-b border-border/50 last:border-0 transition-colors ${
                        !n.read ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <GraduationCap className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            {!n.read && (
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mb-1" />
                            )}
                            <p className="text-xs font-display font-bold text-foreground line-clamp-1">
                              {n.training.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-2.5 h-2.5" />{n.training.state}
                              </span>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Users className="w-2.5 h-2.5" />{n.training.participants_total} participants
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground/60 mt-0.5">{n.training.theme}</p>
                            <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                              {n.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => dismiss(n.id)}
                          className="flex-shrink-0 text-muted-foreground/40 hover:text-muted-foreground transition-colors mt-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-border">
              <p className="text-[10px] text-muted-foreground/60 text-center">
                Listening for realtime training submissions · {notifications.length} recorded
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
