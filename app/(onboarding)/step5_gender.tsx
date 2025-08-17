import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useOnboarding } from '../OnboardingContext';
import { palette } from '@/constants/Colors';
import i18n, { isRTL } from '@/utils/i18n';

// Define gender options with translation keys
const GENDER_OPTIONS = [
  { id: 'male', translationKey: 'onboarding.gender.options.male' },
  { id: 'female', translationKey: 'onboarding.gender.options.female' },
];

export default function Step5GenderScreen() {
  const router = useRouter();
  const { setGender } = useOnboarding();
  const [selectedGender, setSelectedGender] = useState<string | null>(null);

  const goToNextStep = () => {
    if (selectedGender) {
      setGender(selectedGender);
      console.log('User gender:', selectedGender);
      // Navigate to the next screen (final signup/login)
      router.push('/(onboarding)/step6_goal'); 
    }
  };

  const renderOption = (option: typeof GENDER_OPTIONS[0]) => {
    const isSelected = selectedGender === option.id;
    return (
      <TouchableOpacity
        key={option.id}
        className={`items-center p-4 border rounded-lg mb-3 border-gray-200 ${!isSelected ? 'bg-gray-100' : ''}`}
        style={[
          isSelected ? { backgroundColor: palette.primary, borderColor: palette.primary } : {},
          { flexDirection: isRTL() ? 'row-reverse' : 'row' }
        ]}
        onPress={() => setSelectedGender(option.id)}
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
          {i18n.t('onboarding.gender.title')}
        </Text>
        <Text 
          className="text-base text-gray-600 mb-8"
          style={{ textAlign: isRTL() ? 'right' : 'left', writingDirection: isRTL() ? 'rtl' : 'ltr' }}
        >
          {i18n.t('onboarding.gender.subtitle')}
        </Text>

        <View className="flex-1 justify-center">
          {GENDER_OPTIONS.map(renderOption)}
        </View>

      </ScrollView>

      <View className="absolute bottom-1 left-0 right-0 px-7 py-10 bg-white border-t border-gray-200">
        <TouchableOpacity
          className="py-5 px-4 rounded-full items-center"
          style={{ backgroundColor: selectedGender ? palette.primary : '#D1D5DB' /* gray-300 */ }}
          onPress={goToNextStep}
          disabled={!selectedGender}
        >
          <Text className={`text-lg font-semibold ${selectedGender ? 'text-white' : 'text-gray-500'}`}>
            {i18n.t('onboarding.common.continue')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Reusing styles

