import React from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';
import { Meal } from '@/models/meal';
import { format } from 'date-fns';

interface VerticalMealCardProps {
  meal: Meal;
  onPress?: () => void;
}

export default function VerticalMealCardNW({ meal, onPress }: VerticalMealCardProps) {
  // Format the date to show date and time (e.g., "May 3, 2:10 PM")
  const formattedDateTime = meal.meal_time 
    ? format(new Date(meal.meal_time), 'MMM d, h:mm a')
    : '';

  return (
    <TouchableOpacity 
      className="bg-card-bg rounded-card p-4 mb-3 border border-card-border w-full"
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-text-primary text-lg font-semibold flex-1 mr-2" numberOfLines={1}>
          {meal.name || 'Unknown'}
        </Text>
        <Text className="text-text-secondary text-xs">{formattedDateTime}</Text>
      </View>
      
      <View className="flex-row">
        <Image 
          source={{ uri: meal.image_url || 'https://via.placeholder.com/100' }} 
          className="w-24 h-24 rounded-lg mr-4"
        />
        
        <View className="flex-1 justify-center">
          <View className="flex-row justify-between mb-2">
            <View className="flex-1 mr-2">
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-calories mr-1" />
                <Text className="text-text-secondary text-xs">Calories</Text>
              </View>
              <Text className="text-text-primary font-medium">{meal.calories || 0}</Text>
            </View>
            
            <View className="flex-1">
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-protein mr-1" />
                <Text className="text-text-secondary text-xs">Protein</Text>
              </View>
              <Text className="text-text-primary font-medium">{meal.protein || 0}g</Text>
            </View>
          </View>
          
          <View className="flex-row justify-between">
            <View className="flex-1 mr-2">
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-carbs mr-1" />
                <Text className="text-text-secondary text-xs">Carbs</Text>
              </View>
              <Text className="text-text-primary font-medium">{meal.carbs || 0}g</Text>
            </View>
            
            <View className="flex-1">
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-fat mr-1" />
                <Text className="text-text-secondary text-xs">Fat</Text>
              </View>
              <Text className="text-text-primary font-medium">{meal.fat || 0}g</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
