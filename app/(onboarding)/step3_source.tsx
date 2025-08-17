import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '@/constants/Colors';

// Define the source options with icons
const SOURCE_OPTIONS = [
  { id: 'instagram', text: 'Instagram', icon: 'logo-instagram' },
  { id: 'facebook', text: 'Facebook', icon: 'logo-facebook' },
  { id: 'tiktok', text: 'TikTok', icon: 'logo-tiktok' },
  { id: 'youtube', text: 'Youtube', icon: 'logo-youtube' },
  { id: 'google', text: 'Google', icon: 'logo-google' }, // Ionicons might not have a perfect Google logo, adjust if needed
  { id: 'tv', text: 'TV', icon: 'tv-outline' },
  { id: 'friend', text: 'Friend or family', icon: 'people-outline' },
  // Add 'Other' if needed
];

export default function Step3SourceScreen() {
  const router = useRouter();
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  const goToNextStep = () => {
    if (selectedSource) {
      console.log('Source selected:', selectedSource);
      router.push('/(onboarding)/step2_experience'); // Navigate to experience step
    }
  };

  const renderOption = (option: typeof SOURCE_OPTIONS[0]) => {
    const isSelected = selectedSource === option.id;
    return (
      <TouchableOpacity
        key={option.id}
        className={`flex-row items-center p-4 border rounded-lg mb-3 border-gray-200 ${!isSelected ? 'bg-gray-100' : ''}`}
        style={isSelected ? { backgroundColor: palette.primary, borderColor: palette.primary } : {}}
        onPress={() => setSelectedSource(option.id)}
      >
        <Ionicons 
          name={option.icon as keyof typeof Ionicons.glyphMap} 
          size={20} 
          color={isSelected ? 'white' : '#333'} 
          className="mr-3"
        />
        <Text className={`${isSelected ? 'text-white' : 'text-gray-800'} text-base font-medium`}>{option.text}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerTitle: () => null, headerLeft: () => null }} />
      
      {/* ScrollView needed if content exceeds screen height */}
      <ScrollView 
        className="flex-1 p-6"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }} // Ensure it can grow, remove justifyContent
      >
        {/* Title and Description stay at the top */}
        <Text className="text-3xl font-bold mb-2 text-gray-800">
          How did you hear about us?
        </Text>
        <Text className="text-base text-gray-600 mb-8">
          This helps us understand where our users are coming from.
        </Text>

        {/* Container for options - This view expands and centers the buttons */}
        <View className="flex-1 justify-center">
          {SOURCE_OPTIONS.map(renderOption)}
        </View>

      </ScrollView>

      {/* Fixed Continue Button at the bottom */}
      <View className="absolute bottom-1 left-0 right-0 px-7 py-10 bg-white border-t border-gray-200">
        <TouchableOpacity
          className="py-5 px-4 rounded-full items-center"
          style={{ backgroundColor: selectedSource ? palette.primary : '#D1D5DB' /* gray-300 */ }}
          onPress={goToNextStep}
          disabled={!selectedSource}
        >
          <Text className={`text-lg font-semibold ${selectedSource ? 'text-white' : 'text-gray-500'}`}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Reusing styles from previous step

