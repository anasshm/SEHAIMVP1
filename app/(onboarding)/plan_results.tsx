import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, I18nManager, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useOnboarding } from '../OnboardingContext';
import { palette } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NutritionRecommendation } from '@/src/services/NutritionService';
import * as Haptics from 'expo-haptics';
import i18n, { isRTL } from '@/utils/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useGoToNextPage } from '@/utils/onboarding/navigationHelper';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

const NUTRITION_PLAN_STORAGE_KEY = '@nutritionPlan';

export default function PlanResultsScreen() {
  const router = useRouter();
  const { setIsOnboardingComplete } = useOnboarding();
  const [nutritionPlan, setNutritionPlan] = useState<NutritionRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const goToNextPage = useGoToNextPage();
  
  // Edit modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editedCalories, setEditedCalories] = useState('');
  const [editedCarbs, setEditedCarbs] = useState('');
  const [editedProtein, setEditedProtein] = useState('');
  const [editedFats, setEditedFats] = useState('');

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

  const handleEditPress = () => {
    if (nutritionPlan) {
      // Populate form with current values
      setEditedCalories(nutritionPlan.targetCalories.toString());
      setEditedCarbs(nutritionPlan.targetCarbsGrams.toString());
      setEditedProtein(nutritionPlan.targetProteinGrams.toString());
      setEditedFats(nutritionPlan.targetFatsGrams.toString());
      setModalVisible(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const updatedPlan: NutritionRecommendation = {
        ...nutritionPlan!,
        targetCalories: parseInt(editedCalories) || nutritionPlan!.targetCalories,
        targetCarbsGrams: parseInt(editedCarbs) || nutritionPlan!.targetCarbsGrams,
        targetProteinGrams: parseInt(editedProtein) || nutritionPlan!.targetProteinGrams,
        targetFatsGrams: parseInt(editedFats) || nutritionPlan!.targetFatsGrams,
      };

      // Save to AsyncStorage
      await AsyncStorage.setItem(NUTRITION_PLAN_STORAGE_KEY, JSON.stringify(updatedPlan));
      
      // Update local state
      setNutritionPlan(updatedPlan);
      setModalVisible(false);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      console.log('[PlanResults] Nutrition plan updated successfully');
    } catch (error) {
      console.error('[PlanResults] Error saving edited nutrition plan:', error);
    }
  };

  const handleCancelEdit = () => {
    setModalVisible(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderNutritionCircle = (
    label: string, 
    value: number, 
    unit: string, 
    color: string, 
    iconName: string, 
    iconLibrary: 'MaterialCommunityIcons' | 'FontAwesome5'
  ) => {
    const circleSize = 96; // 20% bigger than original 80
    const iconSize = circleSize * 0.35; // 20% bigger than dashboard icons
    
    return (
      <View style={{ flex: 1, alignItems: 'center', marginHorizontal: 10 }}>
        <AnimatedCircularProgress
          size={circleSize}
          width={8}
          fill={100} // Always show full circle for results
          tintColor={color}
          backgroundColor="#F3F4F6"
          rotation={0}
          arcSweepAngle={360}
          lineCap="round"
          style={{
            shadowColor: color,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          {() => (
            <View style={{ alignItems: 'center' }}>
              {iconLibrary === 'MaterialCommunityIcons' ? (
                <MaterialCommunityIcons 
                  name={iconName as any} 
                  size={iconSize} 
                  color={color} 
                  style={{ marginBottom: 4 }}
                />
              ) : (
                <FontAwesome5 
                  name={iconName as any} 
                  size={iconSize} 
                  color={color}
                  style={{ marginBottom: 4 }}
                />
              )}
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000' }}>
                {Math.round(value)}
              </Text>
              {unit && (
                <Text style={{ fontSize: 12, color: '#666' }}>
                  {unit}
                </Text>
              )}
            </View>
          )}
        </AnimatedCircularProgress>
        
        <Text style={{ 
          fontSize: 14, 
          fontWeight: '600', 
          color: '#000', 
          textAlign: 'center',
          marginTop: 12
        }}>
          {label}
        </Text>
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
            marginBottom: 20,
            color: '#000',
            lineHeight: 34,
          }}>
            {i18n.t('onboarding.planResults.congratulations')}{'\n'}{i18n.t('onboarding.planResults.customPlanReady')}
          </Text>
          
          {/* Edit button */}
          <TouchableOpacity
            onPress={handleEditPress}
            style={{
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: palette.primary,
              marginBottom: 20,
            }}
          >
            <Text style={{
              color: palette.primary,
              fontSize: 14,
              fontWeight: '600',
            }}>
              {i18n.t('onboarding.planResults.editYourMacroGoals')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Daily recommendation section */}
        <View style={{ marginBottom: 40 }}>
          {/* Nutrition circles in 2x2 grid */}
          <View style={{ flexDirection: isRTL() ? 'row-reverse' : 'row', marginBottom: 20 }}>
            {renderNutritionCircle(
              i18n.t('onboarding.planResults.calories'), 
              nutritionPlan.targetCalories, 
              '', 
              palette.accent, // #1C1A23
              'fire',
              'MaterialCommunityIcons'
            )}
            {renderNutritionCircle(
              i18n.t('onboarding.planResults.carbs'), 
              nutritionPlan.targetCarbsGrams, 
              'g', 
              palette.carbs, // #D1A46F
              'barley',
              'MaterialCommunityIcons'
            )}
          </View>
          
          <View style={{ flexDirection: isRTL() ? 'row-reverse' : 'row' }}>
            {renderNutritionCircle(
              i18n.t('onboarding.planResults.protein'), 
              nutritionPlan.targetProteinGrams, 
              'g', 
              palette.protein, // #E24D43
              'food-drumstick',
              'MaterialCommunityIcons'
            )}
            {renderNutritionCircle(
              i18n.t('onboarding.planResults.fats'), 
              nutritionPlan.targetFatsGrams, 
              'g', 
              palette.fats, // #F6C45F
              'tint',
              'FontAwesome5'
            )}
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

      {/* Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCancelEdit}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}>
            <View style={{
              backgroundColor: 'white',
              borderRadius: 20,
              padding: 20,
              width: '90%',
              maxWidth: 400,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}>
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: 20,
                color: '#000',
              }}>
                {i18n.t('onboarding.planResults.editMacros')}
              </Text>

              {/* Input fields */}
              <View style={{ marginBottom: 15 }}>
                <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>
                  {i18n.t('onboarding.planResults.calories')}
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#E0E0E0',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                    color: '#000',
                  }}
                  value={editedCalories}
                  onChangeText={setEditedCalories}
                  keyboardType="numeric"
                  placeholder={nutritionPlan?.targetCalories.toString()}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={{ marginBottom: 15 }}>
                <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>
                  {i18n.t('onboarding.planResults.carbs')} (g)
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#E0E0E0',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                    color: '#000',
                  }}
                  value={editedCarbs}
                  onChangeText={setEditedCarbs}
                  keyboardType="numeric"
                  placeholder={nutritionPlan?.targetCarbsGrams.toString()}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={{ marginBottom: 15 }}>
                <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>
                  {i18n.t('onboarding.planResults.protein')} (g)
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#E0E0E0',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                    color: '#000',
                  }}
                  value={editedProtein}
                  onChangeText={setEditedProtein}
                  keyboardType="numeric"
                  placeholder={nutritionPlan?.targetProteinGrams.toString()}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 14, color: '#666', marginBottom: 5 }}>
                  {i18n.t('onboarding.planResults.fats')} (g)
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#E0E0E0',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                    color: '#000',
                  }}
                  value={editedFats}
                  onChangeText={setEditedFats}
                  keyboardType="numeric"
                  placeholder={nutritionPlan?.targetFatsGrams.toString()}
                  placeholderTextColor="#999"
                />
              </View>

              {/* Buttons */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity
                  onPress={handleCancelEdit}
                  style={{
                    flex: 1,
                    marginRight: 10,
                    paddingVertical: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: '#E0E0E0',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#666', fontSize: 16, fontWeight: '600' }}>
                    {i18n.t('onboarding.planResults.cancel')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSaveEdit}
                  style={{
                    flex: 1,
                    marginLeft: 10,
                    paddingVertical: 12,
                    borderRadius: 8,
                    backgroundColor: palette.primary,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                    {i18n.t('onboarding.planResults.save')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
} 