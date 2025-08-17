import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Or FontAwesome, etc.
import { palette } from '@/constants/Colors';

export default function Step2ExperienceScreen() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<'yes' | 'no' | null>(null);

  const goToNextStep = () => {
    if (selectedOption) {
      // TODO: Save the selection if needed (e.g., to state management or async storage)
      console.log('User experience:', selectedOption);
      router.push('/(onboarding)/step6_goal'); // Navigate to Goal step
    }
  };

  const renderOption = (value: 'yes' | 'no', text: string, iconName: keyof typeof Ionicons.glyphMap) => {
    const isSelected = selectedOption === value;
    return (
      <TouchableOpacity
        className={`flex-row items-center p-4 border rounded-lg mb-4 border-gray-200 ${!isSelected ? 'bg-gray-100' : ''}`}
        style={isSelected ? { backgroundColor: palette.primary, borderColor: palette.primary } : {}}
        onPress={() => setSelectedOption(value)}
      >
        <Ionicons 
          name={iconName} 
          size={20} 
          color={isSelected ? 'white' : '#333'} 
          className="mr-3"
        />
        <Text className={`${isSelected ? 'text-white' : 'text-gray-800'} text-base font-medium`}>{text}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerTitle: () => null, headerLeft: () => null }} />

      <ScrollView
        className="flex-1 p-6" // Keep inner padding for content
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }} // Ensure it can grow, remove justifyContent
      >
        <Text className="text-3xl font-bold mb-8 text-gray-800">
          Have you tried other calorie tracking apps?
        </Text>

        <View className="flex-1 justify-center">
          {renderOption('no', 'No', 'thumbs-down-outline')}
          {renderOption('yes', 'Yes', 'thumbs-up-outline')}
        </View>
      </ScrollView>

      <View className="absolute bottom-1 left-0 right-0 px-7 py-10 bg-white border-t border-gray-200">
        <TouchableOpacity
          className="py-5 px-4 rounded-full items-center"
          style={{ backgroundColor: selectedOption ? palette.primary : '#D1D5DB' /* gray-300 */ }}
          onPress={goToNextStep}
          disabled={!selectedOption}
        >
          <Text className={`text-lg font-semibold ${selectedOption ? 'text-white' : 'text-gray-500'}`}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Centralized styles for options to keep JSX cleaner

