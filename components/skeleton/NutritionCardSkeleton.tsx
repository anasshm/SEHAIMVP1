import React from 'react';
import { View, StyleSheet, ViewStyle, Dimensions } from 'react-native';
import { SkeletonCard } from './SkeletonCard';
import { SkeletonText } from './SkeletonText';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface NutritionCardSkeletonProps {
  style?: ViewStyle;
  isSmallScreen?: boolean;
}

export function NutritionCardSkeleton({ 
  style,
  isSmallScreen = screenHeight < 700
}: NutritionCardSkeletonProps) {
  
  // Calculate dimensions matching the real nutrition cards
  const caloriesCardHeight = isSmallScreen ? 60 : 70;
  const macroCardHeight = isSmallScreen ? 50 : 60;
  const iconSize = isSmallScreen ? 18 : 20;
  const macroIconSize = isSmallScreen ? 16 : 18;
  const cardPadding = isSmallScreen ? 12 : 14;
  const macroCardPadding = isSmallScreen ? 8 : 10;
  const cardBorderRadius = 12;
  const gridGap = isSmallScreen ? 6 : 8;
  
  return (
    <View style={[styles.container, style]}>
      {/* Large Calories Card Skeleton - Full Width */}
      <View style={{ marginBottom: gridGap }}>
        <SkeletonCard
          width="100%"
          height={caloriesCardHeight}
          borderRadius={cardBorderRadius}
          style={styles.caloriesCard}
        >
          <View style={[styles.caloriesContent, { padding: cardPadding }]}>
            {/* Icon skeleton */}
            <SkeletonCard
              width={iconSize + 8}
              height={iconSize + 8}
              borderRadius={(iconSize + 8) / 2}
              style={styles.iconSkeleton}
            />
            
            {/* Value and label skeleton */}
            <View style={styles.caloriesValueContainer}>
              <SkeletonText
                width={60}
                height={24}
                borderRadius={6}
                style={styles.caloriesValueSkeleton}
              />
              <SkeletonText
                width={80}
                height={12}
                borderRadius={4}
                style={styles.caloriesLabelSkeleton}
              />
            </View>
          </View>
        </SkeletonCard>
      </View>
      
      {/* Macro Cards Row - Protein, Carbs, Fats */}
      <View style={styles.macroRow}>
        {/* Protein Card Skeleton */}
        <SkeletonCard
          width="32%"
          height={macroCardHeight}
          borderRadius={cardBorderRadius}
          style={styles.macroCard}
        >
          <View style={[styles.macroContent, { padding: macroCardPadding }]}>
            {/* Icon skeleton */}
            <SkeletonCard
              width={macroIconSize + 4}
              height={macroIconSize + 4}
              borderRadius={(macroIconSize + 4) / 2}
              style={styles.macroIconSkeleton}
            />
            
            {/* Value skeleton */}
            <SkeletonText
              width={30}
              height={16}
              borderRadius={4}
              style={styles.macroValueSkeleton}
            />
            
            {/* Label skeleton */}
            <SkeletonText
              width={50}
              height={10}
              borderRadius={3}
              style={styles.macroLabelSkeleton}
            />
          </View>
        </SkeletonCard>
        
        {/* Carbs Card Skeleton */}
        <SkeletonCard
          width="32%"
          height={macroCardHeight}
          borderRadius={cardBorderRadius}
          style={styles.macroCard}
        >
          <View style={[styles.macroContent, { padding: macroCardPadding }]}>
            <SkeletonCard
              width={macroIconSize + 4}
              height={macroIconSize + 4}
              borderRadius={(macroIconSize + 4) / 2}
              style={styles.macroIconSkeleton}
            />
            <SkeletonText
              width={30}
              height={16}
              borderRadius={4}
              style={styles.macroValueSkeleton}
            />
            <SkeletonText
              width={40}
              height={10}
              borderRadius={3}
              style={styles.macroLabelSkeleton}
            />
          </View>
        </SkeletonCard>
        
        {/* Fats Card Skeleton */}
        <SkeletonCard
          width="32%"
          height={macroCardHeight}
          borderRadius={cardBorderRadius}
          style={styles.macroCard}
        >
          <View style={[styles.macroContent, { padding: macroCardPadding }]}>
            <SkeletonCard
              width={macroIconSize + 4}
              height={macroIconSize + 4}
              borderRadius={(macroIconSize + 4) / 2}
              style={styles.macroIconSkeleton}
            />
            <SkeletonText
              width={25}
              height={16}
              borderRadius={4}
              style={styles.macroValueSkeleton}
            />
            <SkeletonText
              width={35}
              height={10}
              borderRadius={3}
              style={styles.macroLabelSkeleton}
            />
          </View>
        </SkeletonCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  caloriesCard: {
    // Additional styling if needed
  },
  caloriesContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconSkeleton: {
    marginRight: 12,
  },
  caloriesValueContainer: {
    alignItems: 'center',
  },
  caloriesValueSkeleton: {
    marginBottom: 4,
  },
  caloriesLabelSkeleton: {
    // Additional styling if needed
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  macroCard: {
    // Additional styling if needed
  },
  macroContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  macroIconSkeleton: {
    marginBottom: 6,
  },
  macroValueSkeleton: {
    marginBottom: 4,
  },
  macroLabelSkeleton: {
    // Additional styling if needed
  },
}); 