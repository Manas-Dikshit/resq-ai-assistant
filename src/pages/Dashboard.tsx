import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageSquare, Map, BarChart3, Radio, ChevronLeft, ChevronRight, LogIn, LogOut, AlertTriangle, Shield, FileWarning, Satellite, Thermometer, Home, Brain, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import DisasterMap from "@/components/DisasterMap";
import AIChatPanel from "@/components/AIChatPanel";
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
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const sidebarTabs: { id: SidebarTab; label: string; icon: any }[] = [
    { id: 'predictions', label: t('sidebar.predictions'), icon: Brain },
    { id: 'community', label: t('sidebar.community'), icon: Users },
    { id: 'events', label: t('sidebar.events'), icon: AlertTriangle },
    { id: 'weather', label: t('sidebar.weather'), icon: Thermometer },
    { id: 'shelters', label: t('sidebar.shelters'), icon: Home },
    { id: 'satellite', label: t('sidebar.satellite'), icon: Satellite },
    { id: 'charts', label: t('sidebar.charts'), icon: BarChart3 },
  ];

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Enhanced header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-border glass-strong z-20">
        <div className="flex items-center gap-3">
          <Link to="/" className="font-display text-lg font-bold group">
            <span className="text-foreground">Res</span>
            <span className="text-gradient-primary">Q</span>
            <span className="text-foreground">AI</span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 ml-2">
            <span className="text-xs text-muted-foreground font-display">{t('app.tagline')}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-safe/10 border border-safe/20 text-xs text-safe font-display">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-safe opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-safe"></span>
            </span>
            {t('app.live')}
          </span>
          {user && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowReport(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-display bg-warning/10 text-warning hover:bg-warning/20 border border-warning/20 transition-colors"
            >
              <FileWarning className="w-3.5 h-3.5" />
              {t('app.report')}
            </motion.button>
          )}
          <button onClick={() => setShowChat(!showChat)} className={`p-2 rounded-md transition-colors ${showChat ? 'bg-primary/10 text-primary' : 'hover:bg-accent text-muted-foreground hover:text-foreground'}`} title="Toggle AI Chat">
            <MessageSquare className="w-4 h-4" />
          </button>
          {user ? (
            <>
              <Link to="/admin" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-display text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                <Shield className="w-3.5 h-3.5" />{t('app.admin')}
              </Link>
              <button onClick={() => signOut()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-display text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                <LogOut className="w-3.5 h-3.5" />{t('app.signOut')}
              </button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/auth")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-display bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <LogIn className="w-3.5 h-3.5" />{t('app.signIn')}
            </motion.button>
          )}
        </div>
      </header>

      <div className="px-4 py-2">
        <AlertBanner />
      </div>

      <div className="flex-1 flex overflow-hidden">
        <AnimatePresence>
          {showSidebar && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 384, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="border-r border-border overflow-hidden bg-card/30 hidden lg:flex flex-col"
            >
              <div className="flex border-b border-border overflow-x-auto">
                {sidebarTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setSidebarTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-xs font-display transition-all whitespace-nowrap ${
                      sidebarTab === tab.id
                        ? 'text-primary border-b-2 border-primary bg-primary/5'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    <span className="hidden xl:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
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
          <div className="absolute bottom-4 left-4 glass-strong rounded-xl p-3 z-[500] animate-fade-in">
            <p className="text-xs font-display font-bold text-muted-foreground mb-2 tracking-wider">{t('legend.title')}</p>
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
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile stat cards */}
          <div className="lg:hidden absolute top-4 left-4 right-4 flex gap-2 z-[500]">
            {[
              { label: t('sidebar.events'), value: t('app.live'), icon: BarChart3 },
              { label: t('sidebar.shelters'), value: "DB", icon: Map },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2 glass-strong rounded-lg px-3 py-2">
                <s.icon className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-display text-foreground">{s.value} {s.label}</span>
              </div>
            ))}
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
              <AIChatPanel />
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