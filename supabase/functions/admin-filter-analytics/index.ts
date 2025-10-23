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

    // Get all filter tracking data
    const { data: filterData, error: filterError } = await supabaseAdmin
      .from('filter_tracking')
      .select('filter_combination, timestamp')
      .order('timestamp', { ascending: false })
      .limit(1000) // Limit to recent 1000 entries for performance

    if (filterError) throw filterError

    // Process filter combinations to extract most common values
    const filterCounts: Record<string, Record<string, number>> = {}
    const dailyUsage: Record<string, number> = {}

    filterData?.forEach(entry => {
      const combination = entry.filter_combination as any
      const date = new Date(entry.timestamp).toISOString().split('T')[0]
      
      // Count daily usage
      dailyUsage[date] = (dailyUsage[date] || 0) + 1

      // Process each filter type in the combination
      Object.entries(combination || {}).forEach(([filterType, filterValue]) => {
        if (!filterValue) return
        
        if (!filterCounts[filterType]) {
          filterCounts[filterType] = {}
        }

        // Handle array values (like technical_skills, nationality_status)
        if (Array.isArray(filterValue)) {
          filterValue.forEach(value => {
            if (value && value.trim()) {
              filterCounts[filterType][value] = (filterCounts[filterType][value] || 0) + 1
            }
          })
        } else if (typeof filterValue === 'string' && filterValue.trim()) {
          filterCounts[filterType][filterValue] = (filterCounts[filterType][filterValue] || 0) + 1
        }
      })
    })

    // Convert to most common filters array
    const mostCommonFilters: Array<{
      filter_type: string;
      filter_value: string;
      usage_count: number;
    }> = []

    Object.entries(filterCounts).forEach(([filterType, values]) => {
      Object.entries(values).forEach(([value, count]) => {
        mostCommonFilters.push({
          filter_type: formatFilterType(filterType),
          filter_value: value,
          usage_count: count
        })
      })
    })

    // Sort by usage count and take top 10
    mostCommonFilters.sort((a, b) => b.usage_count - a.usage_count)
    const topFilters = mostCommonFilters.slice(0, 10)

    // Convert daily usage to time series (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const filterUsageOverTime = []
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      
      filterUsageOverTime.push({
        date: dateStr,
        count: dailyUsage[dateStr] || 0
      })
    }

    // Helper function to format filter type names
    function formatFilterType(filterType: string): string {
      const typeMap: Record<string, string> = {
        'nationality_status': 'Work Authorization',
        'employment_type': 'Employment Type',
        'technical_skills': 'Technical Skills',
        'educationLevel': 'Education Level',
        'lastActive': 'Last Active'
      }
      
      return typeMap[filterType] || filterType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }

    return new Response(
      JSON.stringify({
        mostCommonFilters: topFilters,
        filterUsageOverTime
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Admin filter analytics error:', error)
    
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