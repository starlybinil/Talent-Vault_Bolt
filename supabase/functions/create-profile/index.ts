import { createClient } from 'npm:@supabase/supabase-js@2.39.7'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    })
  }

  try {
    const { user_id, first_name, last_name } = await req.json()

    if (!user_id || !first_name || !last_name) {
      throw new Error('Missing required fields')
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user_id)
      .single()

    if (existingProfile) {
      return new Response(
        JSON.stringify({ 
          error: 'Profile already exists',
          data: existingProfile 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 409
        }
      )
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        user_id,
        type: 'candidate',
        first_name,
        last_name,
        technical_skills: [],
        soft_skills: [],
        projects: [],
        job_preferences: {},
        view_count: 0
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Profile creation error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})