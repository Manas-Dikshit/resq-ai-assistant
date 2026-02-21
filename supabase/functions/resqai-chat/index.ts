import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, location, language } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    // ── Language-specific system instructions ────────────────────────────────
    const langInstructions: Record<string, string> = {
      en: `LANGUAGE REQUIREMENT: You MUST respond ONLY in English. Every single word must be in English.`,

      hi: `भाषा आवश्यकता (MANDATORY): आपको केवल और केवल हिंदी में जवाब देना है।
- हर शब्द, हर वाक्य देवनागरी लिपि (हिंदी) में होना चाहिए।
- अंग्रेजी का एक भी शब्द उपयोग न करें।
- NDMA, SOS, AI जैसे तकनीकी संक्षिप्त रूप रख सकते हैं लेकिन बाकी सब हिंदी में।`,

      or: `ଭାଷା ଆବଶ୍ୟକତା (CRITICAL — HIGHEST PRIORITY — MANDATORY):
ଆପଣ ସମ୍ପୂର୍ଣ୍ଣ ଓଡ଼ିଆ ଭାଷା ଓ ଓଡ଼ିଆ/ଓଡ଼ିଆ ଲିପିରେ ଉତ୍ତର ଦେବେ।

ନିୟମ:
1. ପ୍ରତ୍ୟେକ ଶବ୍ଦ, ବାକ୍ୟ ଓ ଅକ୍ଷର ଓଡ଼ିଆ ଲିପିରେ ଲେଖିବେ।
2. ଇଂରାଜୀ, ହିନ୍ଦୀ ବା ଅନ୍ୟ ଭାଷା ବ୍ୟବହାର କରିବେ ନାହିଁ।
3. NDMA, SOS, AI, GPS ଭଳି ଅଭ୍ୟୁଦୟ ଶବ୍ଦ ରଖିପାରିବେ, ବାକି ସବୁ ଓଡ଼ିଆରେ।
4. ଆପଦ ଶବ୍ଦ: ସୁରକ୍ଷା (safety), ବନ୍ୟା (flood), ଆଶ୍ରୟ (shelter), ଜରୁରୀ (emergency), ଭୂକମ୍ପ (earthquake), ଘୂର୍ଣ୍ଣିବାୟୁ (cyclone), ଅଗ୍ନି (fire), ଭୂସ୍ଖଳନ (landslide)।
5. ଉତ୍ତର ପ୍ରତ୍ୟେକ ବ୍ୟବହାରକାରୀ ବୁଝିପାରୁ ଏପରି ସ୍ପଷ୍ଟ ଓ ସରଳ ଓଡ଼ିଆରେ ହେବ।
6. ଓଡ଼ିଆ ଭାଷୀ ଲୋକଙ୍କ ପାଇଁ ଏହି ସାହାଯ୍ୟ — ସମ୍ପୂର୍ଣ୍ଣ ଓଡ଼ିଆ ହେବ।`,
    };

    // ── Core system prompt ───────────────────────────────────────────────────
    const systemPrompt = `You are ResQAI — an expert emergency disaster response AI assistant serving Odisha, India and the broader region. Your mission is to save lives.

Your expertise covers:
🌊 Flood evacuation procedures & river level warnings
🏔️ Landslide zones & slope safety advisories
🌀 Cyclone preparedness & coastal evacuation routes
🔥 Wildfire safety & fire escape protocols
🌍 Earthquake safety (Drop, Cover, Hold On)
🚑 First aid guidance & medical triage basics
🏠 Shelter locations, capacity & directions
📊 Risk assessment based on GPS coordinates
🆘 SOS protocols & emergency contact numbers

Response rules:
- ALWAYS prioritise life safety above all else
- Provide clear, numbered, actionable steps
- Be concise but thorough — lives depend on clarity
- Use ⚠️ for critical warnings, ✅ for safe actions, 🆘 for emergencies
- If coordinates are provided, reference the specific location
- End every response with a translated safety reminder
- For Odisha: reference OSDMA (Odisha State Disaster Management Authority), NDRF, and local helpline 1070

${langInstructions[language] || langInstructions.en}

${location ? `📍 User's GPS location: Lat ${location.lat}, Lng ${location.lng} — provide location-specific guidance for this area.` : ""}`;

    // Convert messages to Gemini format
    const geminiContents = [];
    
    // Add system instruction as first user message context
    geminiContents.push({
      role: "user",
      parts: [{ text: systemPrompt }],
    });
    geminiContents.push({
      role: "model",
      parts: [{ text: "Understood. I am ResQAI, ready to assist with disaster response." }],
    });

    // Add conversation messages
    for (const msg of messages) {
      geminiContents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: geminiContents,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("Gemini API error:", response.status, t);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Transform Gemini SSE stream to OpenAI-compatible SSE stream
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
      try {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let newlineIdx: number;
          while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
            const line = buffer.slice(0, newlineIdx).trim();
            buffer = buffer.slice(newlineIdx + 1);

            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6);
            if (jsonStr === "[DONE]") continue;

            try {
              const parsed = JSON.parse(jsonStr);
              const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                // Re-emit as OpenAI-compatible SSE
                const chunk = {
                  choices: [{ delta: { content: text } }],
                };
                await writer.write(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
              }
            } catch { /* skip malformed chunks */ }
          }
        }
        await writer.write(encoder.encode("data: [DONE]\n\n"));
      } catch (e) {
        console.error("Stream error:", e);
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("resqai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
