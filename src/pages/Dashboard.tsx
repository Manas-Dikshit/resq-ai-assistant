import { useState } from "react";
import { MessageSquare, BarChart3, ChevronLeft, ChevronRight, AlertTriangle, FileWarning, Satellite, Thermometer, Home, Brain, Users, Maximize2, Minimize2, Activity } from "lucide-react";
import AppHeader from "@/components/layout/AppHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import DisasterMap from "@/components/DisasterMap";
import OperationalChatPanel from "@/components/OperationalChatPanel";
import RiskCards from "@/components/RiskCards";
import AlertBanner from "@/components/AlertBanner";
import LiveEventsPanel from "@/components/LiveEventsPanel";
import WeatherPanel from "@/components/WeatherPanel";
import SatelliteView from "@/components/SatelliteView";
import RealTimeCharts from "@/components/RealTimeCharts";
import ShelterFinder from "@/components/ShelterFinder";
import SOSButton from "@/components/SOSButton";
import ReportForm from "@/components/ReportForm";
import LanguageToggle from "@/components/LanguageToggle";
import PredictionPanel from "@/components/PredictionPanel";
import CommunityValidation from "@/components/CommunityValidation";

type SidebarTab = 'predictions' | 'community' | 'events' | 'weather' | 'satellite' | 'charts' | 'shelters';

