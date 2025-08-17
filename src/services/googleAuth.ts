import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';

// Complete auth session for web browsers
WebBrowser.maybeCompleteAuthSession();

// Google Sign-In function using Supabase OAuth
export const signInWithGoogle = async () => {
  try {
    console.log('Starting Google sign-in with Supabase OAuth');
    
    // Use Supabase's built-in OAuth with redirect
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'foodnsap://auth/callback',
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      console.error('Supabase OAuth error:', error);
      return { 
        user: null, 
        session: null, 
        error: error, 
        googleUser: null 
      };
    }

    console.log('OAuth URL generated:', data.url);
    
    // Open the OAuth URL in browser
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      'foodnsap://auth/callback'
    );

    console.log('WebBrowser result:', result);

    if (result.type === 'success') {
      // The auth state will be updated by Supabase's auth state listener
      // We return success here and let the AuthContext handle the session
      return {
        user: null, // Will be set by auth state listener
        session: null, // Will be set by auth state listener
        error: null,
        googleUser: null
      };
    } else if (result.type === 'cancel') {
      console.log('Google sign-in cancelled by user');
      return { 
        user: null, 
        session: null, 
        error: { message: 'Sign-in was cancelled' }, 
        googleUser: null 
      };
    } else {
      console.error('Google sign-in failed:', result);
      return { 
        user: null, 
        session: null, 
        error: { message: 'Google sign-in failed' }, 
        googleUser: null 
      };
    }

  } catch (error: any) {
    console.error('Google sign-in error:', error);
    
    // Handle specific errors
    if (error.message?.includes('cancelled')) {
      return { user: null, session: null, error: { message: 'Sign-in was cancelled' }, googleUser: null };
    } else if (error.message?.includes('network')) {
      return { user: null, session: null, error: { message: 'Network error. Please check your connection.' }, googleUser: null };
    } else {
      return { user: null, session: null, error: error, googleUser: null };
    }
  }
};

// Configure Google Sign-In (simplified for Supabase OAuth)
export const configureGoogleSignIn = () => {
  console.log('Google Sign-In configured with Supabase OAuth');
  // No additional configuration needed for Supabase OAuth
};

// Sign out from Google (handled by Supabase)
export const signOutFromGoogle = async () => {
  try {
    console.log('Google sign-out (handled by Supabase)');
    // Supabase handles OAuth sign-out automatically
  } catch (error) {
    console.error('Google sign-out error:', error);
  }
};

// Check if user is signed in to Google
export const isGoogleSignedIn = async (): Promise<boolean> => {
  try {
    // Check if there's a valid Supabase session from Google
    const { data: { session } } = await supabase.auth.getSession();
    const isGoogleUser = session?.user?.app_metadata?.provider === 'google';
    return !!session && isGoogleUser;
  } catch (error) {
    console.error('Error checking Google sign-in status:', error);
    return false;
  }
};

// Get current Google user info
export const getCurrentGoogleUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.app_metadata?.provider === 'google') {
      return {
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name,
        picture: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting current Google user:', error);
    return null;
  }
}; 