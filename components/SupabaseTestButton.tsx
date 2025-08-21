import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { supabase } from '@/services/db';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { syncSupabaseAuth } from '@/services/authUtils';

export function SupabaseTestButton() {
  const router = useRouter();
  const testSupabase = async () => {
    try {
      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      console.log('Testing Supabase connection...');
      
      // Synchronize authentication between Supabase clients
      await syncSupabaseAuth();
      
      // First test auth
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Auth session test:', session ? 'Session exists' : 'No session');
      
      if (!session) {
        // Provide warning haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        
        Alert.alert(
          'Authentication Required',
          'You need to sign in to test the full Supabase connection. Would you like to sign in now?',
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Sign In',
              onPress: () => {
                // Navigate to sign in screen
                router.push('/signin');
              }
            }
          ]
        );
        return;
      }
      
      // Test database connection
      const { data, error } = await supabase.from('food_items').select('*').limit(1);
      
      console.log('Supabase test result:', { 
        data: data ? `${data.length} items retrieved` : 'No data', 
        error: error ? error.message : 'No error' 
      });
      
      // Provide success haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        'Supabase Connection Test',
        error 
          ? `Failed: ${error.message}` 
          : `Success! Database and auth connection working.\n${data ? `Retrieved ${data.length} food items.` : 'No food items found (empty table).'}`
      );
    } catch (err: any) {
      console.error('Supabase test error:', err);
      
      // Provide error haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      Alert.alert(
        'Supabase Connection Error',
        `Error: ${err?.message || 'Unknown error'}`
      );
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={testSupabase}>
      <Text style={styles.buttonText}>Test Supabase Connection</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});
