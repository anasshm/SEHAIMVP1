import React from 'react';
import { View, Text } from 'react-native';

type NutritionSummaryProps = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export default function NutritionSummaryCard({ calories, protein, carbs, fat }: NutritionSummaryProps) {
  return (
    <View className="bg-card-bg rounded-card p-4 shadow mb-4 border border-card-border">
      <Text className="text-text-primary text-lg font-semibold mb-4">Today's Nutrition Summary</Text>
      
      <View className="space-y-3">
        {/* Calories */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-calories mr-2" />
            <Text className="text-text-primary">Calories</Text>
          </View>
          <Text className="text-text-primary font-medium">{calories} kcal</Text>
        </View>
        
        {/* Protein */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-protein mr-2" />
            <Text className="text-text-primary">Protein</Text>
          </View>
          <Text className="text-text-primary font-medium">{protein} g</Text>
        </View>
        
        {/* Carbs */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-carbs mr-2" />
            <Text className="text-text-primary">Carbs</Text>
          </View>
          <Text className="text-text-primary font-medium">{carbs} g</Text>
        </View>
        
        {/* Fat */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-fat mr-2" />
            <Text className="text-text-primary">Fat</Text>
          </View>
          <Text className="text-text-primary font-medium">{fat} g</Text>
        </View>
      </View>
    </View>
  );
}
