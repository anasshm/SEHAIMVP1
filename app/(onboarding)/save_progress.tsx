import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from '../OnboardingContext';
import { palette } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import i18n, { isRTL } from '@/utils/i18n';
import { useAuth } from '@/src/services/AuthContext';
import { useGoToNextPage } from '@/utils/onboarding/navigationHelper';

export default function SaveProgressScreen() {
  const router = useRouter();
  const { setIsOnboardingComplete } = useOnboarding();
  const { signInWithGoogle } = useAuth();
  const goToNextPage = useGoToNextPage();
  const isArabic = isRTL();

  const handleAppleSignIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Apple sign-in is coming soon
    Alert.alert(i18n.t('auth.comingSoon.title'), i18n.t('auth.comingSoon.appleSignIn'));
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
          {/* Sign in with Apple */}
          <TouchableOpacity 
            style={styles.appleButton}
            onPress={handleAppleSignIn}
          >
            <View style={[styles.buttonContent, isArabic && styles.buttonContentRTL]}>
              <Ionicons name="logo-apple" size={20} color="white" />
              <Text style={[styles.appleButtonText, isArabic && styles.buttonTextRTL]}>
                {i18n.t('onboarding.saveProgress.signInWithApple')}
              </Text>
            </View>
          </TouchableOpacity>

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