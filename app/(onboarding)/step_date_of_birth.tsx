import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import WheelPicker from 'react-native-wheely';
import { Stack } from 'expo-router';
import { useOnboarding } from '../OnboardingContext';
import i18n, { isRTL } from '@/utils/i18n';
import * as Haptics from 'expo-haptics';
import { useGoToNextPage } from './navigationHelper';

// Helper to generate a range of numbers
const generateRange = (start: number, end: number, step: number = 1, prefix: string = '', suffix: string = '') => {
  const range = [];
  for (let i = start; i <= end; i += step) {
    range.push(`${prefix}${i}${suffix}`);
  }
  return range;
};

const currentYear = new Date().getFullYear();

// Data for pickers
const dayOptions = generateRange(1, 31);

// Get localized month names from i18n
const getLocalizedMonthNames = () => [
  i18n.t('onboarding.dateOfBirth.months.january'),
  i18n.t('onboarding.dateOfBirth.months.february'),
  i18n.t('onboarding.dateOfBirth.months.march'),
  i18n.t('onboarding.dateOfBirth.months.april'),
  i18n.t('onboarding.dateOfBirth.months.may'),
  i18n.t('onboarding.dateOfBirth.months.june'),
  i18n.t('onboarding.dateOfBirth.months.july'),
  i18n.t('onboarding.dateOfBirth.months.august'),
  i18n.t('onboarding.dateOfBirth.months.september'),
  i18n.t('onboarding.dateOfBirth.months.october'),
  i18n.t('onboarding.dateOfBirth.months.november'),
  i18n.t('onboarding.dateOfBirth.months.december'),
];

const yearOptions = generateRange(1950, 2015);

export default function StepDateOfBirthScreen() {
  const goToNextPage = useGoToNextPage();
  const { setDateOfBirth } = useOnboarding();

  // Get localized month names
  const monthNames = useMemo(() => getLocalizedMonthNames(), []);

  // Default selections
  const defaultDay = '15'; // Changed default day
  const defaultMonth = monthNames[5]; // June (0-indexed)
  const defaultYear = '2000'; // Changed default year

  const renderWheelyItem = useCallback((optionText: string) => (
    <Text style={{ fontSize: 18, color: '#1C1C1E' }}>{optionText}</Text>
  ), []);

  const calculateInitialIndex = (options: string[], targetValue: string) => {
    const idx = options.indexOf(targetValue);
    return idx !== -1 ? idx : 0;
  };

  const [selectedDayIndex, setSelectedDayIndex] = useState(() =>
    calculateInitialIndex(dayOptions, defaultDay)
  );
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(() =>
    calculateInitialIndex(monthNames, defaultMonth)
  );
  const [selectedYearIndex, setSelectedYearIndex] = useState(() =>
    calculateInitialIndex(yearOptions, defaultYear)
  );

  const handleContinue = () => {
    const day = dayOptions[selectedDayIndex];
    const monthIndex = selectedMonthIndex; // Month index (0-11)
    const year = yearOptions[selectedYearIndex];

    // Format date as YYYY-MM-DD
    // Month needs to be 1-indexed and padded with 0 if needed
    const monthNumber = monthIndex + 1;
    const formattedMonth = monthNumber < 10 ? `0${monthNumber}` : `${monthNumber}`;
    const formattedDay = parseInt(day) < 10 ? `0${day}` : day;
    const isoDateString = `${year}-${formattedMonth}-${formattedDay}`;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDateOfBirth(isoDateString); // Save to context
    console.log('Saved Date of Birth to context:', isoDateString);

    goToNextPage(); // Navigate to the next page using the new system
  };

  return (
    <View className="flex-1 bg-white pt-10">
      <Stack.Screen options={{ headerTitle: () => null, headerLeft: () => null }} />

      <View className="px-6 mb-8 items-center">
                 <Text 
           className="text-3xl font-bold mb-2 text-[#1C1C1E]"
           style={{ textAlign: isRTL() ? 'right' : 'center', writingDirection: isRTL() ? 'rtl' : 'ltr' }}
         >
           {i18n.t('onboarding.dateOfBirth.title')}
         </Text>
          <Text 
            className="text-base text-[#1C1C1E]"
            style={{ textAlign: isRTL() ? 'right' : 'center', writingDirection: isRTL() ? 'rtl' : 'ltr' }}
          >
           {i18n.t('onboarding.dateOfBirth.subtitle')}
          </Text>
      </View>

      <View className="flex-row justify-around w-full mb-10 px-5">
        <View className="items-center w-1/4">
                     <Text 
             className="text-xl font-semibold mb-3 text-[#1C1C1E]"
             style={{ textAlign: isRTL() ? 'right' : 'center' }}
           >
             {i18n.t('onboarding.dateOfBirth.day')}
           </Text>
          <WheelPicker
            key="day-picker"
            selectedIndex={selectedDayIndex}
            options={dayOptions}
            onChange={(index) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedDayIndex(index);
            }}
            renderItem={renderWheelyItem}
            selectedIndicatorStyle={{ backgroundColor: '#f3f4f6', borderRadius: 8, height: 40 }}
            containerStyle={{ height: 200, width: '100%' }}
            itemHeight={40}
          />
        </View>

        <View className="items-center w-2/5">
                     <Text 
             className="text-xl font-semibold mb-3 text-[#1C1C1E]"
             style={{ textAlign: isRTL() ? 'right' : 'center' }}
           >
             {i18n.t('onboarding.dateOfBirth.month')}
           </Text>
          <WheelPicker
            key="month-picker"
            selectedIndex={selectedMonthIndex}
            options={monthNames}
            onChange={(index) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedMonthIndex(index);
            }}
            renderItem={renderWheelyItem}
            selectedIndicatorStyle={{ backgroundColor: '#f3f4f6', borderRadius: 8, height: 40 }}
            containerStyle={{ height: 200, width: '100%' }}
            itemHeight={40}
          />
        </View>

        <View className="items-center w-1/3">
                     <Text 
             className="text-xl font-semibold mb-3 text-[#1C1C1E]"
             style={{ textAlign: isRTL() ? 'right' : 'center' }}
           >
             {i18n.t('onboarding.dateOfBirth.year')}
           </Text>
          <WheelPicker
            key="year-picker"
            selectedIndex={selectedYearIndex}
            options={yearOptions}
            onChange={(index) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedYearIndex(index);
            }}
            renderItem={renderWheelyItem}
            selectedIndicatorStyle={{ backgroundColor: '#f3f4f6', borderRadius: 8, height: 40 }}
            containerStyle={{ height: 200, width: '100%' }}
            itemHeight={40}
          />
        </View>
      </View>

      {/* Fixed Continue Button at the bottom, mimicking step5_gender.tsx */}
      <View className="absolute bottom-1 left-0 right-0 px-7 py-10 bg-white border-t border-gray-200">
        <TouchableOpacity 
          className="bg-onboarding-primary py-5 px-4 rounded-full items-center"
          onPress={handleContinue}
        >
                     <Text className="text-white text-lg font-semibold">
             {i18n.t('onboarding.common.continue')}
           </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
