import { supabase } from './supabase';

export async function checkIsEmployer(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from('profiles')
      .select('type')
      .eq('user_id', user.id)
      .single();

    return data?.type === 'employer';
  } catch (error) {
    console.error('Error checking employer status:', error);
    return false;
  }
}

export async function checkIsAdmin(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Check if user exists in admin_users table and is active
    const { data } = await supabase
      .from('admin_users')
      .select('id, is_active')
      .eq('auth_user_id', user.id)
      .eq('is_active', true)
      .single();
    return !!data;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}