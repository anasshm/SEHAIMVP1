import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '@/constants/Colors';
import { useGoToNextPage } from '@/utils/onboarding/navigationHelper';
import { useOnboarding } from '../OnboardingContext';
import i18n, { isRTL } from '@/utils/i18n';
import * as Haptics from 'expo-haptics';

// Define workout frequency options with translation keys
const WORKOUT_OPTIONS = [
  { id: '0-2', translationKey: 'onboarding.activityLevel.options.0-2', icon: 'walk-outline' },
  { id: '3-5', translationKey: 'onboarding.activityLevel.options.3-5', icon: 'barbell-outline' },
  { id: '6+', translationKey: 'onboarding.activityLevel.options.6+', icon: 'fitness-outline' },
];

export default function Step4WorkoutsScreen() {
  const goToNextPage = useGoToNextPage();
  const { setActivityLevel } = useOnboarding();
  const [selectedWorkouts, setSelectedWorkouts] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedWorkouts) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      console.log('Workouts per week:', selectedWorkouts);
      setActivityLevel(selectedWorkouts); // Save to OnboardingContext
      goToNextPage(); // Navigate to next page using the new system
    }
  };

  const renderOption = (option: typeof WORKOUT_OPTIONS[0]) => {
    const isSelected = selectedWorkouts === option.id;
    return (
      <TouchableOpacity
        key={option.id}
        className={`items-center p-4 border rounded-lg mb-3 border-gray-200 ${!isSelected ? 'bg-gray-100' : ''}`}
        style={[
          isSelected ? { backgroundColor: palette.primary, borderColor: palette.primary } : {},
          { flexDirection: isRTL() ? 'row-reverse' : 'row' }
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setSelectedWorkouts(option.id);
        }}
      >
        <Ionicons 
          name={option.icon as keyof typeof Ionicons.glyphMap} 
          size={24} // Slightly larger icon
          color={isSelected ? 'white' : '#333'} 
          style={{
            marginRight: isRTL() ? 0 : 16,
            marginLeft: isRTL() ? 16 : 0,
          }}
        />
        <View style={{ flex: 1 }}>
          <Text className={`${isSelected ? 'text-white' : 'text-gray-800'} text-base font-semibold`} 
                style={{ textAlign: isRTL() ? 'right' : 'left', writingDirection: isRTL() ? 'rtl' : 'ltr' }}>
            {i18n.t(`${option.translationKey}.main`)}
          </Text>
          <Text className={`${isSelected ? 'text-gray-200' : 'text-gray-500'} text-sm`}
                style={{ textAlign: isRTL() ? 'right' : 'left', writingDirection: isRTL() ? 'rtl' : 'ltr' }}>
            {i18n.t(`${option.translationKey}.sub`)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerTitle: () => null, headerLeft: () => null }} />
      
      <ScrollView 
        className="flex-1 p-6"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }} 
      >
        <Text className="text-3xl font-bold mb-2 text-gray-800"
              style={{ textAlign: isRTL() ? 'right' : 'left', writingDirection: isRTL() ? 'rtl' : 'ltr' }}>
          {i18n.t('onboarding.activityLevel.title')}
        </Text>
        <Text className="text-base text-gray-600 mb-8"
              style={{ textAlign: isRTL() ? 'right' : 'left', writingDirection: isRTL() ? 'rtl' : 'ltr' }}>
          {i18n.t('onboarding.activityLevel.subtitle')}
        </Text>

        <View className="flex-1 justify-center">
          {WORKOUT_OPTIONS.map(renderOption)}
        </View>

      </ScrollView>

      <View className="absolute bottom-1 left-0 right-0 px-7 py-10 bg-white border-t border-gray-200">
        <TouchableOpacity
          className="py-5 px-4 rounded-full items-center"
          style={{ backgroundColor: selectedWorkouts ? palette.primary : '#D1D5DB' /* gray-300 */ }}
          onPress={handleContinue}
          disabled={!selectedWorkouts}
        >
          <Text className={`text-lg font-semibold ${selectedWorkouts ? 'text-white' : 'text-gray-500'}`}>
            {i18n.t('onboarding.common.continue')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Reusing styles

