import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import EvacuationMap from "@/components/evacuation/EvacuationMap";
import EvacuationPanel from "@/components/evacuation/EvacuationPanel";
import AIChatPanel from "@/components/AIChatPanel";
import LanguageToggle from "@/components/LanguageToggle";
import SOSButton from "@/components/SOSButton";

const EvacuationPlanner = () => {
  const { t } = useTranslation();
  const [showChat, setShowChat] = useState(false);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedShelterId, setSelectedShelterId] = useState<string | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; time: string } | null>(null);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-border glass-strong z-20">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-bold">
              <span className="text-foreground">Res</span>
              <span className="text-gradient-primary">Q</span>
              <span className="text-foreground">AI</span>
            </span>
            <span className="text-xs text-muted-foreground font-display hidden sm:inline">/ {t('evacuation.title')}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/10 border border-destructive/20 text-xs text-destructive font-display">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive" />
            </span>
            {t('evacuation.emergency')}
          </span>
          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-2 rounded-md transition-colors ${showChat ? 'bg-primary/10 text-primary' : 'hover:bg-accent text-muted-foreground hover:text-foreground'}`}
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Side Panel */}
        <aside className="w-[380px] border-r border-border bg-card/30 flex-shrink-0 overflow-y-auto hidden lg:block">
          <EvacuationPanel
            userPos={userPos}
            onUserPosChange={setUserPos}
            selectedShelterId={selectedShelterId}
            onSelectShelter={setSelectedShelterId}
            routeInfo={routeInfo}
          />
        </aside>

        {/* Map */}
        <main className="flex-1 relative">
          <EvacuationMap
            userPos={userPos}
            onUserPosChange={setUserPos}
            selectedShelterId={selectedShelterId}
            onSelectShelter={setSelectedShelterId}
            onRouteFound={setRouteInfo}
          />
        </main>

        {/* Chat Panel */}
        <AnimatePresence>
          {showChat && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 384, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="border-l border-border bg-card/30 overflow-hidden"
            >
              <AIChatPanel />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <SOSButton />
    </div>
  );
};

export default EvacuationPlanner;
