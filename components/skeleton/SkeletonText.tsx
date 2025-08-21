import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface SkeletonTextProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  numberOfLines?: number;
  lineSpacing?: number;
}

export function SkeletonText({ 
  width = '100%', 
  height = 16, 
  borderRadius = 8,
  style,
  numberOfLines = 1,
  lineSpacing = 8
}: SkeletonTextProps) {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    shimmerLoop.start();

    return () => {
      shimmerLoop.stop();
    };
  }, [shimmerAnimation]);

  const translateX = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  // Generate line widths for multiple lines (varied for realistic effect)
  const getLineWidth = (lineIndex: number): DimensionValue => {
    if (numberOfLines === 1) return width;
    
    const widthVariations: DimensionValue[] = ['100%', '85%', '70%', '90%', '60%'];
    const variation = widthVariations[lineIndex % widthVariations.length];
    
    // Last line is typically shorter
    if (lineIndex === numberOfLines - 1 && numberOfLines > 1) {
      return typeof width === 'string' && width.includes('%') 
        ? `${Math.max(50, parseInt(width) - 30)}%` as DimensionValue
        : '70%';
    }
    
    return variation;
  };

  const renderSkeletonLine = (lineIndex: number) => (
    <View
      key={lineIndex}
      style={[
        styles.lineContainer,
        {
          width: getLineWidth(lineIndex),
          height,
          borderRadius,
          marginBottom: lineIndex < numberOfLines - 1 ? lineSpacing : 0,
        },
      ]}
    >
      {/* Base skeleton background */}
      <View style={[styles.skeletonBase, { borderRadius }]} />
      
      {/* Animated shimmer overlay */}
      <Animated.View
        style={[
          styles.shimmerContainer,
          {
            borderRadius,
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0)',
            'rgba(255, 255, 255, 0.4)',
            'rgba(255, 255, 255, 0.6)',
            'rgba(255, 255, 255, 0.4)',
            'rgba(255, 255, 255, 0)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.shimmerGradient, { borderRadius }]}
        />
      </Animated.View>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: numberOfLines }, (_, index) => 
        renderSkeletonLine(index)
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Container for all skeleton lines
  },
  lineContainer: {
    overflow: 'hidden',
    position: 'relative',
  },
  skeletonBase: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#E1E9EE',
  },
  shimmerContainer: {
    position: 'absolute',
    top: 0,
    left: -200,
    right: 0,
    bottom: 0,
    width: '400%',
  },
  shimmerGradient: {
    flex: 1,
  },
}); 