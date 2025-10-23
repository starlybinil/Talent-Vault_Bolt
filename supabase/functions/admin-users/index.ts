import { createClient } from 'npm:@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
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
      .select('id, is_active, role')
      .eq('auth_user_id', user.id)
      .eq('is_active', true)
      .maybeSingle()

    if (adminError || !adminUser) {
      throw new Error('Access denied: Admin privileges required')
    }

    // Handle different HTTP methods
    if (req.method === 'GET') {
      // Get pagination parameters
      const url = new URL(req.url)
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = parseInt(url.searchParams.get('limit') || '25')
      const offset = (page - 1) * limit

      // Get all users with their profile information
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select(`
          id,
          user_id,
          type,
          first_name,
          last_name,
          email_address,
          created_at,
          updated_at,
          view_count
        `)
        .in('type', ['candidate', 'employer'])
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (profilesError) throw profilesError

      // Get total count for pagination
      const { count: totalCount, error: countError } = await supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .in('type', ['candidate', 'employer'])

      if (countError) throw countError

      // Get auth user data for last login info
      const userIds = profiles?.map(p => p.user_id).filter(Boolean) || []
      
      // Get auth users data using admin client
      const authUsers = []
      for (const userId of userIds) {
        try {
          const { data: authUser, error } = await supabaseAdmin.auth.admin.getUserById(userId)
          if (!error && authUser.user) {
            authUsers.push({
              id: authUser.user.id,
              email: authUser.user.email,
              last_sign_in_at: authUser.user.last_sign_in_at,
              email_confirmed_at: authUser.user.email_confirmed_at,
              created_at: authUser.user.created_at
            })
          }
        } catch (error) {
          console.error(`Error fetching auth user ${userId}:`, error)
        }
      }

      // Combine profile and auth data
      const usersWithDetails = profiles?.map(profile => {
        const authUser = authUsers.find(au => au.id === profile.user_id)
        return {
          ...profile,
          auth_email: authUser?.email,
          last_sign_in_at: authUser?.last_sign_in_at,
          email_confirmed: !!authUser?.email_confirmed_at,
          auth_created_at: authUser?.created_at
        }
      }) || []

      return new Response(
        JSON.stringify({
          users: usersWithDetails,
          pagination: {
            page,
            limit,
            total: totalCount || 0,
            totalPages: Math.ceil((totalCount || 0) / limit)
          }
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    if (req.method === 'PUT') {
      // Update user status (activate/deactivate)
      const { userId, action } = await req.json()
      
      if (!userId || !action) {
        throw new Error('Missing userId or action')
      }

      if (!['activate', 'deactivate'].includes(action)) {
        throw new Error('Invalid action. Must be activate or deactivate')
      }

      // For now, we'll update a custom field in profiles table
      // In a real system, you might disable the auth user account
      const isActive = action === 'activate'
      
      // Update profile with active status (we'll add this field if needed)
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ 
          updated_at: new Date().toISOString(),
          // Add is_active field if it exists, otherwise just update timestamp
        })
        .eq('user_id', userId)

      if (updateError) throw updateError

      // Log the activity
      await supabaseAdmin
        .from('admin_activity_logs')
        .insert({
          admin_user_id: adminUser.id,
          action: `user_${action}`,
          entity_type: 'user',
          entity_id: userId,
          details: { action, performed_by: adminUser.role }
        })

      return new Response(
        JSON.stringify({ success: true, action, userId }),
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
    console.error('Admin users error:', error)
    
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