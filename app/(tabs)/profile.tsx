import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView, Alert, ActivityIndicator, SafeAreaView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '@/src/services/AuthContext';
import { useOnboarding } from '../OnboardingContext';
import { InfoCard } from '@/components/ui/InfoCard';
import { FieldRow } from '@/components/ui/FieldRow';
import LanguageSelector from '@/components/LanguageSelector';
import i18n, { isRTL } from '@/utils/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NutritionRecommendation } from '@/src/services/NutritionService';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { palette } from '@/constants/Colors';

const NUTRITION_PLAN_STORAGE_KEY = '@nutritionPlan';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { onboardingData, isLoading: isOnboardingDataLoading, updateOnboardingData } = useOnboarding();
  const isArabic = isRTL();
  
  // User data state
  const [userData, setUserData] = useState({
    name: 'Guest User',
    email: '',
    notifications: true,
    darkMode: false,
  });

  // Macro editing state
  const [nutritionPlan, setNutritionPlan] = useState<NutritionRecommendation | null>(null);
  
  // Inline editing states
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState({
    calories: '',
    carbs: '',
    protein: '',
    fats: '',
    height: '',
    weight: ''
  });
  
  // Update user data when auth state changes
  useEffect(() => {
    if (user) {
      console.log('User data updated from auth state:', user);
      setUserData({
        ...userData,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
      });
    } else {
      console.log('No user found, using guest data');
      setUserData({
        ...userData,
        name: 'Guest User',
        email: '',
      });
    }
  }, [user]);

  // Load nutrition plan from AsyncStorage
  useEffect(() => {
    const loadNutritionPlan = async () => {
      try {
        const storedPlanString = await AsyncStorage.getItem(NUTRITION_PLAN_STORAGE_KEY);
        if (storedPlanString) {
          const plan = JSON.parse(storedPlanString) as NutritionRecommendation;
          setNutritionPlan(plan);
        }
      } catch (error) {
        console.error('[Profile] Error loading nutrition plan:', error);
      }
    };

    if (user) {
      loadNutritionPlan();
    }
  }, [user]);

  // Handle inline edit start
  const handleStartEdit = (field: string, currentValue: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingField(field);
    setTempValues({
      ...tempValues,
      [field]: currentValue.toString()
    });
  };

  // Handle inline edit save
  const handleSaveInlineEdit = async (field: string) => {
    try {
      const value = parseInt(tempValues[field]) || 0;
      
      if (['calories', 'carbs', 'protein', 'fats'].includes(field)) {
        // Handle macro editing
        if (!nutritionPlan) return;
        
        const updatedPlan: NutritionRecommendation = {
          ...nutritionPlan,
          [`target${field.charAt(0).toUpperCase() + field.slice(1)}${field === 'calories' ? '' : 'Grams'}`]: value
        };

        // Save to AsyncStorage
        await AsyncStorage.setItem(NUTRITION_PLAN_STORAGE_KEY, JSON.stringify(updatedPlan));
        setNutritionPlan(updatedPlan);
      } else if (['height', 'weight'].includes(field)) {
        // Handle personal info editing
        if (field === 'height') {
          await updateOnboardingData({ 
            height: { value: value, unit: 'cm' }
          });
        } else if (field === 'weight') {
          await updateOnboardingData({ 
            weight: { value: value, unit: 'kg' }
          });
        }
      }
      
      setEditingField(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('[Profile] Error saving data:', error);
    }
  };

  // Handle inline edit cancel
  const handleCancelInlineEdit = () => {
    setEditingField(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Render editable value
  const renderEditableValue = (field: string, value: number, unit: string) => {
    const isEditing = editingField === field;
    
    if (isEditing) {
      return (
        <View style={{
          backgroundColor: '#F0F0F0',
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 6,
          flexDirection: isArabic ? 'row-reverse' : 'row',
          alignItems: 'center',
        }}>
          <TextInput
            value={tempValues[field]}
            onChangeText={(text) => setTempValues({ ...tempValues, [field]: text })}
            onBlur={() => handleSaveInlineEdit(field)}
            onSubmitEditing={() => handleSaveInlineEdit(field)}
            keyboardType="numeric"
            style={{
              fontSize: 15,
              color: '#000',
              minWidth: 40,
              textAlign: isArabic ? 'right' : 'left',
              padding: 0,
              margin: 0,
            }}
            autoFocus
          />
          <Text style={{ 
            marginLeft: isArabic ? 0 : 4, 
            marginRight: isArabic ? 4 : 0,
            fontSize: 15,
            color: '#6E7685'
          }}>
            {unit}
          </Text>
        </View>
      );
    }
    
    return (
      <TouchableOpacity 
        onPress={() => handleStartEdit(field, value)}
        style={{
          backgroundColor: '#F5F5F7',
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 6,
          flexDirection: isArabic ? 'row-reverse' : 'row',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 15, color: '#000', fontWeight: '500' }}>
          {value}
        </Text>
        <Text style={{ 
          marginLeft: isArabic ? 0 : 4, 
          marginRight: isArabic ? 4 : 0,
          fontSize: 15,
          color: '#6E7685'
        }}>
          {unit}
        </Text>
      </TouchableOpacity>
    );
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      console.log('Attempting to log out');
      await signOut();
      console.log('Logout successful');
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert(i18n.t('profile.error'), i18n.t('profile.failedToLogOut'));
    }
  };

  // Handle opening legal links
  const openPrivacyPolicy = async () => {
    try {
      await WebBrowser.openBrowserAsync('https://createvaluellc.com/privacy');
    } catch (error) {
      console.error('Error opening Privacy Policy:', error);
      Alert.alert(i18n.t('profile.error'), i18n.t('profile.unableToOpenPrivacy'));
    }
  };

  const openTermsAndConditions = async () => {
    try {
      await WebBrowser.openBrowserAsync('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/');
    } catch (error) {
      console.error('Error opening Terms and Conditions:', error);
      Alert.alert(i18n.t('profile.error'), i18n.t('profile.unableToOpenTerms'));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f7' }}>
      <View className="flex-1 bg-app-bg">
      <View className="px-4 pb-4">
        <Text 
          className="text-[32px] font-bold text-[#1D1923]"
          style={{ textAlign: isArabic ? 'right' : 'left' }}
        >
          {i18n.t('profile.title')}
        </Text>
      </View>
      
      <ScrollView className="flex-1">
        {!user ? (
          <View className="p-4 items-center">
            <Text className="text-text-primary text-lg mb-4 text-center">{i18n.t('profile.signInToTrack')}</Text>
            <TouchableOpacity 
              className="bg-blue-500 py-3 px-6 rounded-lg"
              onPress={() => router.push('/(auth)/login')}
            >
              <Text className="text-white font-semibold text-base">{i18n.t('profile.signInRegister')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View className="items-center p-4 mb-8">
              <View className="w-24 h-24 rounded-full bg-[#1C1A2333] justify-center items-center mb-3">
                <Text className="text-white text-[40px] font-bold">
                  {userData.name.charAt(0)}
                </Text>
              </View>
              <Text className="text-xl font-semibold text-[#1D1923] mb-1">{userData.name}</Text>
              {userData.email && <Text className="text-[15px] text-[#6E7685] mt-1">{userData.email}</Text>}
            </View>
          </>
        )}
        
        {/* Macros Card */}
        {user && nutritionPlan && (
          <InfoCard 
            title={
              <View style={{ 
                flexDirection: isArabic ? 'row-reverse' : 'row', 
                alignItems: 'center',
                textAlign: isArabic ? 'right' : 'left'
              }}>
                <MaterialCommunityIcons 
                  name="chart-donut" 
                  size={22} 
                  color={palette.primary}
                  style={{ marginRight: isArabic ? 0 : 8, marginLeft: isArabic ? 8 : 0 }}
                />
                <Text style={{ 
                  fontSize: 18, 
                  fontWeight: '600', 
                  color: '#1D1923',
                  textAlign: isArabic ? 'right' : 'left'
                }}>
                  {i18n.t('profile.dailyMacroGoals')}
                </Text>
              </View>
            }
          >
            <FieldRow 
              label={
                <View style={{ flexDirection: isArabic ? 'row-reverse' : 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons 
                    name="fire" 
                    size={18} 
                    color={palette.accent}
                    style={{ marginRight: isArabic ? 0 : 6, marginLeft: isArabic ? 6 : 0 }}
                  />
                  <Text style={{ fontSize: 15, color: '#1D1923' }}>{i18n.t('profile.calories')}</Text>
                </View>
              }
              value={renderEditableValue('calories', nutritionPlan.targetCalories, i18n.t('profile.kcal'))}
            />
            <FieldRow 
              label={
                <View style={{ flexDirection: isArabic ? 'row-reverse' : 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons 
                    name="barley" 
                    size={18} 
                    color={palette.carbs}
                    style={{ marginRight: isArabic ? 0 : 6, marginLeft: isArabic ? 6 : 0 }}
                  />
                  <Text style={{ fontSize: 15, color: '#1D1923' }}>{i18n.t('profile.carbs')}</Text>
                </View>
              }
              value={renderEditableValue('carbs', nutritionPlan.targetCarbsGrams, i18n.t('profile.grams'))}
            />
            <FieldRow 
              label={
                <View style={{ flexDirection: isArabic ? 'row-reverse' : 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons 
                    name="food-drumstick" 
                    size={18} 
                    color={palette.protein}
                    style={{ marginRight: isArabic ? 0 : 6, marginLeft: isArabic ? 6 : 0 }}
                  />
                  <Text style={{ fontSize: 15, color: '#1D1923' }}>{i18n.t('profile.protein')}</Text>
                </View>
              }
              value={renderEditableValue('protein', nutritionPlan.targetProteinGrams, i18n.t('profile.grams'))}
            />
            <FieldRow 
              label={
                <View style={{ flexDirection: isArabic ? 'row-reverse' : 'row', alignItems: 'center' }}>
                  <FontAwesome5 
                    name="tint" 
                    size={18} 
                    color={palette.fats}
                    style={{ marginRight: isArabic ? 0 : 6, marginLeft: isArabic ? 6 : 0 }}
                  />
                  <Text style={{ fontSize: 15, color: '#1D1923' }}>{i18n.t('profile.fats')}</Text>
                </View>
              }
              value={renderEditableValue('fats', nutritionPlan.targetFatsGrams, i18n.t('profile.grams'))}
              isLast={true}
            />
          </InfoCard>
        )}

        {/* Section for Physical Info */}
        {user && (
          <InfoCard title={i18n.t('profile.myPhysicalInfo')}>
            {isOnboardingDataLoading ? (
              <View className="p-4 items-center justify-center">
                <ActivityIndicator size="small" color="#4A90E2" />
              </View>
            ) : (
              <>
                <FieldRow 
                  label={i18n.t('profile.birthday')}
                  value={onboardingData.dateOfBirth ? onboardingData.dateOfBirth : i18n.t('profile.notSet')}
                />
                <FieldRow 
                  label={i18n.t('profile.height')}
                  value={onboardingData.height 
                    ? renderEditableValue('height', onboardingData.height.value, isArabic ? 'سم' : 'cm')
                    : i18n.t('profile.notSet')}
                />
                <FieldRow 
                  label={i18n.t('profile.weight')}
                  value={onboardingData.weight 
                    ? renderEditableValue('weight', onboardingData.weight.value, isArabic ? 'كغ' : 'kg')
                    : i18n.t('profile.notSet')}
                  isLast={true}
                />
              </>
            )}
          </InfoCard>
        )}
        
        <InfoCard title={i18n.t('profile.appSettings')}>
            <FieldRow 
              label={i18n.t('profile.notifications')}
              right={
                <Switch
                  value={userData.notifications}
                  onValueChange={(value) => setUserData({...userData, notifications: value})}
                  trackColor={{ false: '#C9CDD6', true: '#1D1923' }}
                  thumbColor="#FFF"
                />
              }
            />
            <FieldRow 
              label={i18n.t('profile.language')}
              right={<LanguageSelector />}
              isLast={true}
            />
        </InfoCard>
        
        <InfoCard title={i18n.t('profile.legal')}>
          <TouchableOpacity onPress={openPrivacyPolicy}>
            <FieldRow 
              label={i18n.t('profile.privacyPolicy')}
              right={
                <Text className="text-[15px] text-[#6E7685]">{isArabic ? '←' : '→'}</Text>
              }
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={openTermsAndConditions}>
            <FieldRow 
              label={i18n.t('profile.termsAndConditions')}
              right={
                <Text className="text-[15px] text-[#6E7685]">{isArabic ? '←' : '→'}</Text>
              }
            />
          </TouchableOpacity>
          <FieldRow 
            label={i18n.t('profile.appVersion')}
            right={
              <Text className="text-[15px] text-[#6E7685]">1.0</Text>
            }
            isLast={true}
          />
        </InfoCard>
        
        {user && (
          <View className="px-4 mb-8">
            <TouchableOpacity 
              className="bg-[#D32F2F] rounded-[20px] py-[14px] items-center shadow-md"
              onPress={handleLogout}
            >
              <Text className="text-white text-[17px] font-semibold">{i18n.t('profile.logOut')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      </View>
    </SafeAreaView>
  );
}
