import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useOnboarding } from '../OnboardingContext';
import { palette } from '@/constants/Colors';
import { getNutritionRecommendations } from '@/src/services/NutritionService';
import { NutritionRecommendation } from '@/src/services/NutritionService';
import { useAuth } from '@/src/services/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n, { isRTL } from '@/utils/i18n';
import * as Haptics from 'expo-haptics';

const NUTRITION_PLAN_STORAGE_KEY = '@nutritionPlan';

// Progress stages configuration
const STAGES = [
  { textKey: 'onboarding.calculatingPlan.stages.customizing', startProgress: 0, endProgress: 25 },
  { textKey: 'onboarding.calculatingPlan.stages.applyingFormula', startProgress: 25, endProgress: 50 },
  { textKey: 'onboarding.calculatingPlan.stages.estimatingAge', startProgress: 50, endProgress: 75 },
  { textKey: 'onboarding.calculatingPlan.stages.finalizing', startProgress: 75, endProgress: 95 },
];

export default function CalculatingPlanScreen() {
  const router = useRouter();
  const { onboardingData, batchSaveToStorage, setShouldSaveToStorage } = useOnboarding();
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [isCalculating, setIsCalculating] = useState(true);
  const [nutritionResults, setNutritionResults] = useState<NutritionRecommendation | null>(null);
  const [completedChecks, setCompletedChecks] = useState<boolean[]>([false, false, false, false]);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const calculationStarted = useRef(false);
  const hapticTriggered = useRef<boolean[]>([false, false, false, false]);
  const animationStarted = useRef<boolean[]>([false, false, false, false]);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const checkAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  // Start progress animation and nutrition calculation
  useEffect(() => {
    // Fade in animation on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    startProgressAnimation();
    startNutritionCalculation();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Check if we can proceed to results when both conditions are met
  useEffect(() => {
    if (progress >= 95 && nutritionResults && !isCalculating) {
      // Brief delay before proceeding to show completion
      setTimeout(() => {
        proceedToResults();
      }, 1000);
    }
  }, [progress, nutritionResults, isCalculating]);

  const startProgressAnimation = () => {
    let currentProgress = 0;
    let timeElapsed = 0;
    
    // More natural progress curve - fast start, slow middle, fast end
    const progressSteps = [
      { time: 0, progress: 0 },
      { time: 0.5, progress: 8 },
      { time: 1.0, progress: 15 },
      { time: 1.5, progress: 21 },
      { time: 2.0, progress: 26 },
      { time: 2.5, progress: 32 },
      { time: 3.0, progress: 37 },
      { time: 3.5, progress: 43 },
      { time: 4.0, progress: 48 },
      { time: 4.5, progress: 52 },
      { time: 5.0, progress: 58 },
      { time: 5.5, progress: 64 },
      { time: 6.0, progress: 69 },
      { time: 6.5, progress: 75 },
      { time: 7.0, progress: 81 },
      { time: 7.5, progress: 86 },
      { time: 8.0, progress: 90 },
      { time: 8.5, progress: 93 },
      { time: 9.0, progress: 95 },
    ];
    
    intervalRef.current = setInterval(() => {
      timeElapsed += 0.1; // Update every 100ms for smoother animation
      
      // Find the appropriate progress for current time
      let targetProgress = 0;
      for (let i = 0; i < progressSteps.length - 1; i++) {
        if (timeElapsed >= progressSteps[i].time && timeElapsed < progressSteps[i + 1].time) {
          // Interpolate between steps for smooth animation
          const stepProgress = (timeElapsed - progressSteps[i].time) / (progressSteps[i + 1].time - progressSteps[i].time);
          targetProgress = progressSteps[i].progress + 
            (progressSteps[i + 1].progress - progressSteps[i].progress) * stepProgress;
          break;
        }
      }
      
      // Add tiny random variations for more natural feel
      const variation = (Math.random() - 0.5) * 0.5;
      currentProgress = Math.min(95, Math.max(0, targetProgress + variation));
      
      setProgress(currentProgress);
      
      // Update stage based on progress
      const newStage = STAGES.findIndex(stage => 
        currentProgress >= stage.startProgress && currentProgress < stage.endProgress
      );
      if (newStage !== -1) {
        setCurrentStage(newStage);
      }
      
      // Check if we should trigger checkmark animations
      STAGES.forEach((stage, index) => {
        // For the last stage (Fats), trigger at >= 95%, for others trigger when > endProgress
        const shouldTrigger = (index === STAGES.length - 1) 
          ? currentProgress >= stage.endProgress 
          : currentProgress > stage.endProgress;
          
        if (shouldTrigger && !completedChecks[index]) {
          // Trigger haptic feedback only once per checkmark
          if (!hapticTriggered.current[index]) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            hapticTriggered.current[index] = true;
          }
          
          // Update completed state
          setCompletedChecks(prev => {
            const newChecks = [...prev];
            newChecks[index] = true;
            return newChecks;
          });
          
          // Animate the checkmark only once
          if (!animationStarted.current[index]) {
            animationStarted.current[index] = true;
            Animated.spring(checkAnimations[index], {
              toValue: 1,
              friction: 4,
              tension: 40,
              useNativeDriver: true,
            }).start();
          }
        }
      });
      
      // Stop at 95% and wait for nutrition results
      if (currentProgress >= 95 || timeElapsed >= 9) {
        setProgress(95); // Ensure we end at exactly 95
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    }, 100); // 100ms intervals for smoother updates
  };

  const startNutritionCalculation = async () => {
    if (calculationStarted.current) return;
    calculationStarted.current = true;

    try {
      // First, batch save all onboarding data to storage
      console.log('[CalculatingPlan] Batch saving onboarding data before AI calculation...');
      await batchSaveToStorage();
      console.log('[CalculatingPlan] Onboarding data saved successfully.');
      
      // Re-enable normal storage saves for future updates
      setShouldSaveToStorage(true);
      
      console.log('[CalculatingPlan] Starting nutrition calculation...');
      const userName = user?.user_metadata?.name;
      const results = await getNutritionRecommendations(onboardingData, userName);
      
      if (results) {
        console.log('[CalculatingPlan] Nutrition calculation completed:', results);
        setNutritionResults(results);
        // Save to AsyncStorage for dashboard consistency
        await AsyncStorage.setItem(NUTRITION_PLAN_STORAGE_KEY, JSON.stringify(results));
      } else {
        console.error('[CalculatingPlan] Failed to get nutrition recommendations');
        // Retry logic
        setTimeout(() => {
          calculationStarted.current = false;
          startNutritionCalculation();
        }, 2000);
        return;
      }
    } catch (error) {
      console.error('[CalculatingPlan] Error calculating nutrition:', error);
      // Retry logic
      setTimeout(() => {
        calculationStarted.current = false;
        startNutritionCalculation();
      }, 2000);
      return;
    }
    
    setIsCalculating(false);
  };

  const proceedToResults = () => {
    console.log('[CalculatingPlan] Proceeding to results page');
    router.replace('/(onboarding)/plan_results');
  };

  const renderCheckmark = (stageIndex: number) => {
    const isCompleted = completedChecks[stageIndex];
    const animatedScale = checkAnimations[stageIndex];
    
    return (
      <View 
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: palette.primary || '#000',
          justifyContent: 'center',
          alignItems: 'center',
          marginLeft: isRTL() ? 0 : 8,
          marginRight: isRTL() ? 8 : 0,
          overflow: 'hidden',
        }}
      >
        {isCompleted && (
          <Animated.View
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backgroundColor: palette.primary || '#000',
              borderRadius: 12,
              transform: [{ scale: animatedScale }],
            }}
          />
        )}
        {isCompleted && (
          <Animated.Text 
            style={{ 
              color: 'white', 
              fontSize: 16, 
              fontWeight: 'bold',
              transform: [{ scale: animatedScale }],
            }}
          >
            ✓
          </Animated.Text>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAFA', paddingHorizontal: 20 }}>
      <Stack.Screen 
        options={{ 
          headerShown: false,
        }} 
      />
      
      {/* Progress percentage */}
      <Animated.View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }]
      }}>
        <Text style={{ 
          fontSize: 80, 
          fontWeight: '900', 
          color: palette.primary || '#000', 
          marginBottom: 40,
          letterSpacing: -2
        }}>
          {Math.round(progress)}%
        </Text>
        
        {/* Main heading */}
        <Text style={{ 
          fontSize: 22, 
          fontWeight: '600', 
          textAlign: 'center', 
          marginBottom: 50,
          color: '#333',
          writingDirection: isRTL() ? 'rtl' : 'ltr',
          lineHeight: 32,
          paddingHorizontal: 30
        }}>
          {i18n.t('onboarding.calculatingPlan.mainHeading')}
        </Text>
        
        {/* Progress bar */}
        <View style={{ 
          width: '100%', 
          height: 12, 
          backgroundColor: '#E5E5E5', 
          borderRadius: 6, 
          marginBottom: 40,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 2,
        }}>
          <View style={{ 
            width: `${progress}%`, 
            height: '100%', 
            backgroundColor: palette.primary || '#000',
            borderRadius: 6,
          }} />
        </View>
        
        {/* Current stage text */}
        <Text style={{ 
          fontSize: 16, 
          color: '#666', 
          marginBottom: 60,
          textAlign: 'center',
          writingDirection: isRTL() ? 'rtl' : 'ltr',
          fontWeight: '500'
        }}>
          {i18n.t(STAGES[currentStage]?.textKey || 'onboarding.calculatingPlan.stages.finalizing')}
        </Text>
        
        {/* Daily recommendation checklist - Card Style */}
        <View style={{ 
          width: '100%',
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 5,
        }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: '700', 
            marginBottom: 24,
            color: '#333',
            textAlign: isRTL() ? 'right' : 'left',
            writingDirection: isRTL() ? 'rtl' : 'ltr'
          }}>
            {i18n.t('onboarding.calculatingPlan.dailyRecommendationHeading')}
          </Text>
          
          <View style={{ flexDirection: isRTL() ? 'row-reverse' : 'row', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 16, color: '#555', flex: 1, textAlign: isRTL() ? 'right' : 'left', writingDirection: isRTL() ? 'rtl' : 'ltr', fontWeight: '500' }}>{i18n.t('onboarding.calculatingPlan.dailyRecommendationCalories')}</Text>
            {renderCheckmark(0)}
          </View>
          
          <View style={{ flexDirection: isRTL() ? 'row-reverse' : 'row', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 16, color: '#555', flex: 1, textAlign: isRTL() ? 'right' : 'left', writingDirection: isRTL() ? 'rtl' : 'ltr', fontWeight: '500' }}>{i18n.t('onboarding.calculatingPlan.dailyRecommendationCarbs')}</Text>
            {renderCheckmark(1)}
          </View>
          
          <View style={{ flexDirection: isRTL() ? 'row-reverse' : 'row', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 16, color: '#555', flex: 1, textAlign: isRTL() ? 'right' : 'left', writingDirection: isRTL() ? 'rtl' : 'ltr', fontWeight: '500' }}>{i18n.t('onboarding.calculatingPlan.dailyRecommendationProtein')}</Text>
            {renderCheckmark(2)}
          </View>
          
          <View style={{ flexDirection: isRTL() ? 'row-reverse' : 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: '#555', flex: 1, textAlign: isRTL() ? 'right' : 'left', writingDirection: isRTL() ? 'rtl' : 'ltr', fontWeight: '500' }}>{i18n.t('onboarding.calculatingPlan.dailyRecommendationFats')}</Text>
            {renderCheckmark(3)}
          </View>
        </View>
      </Animated.View>
    </View>
  );
} 