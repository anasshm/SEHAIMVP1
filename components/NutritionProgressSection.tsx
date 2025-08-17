import React from 'react';
import { View, Text } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import ProgressDisplayCard from './ProgressDisplayCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { palette } from '@/constants/Colors';
import { NutritionPlan, NutritionTotals } from '@/models/nutrition';
import { RING_PRESETS } from '@/utils/ringSizes';
import { neumorphicLayerStyle } from '@/utils/styles';

interface NutritionProgressSectionProps {
  nutritionPlan: NutritionPlan;
  currentIntake: NutritionTotals;
}

const NutritionProgressSection: React.FC<NutritionProgressSectionProps> = ({ nutritionPlan, currentIntake }) => {
  const targetCalories = nutritionPlan.targetCalories || 2000;
  const targetProteinGoal = nutritionPlan.targetProteinGrams || 0;
  const targetCarbsGoal = nutritionPlan.targetCarbsGrams || 0;
  const targetFatGoal = nutritionPlan.targetFatsGrams || 0;

  const calculateProgress = (currentValue: number, targetValue: number) => {
    return currentValue && targetValue ? (currentValue / targetValue) * 100 : 0;
  };

  const calorieProgress = calculateProgress(currentIntake.calories, targetCalories);
  const proteinProgress = calculateProgress(currentIntake.protein, targetProteinGoal);
  const carbsProgress = calculateProgress(currentIntake.carbs, targetCarbsGoal);
  const fatProgress = calculateProgress(currentIntake.fat, targetFatGoal);

  const largeCalorieText = Math.round(currentIntake.calories).toString();
  const smallCalorieText = currentIntake.calories <= targetCalories ? 'Calories left' : 'Calories over';

  return (
    <View className="my-4">
      <View 
        style={neumorphicLayerStyle} 
        className="p-4 mb-4 flex-row items-center justify-between"
      >
        <View className="flex-shrink mr-4">
          <Text style={{ color: palette.primary }} className="text-5xl font-bold">{largeCalorieText}</Text>
          <Text style={{ color: palette.inactive, fontSize: 15, lineHeight: 17 }} className="mt-1">{smallCalorieText}</Text>
        </View>

        <AnimatedCircularProgress
          size={RING_PRESETS.large} 
          width={8} 
          fill={calorieProgress}
          tintColor={palette.accent} 
          backgroundColor="#F3F4F6" 
          rotation={0} 
          arcSweepAngle={360}
          lineCap="round"
        >
          {() => (
            <MaterialCommunityIcons 
              name="fire" 
              size={RING_PRESETS.large * 0.4} 
              color={palette.accent} 
            />
          )}
        </AnimatedCircularProgress>
      </View>

      <View className="flex-row justify-between">
        <ProgressDisplayCard
          currentValue={currentIntake.protein}
          targetValue={targetProteinGoal}
          nutrientName="Protein"
          progressPercent={proteinProgress}
          circleColor={palette.protein} 
          iconType="MaterialCommunityIcons"
          iconName="food-drumstick"
          variant="small"
        />
        <ProgressDisplayCard
          currentValue={currentIntake.carbs}
          targetValue={targetCarbsGoal}
          nutrientName="Carbs"
          progressPercent={carbsProgress}
          circleColor={palette.carbs} 
          iconType="MaterialCommunityIcons"
          iconName="barley"
          variant="small"
        />
        <ProgressDisplayCard
          currentValue={currentIntake.fat}
          targetValue={targetFatGoal}
          nutrientName="Fats"
          progressPercent={fatProgress}
          circleColor={palette.fats} 
          iconType="FontAwesome5"
          fa5IconName="tint"
          variant="small"
        />
      </View>
    </View>
  );
};

export default NutritionProgressSection;
