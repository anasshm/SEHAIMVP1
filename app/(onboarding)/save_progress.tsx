import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from '../OnboardingContext';
import { palette } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import i18n, { isRTL } from '@/utils/i18n';
import { useAuth } from '@/src/services/AuthContext';
import { useGoToNextPage } from '@/utils/onboarding/navigationHelper';
import { isAppleAuthAvailable } from '@/services/appleAuthService';

export default function SaveProgressScreen() {
  const router = useRouter();
  const { setIsOnboardingComplete } = useOnboarding();
  const { signInWithGoogle, signInWithApple, isAppleLoading } = useAuth();
  const goToNextPage = useGoToNextPage();
  const isArabic = isRTL();
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);

  useEffect(() => {
    const checkAppleAuth = async () => {
      const available = await isAppleAuthAvailable();
      setIsAppleAvailable(available);
    };
    checkAppleAuth();
  }, []);

  const handleGoogleSignIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        Alert.alert('Google Sign-In Failed', 'Please try again.');
        return;
      }
      // If successful, the auth state change will handle navigation
    } catch (error) {
      console.error('Google sign-in error:', error);
      Alert.alert('Google Sign-In Failed', 'An unexpected error occurred.');
    }
  };

  const handleAppleSignIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const { error } = await signInWithApple();
      if (error) {
        Alert.alert('Apple Sign-In Failed', 'Please try again.');
        return;
      }
      // If successful, the auth state change will handle navigation
    } catch (error) {
      console.error('Apple sign-in error:', error);
      Alert.alert('Apple Sign-In Failed', 'An unexpected error occurred.');
    }
  };

  const handleEmailSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate to the registration form
    router.push('/(auth)/register-form');
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to the next page in onboarding (which will be paywall)
    goToNextPage();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={[styles.title, isArabic && styles.titleRTL]}>
          {i18n.t('onboarding.saveProgress.title')}
        </Text>

        <View style={styles.buttonsContainer}>
          {/* Sign in with Google */}
          <TouchableOpacity 
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
          >
            <View style={[styles.buttonContent, isArabic && styles.buttonContentRTL]}>
              <Ionicons name="logo-google" size={20} color="white" />
              <Text style={[styles.googleButtonText, isArabic && styles.buttonTextRTL]}>
                {i18n.t('onboarding.saveProgress.signInWithGoogle')}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Sign in with Apple - Only show on iOS */}
          {isAppleAvailable && (
            <TouchableOpacity 
              style={styles.appleButton}
              onPress={handleAppleSignIn}
              disabled={isAppleLoading}
            >
              <View style={[styles.buttonContent, isArabic && styles.buttonContentRTL]}>
                <Ionicons name="logo-apple" size={20} color="white" />
                <Text style={[styles.appleButtonText, isArabic && styles.buttonTextRTL]}>
                  {i18n.t('onboarding.saveProgress.signInWithApple')}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Sign in with Email */}
          <TouchableOpacity 
            style={styles.emailButton}
            onPress={handleEmailSignIn}
          >
            <View style={[styles.buttonContent, isArabic && styles.buttonContentRTL]}>
              <Ionicons name="mail-outline" size={20} color="#666" />
              <Text style={[styles.emailButtonText, isArabic && styles.buttonTextRTL]}>
                {i18n.t('onboarding.saveProgress.signInWithEmail')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Skip option */}
        <View style={[styles.skipContainer, isArabic && styles.skipContainerRTL]}>
          <Text style={[styles.skipText, isArabic && styles.skipTextRTL]}>
            {i18n.t('onboarding.saveProgress.wouldYouLikeToSignInLater')}
          </Text>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipButton}>
              {i18n.t('onboarding.saveProgress.skip')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 60,
    color: '#000',
  },
  titleRTL: {
    textAlign: 'right',
  },
  buttonsContainer: {
    marginBottom: 40,
  },
  googleButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  googleButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  appleButton: {
    backgroundColor: '#000',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appleButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  emailButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#000',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonContentRTL: {
    flexDirection: 'row-reverse',
  },
  buttonTextRTL: {
    marginLeft: 0,
    marginRight: 12,
  },
  skipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipContainerRTL: {
    flexDirection: 'row-reverse',
  },
  skipText: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  skipTextRTL: {
    marginRight: 0,
    marginLeft: 8,
  },
  skipButton: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
}); 