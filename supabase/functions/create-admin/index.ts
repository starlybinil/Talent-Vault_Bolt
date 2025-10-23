import { createClient } from 'npm:@supabase/supabase-js@2.39.3'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, ApiKey, Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 200,
    })
  }

  try {
    const { email, password, username, role = 'admin', use_existing_user = false } = await req.json()

    if (!email || !password || !username) {
      throw new Error('Missing required fields: email, username')
    }

    if (!use_existing_user && !password) {
      throw new Error('Password is required when creating new user')
    }

    // Validate role
    if (!['admin', 'super_admin'].includes(role)) {
      throw new Error('Invalid role. Must be admin or super_admin')
    }

    console.log('Creating admin user:', { email, username, role })

    let authUserId: string

    if (use_existing_user) {
      // Find existing auth user
      const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()
      
      if (listError) {
        console.error('Error listing users:', listError)
        throw listError
      }

      const existingUser = existingUsers.users.find(u => u.email === email)
      if (!existingUser) {
        throw new Error(`No existing auth user found with email: ${email}`)
      }

      authUserId = existingUser.id
      console.log('Using existing auth user:', authUserId)
    } else {
      // Create new auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

      if (authError) {
        console.error('Auth creation error:', authError)
        throw authError
      }
      
      if (!authData.user) {
        throw new Error('Failed to create auth user')
      }

      authUserId = authData.user.id
      console.log('Auth user created successfully:', authUserId)
    }

    // Check if admin user already exists
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('id')
      .eq('auth_user_id', authUserId)
      .maybeSingle()

    if (existingAdmin) {
      throw new Error('Admin user record already exists for this auth user')
    }

    // Create admin user record
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .insert({
        auth_user_id: authUserId,
        username,
        email,
        role,
        is_active: true,
        password_changed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (adminError) {
      console.error('Admin user creation error:', adminError)
      
      // Only cleanup if we created a new auth user
      if (!use_existing_user) {
        try {
          await supabase.auth.admin.deleteUser(authUserId)
        } catch (cleanupError) {
          console.error('Failed to cleanup auth user:', cleanupError)
        }
      }
      throw adminError
    }

    console.log('Admin user record created successfully:', adminData.id)

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Admin user created successfully',
      admin_user_id: adminData.id,
      auth_user_id: authUserId,
      username,
      email,
      role
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Admin creation error:', error)
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error instanceof Error ? error.stack : undefined
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})