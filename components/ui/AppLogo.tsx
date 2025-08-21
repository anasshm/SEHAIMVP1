import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '@/constants/Colors';

interface AppLogoProps {
  size?: number;
  showBackground?: boolean;
  backgroundColor?: string;
}

export default function AppLogo({ 
  size = 56, 
  showBackground = true, 
  backgroundColor = palette.primary 
}: AppLogoProps) {
  const logoSize = size;
  const iconSize = Math.round(size * 0.5); // Icon is 50% of container

  try {
    // Try to use the new app logo image
    return (
      <View style={[
        styles.container,
        {
          width: logoSize,
          height: logoSize,
          backgroundColor: showBackground ? backgroundColor : 'transparent',
          borderRadius: logoSize * 0.2, // 20% of size for rounded corners
        }
      ]}>
        <Image 
          source={require('@/assets/images/app-logo.png')}
          style={[styles.logoImage, { width: logoSize, height: logoSize }]}
          resizeMode="contain"
        />
      </View>
    );
  } catch (error) {
    // Fallback to the lightning bolt icon if image is not available
    return (
      <View style={[
        styles.container,
        {
          width: logoSize,
          height: logoSize,
          backgroundColor: showBackground ? backgroundColor : 'transparent',
          borderRadius: logoSize * 0.2,
        }
      ]}>
        <Ionicons name="flash" size={iconSize} color="white" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    borderRadius: 12, // Rounded corners for the image
  },
}); 