import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClientOptions } from '@supabase/supabase-js';
import Constants from "expo-constants";

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl as string;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnon as string;

// Define the type for Supabase client options to ensure type safety
const options: SupabaseClientOptions<"public"> = {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Important for Expo Router to prevent issues with URL-based session recovery
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, options);
