import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '@/constants/Colors';

// Define workout frequency options
const WORKOUT_OPTIONS = [
  { id: '0-2', text: '0-2', description: 'Workouts now and then', icon: 'walk-outline' }, // Example icons
  { id: '3-5', text: '3-5', description: 'A few workouts per week', icon: 'barbell-outline' },
  { id: '6+', text: '6+', description: 'Dedicated athlete', icon: 'fitness-outline' },
];

export default function Step4WorkoutsScreen() {
  const router = useRouter();
  const [selectedWorkouts, setSelectedWorkouts] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedWorkouts) {
      console.log('Workouts per week:', selectedWorkouts);
      router.push('/(onboarding)/step3_source'); // Navigate to source step
    }
  };

  const renderOption = (option: typeof WORKOUT_OPTIONS[0]) => {
    const isSelected = selectedWorkouts === option.id;
    return (
      <TouchableOpacity
        key={option.id}
        className={`flex-row items-center p-4 border rounded-lg mb-3 border-gray-200 ${!isSelected ? 'bg-gray-100' : ''}`}
        style={isSelected ? { backgroundColor: palette.primary, borderColor: palette.primary } : {}}
        onPress={() => setSelectedWorkouts(option.id)}
      >
        <Ionicons 
          name={option.icon as keyof typeof Ionicons.glyphMap} 
          size={24} // Slightly larger icon
          color={isSelected ? 'white' : '#333'} 
          className="mr-4"
        />
        <View>
          <Text className={`${isSelected ? 'text-white' : 'text-gray-800'} text-base font-semibold`}>{option.text}</Text>
          <Text className={`${isSelected ? 'text-gray-200' : 'text-gray-500'} text-sm`}>{option.description}</Text>
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
          How many days do you workout?
        </Text>
        <Text className="text-base text-gray-600 mb-8">
          Helps us recommend the right plan for you.
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
          <Text className={`text-lg font-semibold ${selectedWorkouts ? 'text-white' : 'text-gray-500'}`}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Reusing styles

