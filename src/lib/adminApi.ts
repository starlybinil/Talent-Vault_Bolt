import { supabase } from './supabase';

// Check if current user is admin
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

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

// Check if current user is super admin
export async function checkIsSuperAdmin(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from('admin_users')
      .select('role, is_active')
      .eq('auth_user_id', user.id)
      .eq('is_active', true)
      .single();

    return data?.role === 'super_admin';
  } catch (error) {
    console.error('Error checking super admin status:', error);
    return false;
  }
}

// Get admin user profile
export async function getAdminProfile() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('auth_user_id', user.id)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting admin profile:', error);
    return null;
  }
}

// Log admin activity
export async function logAdminActivity(
  action: string,
  entityType?: string,
  entityId?: string,
  details?: any
) {
  try {
    await supabase.rpc('log_admin_activity', {
      p_action: action,
      p_entity_type: entityType || null,
      p_entity_id: entityId || null,
      p_details: details || {}
    });
  } catch (error) {
    console.error('Error logging admin activity:', error);
  }
}

// Get system statistics
export async function getSystemStats() {
  try {
    const [
      { count: totalCandidates },
      { count: totalEmployers },
      { count: pendingRequests }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('type', 'candidate'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('type', 'employer'),
      supabase.from('access_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending')
    ]);

    return {
      totalCandidates: totalCandidates || 0,
      totalEmployers: totalEmployers || 0,
      totalUsers: (totalCandidates || 0) + (totalEmployers || 0),
      pendingRequests: pendingRequests || 0
    };
  } catch (error) {
    console.error('Error getting system stats:', error);
    return {
      totalCandidates: 0,
      totalEmployers: 0,
      totalUsers: 0,
      pendingRequests: 0
    };
  }
}

// Manage user account status
export async function updateUserStatus(userId: string, isActive: boolean) {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: isActive })
      .eq('user_id', userId);

    if (error) throw error;

    await logAdminActivity(
      isActive ? 'user_activated' : 'user_deactivated',
      'user',
      userId,
      { status: isActive }
    );

    return { success: true };
  } catch (error) {
    console.error('Error updating user status:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}