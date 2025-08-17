import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { palette } from '@/constants/Colors';
import i18n, { isRTL } from '@/utils/i18n';
import * as Haptics from 'expo-haptics';

export default function StepLastingResultsScreen() {
  const router = useRouter();

  const goToNextStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log('Lasting results page viewed');
    // Navigate to the next screen
    router.push('/(onboarding)/step_seh_ai_comparison'); 
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerTitle: () => null, headerLeft: () => null }} />
      
      <ScrollView 
        className="flex-1 p-6"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }} 
      >
        <Text 
          className="text-3xl font-bold mb-8 text-gray-800 text-center"
          style={{ textAlign: 'center', writingDirection: isRTL() ? 'rtl' : 'ltr' }}
        >
          مع Seh AI ستحقق نتائج تدوم معك
        </Text>

        {/* Chart Image Container */}
        <View className="flex-1 justify-center items-center px-4">
          <View className="w-full max-w-sm aspect-video bg-gray-50 rounded-2xl p-4 justify-center items-center">
            <Image 
              source={require('@/assets/images/weight-loss-chart.png')}
              style={{ 
                width: '100%', 
                height: '100%', 
                resizeMode: 'contain' 
              }}
            />
          </View>
          
          {/* Chart Labels */}
          <View className="flex-row justify-between items-center w-full max-w-sm mt-4 px-4">
            <Text className="text-sm text-gray-600">الشهر السادس</Text>
            <Text className="text-sm text-gray-600">الشهر الأول</Text>
          </View>
          
          {/* Legend */}
          <View className="items-center mt-6">
            <View className="flex-row items-center mb-2">
              <View className="w-4 h-1 bg-red-400 mr-2 rounded" />
              <Text className="text-sm text-gray-600">الحمية التقليدية</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-4 h-1 bg-black mr-2 rounded" />
              <Text className="text-sm text-gray-600">مع Seh AI</Text>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Continue Button */}
      <View className="absolute bottom-1 left-0 right-0 px-7 py-10 bg-white border-t border-gray-200">
        <TouchableOpacity
          className="py-5 px-4 rounded-full items-center"
          style={{ backgroundColor: palette.primary }}
          onPress={goToNextStep}
        >
          <Text className="text-white text-lg font-semibold">
            {i18n.t('onboarding.common.continue')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 