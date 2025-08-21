import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/src/services/AuthContext';
import { styled } from 'nativewind';
import { palette } from '@/constants/Colors';

const StyledView = styled(View);
const StyledText = styled(Text);

export default function OAuthCallbackScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();

  useEffect(() => {
    console.log('OAuth callback received with params:', params);
    
    // Check if we have an authenticated user
    if (user) {
      console.log('OAuth callback: User authenticated, redirecting to main app');
      // Redirect to main app after successful authentication
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1000);
    } else {
      console.log('OAuth callback: No user found, redirecting to login');
      // If no user is found, redirect back to login after a brief delay
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 2000);
    }
  }, [user, params, router]);

  return (
    <StyledView className="flex-1 bg-white items-center justify-center px-6">
      <StyledView className="w-16 h-16 rounded-xl items-center justify-center mb-6" style={{ backgroundColor: palette.primary }}>
        <ActivityIndicator size="large" color="white" />
      </StyledView>
      
      <StyledText className="text-xl font-semibold text-center mb-2">
        Completing Sign-In
      </StyledText>
      
      <StyledText className="text-gray-600 text-center">
        Please wait while we finish setting up your account...
      </StyledText>
    </StyledView>
  );
} 