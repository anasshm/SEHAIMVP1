import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useOnboarding } from '../OnboardingContext';
import { palette } from '@/constants/Colors'; // Import palette
import i18n, { isRTL } from '@/utils/i18n';
import * as Haptics from 'expo-haptics';
import { useGoToNextPage } from '@/utils/onboarding/navigationHelper';

// Define the type for an option
type ObstacleOption = {
  id: string;
  translationKey: string;
  icon: keyof typeof Ionicons.glyphMap;
};

// Define options for the obstacles screen with explicit typing
const OBSTACLE_OPTIONS: ObstacleOption[] = [
  { id: 'consistency', translationKey: 'onboarding.obstacles.options.consistency', icon: 'repeat-outline' },
  { id: 'habits', translationKey: 'onboarding.obstacles.options.habits', icon: 'fast-food-outline' },
  { id: 'support', translationKey: 'onboarding.obstacles.options.support', icon: 'people-outline' },
  { id: 'schedule', translationKey: 'onboarding.obstacles.options.schedule', icon: 'calendar-outline' },
  { id: 'inspiration', translationKey: 'onboarding.obstacles.options.inspiration', icon: 'bulb-outline' },
];

export default function Step9ObstaclesScreen() {
  const goToNextPage = useGoToNextPage();
  const { setObstacles, setIsOnboardingComplete } = useOnboarding();
  const [selectedObstacle, setSelectedObstacle] = useState<string | null>(null);

  const handleSelectObstacle = (obstacleId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedObstacle(obstacleId);
  };

  const goToNextStep = () => {
    if (selectedObstacle) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      console.log('Obstacle selected:', selectedObstacle);
      setObstacles(selectedObstacle ? [selectedObstacle] : null);
      goToNextPage(); // Navigate to the next page using the new system
    }
  };

  // Reusable component for rendering options - type matches ObstacleOption
  const renderOption = (option: ObstacleOption) => {
    const isSelected = selectedObstacle === option.id;
    return (
      <TouchableOpacity
        key={option.id}
        style={[
          isSelected 
            ? { backgroundColor: palette.primary, borderColor: palette.primary } 
            : { backgroundColor: 'white', borderColor: '#d1d5db' /* gray-300 from Tailwind's default theme */ },
          { flexDirection: isRTL() ? 'row-reverse' : 'row' }
        ]}
        className={`items-center p-4 border rounded-lg mb-4`}
        onPress={() => handleSelectObstacle(option.id)}
      >
        <Ionicons 
          name={option.icon} 
          size={20} 
          color={isSelected ? 'white' : palette.primary} 
          style={{ [isRTL() ? 'marginLeft' : 'marginRight']: 12 }}
        />
        <Text 
          style={{ 
            color: isSelected ? 'white' : palette.primary,
            textAlign: isRTL() ? 'right' : 'left',
            flex: 1
          }}
          className={`text-base font-medium`}
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
          className="text-3xl font-bold mb-8 text-gray-800"
          style={{ textAlign: isRTL() ? 'right' : 'left', writingDirection: isRTL() ? 'rtl' : 'ltr' }}
        >
          {i18n.t('onboarding.obstacles.title')}
        </Text>

        {/* Container for options - This view expands and centers the buttons */}
        <View className="flex-1 justify-center">
          {OBSTACLE_OPTIONS.map(renderOption)}
        </View>

      </ScrollView>

      {/* Fixed Continue Button at the bottom */}
      <View className="absolute bottom-1 left-0 right-0 px-7 py-10 bg-white border-t border-gray-200">
        <TouchableOpacity
          style={{ backgroundColor: selectedObstacle ? palette.primary : '#d1d5db' /* gray-300 from Tailwind's default theme */ }}
          className={`py-5 px-4 rounded-full items-center`}
          onPress={goToNextStep}
          disabled={!selectedObstacle}
        >
          <Text className={`text-lg font-semibold ${selectedObstacle ? 'text-white' : 'text-gray-500'}`}>
            {i18n.t('onboarding.common.continue')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
