import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import { supabase } from '@/src/services/supabase';

/**
 * Check if Apple Authentication is available on the current device
 * Apple Sign In is only available on iOS devices
 */
export const isAppleAuthAvailable = async (): Promise<boolean> => {
  console.log('isAppleAuthAvailable: Platform.OS =', Platform.OS);
  
  if (Platform.OS !== 'ios') {
    console.log('isAppleAuthAvailable: Not iOS, returning false');
    return false;
  }
  
  try {
    const available = await AppleAuthentication.isAvailableAsync();
    console.log('isAppleAuthAvailable: AppleAuthentication.isAvailableAsync() =', available);
    return available;
  } catch (error) {
    console.error('Error checking Apple Auth availability:', error);
    return false;
  }
};

/**
 * Sign in with Apple using native authentication
 * Returns user, session, and error information similar to Google auth service
 */
export const signInWithApple = async () => {
  try {
    console.log('Starting Apple sign-in');
    
    // Check if Apple Authentication is available
    const available = await isAppleAuthAvailable();
    if (!available) {
      console.error('Apple Sign In not available on this platform');
      return {
        user: null,
        session: null,
        error: { message: 'Apple Sign In not available on this platform' },
        appleUser: null
      };
    }

    // Perform Apple sign-in
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      // Following the same pattern as Google auth - not using nonce to avoid validation issues
    });

    console.log('Apple sign-in successful:', {
      email: credential.email || 'No email (may be hidden)',
      fullName: credential.fullName || 'No name provided',
      hasIdentityToken: !!credential.identityToken
    });

    // Check if we got an identity token
    if (!credential.identityToken) {
      console.error('No identity token received from Apple');
      return {
        user: null,
        session: null,
        error: { message: 'No identity token received from Apple' },
        appleUser: null
      };
    }

    // Sign in to Supabase using the Apple identity token
    console.log('Authenticating with Supabase using Apple identity token');
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
      // Not using nonce to avoid validation issues (same approach as Google auth)
    });

    if (error) {
      console.error('Supabase authentication error:', error);
      return {
        user: null,
        session: null,
        error,
        appleUser: null
      };
    }

    console.log('Supabase authentication successful:', {
      userId: data.user?.id,
      email: data.user?.email
    });

    return {
      user: data.user,
      session: data.session,
      error: null,
      appleUser: {
        email: credential.email,
        fullName: credential.fullName,
        user: credential.user
      }
    };

  } catch (error: any) {
    console.error('Apple sign-in error:', error);
    
    // Handle specific Apple Authentication errors
    if (error.code === 'ERR_CANCELED') {
      return {
        user: null,
        session: null,
        error: { message: 'Sign-in was cancelled' },
        appleUser: null
      };
    } else {
      return {
        user: null,
        session: null,
        error: error,
        appleUser: null
      };
    }
  }
};

/**
 * Check current Apple authentication state
 * Note: Apple doesn't provide a direct way to check if user is signed in
 * This is mainly for compatibility with the auth pattern
 */
export const isAppleSignedIn = async (): Promise<boolean> => {
  try {
    // Apple doesn't provide a direct way to check authentication state
    // We rely on Supabase session for authentication state
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error('Error checking Apple sign-in status:', error);
    return false;
  }
};

export { AppleAuthentication };
