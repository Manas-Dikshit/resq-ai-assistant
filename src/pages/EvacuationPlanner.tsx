import { useState } from "react";
import { MessageSquare, Siren } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import EvacuationMap from "@/components/evacuation/EvacuationMap";
import EvacuationPanel from "@/components/evacuation/EvacuationPanel";
import AIChatPanel from "@/components/AIChatPanel";
import AppHeader from "@/components/layout/AppHeader";
import SOSButton from "@/components/SOSButton";

const EvacuationPlanner = () => {
  const { t } = useTranslation();
  const [showChat, setShowChat] = useState(false);
  const [selectedShelterId, setSelectedShelterId] = useState<string | null>(null);

  return (
    <div className="h-screen flex flex-col bg-background">
      <AppHeader
        title={t('evacuation.title', { defaultValue: 'Evacuation Planner' })}
        subtitle={t('evacuation.emergency', { defaultValue: 'Emergency evacuation' })}
        icon={Siren}
        backTo="/dashboard"
        live={false}
        actions={
          <>
            <span className="hidden items-center gap-1.5 rounded-full border border-destructive/25 bg-destructive/10 px-2.5 py-1 font-display text-[10px] font-semibold uppercase tracking-wide text-destructive sm:flex">
              {t('evacuation.emergency', { defaultValue: 'Emergency' })}
            </span>
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

      <div className="flex-1 flex overflow-hidden">
        {/* Side Panel */}
        <aside className="w-[380px] border-r border-border bg-card/30 flex-shrink-0 overflow-y-auto hidden lg:block">
          <EvacuationPanel
            selectedShelterId={selectedShelterId}
            onSelectShelter={setSelectedShelterId}
          />
        </aside>

        {/* Map */}
        <main className="flex-1 relative">
          <EvacuationMap
            selectedShelterId={selectedShelterId}
            onSelectShelter={setSelectedShelterId}
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
