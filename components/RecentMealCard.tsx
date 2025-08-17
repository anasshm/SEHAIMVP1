import React from 'react';

import { View, Text, Image, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { Meal } from '@/models/meal';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { palette } from '@/constants/Colors';
import { neumorphicLayerStyle } from '@/utils/styles';
import { isRTL } from '@/utils/i18n';

type RecentMealCardProps = {
  meal: Meal;
};

export default function RecentMealCard({ meal }: RecentMealCardProps) {
  // Format the time
  const formattedTime = meal.meal_time ? format(new Date(meal.meal_time), 'h:mm a') : '';
  
  const isArabic = isRTL();

  return (
    <View style={[styles.cardBase, neumorphicLayerStyle, { flexDirection: isArabic ? 'row-reverse' : 'row' }]}>
      {/* Meal Image */}
      <View className={`w-16 h-16 rounded-xl overflow-hidden ${isArabic ? 'ml-3' : 'mr-3'}`}>
        <Image 
          source={{ uri: meal.image_url || 'https://via.placeholder.com/100' }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>
      
      {/* Meal Details */}
      <View className="flex-1 justify-center">
        <View style={{ flexDirection: isArabic ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Text style={{ 
            color: palette.primary, 
            textAlign: isArabic ? 'right' : 'left',
            fontSize: 16,
            fontWeight: '500',
            flex: 1
          }} numberOfLines={1} ellipsizeMode="tail">{meal.name || 'Unknown'}</Text> 
          <Text style={{ 
            color: palette.inactive, 
            fontSize: 12,
            marginLeft: isArabic ? 0 : 8,
            marginRight: isArabic ? 8 : 0
          }}>{formattedTime}</Text> 
        </View>
        
        {/* Nutrition Icons */}
        <View style={{ flexDirection: isArabic ? 'row-reverse' : 'row', marginTop: 8, alignItems: 'center' }}> 
          <View style={{ flexDirection: isArabic ? 'row-reverse' : 'row', alignItems: 'center', marginRight: isArabic ? 0 : 12, marginLeft: isArabic ? 12 : 0 }}>
            <FontAwesome5 name="fire" size={16} color={palette.accent} style={{ marginRight: isArabic ? 0 : 4, marginLeft: isArabic ? 4 : 0 }} />
            <Text style={{ color: palette.inactive, fontSize: 14, width: 32, textAlign: isArabic ? 'right' : 'left' }}>{meal.calories || 0}</Text>
          </View>
          
          <View style={{ flexDirection: isArabic ? 'row-reverse' : 'row', alignItems: 'center', marginRight: isArabic ? 0 : 12, marginLeft: isArabic ? 12 : 0 }}>
            <MaterialCommunityIcons name="food-drumstick" size={16} color={palette.protein} style={{ marginRight: isArabic ? 0 : 4, marginLeft: isArabic ? 4 : 0 }} />
            <Text style={{ color: palette.inactive, fontSize: 14, width: 32, textAlign: isArabic ? 'right' : 'left' }}>{meal.protein || 0}g</Text>
          </View>
          
          <View style={{ flexDirection: isArabic ? 'row-reverse' : 'row', alignItems: 'center', marginRight: isArabic ? 0 : 12, marginLeft: isArabic ? 12 : 0 }}>
            <MaterialCommunityIcons name="barley" size={16} color={palette.carbs} style={{ marginRight: isArabic ? 0 : 4, marginLeft: isArabic ? 4 : 0 }} />
            <Text style={{ color: palette.inactive, fontSize: 14, width: 32, textAlign: isArabic ? 'right' : 'left' }}>{meal.carbs || 0}g</Text>
          </View>
          
          <View style={{ flexDirection: isArabic ? 'row-reverse' : 'row', alignItems: 'center' }}>
            <FontAwesome5 name="tint" size={16} color={palette.fats} style={{ marginRight: isArabic ? 0 : 4, marginLeft: isArabic ? 4 : 0 }} />
            <Text style={{ color: palette.inactive, fontSize: 14, width: 32, textAlign: isArabic ? 'right' : 'left' }}>{meal.fat || 0}g</Text>
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
