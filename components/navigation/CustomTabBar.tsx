import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { styled } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette } from '@/constants/Colors';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

// Define the structure for route configuration
interface RouteConfigItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap; // Use keyof for type safety
  iconOutline: keyof typeof Ionicons.glyphMap;
}

// Explicitly type the keys for routeConfig
type RouteName = 'index' | 'camera' | 'history' | 'profile';

const routeConfig: Record<RouteName, RouteConfigItem> = {
  index: { label: 'Dashboard', icon: 'home', iconOutline: 'home-outline' },
  camera: { label: 'Camera', icon: 'camera', iconOutline: 'camera-outline' },
  history: { label: 'History', icon: 'time', iconOutline: 'time-outline' },
  profile: { label: 'Profile', icon: 'person', iconOutline: 'person-outline' },
};

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  // Hide the tab bar completely if the camera screen is active
  if (state.routes[state.index].name === 'camera') {
    return null;
  }
  
  // Otherwise, render the tab bar
  return (
    <StyledView style={{ backgroundColor: palette.surface, borderTopColor: palette.inactive, borderTopWidth: 1 }} className="flex-row">
      {/* SafeAreaView for bottom padding on iOS */} 
      <SafeAreaView edges={['bottom']} style={{ flex: 1, flexDirection: 'row' }}> 
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          // Cast route.name to our defined RouteName type
          const config = routeConfig[route.name as RouteName]; 
          
          // Fallback label if not in config or name is unexpected
          const label = config?.label ?? options.title ?? route.name;
          
          // Determine active state
          const isActive = state.index === index;
          
          // Get icon names from config
          const iconName = isActive ? config?.icon : config?.iconOutline;
          
          // Handle press event
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isActive && !event.defaultPrevented) {
              // Ensure route.name is treated as string for navigation
              navigation.navigate(route.name, route.params); 
            }
          };

          // Handle long press event (optional, but good practice)
          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };
          
          // Special styling for the Camera button
          if (route.name === 'camera') {
            return (
              <StyledTouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isActive ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
                onPress={onPress}
                onLongPress={onLongPress}
                className="flex-1 items-center justify-center"
              >
                {/* Increase container size, icon size, and negative margin */}
                <StyledView className="w-16 h-16 rounded-full items-center justify-center -mt-8 shadow-lg" style={{ backgroundColor: palette.accent }}>
                  {iconName && <Ionicons name={iconName} size={40} color="white" />} 
                </StyledView>
                {/* Camera button usually doesn't have a label below */}
              </StyledTouchableOpacity>
            );
          }

          // Default button styling
          return (
            <StyledTouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isActive ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              onPress={onPress}
              onLongPress={onLongPress}
              className="flex-1 items-center py-2" // Standard button container
            >
              {/* Use iconName directly */} 
              {iconName && (
                <Ionicons 
                  name={iconName} 
                  size={24} 
                  style={{ color: isActive ? palette.primary : palette.inactive }} 
                />
              )}
              <StyledText 
                style={{ color: isActive ? palette.primary : palette.inactive }} 
                className={`text-xs mt-1 ${isActive ? 'font-semibold' : ''}`}
              >
                {label}
              </StyledText>
            </StyledTouchableOpacity>
          );
        })}
      </SafeAreaView>
    </StyledView>
  );
}
