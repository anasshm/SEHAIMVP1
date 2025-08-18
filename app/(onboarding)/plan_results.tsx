import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, I18nManager } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useOnboarding } from '../OnboardingContext';
import { palette } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NutritionRecommendation } from '@/src/services/NutritionService';
import * as Haptics from 'expo-haptics';
import i18n, { isRTL } from '@/utils/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useGoToNextPage } from '@/utils/onboarding/navigationHelper';

const NUTRITION_PLAN_STORAGE_KEY = '@nutritionPlan';

export default function PlanResultsScreen() {
  const router = useRouter();
  const { setIsOnboardingComplete } = useOnboarding();
  const [nutritionPlan, setNutritionPlan] = useState<NutritionRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const goToNextPage = useGoToNextPage();

  useEffect(() => {
    loadNutritionPlan();
  }, []);

  const loadNutritionPlan = async () => {
    try {
      const storedPlanString = await AsyncStorage.getItem(NUTRITION_PLAN_STORAGE_KEY);
      if (storedPlanString) {
        const plan = JSON.parse(storedPlanString) as NutritionRecommendation;
        setNutritionPlan(plan);
      }
    } catch (error) {
      console.error('[PlanResults] Error loading nutrition plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Don't mark onboarding as complete yet - let the user decide on save_progress page
      // Navigate to the next onboarding step (save_progress page)
      goToNextPage();
    } catch (error) {
      console.error('[PlanResults] Error navigating to next page:', error);
    }
  };

  const renderNutritionCircle = (label: string, value: number, unit: string, color: string) => {
    return (
      <View style={{ flex: 1, alignItems: 'center', marginHorizontal: 10 }}>
        <View style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          borderWidth: 6,
          borderColor: color,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 10,
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000' }}>
            {Math.round(value)}
          </Text>
          <Text style={{ fontSize: 12, color: '#666' }}>
            {unit}
          </Text>
        </View>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#000', textAlign: 'center' }}>
          {label}
        </Text>
        {/* Edit icon placeholder */}
        <View style={{ marginTop: 5 }}>
          <Text style={{ fontSize: 16 }}>✏️</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ textAlign: 'center' }}>{i18n.t('onboarding.planResults.loading')}</Text>
      </View>
    );
  }

  if (!nutritionPlan) {
    return (
      <View style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, textAlign: 'center', marginBottom: 20 }}>
          {i18n.t('onboarding.planResults.errorLoading')}
        </Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={{
            backgroundColor: palette.primary,
            paddingHorizontal: 30,
            paddingVertical: 15,
            borderRadius: 25,
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
            {i18n.t('onboarding.planResults.goBack')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          headerTitle: '',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ fontSize: 24 }}>{isRTL() ? '→' : '←'}</Text>
            </TouchableOpacity>
          ),
          headerRight: () => <LanguageSwitcher />,
        }} 
      />
      
      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center', marginTop: 40, marginBottom: 60 }}>
          {/* Success checkmark */}
          <View style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: '#000',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 30,
          }}>
            <Text style={{ color: 'white', fontSize: 30, fontWeight: 'bold' }}>✓</Text>
          </View>
          
          {/* Main heading */}
          <Text style={{
            fontSize: 28,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 30,
            color: '#000',
            lineHeight: 34,
          }}>
            {i18n.t('onboarding.planResults.congratulations')}{'\n'}{i18n.t('onboarding.planResults.customPlanReady')}
          </Text>
        </View>

        {/* Daily recommendation section */}
        <View style={{ marginBottom: 40 }}>
          {/* Nutrition circles in 2x2 grid */}
          <View style={{ flexDirection: isRTL() ? 'row-reverse' : 'row', marginBottom: 20 }}>
            {renderNutritionCircle(i18n.t('onboarding.planResults.calories'), nutritionPlan.targetCalories, '', '#000')}
            {renderNutritionCircle(i18n.t('onboarding.planResults.carbs'), nutritionPlan.targetCarbsGrams, 'g', '#FF9500')}
          </View>
          
          <View style={{ flexDirection: isRTL() ? 'row-reverse' : 'row' }}>
            {renderNutritionCircle(i18n.t('onboarding.planResults.protein'), nutritionPlan.targetProteinGrams, 'g', '#FF3B30')}
            {renderNutritionCircle(i18n.t('onboarding.planResults.fats'), nutritionPlan.targetFatsGrams, 'g', '#007AFF')}
          </View>
        </View>

        {/* Motivational message */}
        {nutritionPlan.briefRationale && (
          <View style={{
            backgroundColor: '#F8F9FA',
            padding: 20,
            borderRadius: 12,
            marginBottom: 40,
          }}>
            <Text style={{
              fontSize: 16,
              color: '#333',
              lineHeight: 22,
              textAlign: isRTL() ? 'right' : 'left',
              writingDirection: isRTL() ? 'rtl' : 'ltr',
            }}>
              {nutritionPlan.briefRationale}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Get Started Button */}
      <View style={{ padding: 20, paddingBottom: 40 }}>
        <TouchableOpacity
          onPress={handleGetStarted}
          style={{
            backgroundColor: '#000',
            paddingVertical: 18,
            borderRadius: 25,
            alignItems: 'center',
          }}
        >
          <Text style={{
            color: 'white',
            fontSize: 18,
            fontWeight: 'bold',
          }}>
            {i18n.t('onboarding.planResults.letsGetStarted')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 