const Dashboard = () => {
  const [showChat, setShowChat] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('predictions');
  const [bigView, setBigView] = useState(false);
  const { user } = useAuth();
  const { t } = useTranslation();

  const sidebarTabs: { id: SidebarTab; label: string; icon: any }[] = [
    { id: 'predictions', label: t('sidebar.predictions'), icon: Brain },
    { id: 'community', label: t('sidebar.communication', { defaultValue: 'Communication' }), icon: Users },
    { id: 'events', label: t('sidebar.events'), icon: AlertTriangle },
    { id: 'weather', label: t('sidebar.weather'), icon: Thermometer },
    { id: 'shelters', label: t('sidebar.shelters'), icon: Home },
    { id: 'satellite', label: t('sidebar.satellite'), icon: Satellite },
    { id: 'charts', label: t('sidebar.charts'), icon: BarChart3 },
  ];

  const activeSidebarTab = sidebarTabs.find(tab => tab.id === sidebarTab) ?? sidebarTabs[0];
  const ActiveSidebarIcon = activeSidebarTab.icon;

  return (
    <div className="h-screen flex flex-col bg-background">
      <AppHeader
        title={t('nav.dashboard', { defaultValue: 'Live Dashboard' })}
        subtitle={t('app.tagline', { defaultValue: 'Disaster response operations' })}
        icon={Activity}
        actions={
          <>
            {user && (
              <button
                onClick={() => setShowReport(true)}
                className="hidden items-center gap-1.5 rounded-md border border-warning/25 bg-warning/10 px-2.5 py-1.5 text-xs text-warning transition-colors hover:bg-warning/15 sm:flex"
              >
                <FileWarning className="h-3.5 w-3.5" />
                {t('app.report', { defaultValue: 'Report' })}
              </button>
            )}
            <button
              onClick={() => setShowChat(!showChat)}
              className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                showChat ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
              title="Toggle assistant"
              aria-label="Toggle assistant"
              aria-pressed={showChat}
            >
              <MessageSquare className="h-4 w-4" />
            </button>
          </>
        }
      />

      <div className="px-4 py-2">
        <AlertBanner />
      </div>

      {/* Main workspace layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Vertical Operations Rail */}
        <nav
          className="flex flex-col items-center justify-between border-r border-border bg-card/60 backdrop-blur-md px-1.5 py-3 z-10 shrink-0"
          aria-label="Operational views"
        >
          <div className="flex flex-col items-center gap-1.5 w-full">
            {sidebarTabs.map(tab => {
              const isActive = showSidebar && sidebarTab === tab.id;
              return (
                <button
                  key={`rail-${tab.id}`}
                  onClick={() => {
                    if (sidebarTab === tab.id && showSidebar) {
                      setShowSidebar(false);
                    } else {
                      setSidebarTab(tab.id);
                      setShowSidebar(true);
                    }
                  }}
                  className={`group relative flex h-10 w-10 items-center justify-center rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:bg-accent/80 hover:text-foreground'
                  }`}
                  title={tab.label}
                  aria-label={tab.label}
                  aria-pressed={isActive}
                >
                  <tab.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                  {/* Tooltip on hover */}
                  <span className="pointer-events-none absolute left-full ml-2 hidden whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-[11px] font-medium text-popover-foreground shadow-md z-50 group-hover:block">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col items-center gap-2 pt-2 border-t border-border/60 w-full">
            <button
              onClick={() => {
                if (!showSidebar) setShowSidebar(true);
                setBigView(v => !v);
              }}
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                bigView && showSidebar
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
              title={bigView ? 'Normal panel view' : 'Expand panel view'}
              aria-label={bigView ? 'Normal panel view' : 'Expand panel view'}
            >
              {bigView ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setShowSidebar(v => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              title={showSidebar ? 'Collapse sidebar' : 'Expand sidebar'}
              aria-label={showSidebar ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {showSidebar ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
        </nav>

        {/* Dynamic Operational Content Drawer */}
        <AnimatePresence initial={false}>
          {showSidebar && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: bigView ? 520 : 360, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="border-r border-border overflow-hidden bg-card/40 backdrop-blur-md hidden lg:flex flex-col shrink-0"
            >
              <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3 bg-card/60">
                <div className="min-w-0 flex items-center gap-2.5">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-secondary text-primary">
                    <ActiveSidebarIcon className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-display font-bold text-foreground tracking-wide uppercase">{activeSidebarTab.label}</p>
                    <p className="text-[10px] text-muted-foreground">Live operational feed</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setBigView(v => !v)}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    title={bigView ? 'Normal view' : 'Expand width'}
                  >
                    {bigView ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    title="Close drawer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className={`flex-1 overflow-y-auto ${bigView ? 'p-5 space-y-7' : 'p-4 space-y-5'}`}>
                {sidebarTab === 'predictions' && <PredictionPanel />}
                {sidebarTab === 'community' && <CommunityValidation />}
                {sidebarTab === 'events' && (<><LiveEventsPanel /><RiskCards /></>)}
                {sidebarTab === 'weather' && <WeatherPanel />}
                {sidebarTab === 'shelters' && <ShelterFinder />}
                {sidebarTab === 'satellite' && <SatelliteView />}
                {sidebarTab === 'charts' && <RealTimeCharts />}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <main className="flex-1 relative">
          <DisasterMap />

          {/* Map legend */}
          <div className="absolute bottom-4 left-4 z-[500] max-w-[220px] rounded-lg border border-border bg-card/95 p-3 shadow-lg backdrop-blur-sm">
            <p className="mb-2 font-display text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t('legend.title')}</p>
            <div className="space-y-1.5">
              {[
                { color: "bg-flood", label: t('legend.floodZone') },
                { color: "bg-fire", label: t('legend.wildfire') },
                { color: "bg-quake", label: t('legend.earthquake') },
                { color: "bg-destructive", label: t('legend.cyclone') },
                { color: "bg-safe", label: t('legend.shelterAvailable') },
                { color: "bg-warning", label: t('legend.shelterModerate') },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${item.color}`} />
                  <span className="text-[11px] text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </main>

        <AnimatePresence>
          {showChat && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 384, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="border-l border-border bg-card/30 overflow-hidden"
            >
              <OperationalChatPanel />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <SOSButton />
      <ReportForm open={showReport} onClose={() => setShowReport(false)} />
    </div>
  );
};

export default Dashboard;