import React from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import { SkeletonText } from './SkeletonText';

interface TitleSkeletonProps {
  style?: ViewStyle;
  titleWidth?: DimensionValue;
}

export function TitleSkeleton({ 
  style,
  titleWidth = '70%'
}: TitleSkeletonProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Main title skeleton - mimics food name */}
      <SkeletonText
        width={titleWidth}
        height={28}
        borderRadius={8}
        style={styles.titleSkeleton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSkeleton: {
    // Matches the title text styling from AnalysisOverlay
  },
}); 