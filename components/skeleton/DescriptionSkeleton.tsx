import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ViewStyle, Dimensions, Animated, DimensionValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { height: screenHeight } = Dimensions.get('window');

interface DescriptionSkeletonProps {
  style?: ViewStyle;
  isSmallScreen?: boolean;
}

export function DescriptionSkeleton({ 
  style,
  isSmallScreen = screenHeight < 700
}: DescriptionSkeletonProps) {
  // Responsive sizing for text lines
  const textLineHeight = isSmallScreen ? 16 : 18;
  const lineSpacing = isSmallScreen ? 8 : 10;
  const toggleButtonSpacing = isSmallScreen ? 12 : 16;

  // Simple shimmer animation
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false, // Use false to avoid layout issues
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ])
    );

    shimmerLoop.start();

    return () => {
      shimmerLoop.stop();
    };
  }, [shimmerAnimation]);

  const shimmerOpacity = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const SkeletonLine = ({ width, height }: { width: DimensionValue; height: number }) => (
    <View style={[styles.skeletonLine, { width, height }]}>
      <Animated.View style={[styles.shimmerOverlay, { opacity: shimmerOpacity }]} />
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Gray separator line - matches real description section */}
      <View style={styles.separatorLine} />
      
      {/* Three individual skeleton lines - all 100% width */}
      <View style={styles.textLinesContainer}>
        {/* Line 1: 100% width */}
        <View style={styles.lineWrapper}>
          <SkeletonLine width="100%" height={textLineHeight} />
        </View>
        
        {/* Line 2: 100% width */}
        <View style={[styles.lineWrapper, { marginTop: lineSpacing }]}>
          <SkeletonLine width="100%" height={textLineHeight} />
        </View>
        
        {/* Line 3: 100% width */}
        <View style={[styles.lineWrapper, { marginTop: lineSpacing }]}>
          <SkeletonLine width="100%" height={textLineHeight} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 80,
  },
  textLinesContainer: {
    width: '100%',
    marginTop: 8,
  },
  lineWrapper: {
    width: '100%',
    alignItems: 'flex-start',
  },
  toggleButtonWrapper: {
    width: '100%',
    alignItems: 'flex-start',
  },
  skeletonLine: {
    backgroundColor: '#E1E9EE',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F7F9FA',
    borderRadius: 6,
  },
  separatorLine: {
    height: 1,
    backgroundColor: 'rgba(140, 140, 140, 0.2)',
    marginBottom: 8,
    width: '100%',
  },
});