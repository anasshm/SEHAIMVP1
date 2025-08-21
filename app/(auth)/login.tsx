import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '@/src/services/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { styled } from 'nativewind';
import { palette } from '@/constants/Colors';
import i18n, { isRTL } from '@/utils/i18n';
import AppLogo from '@/components/ui/AppLogo';

// Create styled components with NativeWind
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledTextInput = styled(TextInput);
const StyledScrollView = styled(ScrollView);
const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView);

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signUp, signInWithGoogle, isGoogleLoading, signInWithApple, isAppleLoading } = useAuth();
  const isArabic = isRTL();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: '', password: '' };

    // Email validation
    if (!email) {
      newErrors.email = i18n.t('auth.errors.emailRequired');
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = i18n.t('auth.errors.emailInvalid');
      valid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = i18n.t('auth.errors.passwordRequired');
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = i18n.t('auth.errors.passwordMinLength');
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleGoogleSignIn = async () => {
    try {
      console.log('Attempting Google sign in');
      const { error } = await signInWithGoogle();
      
      if (error) {
        let userFriendlyMessage = i18n.t('auth.errors.unexpectedError');
        
        if (error.message === 'Sign-in was cancelled') {
          // Don't show error for user cancellation
          return;
        } else if (error.message === 'Google Play Services not available') {
          userFriendlyMessage = i18n.t('auth.errors.googlePlayServicesUnavailable');
        } else if (error.message === 'Sign-in is already in progress') {
          userFriendlyMessage = i18n.t('auth.errors.signInInProgress');
        } else if (error.message) {
          userFriendlyMessage = i18n.t('auth.errors.googleSignInFailed');
          console.warn('Google sign-in error:', error.message);
        }
        
        Alert.alert(i18n.t('auth.errors.googleSignInFailedTitle'), userFriendlyMessage);
        return;
      }
      
      // If we got here, Google sign-in was successful
      console.log('Google sign-in successful, navigating to tabs');
      
      // Force navigation to tabs after a short delay to allow state to update
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
      Alert.alert(i18n.t('auth.errors.googleSignInFailedTitle'), i18n.t('auth.errors.unexpectedError'));
    }
  };

  const handleAppleSignIn = async () => {
    try {
      console.log('Attempting Apple sign in');
      const { error } = await signInWithApple();
      
      if (error) {
        let userFriendlyMessage = i18n.t('auth.errors.unexpectedError');
        
        if (error.message === 'Sign-in was cancelled') {
          // Don't show error for user cancellation
          return;
        } else if (error.message === 'Apple Sign In not available on this platform') {
          userFriendlyMessage = 'Apple Sign In is not available on this device';
        } else if (error.message) {
          userFriendlyMessage = 'Apple Sign In failed. Please try again.';
          console.warn('Apple sign-in error:', error.message);
        }
        
        Alert.alert('Apple Sign In Failed', userFriendlyMessage);
        return;
      }
      
      // If we got here, Apple sign-in was successful
      console.log('Apple sign-in successful, navigating to tabs');
      
      // Force navigation to tabs after a short delay to allow state to update
      setTimeout(() => {
        try {
          router.replace('/(tabs)');
        } catch (navError) {
          console.error('Navigation error after Apple sign-in:', navError);
          router.navigate('/(tabs)');
        }
      }, 500);
      
    } catch (error: any) {
      console.error('Apple sign-in catch block error:', error);
      Alert.alert('Apple Sign In Failed', i18n.t('auth.errors.unexpectedError'));
    }
  };



  const handleLogin = async () => {
    // Mark all fields as touched
    setTouched({
      email: true,
      password: true,
    });

    if (!validateForm()) {
      return;
    }

    console.log('Login form validated, attempting login with:', { email });
    setLoading(true);
    
    try {
      // For testing purposes, let's create a test account if one doesn't exist
      if (email === 'test@example.com' && password === 'password123') {
        // Try to sign up first if the user doesn't exist
        const checkSignUp = await signIn(email, password);
        if (checkSignUp.error && checkSignUp.error.message.includes('Invalid login credentials')) {
          console.log('Test user does not exist, creating test account');
          await signUp(email, password, { name: 'Test User' });
          // Now try to sign in with the newly created account
          await signIn(email, password);
        }
      } else {
        // Normal login flow
        const { error } = await signIn(email, password);
        console.log('Login response received:', { error: error ? 'Error exists' : 'No error' });
        
        if (error) {
          let userFriendlyMessage = i18n.t('auth.errors.unexpectedError');
          let logMessage = error.message; // Keep original for logging

          if (error.message === 'Invalid login credentials') {
            userFriendlyMessage = i18n.t('auth.errors.invalidCredentials');
          } else if (error.message === 'Email not confirmed') {
            userFriendlyMessage = i18n.t('auth.errors.emailNotConfirmed');
          } else if (error.message) {
            // For other specific errors we might want to map in the future, or keep it generic
            // For now, if it's not one of the above, we might still show the raw message or a generic one.
            // Let's use a generic one if the message is not specifically handled.
            userFriendlyMessage = i18n.t('auth.errors.unexpectedError'); 
            // Log the actual error for debugging even if we show a generic message
            console.warn('Unhandled login error type, showing generic message. Raw error:', error.message);
          }
          
          console.log('Login failed with raw error:', logMessage, 'User message:', userFriendlyMessage);
          Alert.alert(i18n.t('auth.errors.loginFailed'), userFriendlyMessage);
          setLoading(false);
          return; // Return here to stop further processing for handled errors.
        }
      }
      
      // If we got here, login was successful
      console.log('Login successful, navigating to tabs');
      
      // Force navigation to tabs after a short delay to allow state to update
      setTimeout(() => {
        try {
          router.replace('/(tabs)');
        } catch (navError) {
          console.error('Navigation error:', navError);
          // Try alternate navigation method
          router.navigate('/(tabs)');
        }
      }, 500);
      
    } catch (error: any) {
      console.error('Login catch block error:', error);
      Alert.alert(i18n.t('auth.errors.loginFailed'), i18n.t('auth.errors.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledView className="flex-1 bg-white">
      <StyledKeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <StyledScrollView 
          className="flex-1 px-6"
          contentContainerStyle={{ paddingTop: 40, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with title */}
          <StyledView className={`flex-row items-center justify-between mb-10 ${isArabic ? 'flex-row-reverse' : ''}`}>
            <StyledTouchableOpacity 
              className="p-2" 
              onPress={() => router.replace('/(auth)/register')}
            >
              <StyledText className="text-base" style={{ color: palette.primary, textAlign: isArabic ? 'right' : 'left' }}>{i18n.t('auth.cancel')}</StyledText>
            </StyledTouchableOpacity>
            <StyledText className="text-lg font-semibold" style={{ textAlign: 'center' }}>{i18n.t('auth.login')}</StyledText>
            <StyledView className="w-14" />
          </StyledView>

          {/* App Logo */}
          <StyledView className="items-center mb-6">
            <StyledView className="mb-6">
              <AppLogo size={56} showBackground={false} />
            </StyledView>
          </StyledView>
          
          {/* Login form */}
          <StyledView className="mb-4">
            <StyledTextInput
              className="bg-gray-100 text-gray-800 p-4 rounded-md w-full"
              placeholder={i18n.t('auth.email')}
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onBlur={() => setTouched({ ...touched, email: true })}
              style={{ textAlign: isArabic ? 'right' : 'left', writingDirection: isArabic ? 'rtl' : 'ltr' }}
            />
            {touched.email && errors.email ? (
              <StyledText className="text-red-500 mt-1" style={{ textAlign: isArabic ? 'right' : 'left' }}>{errors.email}</StyledText>
            ) : null}
          </StyledView>
          
          <StyledView className="mb-2">
            <StyledTextInput
              className="bg-gray-100 text-gray-800 p-4 rounded-md w-full"
              placeholder={i18n.t('auth.password')}
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              onBlur={() => setTouched({ ...touched, password: true })}
              style={{ textAlign: isArabic ? 'right' : 'left', writingDirection: isArabic ? 'rtl' : 'ltr' }}
            />
            {touched.password && errors.password ? (
              <StyledText className="text-red-500 mt-1" style={{ textAlign: isArabic ? 'right' : 'left' }}>{errors.password}</StyledText>
            ) : null}
          </StyledView>
          
          <StyledView className={`mb-6 ${isArabic ? 'items-end' : 'items-end'}`}>
            <Link href="/(auth)/forgot-password" asChild>
              <StyledTouchableOpacity className="py-2">
                <StyledText className="text-sm font-bold" style={{ color: palette.primary, textAlign: isArabic ? 'right' : 'right' }}>{i18n.t('auth.forgotPassword')}</StyledText>
              </StyledTouchableOpacity>
            </Link>
          </StyledView>
          
          <StyledTouchableOpacity 
            className="py-5 px-4 rounded-full items-center mb-6"
            style={{ backgroundColor: palette.primary }}
            onPress={handleLogin}
            disabled={loading}
          >
            <StyledText className="text-white text-lg font-semibold">
              {loading ? i18n.t('auth.loggingIn') : i18n.t('auth.login')}
            </StyledText>
          </StyledTouchableOpacity>
          
          <StyledView className="flex-row items-center mb-6">
            <StyledView className="flex-1 h-px bg-gray-200" />
            <StyledText className="mx-4 text-gray-500 text-sm">{i18n.t('auth.or')}</StyledText>
            <StyledView className="flex-1 h-px bg-gray-200" />
          </StyledView>
          
          <StyledTouchableOpacity 
            className={`flex-row bg-white border-2 border-gray-200 py-5 px-4 rounded-full items-center justify-center mb-4 ${isArabic ? 'flex-row-reverse' : ''}`}
            onPress={handleGoogleSignIn}
            disabled={isGoogleLoading}
          >
            <StyledView className={`w-5 h-5 items-center justify-center ${isArabic ? 'ml-2' : 'mr-2'}`}>
              <Ionicons name="logo-google" size={18} color="#4285F4" />
            </StyledView>
            <StyledText className="text-black text-lg font-semibold">
              {isGoogleLoading ? i18n.t('auth.signingIn') : i18n.t('auth.loginWithGoogle')}
            </StyledText>
          </StyledTouchableOpacity>

          <StyledTouchableOpacity 
            className={`flex-row bg-white border-2 border-gray-200 py-5 px-4 rounded-full items-center justify-center mb-8 ${isArabic ? 'flex-row-reverse' : ''}`}
            onPress={handleAppleSignIn}
            disabled={isAppleLoading}
          >
            <StyledView className={`w-5 h-5 items-center justify-center ${isArabic ? 'ml-2' : 'mr-2'}`}>
              <Ionicons name="logo-apple" size={18} color="#000000" />
            </StyledView>
            <StyledText className="text-black text-lg font-semibold">
              {isAppleLoading ? i18n.t('auth.signingIn') : i18n.t('auth.loginWithApple')}
            </StyledText>
          </StyledTouchableOpacity>
        </StyledScrollView>
      </StyledKeyboardAvoidingView>
    </StyledView>
  );
}

// Styles are now handled by NativeWind classes
