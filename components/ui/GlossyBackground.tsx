import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

export const GlossyBackground = () => (
  <>
    <LinearGradient
      colors={['#F0F0F0', '#E0E0E0']}
      start={{x: 0,   y: 0}}
      end={{x: 1,   y: 1}}
      style={styles.gradient}
    />
    <BlurView
      intensity={40}
      tint="light"
      style={styles.topBlur}
    />
  </>
);

const styles = StyleSheet.create({
  gradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 1,
  },
  topBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
});
