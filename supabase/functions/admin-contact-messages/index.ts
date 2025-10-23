import { createClient } from 'npm:@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create a Supabase client with the service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Create a client to verify the user's token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify the user's JWT and check if they're an admin
    const { data: { user }, error: verifyError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (verifyError || !user) {
      throw new Error('Invalid token')
    }

    // Check if user is an admin
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('id, is_active')
      .eq('auth_user_id', user.id)
      .eq('is_active', true)
      .maybeSingle()

    if (adminError || !adminUser) {
      throw new Error('Access denied: Admin privileges required')
    }

    // Handle different HTTP methods
    if (req.method === 'GET') {
      // Get all contact messages using service role (bypasses RLS)
      const { data: messages, error: messagesError } = await supabaseAdmin
        .from('contact_messages')
        .select('*')
        .eq('status', 'unread')
        .order('created_at', { ascending: false })

      if (messagesError) throw messagesError

      return new Response(
        JSON.stringify(messages || []),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    if (req.method === 'PUT') {
      // Update message status
      const { messageId, status } = await req.json()
      
      if (!messageId || !status) {
        throw new Error('Missing messageId or status')
      }

      const { error: updateError } = await supabaseAdmin
        .from('contact_messages')
        .update({ status })
        .eq('id', messageId)

      if (updateError) throw updateError

      // Log the activity
      await supabaseAdmin
        .from('admin_activity_logs')
        .insert({
          admin_user_id: adminUser.id,
          action: `message_${status}`,
          entity_type: 'contact_message',
          entity_id: messageId,
          details: { status }
        })

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    throw new Error('Method not allowed')

  } catch (error) {
    console.error('Admin contact messages error:', error)
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})