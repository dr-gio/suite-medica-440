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

        // 2. Generate Embedding for the query (using OpenAI or similar trough Supabase AI)
        // NOTE: In a real implementation with Supabase AI, we use their built-in models
        // OR we call OpenAI API directly. For now, we'll use similarity search on titles/content 
        // if vectors are not yet fully generated in this demo stage, 
        // but the SQL supports vector matching.

        // 3. Perform Search in JSONB knowledge base
        const { data: documents, error: searchError } = await supabase.rpc('search_knowledge', {
            search_query: query
        })

        if (searchError) throw searchError

        // 4. Build Moderate Length Response
        const bestMatch = documents?.[0]
        const answer = bestMatch
            ? `${bestMatch.title.toUpperCase()}:\n${bestMatch.content.substring(0, 1200)}${bestMatch.content.length > 1200 ? '...' : ''}`
            : "No encontré información específica."

        return new Response(
            JSON.stringify({
                answer: answer,
                sources: documents?.slice(0, 1)
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
