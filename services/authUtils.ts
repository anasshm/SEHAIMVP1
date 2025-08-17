import { supabase as mainSupabase } from '@/src/services/supabase';
import { supabase as dbSupabase } from '@/services/db';
import { useAuth } from '@/src/services/AuthContext';

/**
 * Synchronizes the session between different Supabase client instances
 * This helps ensure that authentication state is consistent across the app
 */
export const syncSupabaseAuth = async (): Promise<void> => {
  try {
    // Get the current session from the main client
    const { data: { session } } = await mainSupabase.auth.getSession();
    
    if (session) {
      // If we have a session, set it on the db client as well
      await dbSupabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token
      });
      console.log('Supabase auth synchronized successfully');
    } else {
      console.log('No active session to synchronize');
    }
  } catch (error) {
    console.error('Error synchronizing Supabase auth:', error);
  }
};

/**
 * Hook that provides the current user and a function to sync auth
 * Use this in components that need to access the user and ensure auth is synced
 */
export const useAuthSync = () => {
  const { user } = useAuth();
  
  return {
    user,
    syncAuth: syncSupabaseAuth
  };
};
