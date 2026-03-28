import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { query } = await req.json()

        // 1. Initialize Supabase Client
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 2. Fetch full knowledge base from Supabase
        const { data: kbData, error: kbError } = await supabase
            .from('suite_config')
            .select('knowledge_base')
            .eq('id', 'main')
            .single();
        if (kbError) throw kbError;
        const knowledgeBase = kbData?.knowledge_base ?? [];

        // 3. Build prompt for Gemini
        const systemPrompt = "Eres el asistente experto de las asesoras comerciales de 440 Clinic y del Dr. Gio. Responde a la pregunta del usuario utilizando ÚNICAMENTE la siguiente base de conocimientos. Si la respuesta no está en el texto proporcionado, indica que deben consultar directamente con el cirujano. Sé amable, conciso y profesional.";
        const kbText = knowledgeBase.map((k: any) => `Título: ${k.title}\nContenido: ${k.content}`).join("\n---\n");
        const prompt = `${systemPrompt}\n\nBase de conocimientos:\n${kbText}\n\nPregunta: ${query}`;

        // 4. Call Gemini API
        const geminiApiKey = Deno.env.get('GEMINI_API_KEY') ?? '';
        if (!geminiApiKey) throw new Error('Missing GEMINI_API_KEY secret');
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] })
        });
        if (!geminiResponse.ok) {
            const errText = await geminiResponse.text();
            throw new Error(`Gemini API error ${geminiResponse.status}: ${errText}`);
        }
        const geminiData = await geminiResponse.json();
        const answer = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No se obtuvo respuesta.";

        return new Response(
            JSON.stringify({
                answer: answer
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
