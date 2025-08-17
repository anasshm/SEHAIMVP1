// The patch instructions below were causing a syntax error and have been removed.
// If you need to patch react-native-wheely, do so directly inside the library or via a patch package.

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { palette } from '@/constants/Colors'; // Import palette
import i18n, { isRTL } from '@/utils/i18n';

// Define the type for an option
type AccomplishmentOption = {
  id: string;
  translationKey: string;
  icon: keyof typeof Ionicons.glyphMap;
};

// Define options for the accomplishments screen with explicit typing
const ACCOMPLISHMENT_OPTIONS: AccomplishmentOption[] = [
  { id: 'healthier', translationKey: 'onboarding.accomplishments.options.healthier', icon: 'heart-outline' }, // Changed from 'apple-outline' as it wasn't fitting
  { id: 'confident', translationKey: 'onboarding.accomplishments.options.confident', icon: 'happy-outline' }, // Changed icon and moved to 2nd
  { id: 'energy', translationKey: 'onboarding.accomplishments.options.energy', icon: 'sunny-outline' },
  { id: 'body', translationKey: 'onboarding.accomplishments.options.body', icon: 'body-outline' },
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
        style={[
          isSelected 
            ? { backgroundColor: palette.primary, borderColor: palette.primary } 
            : { backgroundColor: 'white', borderColor: '#d1d5db' /* gray-300 from Tailwind's default theme */ },
          { flexDirection: isRTL() ? 'row-reverse' : 'row' }
        ]}
        className={`items-center p-4 border rounded-lg mb-4`}
        onPress={() => handleSelectAccomplishment(option.id)}
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
          {i18n.t('onboarding.accomplishments.title')}
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
          <Text className={`text-lg font-semibold ${selectedAccomplishment ? 'text-white' : 'text-gray-500'}`}>
            {i18n.t('onboarding.common.continue')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
