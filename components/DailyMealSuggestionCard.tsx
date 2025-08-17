import React from 'react';
import { View, Text } from 'react-native';
import { MealSuggestion, DayMealPlan } from '../src/services/NutritionService'; // Adjust path as needed

interface DailyMealSuggestionCardProps {
  dailyPlan: DayMealPlan;
  rationale: string;
}

const MealDetail: React.FC<{ mealName: string; suggestion?: MealSuggestion }> = ({ mealName, suggestion }) => {
  if (!suggestion || !suggestion.description) {
    return null; // Don't render if no suggestion or description
  }
  return (
    <View className="mb-2">
      <Text className="text-sm font-semibold text-slate-700">{mealName}:</Text>
      <Text className="text-sm text-slate-600">  {suggestion.description} ({suggestion.calories} kcal)</Text>
    </View>
  );
};

const DailyMealSuggestionCard: React.FC<DailyMealSuggestionCardProps> = ({ dailyPlan, rationale }) => {
  return (
    <View className="my-3 p-4 bg-white rounded-lg shadow">
      <Text className="text-lg font-bold text-slate-800 mb-3">{dailyPlan.day}</Text>
      
      <MealDetail mealName="Breakfast" suggestion={dailyPlan.breakfast} />
      <MealDetail mealName="Lunch" suggestion={dailyPlan.lunch} />
      <MealDetail mealName="Dinner" suggestion={dailyPlan.dinner} />
      {dailyPlan.snacks && <MealDetail mealName="Snacks" suggestion={dailyPlan.snacks} />}

      {rationale && (
        <View className="mt-3 pt-3 border-t border-slate-200">
          <Text className="text-xs font-semibold text-slate-700 mb-1">AI Nutritionist's Note:</Text>
          <Text className="text-xs text-slate-600 italic">
            {rationale}
          </Text>
        </View>
      )}
    </View>
  );
};

export default DailyMealSuggestionCard;
