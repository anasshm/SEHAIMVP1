import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native'; 
import { Stack, useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'; 
import { isRTL } from '@/utils/i18n';

// --- Constants ---
export const ONBOARDING_STEPS = [ // Order matters for navigation and finding index
  'step_desired_weight',  // NEW: Testing page - always first for easy testing
  'step1_calorie_apps',
  'step_date_of_birth',
  'step_height_weight',
  'step2_experience',
  'step3_source',
  'step4_workouts',
  'step5_gender',
  'step6_goal',
  'step_activity_level', 
  'step7_diet', 
  'step8_accomplishments', 
  'step9_obstacles', 
  'paywall',          // Final step after progress is complete
];
// Define specifically the steps that contribute to the progress bar calculation
export const PROGRESS_BAR_STEPS = [
  'step_desired_weight',  // NEW: Testing page - always first for easy testing
  'step1_calorie_apps',
  'step_date_of_birth',
  'step_height_weight',
  'step2_experience',
  'step3_source',
  'step4_workouts',
  'step5_gender',
  'step6_goal',
  'step_activity_level', 
  'step7_diet',
  'step8_accomplishments',
  'step9_obstacles',
];
const TOTAL_PROGRESS_STEPS = PROGRESS_BAR_STEPS.length; // Now 12 based on the actual steps

// --- Custom Header Component ---
function OnboardingHeader() {
  const router = useRouter();
  const segments = useSegments(); 
  const currentStepName = segments[segments.length - 1] ?? '';
  // Find index within the overall flow for back button logic
  const currentOnboardingIndex = ONBOARDING_STEPS.indexOf(currentStepName);
  // Find index specifically within the steps that count for progress
  const currentProgressStepIndex = PROGRESS_BAR_STEPS.indexOf(currentStepName);

  // Calculate progress (0 to 1)
  let progressValue = 0;
  if (currentProgressStepIndex !== -1) {
    // We are on one of the steps that define progress
    progressValue = (currentProgressStepIndex + 1) / TOTAL_PROGRESS_STEPS; 
  } else if (currentOnboardingIndex > PROGRESS_BAR_STEPS.length -1 && currentOnboardingIndex < ONBOARDING_STEPS.length) {
     // We are past the steps that define progress but still in the defined onboarding flow (e.g., on 'paywall')
     progressValue = 1;
  }
  // Otherwise, it remains 0 (e.g., if step name is not found, though unlikely)

  const animatedProgress = useSharedValue(0);

  // --- DEBUG LOGS ---
  console.log('[OnboardingHeader] Debug:', {
    segments,
    currentStepName,
    currentOnboardingIndex, // Keep overall index for context
    currentProgressStepIndex, // Index used for progress calculation (-1 if not a progress step)
    TOTAL_PROGRESS_STEPS, // Should be 11
    calculatedProgress: progressValue,
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

  // Use overall index for back button logic (can't go back from the new first step: gender)
  const canGoBack = router.canGoBack(); // New logic: show if router allows going back

  return (
    <View style={[styles.headerContainer, rtlContainerStyle]}>
      {canGoBack ? (
         <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, isRTL() && styles.backButtonRTL]}>
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
  return (
    <Stack screenOptions={{ header: () => <OnboardingHeader />, headerBackVisible: false, headerShadowVisible: false }}>
      {ONBOARDING_STEPS.map(stepName => (
        <Stack.Screen key={stepName} name={stepName} />
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
