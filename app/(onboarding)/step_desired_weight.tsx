import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { RulerPicker } from 'react-native-ruler-picker';
import { useOnboarding } from '../OnboardingContext';
import { palette } from '@/constants/Colors';
import i18n, { isRTL } from '@/utils/i18n';
import * as Haptics from 'expo-haptics';

export default function StepDesiredWeightScreen() {
  const router = useRouter();
  const { setWeight, onboardingData } = useOnboarding();
  
  // Get current weight or default to 70kg
  const currentWeight = onboardingData.weight?.value 
    ? parseInt(onboardingData.weight.value) 
    : 70;
    
  const [selectedWeight, setSelectedWeight] = useState(currentWeight);

  const goToNextStep = () => {
    if (selectedWeight) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setWeight({ value: selectedWeight.toString(), unit: 'kg' });
      console.log('Desired weight:', selectedWeight, 'kg');
      
      // Navigate to next screen in the updated flow
      router.push('/(onboarding)/step1_calorie_apps'); 
    }
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerTitle: () => null, headerLeft: () => null }} />
      
      <ScrollView 
        className="flex-1 p-6"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }} 
      >
        <Text 
          className="text-3xl font-bold mb-2 text-gray-800"
          style={{ textAlign: isRTL() ? 'right' : 'left', writingDirection: isRTL() ? 'rtl' : 'ltr' }}
        >
          {i18n.t('onboarding.desiredWeight.title')}
        </Text>
        <Text 
          className="text-base text-gray-600 mb-8"
          style={{ textAlign: isRTL() ? 'right' : 'left', writingDirection: isRTL() ? 'rtl' : 'ltr' }}
        >
          {i18n.t('onboarding.desiredWeight.subtitle')}
        </Text>

        {/* Weight Display and Ruler */}
        <View className="flex-1 justify-center items-center">
          {/* Current Weight Display */}
          <Text className="text-5xl font-bold text-gray-800 mb-8">
            {selectedWeight} kg
          </Text>
          
          {/* Ruler Picker */}
          <View style={{ height: 120, width: '100%', marginHorizontal: 20 }}>
            <RulerPicker
              min={30}
              max={200}
              step={1}
              fractionDigits={0}
              initialValue={selectedWeight}
              onValueChange={(value) => {
                Haptics.selectionAsync();
                setSelectedWeight(parseInt(value));
              }}
              onValueChangeEnd={(value) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedWeight(parseInt(value));
              }}
              unit=""
              height={100}
              indicatorColor={palette.primary}
              indicatorHeight={60}
              decelerationRate="fast"
              width={320}
            />
          </View>
        </View>

      </ScrollView>

      {/* Continue Button */}
      <View className="absolute bottom-1 left-0 right-0 px-7 py-10 bg-white border-t border-gray-200">
        <TouchableOpacity
          className="py-5 px-4 rounded-full items-center"
          style={{ backgroundColor: selectedWeight ? palette.primary : '#D1D5DB' /* gray-300 */ }}
          onPress={goToNextStep}
          disabled={!selectedWeight}
        >
          <Text className={`text-lg font-semibold ${selectedWeight ? 'text-white' : 'text-gray-500'}`}>
            {i18n.t('onboarding.common.continue')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 