import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  global: {
    headers: {
      'X-Client-Info': 'talentvault@1.0.0',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  },
  db: {
    schema: 'public'
  }
})

// Add error handling for storage operations
export async function getStorageUrl(bucket: string, path: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .getPublicUrl(path)
    
    if (error) {
      console.error('Error getting storage URL:', error)
      throw error
    }

    if (!data?.publicUrl) {
      throw new Error('No public URL returned from storage')
    }

    return data.publicUrl
  } catch (error) {
    console.error('Failed to get storage URL:', error)
    throw error
  }
}