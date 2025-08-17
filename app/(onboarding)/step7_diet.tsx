import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { palette } from '@/constants/Colors';
import i18n, { isRTL } from '@/utils/i18n';

// Define the type for an option
type DietOption = {
  id: string;
  translationKey: string;
  icon: keyof typeof Ionicons.glyphMap;
};

// Define options for the diet screen with explicit typing
const DIET_OPTIONS: DietOption[] = [
  { id: 'classic', translationKey: 'onboarding.diet.options.classic', icon: 'restaurant-outline' },
  { id: 'pescatarian', translationKey: 'onboarding.diet.options.pescatarian', icon: 'fish-outline' },
  { id: 'vegetarian', translationKey: 'onboarding.diet.options.vegetarian', icon: 'leaf-outline' },
  { id: 'vegan', translationKey: 'onboarding.diet.options.vegan', icon: 'nutrition-outline' }, // Placeholder icon, maybe leaf again?
];

export default function Step7DietScreen() {
  const router = useRouter();
  const [selectedDiet, setSelectedDiet] = useState<string | null>(null);

  const handleSelectDiet = (dietId: string) => {
    setSelectedDiet(dietId);
  };

  const goToNextStep = () => {
    if (selectedDiet) {
      console.log('Diet selected:', selectedDiet);
      router.push('/(onboarding)/step8_accomplishments'); // Navigate to Accomplishments step
    }
  };

  // Reusable component for rendering options - type matches DietOption
  const renderOption = (option: DietOption) => {
    const isSelected = selectedDiet === option.id;
    return (
      <TouchableOpacity
        key={option.id}
        // Apply exact styling from step2
        className={`items-center p-4 border rounded-lg mb-4 ${!isSelected ? 'bg-white border-gray-300' : ''}`}
        style={[
          isSelected ? { backgroundColor: palette.primary, borderColor: palette.primary } : {},
          { flexDirection: isRTL() ? 'row-reverse' : 'row' }
        ]}
        onPress={() => handleSelectDiet(option.id)}
      >
        <Ionicons 
          name={option.icon} 
          size={20} // Target size
          color={isSelected ? 'white' : '#333'} 
          style={{ [isRTL() ? 'marginLeft' : 'marginRight']: 12 }}
        />
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
        {/* Title and Description stay at the top */}
        <Text 
          className="text-3xl font-bold mb-2 text-gray-800"
          style={{ textAlign: isRTL() ? 'right' : 'left', writingDirection: isRTL() ? 'rtl' : 'ltr' }}
        >
          {i18n.t('onboarding.diet.title')}
        </Text>
        <Text 
          className="text-base text-gray-600 mb-8"
          style={{ textAlign: isRTL() ? 'right' : 'left', writingDirection: isRTL() ? 'rtl' : 'ltr' }}
        >
          {i18n.t('onboarding.diet.subtitle')}
        </Text>

        {/* Container for options - This view expands and centers the buttons */}
        <View className="flex-1 justify-center">
          {DIET_OPTIONS.map(renderOption)}
        </View>

      </ScrollView>

      {/* Fixed Continue Button at the bottom */}
      <View className="absolute bottom-1 left-0 right-0 px-7 py-10 bg-white border-t border-gray-200">
        <TouchableOpacity
          className="py-5 px-4 rounded-full items-center"
          style={{ backgroundColor: selectedDiet ? palette.primary : '#D1D5DB' /* gray-300 */ }}
          onPress={goToNextStep}
          disabled={!selectedDiet}
        >
          <Text className={`text-lg font-semibold ${selectedDiet ? 'text-white' : 'text-gray-500'}`}>
            {i18n.t('onboarding.common.continue')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
