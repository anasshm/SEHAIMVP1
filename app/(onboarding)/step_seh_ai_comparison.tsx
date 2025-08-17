import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { palette } from '@/constants/Colors';
import i18n, { isRTL } from '@/utils/i18n';
import * as Haptics from 'expo-haptics';

export default function StepSehAiComparisonScreen() {
  const router = useRouter();

  const goToNextStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log('Seh AI comparison viewed');
    // Navigate to the next screen
    router.push('/(onboarding)/step_desired_weight'); 
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
          مع Seh AI ستفقد وزنًا يعادل الضعف مقارنةً بالاعتماد على نفسك
        </Text>

        {/* Comparison Image Container */}
        <View className="flex-1 justify-center items-center">
          <View className="flex-row justify-center items-center space-x-4" style={{ gap: 20 }}>
            {/* Without Seh AI - 20% with 33% fill */}
            <View className="items-center">
              <View className="bg-gray-100 rounded-2xl w-32 h-40 mb-4 overflow-hidden relative justify-center items-center">
                {/* 33% black fill from bottom */}
                <View 
                  className="absolute bottom-0 left-0 right-0 bg-black" 
                  style={{ height: '33%' }}
                />
                <Text className="text-lg font-semibold text-gray-600 text-center z-10">
                  من دون{'\n'}Seh AI
                </Text>
              </View>
              <View className="bg-gray-300 rounded-full px-6 py-3">
                <Text className="text-xl font-bold text-gray-700">20%</Text>
              </View>
            </View>

            {/* With Seh AI - 2X with 100% fill */}
            <View className="items-center">
              <View className="bg-black rounded-2xl p-6 w-32 h-40 justify-center items-center mb-4">
                <Text className="text-lg font-semibold text-white text-center">
                  مع{'\n'}Seh AI
                </Text>
              </View>
              <View className="bg-black rounded-full px-6 py-3">
                <Text className="text-xl font-bold text-white">2X</Text>
              </View>
            </View>
          </View>

          {/* Bottom Text */}
          <Text 
            className="text-lg font-semibold text-gray-700 text-center mt-8"
            style={{ textAlign: 'center', writingDirection: isRTL() ? 'rtl' : 'ltr' }}
          >
            مع Seh AI ستحقق نتائج اكبر و اسرع
          </Text>
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