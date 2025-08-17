import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { palette } from '@/constants/Colors';
import Svg, { Circle } from 'react-native-svg';

interface AnalysisProgressProps {
  progress: number; // 0-100
  stage: string;
  size?: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function AnalysisProgress({ 
  progress, 
  stage, 
  size = 120 // Increased default size from 120 to match reference
}: AnalysisProgressProps) {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  // Removed pulseAnim for cleaner, stable appearance
  
  const strokeWidth = 12; // Increased from 8 to 12 for better visibility
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Animate progress changes
  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  // Removed pulse animation for clean, stable ring

  // Calculate stroke dash offset for progress
  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
    extrapolate: 'clamp',
  });

  // Force white color for clean appearance - Step 2 implementation
  const getProgressColor = () => {
    return '#FFFFFF'; // Always white for clean, consistent appearance
  };

  return (
    <View style={styles.container}>
      <View 
        style={[
          styles.progressContainer,
          { 
            width: size, 
            height: size,
            position: 'relative',
            justifyContent: 'center',
            alignItems: 'center',
          }
        ]}
      >
        <Svg 
          width={size} 
          height={size} 
          style={[styles.svg, { zIndex: 1 }]}
        >
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.25)" // Slightly more visible background ring
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          
          {/* Progress circle - Now always white */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getProgressColor()}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        
        <View style={[
          styles.progressTextContainer,
          {
            width: size - strokeWidth * 2,
            height: size - strokeWidth * 2,
            zIndex: 2,
            position: 'absolute',
            justifyContent: 'center',
            alignItems: 'center',
          }
        ]}>
          <ThemedText style={styles.progressText}>
            {Math.round(progress)}%
          </ThemedText>
        </View>
      </View>
      
      {/* Minimized stage text for cleaner appearance - Step 4 implementation */}
      {stage && stage.trim() && progress < 100 && (
        <ThemedText style={styles.stageText}>
          {stage}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 20, // Reduced from 30 to 20 for tighter layout
  },
  progressContainer: {
    marginBottom: 12, // Reduced from 16 to 12 for better spacing
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  progressTextContainer: {
  },
  progressText: {
    fontSize: 28, // Reduced from 32 to 28 for better fit in circle
    fontWeight: '700',
    color: '#FFFFFF', // Pure white for maximum contrast
    textAlign: 'center',
    lineHeight: 32, // Explicit line height for consistent vertical centering
    letterSpacing: -0.8, // Slightly tighter for better fit
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
    includeFontPadding: false, // Remove extra font padding on Android
    textAlignVertical: 'center', // Ensure vertical centering on Android
  },
  stageText: {
    fontSize: 18, // Significantly increased from 12 to 18 for much better visibility
    fontWeight: '600', // Increased from 400 to 600 for more prominence
    color: 'rgba(255, 255, 255, 0.9)', // Increased opacity from 0.7 to 0.9 for better readability
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.7)', // Enhanced shadow for better contrast
    textShadowOffset: { width: 0, height: 2 }, // Increased shadow offset
    textShadowRadius: 3, // Enhanced shadow radius
    marginTop: 8, // Increased margin from 4 to 8 for better spacing
    letterSpacing: 0.3, // Add slight letter spacing for better readability
    lineHeight: 22, // Add line height for better text rendering
  },
}); 