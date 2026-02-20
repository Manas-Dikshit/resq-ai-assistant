import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Loader2, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";

interface Message { role: "user" | "assistant"; content: string; }

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/resqai-chat`;

// Odia uses 'or-IN' BCP47 tag; some browsers map to 'or' — we try both
const LANG_MAP: Record<string, string[]> = {
  en: ["en-US"],
  hi: ["hi-IN"],
  or: ["or-IN", "or"],
};

const AIChatPanel = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: t('chat.welcome') },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Get preferred TTS voice for language
  const getVoice = useCallback((lang: string): SpeechSynthesisVoice | null => {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    const langCodes = LANG_MAP[lang] || LANG_MAP.en;
    for (const code of langCodes) {
      const match = voices.find(v => v.lang.startsWith(code) || v.lang === code);
      if (match) return match;
    }
    // Fallback: find any voice matching the base language
    const base = lang.split('-')[0];
    return voices.find(v => v.lang.startsWith(base)) || null;
  }, []);

  // Speak text using Web Speech API
  const speak = useCallback((text: string) => {
    if (!ttsEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*#_~`>]/g, '').replace(/\[.*?\]\(.*?\)/g, '');
    const utterance = new SpeechSynthesisUtterance(clean);
    const lang = i18n.language;
    const voice = getVoice(lang);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = LANG_MAP[lang]?.[0] || "en-US";
    }
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled, i18n.language, getVoice]);

  // Load voices asynchronously (Chrome loads them async)
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices(); // trigger load
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  // Start voice recognition — tries each lang code until one works
  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error(t('chat.voiceNotSupported'));
      return;
    }

    const recognition = new SpeechRecognition();
    const lang = i18n.language;
    const codes = LANG_MAP[lang] || LANG_MAP.en;
    recognition.lang = codes[0]; // primary code
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 3;

    recognition.onresult = (event: any) => {
      // Take the best alternative from the last result
      const lastResult = event.results[event.results.length - 1];
      const transcript = lastResult[0].transcript;
      setInput(transcript);
    };

    recognition.onend = () => setIsListening(false);

    recognition.onerror = (e: any) => {
      console.error("Speech error:", e.error, "lang:", recognition.lang);
      setIsListening(false);
      // For Odia, browser may not support or-IN — silently show message
      if (e.error === 'language-not-supported' && codes.length > 1) {
        // Retry with fallback code
        const recognition2 = new SpeechRecognition();
        recognition2.lang = codes[1];
        recognition2.interimResults = true;
        recognition2.continuous = false;
        recognition2.onresult = (ev: any) => {
          const t2 = ev.results[ev.results.length - 1][0].transcript;
          setInput(t2);
        };
        recognition2.onend = () => setIsListening(false);
        recognition2.onerror = () => {
          setIsListening(false);
          toast.error(t('chat.voiceFailed'));
        };
        recognitionRef.current = recognition2;
        recognition2.start();
        setIsListening(true);
        return;
      }
      if (e.error !== 'aborted' && e.error !== 'no-speech') {
        toast.error(t('chat.voiceFailed'));
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [i18n.language, t]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const allMessages = [...messages, userMsg].filter(m => m.role === "user" || m.role === "assistant");

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: allMessages, language: i18n.language }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({ error: "AI service error" }));
        if (resp.status === 429) toast.error("Rate limit exceeded.");
        else if (resp.status === 402) toast.error("AI credits exhausted.");
        else toast.error(errData.error || "AI service error");
        setIsLoading(false);
        return;
      }

      if (!resp.body) throw new Error("No response body");
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && prev.length > 1 && prev[prev.length - 2]?.role === "user") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch { textBuffer = line + "\n" + textBuffer; break; }
        }
      }

      // Speak the final response
      if (assistantSoFar) speak(assistantSoFar);
    } catch (e) {
      console.error("Chat error:", e);
      toast.error("Failed to get AI response");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full border border-border rounded-lg bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/50">
        <Bot className="w-5 h-5 text-primary" />
        <span className="font-display text-sm font-bold text-foreground">{t('chat.title')}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={() => { setTtsEnabled(!ttsEnabled); if (ttsEnabled) window.speechSynthesis?.cancel(); }}
            className="p-1 rounded hover:bg-accent transition-colors" title={ttsEnabled ? t('chat.muteVoice') : t('chat.enableVoice')}>
            {ttsEnabled ? <Volume2 className="w-3.5 h-3.5 text-primary" /> : <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>
          <span className="w-2 h-2 rounded-full bg-safe animate-pulse-glow" />
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "assistant" && (
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-1 [&>ul]:mb-1 [&>ol]:mb-1">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : msg.content}
              </div>
              {msg.role === "user" && (
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
            </div>
            <div className="bg-secondary rounded-lg px-3 py-2 text-sm text-muted-foreground">{t('chat.thinking')}</div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <button onClick={isListening ? stopListening : startListening} disabled={!user}
            className={`p-2 rounded-md transition-colors ${isListening ? 'bg-destructive text-destructive-foreground animate-pulse' : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent'} disabled:opacity-50`}
            title={isListening ? t('chat.stopListening') : t('chat.voiceInput')}>
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={user ? t('chat.placeholder') : t('chat.signInPlaceholder')} disabled={!user}
            className="flex-1 bg-secondary rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary disabled:opacity-50" />
          <button onClick={handleSend} disabled={isLoading || !user} className="p-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatPanel;
