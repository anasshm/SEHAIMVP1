import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '@/constants/Colors';
import i18n, { isRTL } from '@/utils/i18n';

interface EmptyMealStateProps {
  onAddMeal?: () => void;
}

export default function EmptyMealState({ onAddMeal }: EmptyMealStateProps) {
  const isArabic = isRTL();

  return (
    <View style={{ 
      backgroundColor: palette.surface, 
      borderRadius: 16, 
      padding: 24, 
      elevation: 2,
      alignItems: 'center'
    }}>
      {/* Main Title */}
      <Text style={{ 
        color: palette.primary, 
        fontSize: 20, 
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8
      }}>
        {i18n.t('dashboard.readyToStart')}
      </Text>
      
      {/* Subtitle */}
      <Text style={{ 
        color: palette.inactive, 
        fontSize: 16, 
        textAlign: 'center',
        marginBottom: 20
      }}>
        {i18n.t('dashboard.tapPlusButtonBelow')}
      </Text>

      {/* Curved arrow positioned at bottom right pointing to + button */}
      <View style={{
        alignItems: 'flex-end',
        marginBottom: -10,
        paddingRight: 20
      }}>
        <Ionicons 
          name="arrow-redo-outline" 
          size={50} 
          color={palette.accent}
          style={{
            transform: [{ rotate: '110deg' }]
          }}
        />
      </View>
    </View>
  );
} 