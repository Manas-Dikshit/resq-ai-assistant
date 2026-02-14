import { useState } from "react";
import { Send, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const mockResponses: Record<string, string> = {
  default: "I'm ResQAI, your disaster intelligence assistant. I can help you with evacuation routes, safety protocols, shelter locations, and risk assessments. How can I help you stay safe?",
  earthquake: "🚨 **Earthquake Safety Protocol:**\n\n1. **DROP** to your hands and knees\n2. Take **COVER** under a sturdy desk or table\n3. **HOLD ON** until the shaking stops\n\nIf on a high floor, stay away from windows. Do NOT use elevators. After shaking stops, check for injuries and move to open ground if possible.",
  flood: "🌊 **Flood Response:**\n\n1. Move to **higher ground** immediately\n2. Avoid walking through moving water — 6 inches can knock you down\n3. Do NOT drive through flooded roads\n4. If trapped, go to the **highest level** and signal for help\n\nNearest shelter: *Mumbai Central Shelter* (1.2 km away, 160 spots available)",
};

const getResponse = (msg: string): string => {
  const lower = msg.toLowerCase();
  if (lower.includes("earthquake") || lower.includes("quake")) return mockResponses.earthquake;
  if (lower.includes("flood") || lower.includes("water")) return mockResponses.flood;
  return mockResponses.default;
};

const AIChatPanel = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: mockResponses.default },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    const aiMsg: Message = { role: "assistant", content: getResponse(input) };
    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full border border-border rounded-lg bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/50">
        <Bot className="w-5 h-5 text-primary" />
        <span className="font-display text-sm font-bold text-foreground">ResQAI Assistant</span>
        <span className="ml-auto w-2 h-2 rounded-full bg-safe animate-pulse-glow" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}
            >
              {msg.role === "assistant" && (
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about safety, shelters, risks..."
            className="flex-1 bg-secondary rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={handleSend}
            className="p-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatPanel;
