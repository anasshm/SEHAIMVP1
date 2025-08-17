import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Supabase URL and anon key
const supabaseUrl = 'https://zytvlzdocsiqnyhjhcbs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5dHZsemRvY3NpcW55aGpoY2JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3OTc5NzUsImV4cCI6MjA2MTM3Mzk3NX0.QqNoGgZEZhwmFj6CegGI2nf__FiKeWhVcLyPDItP_XE';

// Initialize the Supabase client with v2 API
export const supabase = createClient(
  supabaseUrl, 
  supabaseAnonKey, 
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  }
);

// Helper functions for authentication
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { user: data?.user || null, session: data?.session || null, error };
};

export const signUpWithEmail = async (email: string, password: string, metadata?: object) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata }
  });
  return { user: data?.user || null, session: data?.session || null, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
};

export const getCurrentSession = async () => {
  const { data } = await supabase.auth.getSession();
  return data?.session || null;
};

// Google OAuth function
export const signInWithGoogleOAuth = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'foodnsap://auth/callback'
    }
  });
  return { data, error };
};
