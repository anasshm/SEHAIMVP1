import React from 'react';

import { View, Text, Image, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { Meal } from '@/models/meal';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { palette } from '@/constants/Colors';
import { neumorphicLayerStyle } from '@/utils/styles';

type RecentMealCardProps = {
  meal: Meal;
};

export default function RecentMealCard({ meal }: RecentMealCardProps) {
  // Format the time
  const formattedTime = meal.meal_time ? format(new Date(meal.meal_time), 'h:mm a') : '';
  
  return (
    <View style={[styles.cardBase, neumorphicLayerStyle]} className="flex-row">
      {/* Meal Image */}
      <View className="w-16 h-16 rounded-xl overflow-hidden mr-3">
        <Image 
          source={{ uri: meal.image_url || 'https://via.placeholder.com/100' }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>
      
      {/* Meal Details */}
      <View className="flex-1 justify-center">
        <View className="flex-row justify-between items-start">
          <Text style={{ color: palette.primary }} className="font-medium text-base flex-1" numberOfLines={1} ellipsizeMode="tail">{meal.name || 'Unknown'}</Text> 
          <Text style={{ color: palette.inactive }} className="text-xs ml-2">{formattedTime}</Text> 
        </View>
        
        {/* Nutrition Icons */}
        <View className="flex-row mt-2 items-center"> 
          <View className="flex-row items-center mr-3">
            <FontAwesome5 name="fire" size={16} color={palette.accent} style={{ marginRight: 4 }} />
            <Text style={{ color: palette.inactive }} className="text-sm w-8 text-left">{meal.calories || 0}</Text>
          </View>
          
          <View className="flex-row items-center mr-3">
            <MaterialCommunityIcons name="food-drumstick" size={16} color={palette.protein} style={{ marginRight: 4 }} />
            <Text style={{ color: palette.inactive }} className="text-sm w-8 text-left">{meal.protein || 0}g</Text>
          </View>
          
          <View className="flex-row items-center mr-3">
            <MaterialCommunityIcons name="barley" size={16} color={palette.carbs} style={{ marginRight: 4 }} />
            <Text style={{ color: palette.inactive }} className="text-sm w-8 text-left">{meal.carbs || 0}g</Text>
          </View>
          
          <View className="flex-row items-center">
            <FontAwesome5 name="tint" size={16} color={palette.fats} style={{ marginRight: 4 }} />
            <Text style={{ color: palette.inactive }} className="text-sm w-8 text-left">{meal.fat || 0}g</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const CARD_RADIUS = 20;
const V_MARGIN = 6;

const styles = StyleSheet.create({
  cardBase: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: V_MARGIN,
    // backgroundColor, borderRadius, and shadow are handled by neumorphicLayerStyle
  },
});
