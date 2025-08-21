import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
import { supabase } from '@/src/services/supabase';

// Configure Google Sign-in with your client IDs
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!, // Web Client ID for ID token
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID!, // iOS Client ID for native auth
    offlineAccess: false, // We don't need refresh tokens for this use case
    forceCodeForRefreshToken: false,
    scopes: ['profile', 'email'], // Standard scopes for basic profile info
    // Don't include nonce to avoid Supabase nonce validation issues
  });
  
  console.log('Native Google Sign-in configured successfully');
};

// Native Google Sign-in function
export const signInWithGoogle = async () => {
  try {
    console.log('Starting native Google sign-in');
    
    // Check if Google Play Services are available (mainly for Android, but good practice)
    await GoogleSignin.hasPlayServices();
    
    // Perform the sign-in and get user info including ID token
    // Note: We're not using nonce with the current version to avoid validation issues
    const userInfo = await GoogleSignin.signIn();
    console.log('Google sign-in response:', userInfo);
    
    // Check if we have user info - handle both response structures
    const userData = userInfo.data?.user || userInfo.user;
    const idToken = userInfo.data?.idToken || userInfo.idToken;
    
    if (!userInfo || !userData) {
      console.error('No user info received from Google');
      return {
        user: null,
        session: null,
        error: { message: 'No user info received from Google' },
        googleUser: null
      };
    }
    
    console.log('Google sign-in successful:', {
      email: userData.email || 'No email',
      name: userData.name || 'No name',
      hasIdToken: !!idToken
    });
    
    // Check if we got an ID token
    if (!idToken) {
      console.error('No ID token received from Google');
      return {
        user: null,
        session: null,
        error: { message: 'No ID token received from Google' },
        googleUser: null
      };
    }
    
    // Sign in to Supabase using the Google ID token
    console.log('Authenticating with Supabase using Google ID token');
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
      // Not using nonce to avoid validation issues with current Google Sign-In setup
    });
    
    if (error) {
      console.error('Supabase authentication error:', error);
      return {
        user: null,
        session: null,
        error,
        googleUser: null
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
      googleUser: userData || null
    };
    
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    
    // Handle specific Google Sign-in errors
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      return {
        user: null,
        session: null,
        error: { message: 'Sign-in was cancelled' },
        googleUser: null
      };
    } else if (error.code === statusCodes.IN_PROGRESS) {
      return {
        user: null,
        session: null,
        error: { message: 'Sign-in is already in progress' },
        googleUser: null
      };
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return {
        user: null,
        session: null,
        error: { message: 'Google Play Services not available' },
        googleUser: null
      };
    } else {
      return {
        user: null,
        session: null,
        error: error,
        googleUser: null
      };
    }
  }
};

// Sign out from Google
export const signOutFromGoogle = async () => {
  try {
    console.log('Signing out from Google');
    
    // Check if user is signed in to Google
    const isSignedIn = await GoogleSignin.isSignedIn();
    if (isSignedIn) {
      await GoogleSignin.signOut();
      console.log('Google sign-out successful');
    } else {
      console.log('User was not signed in to Google');
    }
  } catch (error) {
    console.error('Google sign-out error:', error);
  }
};

// Check if user is signed in to Google
export const isGoogleSignedIn = async (): Promise<boolean> => {
  try {
    return await GoogleSignin.isSignedIn();
  } catch (error) {
    console.error('Error checking Google sign-in status:', error);
    return false;
  }
};

// Get current Google user info
export const getCurrentGoogleUser = async () => {
  try {
    const isSignedIn = await GoogleSignin.isSignedIn();
    if (!isSignedIn) {
      return null;
    }
    
    const userInfo = await GoogleSignin.getCurrentUser();
    if (!userInfo) {
      return null;
    }
    
    return {
      email: userInfo.user.email,
      name: userInfo.user.name,
      picture: userInfo.user.photo,
      givenName: userInfo.user.givenName,
      familyName: userInfo.user.familyName,
    };
  } catch (error) {
    console.error('Error getting current Google user:', error);
    return null;
  }
};

// Get Google access token (if needed for API calls)
export const getGoogleAccessToken = async (): Promise<string | null> => {
  try {
    const isSignedIn = await GoogleSignin.isSignedIn();
    if (!isSignedIn) {
      return null;
    }
    
    const tokens = await GoogleSignin.getTokens();
    return tokens.accessToken;
  } catch (error) {
    console.error('Error getting Google access token:', error);
    return null;
  }
};

// Revoke Google access (clears all tokens)
export const revokeGoogleAccess = async () => {
  try {
    console.log('Revoking Google access');
    await GoogleSignin.revokeAccess();
    console.log('Google access revoked successfully');
  } catch (error) {
    console.error('Error revoking Google access:', error);
  }
};

export { GoogleSigninButton };
