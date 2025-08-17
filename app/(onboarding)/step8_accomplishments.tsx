// The patch instructions below were causing a syntax error and have been removed.
// If you need to patch react-native-wheely, do so directly inside the library or via a patch package.

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { palette } from '@/constants/Colors'; // Import palette

// Define the type for an option
type AccomplishmentOption = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

// Define options for the accomplishments screen with explicit typing
const ACCOMPLISHMENT_OPTIONS: AccomplishmentOption[] = [
  { id: 'healthier', label: 'Eat and live healthier', icon: 'heart-outline' }, // Changed from 'apple-outline' as it wasn't fitting
  { id: 'motivated', label: 'Feel more confident and attractive', icon: 'happy-outline' }, // Changed icon and moved to 2nd
  { id: 'energy', label: 'Boost my energy and mood', icon: 'sunny-outline' },
  { id: 'body', label: 'Feel better about my body', icon: 'body-outline' },
];

export default function Step8AccomplishmentsScreen() {
  const router = useRouter();
  const [selectedAccomplishment, setSelectedAccomplishment] = useState<string | null>(null);

  const handleSelectAccomplishment = (accomplishmentId: string) => {
    setSelectedAccomplishment(accomplishmentId);
  };

  const goToNextStep = () => {
    if (selectedAccomplishment) {
      console.log('Accomplishment selected:', selectedAccomplishment);
      router.push('/(onboarding)/step9_obstacles'); // Navigate to Obstacles step
    }
  };

  // Reusable component for rendering options - type matches AccomplishmentOption
  const renderOption = (option: AccomplishmentOption) => {
    const isSelected = selectedAccomplishment === option.id;
    return (
      <TouchableOpacity
        key={option.id}
        style={isSelected 
            ? { backgroundColor: palette.primary, borderColor: palette.primary } 
            : { backgroundColor: 'white', borderColor: '#d1d5db' /* gray-300 from Tailwind's default theme */ }
        }
        className={`flex-row items-center p-4 border rounded-lg mb-4`}
        onPress={() => handleSelectAccomplishment(option.id)}
      >
        <Ionicons 
          name={option.icon} 
          size={20} // Target size
          color={isSelected ? 'white' : palette.primary} // Icon color: white when selected, primary color when not.
          className="mr-3" // Target margin
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
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }} // Ensure it can grow, bottom padding for button
      >
        {/* Title and Description stay at the top */}
        <Text className="text-3xl font-bold mb-8 text-gray-800">
          What would you like to accomplish?
        </Text>

        {/* Container for options - This view expands and centers the buttons */}
        <View className="flex-1 justify-center">
          {ACCOMPLISHMENT_OPTIONS.map(renderOption)}
        </View>

      </ScrollView>

      {/* Fixed Continue Button at the bottom */}
      <View className="absolute bottom-1 left-0 right-0 px-7 py-10 bg-white border-t border-gray-200">
        <TouchableOpacity
          style={{ backgroundColor: selectedAccomplishment ? palette.primary : '#d1d5db' /* gray-300 from Tailwind's default theme */ }}
          className={`py-5 px-4 rounded-full items-center`} 
          onPress={goToNextStep}
          disabled={!selectedAccomplishment}
        >
          <Text style={{ color: selectedAccomplishment ? 'white' : '#6b7280' /* gray-500 */}} className={`text-lg font-semibold`}>Continue</Text> 
        </TouchableOpacity>
      </View>
    </View>
  );
}
