import { createClient } from 'npm:@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

    // Get all candidate profiles with technical skills using service role (bypasses RLS)
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('technical_skills')
      .eq('type', 'candidate')
      .not('technical_skills', 'is', null)

    if (profilesError) throw profilesError

    // Aggregate skills from all profiles
    const skillCounts: Record<string, number> = {}
    let totalProfiles = 0
    let profilesWithSkills = 0

    profiles?.forEach(profile => {
      totalProfiles++
      
      let skills: string[] = []
      
      // Handle different formats of technical_skills
      if (Array.isArray(profile.technical_skills)) {
        skills = profile.technical_skills
      } else if (typeof profile.technical_skills === 'string') {
        try {
          const parsed = JSON.parse(profile.technical_skills)
          skills = Array.isArray(parsed) ? parsed : []
        } catch {
          // If it's not valid JSON, treat as empty array
          skills = []
        }
      }

      if (skills.length > 0) {
        profilesWithSkills++
        
        skills.forEach(skill => {
          if (typeof skill === 'string' && skill.trim()) {
            const cleanSkill = skill.trim()
            skillCounts[cleanSkill] = (skillCounts[cleanSkill] || 0) + 1
          }
        })
      }
    })

    // Convert to array and sort by count
    const topSkills = Object.entries(skillCounts)
      .map(([skill, count]) => ({
        skill,
        count,
        percentage: Math.round((count / profilesWithSkills) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20) // Top 20 skills

    // Calculate summary statistics
    const totalUniqueSkills = Object.keys(skillCounts).length
    const averageSkillsPerProfile = profilesWithSkills > 0 
      ? Math.round(Object.values(skillCounts).reduce((sum, count) => sum + count, 0) / profilesWithSkills)
      : 0

    // Calculate active users in last 24 hours
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)
    
    const { count: activeUsersCount, error: activeUsersError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_viewed_at', twentyFourHoursAgo.toISOString())

    if (activeUsersError) {
      console.error('Error getting active users count:', activeUsersError)
    }

    return new Response(
      JSON.stringify({
        topSkills,
        summary: {
          totalProfiles,
          profilesWithSkills,
          totalUniqueSkills,
          averageSkillsPerProfile,
          activeUsersLast24h: activeUsersCount || 0
        }
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Admin skills analytics error:', error)
    
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