import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ProgressRing from '@/components/ui/ProgressRing'; 
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons'; 
import { palette } from '@/constants/Colors';
import { CARD_PRESETS } from '@/utils/ringSizes';
import { neumorphicLayerStyle } from '@/utils/styles';
import i18n from '@/utils/i18n'; 

interface ProgressDisplayCardProps {
  currentValue: number;
  targetValue: number;
  nutrientName: string;
  progressPercent: number;
  circleColor?: string;
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap; 
  fa5IconName?: keyof typeof FontAwesome5.glyphMap; 
  iconType?: 'MaterialCommunityIcons' | 'FontAwesome5'; 
  variant?: 'small' | 'large';
}

const ProgressDisplayCard: React.FC<ProgressDisplayCardProps> = ({
  currentValue,
  targetValue,
  nutrientName,
  progressPercent,
  circleColor = palette.primary,
  iconName, 
  fa5IconName, 
  iconType = 'MaterialCommunityIcons', 
  variant = 'small',
}) => {
  const fillPercent = Math.max(0, Math.min(100, progressPercent || 0));
  
  // New logic for display text and status text
  let displayText: string;
  let statusText: string;

  // Determine the appropriate translation key based on nutrient name
  const getStatusTranslationKey = (nutrientName: string, isLeft: boolean) => {
    const nutrientLower = nutrientName.toLowerCase();
    if (nutrientLower.includes('protein') || nutrientLower.includes('بروتين')) {
      return isLeft ? 'dashboard.proteinLeft' : 'dashboard.proteinOver';
    } else if (nutrientLower.includes('carb') || nutrientLower.includes('كربوهيدرات')) {
      return isLeft ? 'dashboard.carbsLeft' : 'dashboard.carbsOver';
    } else if (nutrientLower.includes('fat') || nutrientLower.includes('دهون')) {
      return isLeft ? 'dashboard.fatsLeft' : 'dashboard.fatsOver';
    }
    // Fallback to the original behavior
    return isLeft ? 'dashboard.caloriesLeft' : 'dashboard.caloriesOver';
  };

  if (targetValue > 0) {
    if (currentValue <= targetValue) {
      displayText = `${Math.round(targetValue - currentValue)}g`;
      statusText = i18n.t(getStatusTranslationKey(nutrientName, true));
    } else { // currentValue > targetValue
      displayText = `${Math.round(currentValue - targetValue)}g`;
      statusText = i18n.t(getStatusTranslationKey(nutrientName, false));
    }
  } else { // targetValue is 0 or undefined, show current consumed
    displayText = `${Math.round(currentValue)}g`;
    statusText = nutrientName; 
  }

  const cardDimensions = CARD_PRESETS[variant];

  return (
    <View 
      style={[
        { 
          width: cardDimensions.width,
          height: cardDimensions.height,
        },
        neumorphicLayerStyle, 
      ]}
      className="items-center p-3"
    >
      <View className="items-start mb-2 w-full px-1" style={{ height: 50 }}>
        <Text style={{ color: palette.primary }} className="text-lg font-bold mb-1">
          {displayText} 
        </Text>
        <Text style={{ color: palette.inactive, fontSize: 15, lineHeight: 17 }}>
          {statusText} 
        </Text>
      </View>
      <ProgressRing
        presetSize={variant}
        fill={fillPercent}
        tintColor={circleColor}
        backgroundColor="#F3F4F6"
        rotation={0}
        arcSweepAngle={360}
        lineCap="round"
      >
        {() => (
          <View className="items-center justify-center">
            {iconType === 'MaterialCommunityIcons' && iconName ? (
              <MaterialCommunityIcons 
                name={iconName} 
                size={28} 
                color={circleColor} 
              />
            ) : iconType === 'FontAwesome5' && fa5IconName ? (
              <FontAwesome5 
                name={fa5IconName} 
                size={28} 
                color={circleColor} 
              />
            ) : (
              <Text style={{ color: palette.inactive }} className="text-xs">{Math.round(fillPercent)}%</Text>
            )}
          </View>
        )}
      </ProgressRing>
    </View>
  );
};

export default ProgressDisplayCard;
