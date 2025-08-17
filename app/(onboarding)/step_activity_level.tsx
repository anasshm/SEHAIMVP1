import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useOnboarding } from '../OnboardingContext';
import { palette } from '@/constants/Colors';

// Define activity level options with icons
const ACTIVITY_LEVEL_OPTIONS = [
  { id: '0-2', mainText: '0-2', subText: 'Workouts now and then', icon: 'walk-outline' as keyof typeof Ionicons.glyphMap },
  { id: '3-5', mainText: '3-5', subText: 'A few workouts per week', icon: 'barbell-outline' as keyof typeof Ionicons.glyphMap },
  { id: '6+', mainText: '6+', subText: 'Dedicated athlete', icon: 'flame-outline' as keyof typeof Ionicons.glyphMap },
];

export default function StepActivityLevelScreen() {
  const router = useRouter();
  const { setActivityLevel } = useOnboarding();
  const [selectedActivityLevel, setSelectedActivityLevel] = useState<string | null>(null);

  const goToNextStep = () => {
    if (selectedActivityLevel) {
      setActivityLevel(selectedActivityLevel);
      console.log('User activity level:', selectedActivityLevel);
      router.push('/(onboarding)/step7_diet'); 
    }
  };

  const renderOption = (option: typeof ACTIVITY_LEVEL_OPTIONS[0]) => {
    const isSelected = selectedActivityLevel === option.id;
    return (
      <TouchableOpacity
        key={option.id}
        className={`flex-row items-center p-4 border rounded-lg mb-3 border-gray-200 ${!isSelected ? 'bg-gray-100' : ''}`}
        style={isSelected ? { backgroundColor: palette.primary, borderColor: palette.primary } : {}}
        onPress={() => setSelectedActivityLevel(option.id)}
      >
        <Ionicons 
          name={option.icon} 
          size={20} 
          color={isSelected ? 'white' : '#333'} 
          className="mr-3"
        />
        <View>
          <Text className={`${isSelected ? 'text-white' : 'text-gray-800'} text-base font-medium`}>{option.mainText}</Text>
          <Text className={`${isSelected ? 'text-white' : 'text-gray-600'} text-sm`}>{option.subText}</Text>
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
        <Text className="text-3xl font-bold mb-2 text-gray-800">
          How many workouts do you do per week?
        </Text>
        <Text className="text-base text-gray-600 mb-8">
          This will be used to calibrate your custom plan.
        </Text>

        <View className="flex-1 justify-center">
          {ACTIVITY_LEVEL_OPTIONS.map(renderOption)}
        </View>

      </ScrollView>

      <View className="absolute bottom-1 left-0 right-0 px-7 py-10 bg-white border-t border-gray-200">
        <TouchableOpacity
          className="py-5 px-4 rounded-full items-center"
          style={{ backgroundColor: selectedActivityLevel ? palette.primary : '#D1D5DB' /* gray-300 */ }}
          onPress={goToNextStep}
          disabled={!selectedActivityLevel}
        >
          <Text className={`text-lg font-semibold ${selectedActivityLevel ? 'text-white' : 'text-gray-500'}`}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Reusing styles from gender page for consistency

