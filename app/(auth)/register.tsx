import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Image, Platform } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '@/src/services/AuthContext';
import { useOnboarding } from '../OnboardingContext';
import { Ionicons } from '@expo/vector-icons';
import { styled } from 'nativewind';
import { palette } from '@/constants/Colors';

import i18n, { isRTL } from '@/utils/i18n';
import { getScreenName } from '@/utils/onboarding/onboardingConfig';
import * as Haptics from 'expo-haptics';

// Create styled components with NativeWind
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, signInWithGoogle, isGoogleLoading } = useAuth();
  const { setShouldSaveToStorage } = useOnboarding();
  const isArabic = isRTL();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = { 
      name: '', 
      email: '', 
      password: '', 
      confirmPassword: '' 
    };

    // Name validation
    if (!name.trim()) {
      newErrors.name = 'Name is required';
      valid = false;
    }

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      valid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      valid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    setErrors(newErrors);
    return valid; // Keep validation logic for now, though it's not used by the button
  };

  const handleGoogleSignIn = async () => {
    // Add haptic feedback when user presses the button
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      console.log('Attempting Google sign in from register screen');
      const { error } = await signInWithGoogle();
      
      if (error) {
        let userFriendlyMessage = 'An error occurred during Google sign in.';
        
        if (error.message === 'Sign-in was cancelled') {
          // Don't show error for user cancellation
          return;
        } else if (error.message === 'Google Play Services not available') {
          userFriendlyMessage = 'Google Play Services not available. Please update Google Play Services and try again.';
        } else if (error.message === 'Sign-in is already in progress') {
          userFriendlyMessage = 'Sign-in is already in progress. Please wait.';
        } else if (error.message) {
          userFriendlyMessage = 'Google sign-in failed. Please try again.';
          console.warn('Google sign-in error:', error.message);
        }
        
        Alert.alert('Google Sign-In Failed', userFriendlyMessage);
        return;
      }
      
      // If we got here, Google sign-in was successful
      console.log('Google sign-in successful from register screen, navigating to tabs');
      
      // For new Google users, we might want to direct them to onboarding
      // For now, let's send them to tabs - this can be customized later
      setTimeout(() => {
        try {
          router.replace('/(tabs)');
        } catch (navError) {
          console.error('Navigation error after Google sign-in:', navError);
          router.navigate('/(tabs)');
        }
      }, 500);
      
    } catch (error: any) {
      console.error('Google sign-in catch block error:', error);
      Alert.alert('Google Sign-In Failed', 'An unexpected error occurred during Google sign-in');
    }
  };

  const handleRegister = async () => {
    // Add haptic feedback when user presses the button
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setLoading(true);
    // Disable AsyncStorage saves during onboarding for better performance
    setShouldSaveToStorage(false);
    console.log('[Register] Disabled AsyncStorage saves for onboarding performance');
    
    // Navigate to page 1 of the new onboarding system
    const firstPageScreen = getScreenName(1);
    if (firstPageScreen) {
      router.push(`/(onboarding)/${firstPageScreen}`);
    }
    setLoading(false);
  };

  const handleAppleSignIn = () => {
    // Add haptic feedback when user presses the button
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(i18n.t('auth.comingSoon.title'), i18n.t('auth.comingSoon.appleSignIn'));
  };

  return (
    <StyledView className="flex-1 bg-white">
      {/* Main content area */}
      <StyledView className="flex-1 px-6 py-10 justify-center">
        {/* Dashboard Preview and Title */}
        <StyledView className="items-center mb-8">
          {/* Dashboard Preview Image */}
          <StyledView className="mb-6">
            <Image 
              source={require('@/assets/images/dashboard-preview.png')} 
              style={{ width: 422, height: 528 }} 
              resizeMode="contain"
            />
          </StyledView>
          <StyledText className="text-3xl font-bold text-center mb-2" style={{ textAlign: 'center' }}>{i18n.t('auth.braceYourself')}</StyledText>
          <StyledText className="text-2xl font-bold text-center" style={{ textAlign: 'center' }}>{i18n.t('auth.forWhatsNext')}</StyledText>
        </StyledView>
        
        {/* Buttons Container */}
        <StyledView className="space-y-4">
          {/* Get Started button - matches onboarding style */}
          <StyledTouchableOpacity 
            className="py-5 px-4 rounded-full items-center"
            style={{ backgroundColor: palette.primary }}
            onPress={handleRegister}
          >
            <StyledText className="text-white text-lg font-semibold">{i18n.t('auth.getStarted')}</StyledText>
          </StyledTouchableOpacity>
          

        </StyledView>
      </StyledView>

      {/* Login link at bottom - matches onboarding bottom layout */}
      <StyledView className="px-6 py-8 bg-white border-t border-gray-200">
        <StyledView className="items-center">
          <StyledTouchableOpacity onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/(auth)/login');
          }}> 
            <StyledText className="text-lg font-semibold" style={{ color: palette.primary, textAlign: 'center' }}>{i18n.t('auth.logIn')}</StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      </StyledView>
    </StyledView>
  );
}

// Styles are now handled by NativeWind classes
