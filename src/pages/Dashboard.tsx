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

      <div className="flex items-center gap-1 overflow-x-auto border-b border-border bg-card/30 px-3 py-1.5">
        {sidebarTabs.map(tab => (
          <button
            key={`quick-${tab.id}`}
            onClick={() => {
              setSidebarTab(tab.id);
              setShowSidebar(true);
            }}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs transition-colors ${
              sidebarTab === tab.id
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
            }`}
            aria-pressed={sidebarTab === tab.id}
          >
            <tab.icon className="h-3.5 w-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}

        <div className="ml-auto flex items-center gap-1 pl-2">
          <button
            onClick={() => {
              setShowSidebar(true);
              setBigView(v => !v);
            }}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1.5 text-xs transition-colors ${
              bigView ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
            }`}
            title={bigView ? 'Exit expanded panel' : 'Expand panel'}
            aria-label={bigView ? 'Exit expanded panel' : 'Expand panel'}
          >
            {bigView ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <AnimatePresence>
          {showSidebar && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: bigView ? 560 : 360, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="border-r border-border overflow-hidden bg-card/30 hidden lg:flex flex-col"
            >
              <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
                <div className="min-w-0 flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-secondary text-foreground">
                    <ActiveSidebarIcon className="w-3.5 h-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-display font-semibold text-foreground">{activeSidebarTab.label}</p>
                    <p className="text-[10px] text-muted-foreground">Operational feed</p>
                  </div>
                </div>
                <button
                  onClick={() => setBigView(v => !v)}
                  className="px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  title={bigView ? 'Exit Big View' : 'Big View'}
                >
                  {bigView ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className={`flex-1 overflow-y-auto ${bigView ? 'p-5 space-y-7' : 'p-4 space-y-6'}`}>
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

        <button onClick={() => setShowSidebar(!showSidebar)} className="hidden lg:flex items-center justify-center w-5 border-r border-border bg-card/50 hover:bg-accent transition-colors group">
          {showSidebar
            ? <ChevronLeft className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
            : <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
          }
        </button>

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