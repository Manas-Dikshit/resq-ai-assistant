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
4. ଆପଦ ଶବ୍ଦ: ସୁରକ୍ଷା, ବନ୍ୟା, ଆଶ୍ରୟ, ଜରୁରୀ, ଭୂକମ୍ପ, ଘୂର୍ଣ୍ଣିବାୟୁ, ଅଗ୍ନି, ଭୂସ୍ଖଳନ।
5. ଉତ୍ତର ସ୍ପଷ୍ଟ ଓ ସରଳ ଓଡ଼ିଆରେ ହେବ।
6. ସମ୍ପୂର୍ଣ୍ଣ ଓଡ଼ିଆ ହେବ।`,
    };

    const systemPrompt = `You are ResQAI — an expert emergency disaster response AI assistant serving Odisha, India and the broader region. Your mission is to save lives.

Your expertise covers:
  - Flood evacuation procedures and river level warnings
  - Landslide zones and slope safety advisories
  - Cyclone preparedness and coastal evacuation routes
  - Wildfire safety and fire escape protocols
  - Earthquake safety (Drop, Cover, Hold On)
  - First aid guidance and medical triage basics
  - Shelter locations, capacity and directions
  - Risk assessment based on GPS coordinates
  - SOS protocols and emergency contact numbers

Response rules:
- ALWAYS prioritise life safety above all else
- Provide clear, numbered, actionable steps
- Be concise but thorough — lives depend on clarity
- Use ⚠️ for critical warnings, ✅ for safe actions, 🆘 for emergencies
- If coordinates are provided, reference the specific location
- End every response with a translated safety reminder
- For Odisha: reference OSDMA, NDRF, and local helpline 1070

${langInstructions[language] || langInstructions.en}

${location ? `📍 User's GPS location: Lat ${location.lat}, Lng ${location.lng} — provide location-specific guidance for this area.` : ""}`;

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
        temperature: 0.3,
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
