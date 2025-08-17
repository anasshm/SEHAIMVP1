import React, { useState, useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useOnboarding } from '../OnboardingContext';
import { palette } from '@/constants/Colors';
import { getNutritionRecommendations } from '@/src/services/NutritionService';
import { NutritionRecommendation } from '@/src/services/NutritionService';
import { useAuth } from '@/src/services/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NUTRITION_PLAN_STORAGE_KEY = '@nutritionPlan';

// Progress stages configuration
const STAGES = [
  { text: 'Customizing health plan...', startProgress: 0, endProgress: 25 },
  { text: 'Applying BMR formula...', startProgress: 25, endProgress: 50 },
  { text: 'Estimating your metabolic age...', startProgress: 50, endProgress: 75 },
  { text: 'Finalizing results...', startProgress: 75, endProgress: 95 },
];

export default function CalculatingPlanScreen() {
  const router = useRouter();
  const { onboardingData, batchSaveToStorage, setShouldSaveToStorage } = useOnboarding();
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [isCalculating, setIsCalculating] = useState(true);
  const [nutritionResults, setNutritionResults] = useState<NutritionRecommendation | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const calculationStarted = useRef(false);

  // Start progress animation and nutrition calculation
  useEffect(() => {
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
    
    intervalRef.current = setInterval(() => {
      currentProgress += 10; // 10% per second as requested
      
      setProgress(currentProgress);
      
      // Update stage based on progress
      const newStage = STAGES.findIndex(stage => 
        currentProgress >= stage.startProgress && currentProgress < stage.endProgress
      );
      if (newStage !== -1) {
        setCurrentStage(newStage);
      }
      
      // Stop at 95% and wait for nutrition results
      if (currentProgress >= 95) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    }, 1000); // 1 second intervals
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
    router.push('/(onboarding)/plan_results');
  };

  const renderCheckmark = (stageIndex: number) => {
    const isCompleted = progress > STAGES[stageIndex].endProgress;
    return (
      <View 
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: isCompleted ? '#000' : 'transparent',
          borderWidth: 2,
          borderColor: '#000',
          justifyContent: 'center',
          alignItems: 'center',
          marginLeft: 8,
        }}
      >
        {isCompleted && (
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>✓</Text>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: 20 }}>
      <Stack.Screen 
        options={{ 
          headerShown: false,
        }} 
      />
      
      {/* Progress percentage */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ 
          fontSize: 72, 
          fontWeight: 'bold', 
          color: '#000', 
          marginBottom: 40 
        }}>
          {Math.round(progress)}%
        </Text>
        
        {/* Main heading */}
        <Text style={{ 
          fontSize: 24, 
          fontWeight: 'bold', 
          textAlign: 'center', 
          marginBottom: 60,
          color: '#000'
        }}>
          We're setting{'\n'}everything up for you
        </Text>
        
        {/* Progress bar */}
        <View style={{ 
          width: '100%', 
          height: 8, 
          backgroundColor: '#E5E5E5', 
          borderRadius: 4, 
          marginBottom: 40,
          overflow: 'hidden'
        }}>
          <View style={{ 
            width: `${progress}%`, 
            height: '100%', 
            backgroundColor: '#000',
            borderRadius: 4,
          }} />
        </View>
        
        {/* Current stage text */}
        <Text style={{ 
          fontSize: 16, 
          color: '#666', 
          marginBottom: 60,
          textAlign: 'center'
        }}>
          {STAGES[currentStage]?.text || 'Finalizing results...'}
        </Text>
        
        {/* Daily recommendation checklist */}
        <View style={{ width: '100%' }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: 'bold', 
            marginBottom: 20,
            color: '#000'
          }}>
            Daily recommendation for
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 16, color: '#000', flex: 1 }}>• Calories</Text>
            {renderCheckmark(0)}
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 16, color: '#000', flex: 1 }}>• Carbs</Text>
            {renderCheckmark(1)}
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 16, color: '#000', flex: 1 }}>• Protein</Text>
            {renderCheckmark(2)}
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 16, color: '#000', flex: 1 }}>• Fats</Text>
            {renderCheckmark(3)}
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 16, color: '#000', flex: 1 }}>• Health Score</Text>
            <View style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: 'transparent',
              borderWidth: 2,
              borderColor: '#ccc',
              marginLeft: 8,
            }} />
          </View>
        </View>
      </View>
    </View>
  );
} 