import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, location, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langInstructions: Record<string, string> = {
      en: `LANGUAGE REQUIREMENT: You MUST respond ONLY in English. Every single word must be in English.`,
      hi: `LANGUAGE REQUIREMENT: आपको केवल हिंदी में जवाब देना है। हर शब्द देवनागरी लिपि में होना चाहिए। अंग्रेजी का उपयोग न करें।`,
      or: `LANGUAGE REQUIREMENT (CRITICAL - HIGHEST PRIORITY): 
You MUST respond EXCLUSIVELY in Odia language using Odia/Oriya script (ଓଡ଼ିଆ).
- Every single word, sentence, and character in your response MUST be in Odia script.
- DO NOT use English, Hindi, or any other language.
- DO NOT mix languages — 100% Odia response only.
- Use proper Odia vocabulary for disaster/emergency terms.
- If you don't know an Odia word, use the closest Odia equivalent.
- The user ONLY reads Odia script. English or Hindi will be USELESS to them.
- Example Odia words: ସୁରକ୍ଷା (safety), ବନ୍ୟା (flood), ଆଶ୍ରୟ (shelter), ଜରୁରୀ (emergency), ସ୍ଥଳ ଖାଲି କରନ୍ତୁ (evacuate)`,
    };

    const systemPrompt = `You are ResQAI, an emergency disaster response AI assistant. You provide critical, life-saving guidance during natural disasters.

Your capabilities:
- Earthquake safety protocols (Drop, Cover, Hold On)
- Flood evacuation procedures  
- Wildfire safety and evacuation routes
- Storm/cyclone preparedness
- First aid guidance
- Shelter location information
- Risk assessment based on location

Rules:
- Always prioritize life safety above all else
- Give clear, numbered, actionable steps
- Be concise but thorough — lives depend on clarity
- If location coordinates are provided, reference them in your guidance
- Use emergency formatting: bold key actions, use warning emojis for critical info
- Always end with a safety message translated to the response language

${langInstructions[language] || langInstructions.en}

${location ? `User's current location: ${location.lat}, ${location.lng}` : ""}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("resqai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
