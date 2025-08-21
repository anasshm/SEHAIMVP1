import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { supabase, signInWithEmail, signUpWithEmail, signOut as supabaseSignOut, getCurrentUser, getCurrentSession } from './supabase';
import { signInWithGoogle as googleSignIn, signOutFromGoogle, configureGoogleSignIn } from '../../services/googleAuthService';
import { User, Session } from '@supabase/supabase-js'; // Import User and Session types

// Define the shape of our auth context
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isGoogleLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, metadata?: { name?: string }) => Promise<{ error: any | null }>;
  signInWithGoogle: () => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any | null }>;
  signInWithTestUser: (testEmail: string) => void; // Added for test user
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isGoogleLoading: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signInWithGoogle: async () => ({ error: null }),
  signOut: async () => {},
  resetPassword: async () => ({ error: null }),
  signInWithTestUser: () => {}, // Added for test user
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component that wraps the app and makes auth object available
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); // Use User type
  const [session, setSession] = useState<Session | null>(null); // Use Session type
  const [isLoading, setIsLoading] = useState(true);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Check if user is logged in on mount and set up auth state listener
  useEffect(() => {
    // Configure Google Sign-In on app startup
    configureGoogleSignIn();
    
    // Get the current user and session asynchronously
    const fetchUserAndSession = async () => {
      try {
        const currentUser = await getCurrentUser();
        console.log('Current user on mount:', currentUser);
        
        const currentSession = await getCurrentSession();
        console.log('Current session on mount:', currentSession);
        
        setUser(currentUser);
        setSession(currentSession);
      } catch (error) {
        console.error('Error fetching auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserAndSession();

    // Set up a listener for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', { event, session });
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Clean up the subscription when the component unmounts
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Sign in function using our helper function
  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in with:', email);
      const { user, session, error } = await signInWithEmail(email, password);
      
      if (error) {
        console.warn('Sign in error (AuthContext):', error);
        return { error };
      }
      
      console.log('Sign in successful:', { user, session });
      return { error: null };
    } catch (error) {
      console.warn('Sign in error (AuthContext):', error);
      return { error };
    }
  };

  // Sign up function using our helper function
  const signUp = async (email: string, password: string, metadata?: { name?: string }) => {
    try {
      console.log('Attempting sign up with:', { email });
      const { user, error, session } = await signUpWithEmail(email, password, metadata);
      
      console.log('Sign up response:', { 
        user: user ? 'User exists' : 'No user', 
        error: error ? error.message : 'No error',
        session: session ? 'Session exists' : 'No session'
      });
      
      if (user) {
        // Manually update the state
        setUser(user);
        setSession(session);
      }
      
      return { error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error };
    }
  };

  // Google Sign-In function
  const signInWithGoogle = async () => {
    try {
      setIsGoogleLoading(true);
      console.log('Attempting Google sign in');
      
      const { user, session, error, googleUser } = await googleSignIn();
      
      if (error) {
        console.warn('Google sign in error (AuthContext):', error);
        return { error };
      }
      
      if (user && session) {
        console.log('Google sign in successful:', { 
          email: user.email, 
          name: googleUser?.name 
        });
        // State will be updated by the auth state listener
        return { error: null };
      } else {
        const noSessionError = { message: 'No session created' };
        console.warn('Google sign in error - no session:', noSessionError);
        return { error: noSessionError };
      }
    } catch (error) {
      console.warn('Google sign in error (AuthContext):', error);
      return { error };
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Sign out function using our helper function
  const signOut = async () => {
    try {
      console.log('Attempting sign out');
      
      // Sign out from Google if signed in
      await signOutFromGoogle();
      
      const { error } = await supabaseSignOut();
      
      if (!error) {
        // Manually clear the state
        setUser(null);
        setSession(null);
        console.log('Sign out successful');
      } else {
        console.error('Sign out error:', error);
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Reset password function using Supabase v2
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'sehai.createvalue.app://reset-password',
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  // Test user sign-in function
  const signInWithTestUser = (testEmail: string) => {
    console.log('Signing in with test user:', testEmail);
    const mockUserId = `test-user-${Date.now()}`;
    const mockUser: User = {
      id: mockUserId,
      app_metadata: { provider: 'email' },
      user_metadata: { name: testEmail.split('@')[0] || 'Test User' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: testEmail,
      // Add any other fields your app might expect on the user object
    } as User; // Type assertion might be needed if not all User fields are mocked

    // Create a simplified mock session
    const mockSession: Session = {
      access_token: `mock_access_token_${Date.now()}`,
      refresh_token: `mock_refresh_token_${Date.now()}`,
      expires_in: 3600,
      token_type: 'bearer',
      user: mockUser,
    };

    setUser(mockUser);
    setSession(mockSession);
    setIsLoading(false);
    console.log('Test user session created:', { user: mockUser, session: mockSession });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isGoogleLoading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPassword,
        signInWithTestUser, // Added to provider value
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
