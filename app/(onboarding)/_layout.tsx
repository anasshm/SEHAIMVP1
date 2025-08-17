import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native'; 
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'; 
import { isRTL } from '@/utils/i18n';
import { 
  useCurrentPageNumber, 
  useGoToPreviousPage,
  useProgressPercentage 
} from './navigationHelper';
import { ONBOARDING_PAGE_MAP } from './onboardingConfig';

// --- Custom Header Component ---
function OnboardingHeader() {
  const router = useRouter();
  const currentPageNumber = useCurrentPageNumber();
  const progressPercentage = useProgressPercentage();
  const goToPreviousPage = useGoToPreviousPage();
  
  // Convert percentage to 0-1 for animation
  const progressValue = progressPercentage / 100;
  
  const animatedProgress = useSharedValue(0);

  // --- DEBUG LOGS ---
  console.log('[OnboardingHeader - NEW] Debug:', {
    currentPageNumber,
    progressPercentage,
    progressValue,
  });
  // --- END DEBUG LOGS ---

  // Animate progress changes
  useEffect(() => {
    animatedProgress.value = withTiming(progressValue, { duration: 300 });
  }, [progressValue]);

  const animatedBarStyle = useAnimatedStyle(() => {
    return {
      width: `${animatedProgress.value * 100}%`,
    };
  });

  // For RTL support, we'll modify the container instead
  const rtlContainerStyle = isRTL() ? { 
    flexDirection: 'row-reverse' as const,
  } : {};

  const rtlProgressBarStyle = isRTL() ? { 
    flexDirection: 'row-reverse' as const,
  } : {};

  // Show back button for all pages except page 1
  const canGoBack = currentPageNumber > 1;

  return (
    <View style={[styles.headerContainer, rtlContainerStyle]}>
      {canGoBack ? (
         <TouchableOpacity onPress={goToPreviousPage} style={[styles.backButton, isRTL() && styles.backButtonRTL]}>
           <Ionicons name={isRTL() ? "arrow-forward" : "arrow-back"} size={24} color="#000" />
         </TouchableOpacity>
      ) : (
        // Placeholder to keep alignment when back button is hidden
        <View style={[styles.backButtonPlaceholder, isRTL() && styles.backButtonPlaceholderRTL]} />
      )}
      <View style={[styles.progressBarBackground, rtlProgressBarStyle]}>
        <Animated.View style={[styles.progressBarForeground, animatedBarStyle]} />
      </View>
    </View>
  );
}

// --- Onboarding Layout Component ---
export default function OnboardingLayout() {
  // Register all screens from our page map
  const screens = Object.values(ONBOARDING_PAGE_MAP);
  
  return (
    <Stack screenOptions={{ 
      header: () => <OnboardingHeader />, 
      headerBackVisible: false, 
      headerShadowVisible: false 
    }}>
      {screens.map(screenName => (
        <Stack.Screen key={screenName} name={screenName} />
      ))}
    </Stack>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', 
    paddingHorizontal: 15,
    paddingTop: 75, 
    paddingBottom: 10,
    backgroundColor: '#fff', 
    height: 90, 
  },
  backButton: {
    backgroundColor: '#f0f0f0', 
    borderRadius: 20, 
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15, 
  },
  backButtonRTL: {
    marginRight: 0,
    marginLeft: 15,
  },
   backButtonPlaceholder: { 
    width: 40,
    height: 40,
    marginRight: 15,
   },
   backButtonPlaceholderRTL: {
    marginRight: 0,
    marginLeft: 15,
   },
  progressBarBackground: {
    flex: 1, 
    height: 6, 
    backgroundColor: '#e0e0e0', 
    borderRadius: 3,
    overflow: 'hidden', 
  },
  progressBarForeground: {
    height: '100%',
    backgroundColor: '#000000', 
    borderRadius: 3,
  },
}); 