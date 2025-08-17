import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useOnboarding } from '../OnboardingContext';
import { palette } from '@/constants/Colors'; // Import palette

// Define the type for an option
type ObstacleOption = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

// Define options for the obstacles screen with explicit typing
const OBSTACLE_OPTIONS: ObstacleOption[] = [
  { id: 'consistency', label: 'Lack of consistency', icon: 'repeat-outline' },
  { id: 'habits', label: 'Unhealthy eating habits', icon: 'fast-food-outline' },
  { id: 'support', label: 'Lack of support', icon: 'people-outline' },
  { id: 'schedule', label: 'Busy schedule', icon: 'calendar-outline' },
  { id: 'inspiration', label: 'Lack of meal inspiration', icon: 'bulb-outline' },
];

export default function Step9ObstaclesScreen() {
  const router = useRouter();
  const { setObstacles, setIsOnboardingComplete } = useOnboarding();
  const [selectedObstacle, setSelectedObstacle] = useState<string | null>(null);

  const handleSelectObstacle = (obstacleId: string) => {
    setSelectedObstacle(obstacleId);
  };

  const goToNextStep = () => {
    if (selectedObstacle) {
      console.log('Obstacle selected:', selectedObstacle);
      setObstacles(selectedObstacle ? [selectedObstacle] : null);
      router.push('/(onboarding)/paywall');
    }
  };

  // Reusable component for rendering options - type matches ObstacleOption
  const renderOption = (option: ObstacleOption) => {
    const isSelected = selectedObstacle === option.id;
    return (
      <TouchableOpacity
        key={option.id}
        style={isSelected 
            ? { backgroundColor: palette.primary, borderColor: palette.primary } 
            : { backgroundColor: 'white', borderColor: '#d1d5db' /* gray-300 from Tailwind's default theme */ }
        }
        className={`flex-row items-center p-4 border rounded-lg mb-4`}
        onPress={() => handleSelectObstacle(option.id)}
      >
        <Ionicons 
          name={option.icon} 
          size={20} 
          color={isSelected ? 'white' : palette.primary} 
          className="mr-3" 
        />
        <Text 
          style={{ color: isSelected ? 'white' : palette.primary}}
          className={`text-base font-medium`}
        >
          {option.label}
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
        <Text className="text-3xl font-bold mb-8 text-gray-800">
          What's stopping you from reaching your goals?
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
          <Text className={`text-lg font-semibold ${selectedObstacle ? 'text-white' : 'text-gray-500'}`}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
