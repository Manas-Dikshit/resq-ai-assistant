import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, CheckCircle2, XCircle, Users, Shield, Loader2, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

interface Report {
  id: string;
  title: string;
  description: string | null;
  disaster_type: string;
  lat: number;
  lng: number;
  verified: boolean;
  trust_score: number;
  confirm_count: number;
  deny_count: number;
  created_at: string;
  user_id: string;
}

const DISASTER_EMOJI: Record<string, string> = {
  flood: "🌊", cyclone: "🌀", fire: "🔥", earthquake: "🏔️",
  landslide: "⛰️", storm: "⛈️", lightning: "⚡", other: "⚠️",
};

const CommunityValidation = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery({
    queryKey: ["community-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("id, title, description, disaster_type, lat, lng, verified, trust_score, confirm_count, deny_count, created_at, user_id")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data || []) as Report[];
    },
    refetchInterval: 30000,
  });

  // Get user's existing votes
  const { data: myVotes } = useQuery({
    queryKey: ["my-votes", user?.id],
    queryFn: async () => {
      if (!user) return {};
      const { data } = await supabase
        .from("report_validations")
        .select("report_id, vote")
        .eq("user_id", user.id);
      const map: Record<string, string> = {};
      (data || []).forEach((v: any) => { map[v.report_id] = v.vote; });
      return map;
    },
    enabled: !!user,
  });

  const voteMutation = useMutation({
    mutationFn: async ({ reportId, vote }: { reportId: string; vote: "confirm" | "deny" }) => {
      if (!user) throw new Error("Sign in required");
      const existing = myVotes?.[reportId];
      if (existing === vote) {
        // Remove vote
        await supabase.from("report_validations").delete().eq("report_id", reportId).eq("user_id", user.id);
      } else if (existing) {
        // Update vote
        await supabase.from("report_validations").update({ vote }).eq("report_id", reportId).eq("user_id", user.id);
      } else {
        // Insert vote
        await supabase.from("report_validations").insert({ report_id: reportId, user_id: user.id, vote });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-reports"] });
      queryClient.invalidateQueries({ queryKey: ["my-votes"] });
    },
    onError: () => toast.error("Vote failed"),
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("report-validations-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "report_validations" }, () => {
        queryClient.invalidateQueries({ queryKey: ["community-reports"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const getTrustColor = (score: number) => {
    if (score >= 0.7) return "text-safe";
    if (score >= 0.4) return "text-warning";
    return "text-muted-foreground";
  };

  const getTierLabel = (report: Report) => {
    if (report.verified) return { label: "VERIFIED", className: "bg-safe/10 text-safe border-safe/30" };
    if (report.confirm_count >= 2) return { label: "COMMUNITY", className: "bg-primary/10 text-primary border-primary/30" };
    return { label: "UNCONFIRMED", className: "bg-muted text-muted-foreground border-border" };
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary animate-pulse" />
          <h3 className="font-display text-xs font-bold text-muted-foreground tracking-widest uppercase">Loading Reports...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <h3 className="font-display text-xs font-bold text-muted-foreground tracking-widest uppercase">
            Community Reports
          </h3>
        </div>
        <span className="text-xs text-muted-foreground font-display">{reports?.length || 0} reports</span>
      </div>

      {/* Trust Legend */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground p-2 rounded-lg bg-secondary/50">
        <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-safe" /> Verified</span>
        <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-primary" /> Community</span>
        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3 text-muted-foreground" /> Unconfirmed</span>
      </div>

      {(!reports || reports.length === 0) && (
        <p className="text-xs text-muted-foreground text-center py-6">No community reports yet. Be the first to report!</p>
      )}

      <div className="space-y-2">
        <AnimatePresence>
          {(reports || []).map((report, idx) => {
            const tier = getTierLabel(report);
            const myVote = myVotes?.[report.id];
            const totalVotes = report.confirm_count + report.deny_count;

            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="p-3 rounded-lg border border-border bg-card"
                role="article"
                aria-label={`${report.disaster_type} report: ${report.title}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <span className="text-lg mt-0.5">{DISASTER_EMOJI[report.disaster_type] || "⚠️"}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-display font-bold text-foreground truncate">{report.title}</p>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-display ${tier.className}`}>
                          {tier.label}
                        </span>
                      </div>
                      {report.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{report.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span>{new Date(report.created_at).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}</span>
                        <span className="capitalize">{report.disaster_type}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trust Score Bar */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-12">Trust</span>
                  <div className="flex-1 h-1.5 rounded-full bg-secondary">
                    <motion.div
                      className="h-full rounded-full bg-safe"
                      initial={{ width: 0 }}
                      animate={{ width: `${report.trust_score * 100}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                  <span className={`text-xs font-display w-10 text-right ${getTrustColor(report.trust_score)}`}>
                    {totalVotes > 0 ? `${(report.trust_score * 100).toFixed(0)}%` : "—"}
                  </span>
                </div>

                {/* Voting Buttons */}
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => voteMutation.mutate({ reportId: report.id, vote: "confirm" })}
                    disabled={!user || voteMutation.isPending}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-display transition-colors ${
                      myVote === "confirm"
                        ? "bg-safe/20 text-safe border border-safe/30"
                        : "bg-secondary text-muted-foreground hover:text-safe hover:bg-safe/10"
                    } disabled:opacity-40`}
                    aria-label="Confirm this report"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>{report.confirm_count}</span>
                  </button>
                  <button
                    onClick={() => voteMutation.mutate({ reportId: report.id, vote: "deny" })}
                    disabled={!user || voteMutation.isPending}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-display transition-colors ${
                      myVote === "deny"
                        ? "bg-destructive/20 text-destructive border border-destructive/30"
                        : "bg-secondary text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    } disabled:opacity-40`}
                    aria-label="Deny this report"
                  >
                    <ThumbsDown className="w-3 h-3" />
                    <span>{report.deny_count}</span>
                  </button>
                  <span className="ml-auto text-[10px] text-muted-foreground">{totalVotes} vote{totalVotes !== 1 ? "s" : ""}</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CommunityValidation;
