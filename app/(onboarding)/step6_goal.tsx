import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useOnboarding } from '../OnboardingContext';
import { palette } from '@/constants/Colors';
import i18n, { isRTL } from '@/utils/i18n';
import * as Haptics from 'expo-haptics';

// Define the type for an option
type GoalOption = {
  id: string;
  translationKey: string;
  icon: keyof typeof Ionicons.glyphMap;
};

// Define options for the goal screen with explicit typing
const GOAL_OPTIONS: GoalOption[] = [
  { id: 'lose', translationKey: 'onboarding.goal.options.lose', icon: 'trending-down-outline' },
  { id: 'maintain', translationKey: 'onboarding.goal.options.maintain', icon: 'remove-outline' }, // Placeholder icon
  { id: 'gain', translationKey: 'onboarding.goal.options.gain', icon: 'trending-up-outline' },
];

export default function Step6GoalScreen() {
  const router = useRouter();
  const { setGoal } = useOnboarding();
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const handleSelectGoal = (goalId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedGoal(goalId);
  };

  const goToNextStep = () => {
    if (selectedGoal) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setGoal(selectedGoal);
      console.log('Goal selected:', selectedGoal);
      router.push('/(onboarding)/step_activity_level'); // Navigate to Activity Level step
    }
  };

  // Reusable component for rendering options - type matches GoalOption
  const renderOption = (option: GoalOption) => {
    const isSelected = selectedGoal === option.id;
    return (
      <TouchableOpacity
        key={option.id}
        className={`items-center p-4 border rounded-lg mb-4 ${!isSelected ? 'bg-white border-gray-300' : ''}`}
        style={[
          isSelected ? { backgroundColor: palette.primary, borderColor: palette.primary } : {},
          { flexDirection: isRTL() ? 'row-reverse' : 'row' }
        ]}
        onPress={() => handleSelectGoal(option.id)}
      >
        <Ionicons 
          name={option.icon} 
          size={20} 
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
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }} // Ensure it can grow, bottom padding for button
      >
        {/* Title and Description stay at the top */}
        <Text 
          className="text-3xl font-bold mb-2 text-gray-800"
          style={{ textAlign: isRTL() ? 'right' : 'left', writingDirection: isRTL() ? 'rtl' : 'ltr' }}
        >
          {i18n.t('onboarding.goal.title')}
        </Text>
        <Text 
          className="text-base text-gray-600 mb-8"
          style={{ textAlign: isRTL() ? 'right' : 'left', writingDirection: isRTL() ? 'rtl' : 'ltr' }}
        >
          {i18n.t('onboarding.goal.subtitle')}
        </Text>

        {/* Container for options - This view expands and centers the buttons */}
        <View className="flex-1 justify-center">
          {GOAL_OPTIONS.map(renderOption)}
        </View>

      </ScrollView>

      {/* Fixed Continue Button at the bottom */}
      <View className="absolute bottom-1 left-0 right-0 px-7 py-10 bg-white border-t border-gray-200">
        <TouchableOpacity
          className="py-5 px-4 rounded-full items-center"
          style={{ backgroundColor: selectedGoal ? palette.primary : '#D1D5DB' /* gray-300 */ }}
          onPress={goToNextStep}
          disabled={!selectedGoal}
        >
          <Text className={`text-lg font-semibold ${selectedGoal ? 'text-white' : 'text-gray-500'}`}>
            {i18n.t('onboarding.common.continue')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
