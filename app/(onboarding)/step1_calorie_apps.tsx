import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useOnboarding } from '../OnboardingContext';
import { palette } from '@/constants/Colors';
import i18n, { isRTL } from '@/utils/i18n';
import * as Haptics from 'expo-haptics';

// Define calorie app experience options with translation keys
const CALORIE_APP_OPTIONS = [
  { id: 'yes', translationKey: 'onboarding.calorieApps.options.yes' },
  { id: 'no', translationKey: 'onboarding.calorieApps.options.no' },
];

export default function Step1CalorieAppsScreen() {
  const router = useRouter();
  const { setCalorieAppsExperience } = useOnboarding();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const goToNextStep = () => {
    if (selectedOption) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setCalorieAppsExperience(selectedOption);
      console.log('User calorie apps experience:', selectedOption);
      // Navigate to the next screen
      router.push('/(onboarding)/step_date_of_birth'); 
    }
  };

  const renderOption = (option: typeof CALORIE_APP_OPTIONS[0]) => {
    const isSelected = selectedOption === option.id;
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
          setSelectedOption(option.id);
        }}
      >
        {/* No icon needed here based on example */}
        <Text 
          className={`${isSelected ? 'text-white' : 'text-gray-800'} text-base font-medium`}
          style={{ 
            textAlign: isRTL() ? 'right' : 'left',
            flex: 1
          }}
        >
          {i18n.t(option.translationKey)}
        </Text>
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
        <Text 
          className="text-3xl font-bold mb-2 text-gray-800"
          style={{ textAlign: isRTL() ? 'right' : 'left', writingDirection: isRTL() ? 'rtl' : 'ltr' }}
        >
          {i18n.t('onboarding.calorieApps.title')}
        </Text>
        <Text 
          className="text-base text-gray-600 mb-8"
          style={{ textAlign: isRTL() ? 'right' : 'left', writingDirection: isRTL() ? 'rtl' : 'ltr' }}
        >
          {i18n.t('onboarding.calorieApps.subtitle')}
        </Text>

        <View className="flex-1 justify-center">
          {CALORIE_APP_OPTIONS.map(renderOption)}
        </View>

      </ScrollView>

      <View className="absolute bottom-1 left-0 right-0 px-7 py-10 bg-white border-t border-gray-200">
        <TouchableOpacity
          className="py-5 px-4 rounded-full items-center"
          style={{ backgroundColor: selectedOption ? palette.primary : '#D1D5DB' /* gray-300 */ }}
          onPress={goToNextStep}
          disabled={!selectedOption}
        >
          <Text className={`text-lg font-semibold ${selectedOption ? 'text-white' : 'text-gray-500'}`}>
            {i18n.t('onboarding.common.continue')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Reusing styles 