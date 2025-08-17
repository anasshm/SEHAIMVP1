import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, Switch, TouchableOpacity } from 'react-native';
import WheelPicker from 'react-native-wheely';
import { styled } from 'nativewind';
import { Stack, useRouter } from 'expo-router';
import { useOnboarding } from '../OnboardingContext';
import { palette } from '@/constants/Colors';
import i18n, { isRTL } from '@/utils/i18n';
import * as Haptics from 'expo-haptics';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledSwitch = styled(Switch);
const StyledTouchableOpacity = styled(TouchableOpacity);

// Helper to generate a range of numbers
const generateRange = (start: number, end: number, step: number = 1, unit: string = '') => {
  const range = [];
  for (let i = start; i <= end; i += step) {
    range.push(`${i}${unit}`);
  }
  return range;
};

// Data for pickers
const heightsCm = generateRange(100, 250, 1, ' cm');
const weightsKg = generateRange(30, 200, 1, ' kg');

const defaultMetricHeight = '165 cm';
const defaultMetricWeight = '52 kg';

export default function StepHeightWeightScreen() {
  const router = useRouter();
  const { setHeight, setWeight } = useOnboarding();

  // Memoized renderItem function
  const renderWheelyItem = useCallback((optionText: string) => (
    <Text style={{ fontSize: 18, color: '#6b7280' }}>{optionText}</Text>
  ), []);

  // Helper to calculate index safely
  const calculateInitialIndex = (optionsFuncOrArray: (() => string[]) | string[], targetValue: string) => {
    const options = typeof optionsFuncOrArray === 'function' ? optionsFuncOrArray() : optionsFuncOrArray;
    const idx = options.indexOf(targetValue);
    return idx !== -1 ? idx : 0;
  };

  const [selectedHeightIndex, setSelectedHeightIndex] = useState(() =>
    calculateInitialIndex(heightsCm, defaultMetricHeight)
  );
  const [selectedWeightIndex, setSelectedWeightIndex] = useState(() =>
    calculateInitialIndex(weightsKg, defaultMetricWeight)
  );

  const heightOptions = useMemo(() => heightsCm, []);
  const weightOptions = useMemo(() => weightsKg, []);

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const heightString = heightOptions[selectedHeightIndex]; // e.g., "165 cm"
    const weightString = weightOptions[selectedWeightIndex]; // e.g., "52 kg"

    // Parse value and unit
    const heightValue = parseInt(heightString);
    const heightUnit = heightString.includes('cm') ? 'cm' : 'ft'; // Assuming only cm or ft

    const weightValue = parseInt(weightString);
    const weightUnit = weightString.includes('kg') ? 'kg' : 'lbs'; // Assuming only kg or lbs

    if (!isNaN(heightValue) && (heightUnit === 'cm' || heightUnit === 'ft')) {
      setHeight({ value: String(heightValue), unit: heightUnit as 'cm' | 'ft' });
      console.log('Saved Height to context:', { value: heightValue, unit: heightUnit });
    } else {
      console.error('Invalid height string:', heightString);
    }

    if (!isNaN(weightValue) && (weightUnit === 'kg' || weightUnit === 'lbs')) {
      setWeight({ value: String(weightValue), unit: weightUnit as 'kg' | 'lbs' });
      console.log('Saved Weight to context:', { value: weightValue, unit: weightUnit });
    } else {
      console.error('Invalid weight string:', weightString);
    }
    
    router.push('/(onboarding)/step_date_of_birth'); // Navigate to the new date of birth step
  };

  return (
    <StyledView className="flex-1 bg-white pt-10">
      <Stack.Screen options={{ headerTitle: () => null, headerLeft: () => null }} />

      <StyledView className="px-6 mb-8 items-center">
        <StyledText 
          className="text-3xl font-bold mb-2 text-gray-800"
          style={{ textAlign: isRTL() ? 'right' : 'center', writingDirection: isRTL() ? 'rtl' : 'ltr' }}
        >
          {i18n.t('onboarding.heightWeight.title')}
        </StyledText>
        <StyledText 
          className="text-base text-gray-600"
          style={{ textAlign: isRTL() ? 'right' : 'center', writingDirection: isRTL() ? 'rtl' : 'ltr' }}
        >
          {i18n.t('onboarding.heightWeight.subtitle')}
        </StyledText>
      </StyledView>

      <StyledView className="flex-row justify-around w-full mb-10 px-5">
        <StyledView className="items-center w-2/5">
          <StyledText 
            className="text-xl font-semibold mb-3 text-gray-700"
            style={{ textAlign: isRTL() ? 'right' : 'center' }}
          >
            {i18n.t('onboarding.heightWeight.height')}
          </StyledText>
          <WheelPicker
            key="metric-height"
            selectedIndex={selectedHeightIndex}
            options={heightOptions}
            onChange={(index) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedHeightIndex(index);
            }}
            renderItem={renderWheelyItem}
            selectedIndicatorStyle={{ backgroundColor: '#f3f4f6', borderRadius: 8, height: 40 }} 
            containerStyle={{ height: 200, width: '100%' }}
            itemHeight={40}
          />
        </StyledView>

        <StyledView className="items-center w-2/5">
          <StyledText 
            className="text-xl font-semibold mb-3 text-gray-700"
            style={{ textAlign: isRTL() ? 'right' : 'center' }}
          >
            {i18n.t('onboarding.heightWeight.weight')}
          </StyledText>
          <WheelPicker
            key="metric-weight"
            selectedIndex={selectedWeightIndex}
            options={weightOptions}
            onChange={(index) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedWeightIndex(index);
            }}
            renderItem={renderWheelyItem}
            selectedIndicatorStyle={{ backgroundColor: '#f3f4f6', borderRadius: 8, height: 40 }} 
            containerStyle={{ height: 200, width: '100%' }}
            itemHeight={40}
          />
        </StyledView>
      </StyledView>

      {/* Fixed Continue Button at the bottom, consistent with other onboarding screens */}
      <StyledView className="absolute bottom-1 left-0 right-0 px-7 py-10 bg-white border-t border-gray-200">
        <StyledTouchableOpacity 
          className="py-5 px-4 rounded-full items-center"
          style={{ backgroundColor: palette.primary }}
          onPress={handleContinue}
        >
          <StyledText className="text-white text-lg font-semibold">
            {i18n.t('onboarding.common.continue')}
          </StyledText>
        </StyledTouchableOpacity>
      </StyledView>
    </StyledView>
  );
}
