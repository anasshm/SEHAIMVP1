import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
// import { AnimatePresence } from 'moti';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/src/services/AuthContext';
import { OnboardingProvider } from './OnboardingContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { GlossyBackground } from '@/components/ui/GlossyBackground';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';


function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) {
      if (__DEV__) {
        console.log('[RootLayout] Auth is loading, skipping navigation.');
      }
      return; 
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(tabs)';
    const inOnboardingGroup = segments[0] === '(onboarding)';
    const inPaywallGroup = segments[0] === '(paywall)';
    const isResultsScreen = segments[0] === 'results'; 
    const isMealDetailScreen = segments[0] === 'meal'; 
    const currentRoute = segments.join('/'); 

    if (__DEV__) {
      console.log('[RootLayout] Navigation check:', { 
        user: user ? user.id : 'None', 
        isLoading, 
        inAuthGroup, 
        inAppGroup, 
        inOnboardingGroup,
        inPaywallGroup,
        isResultsScreen,
        isMealDetailScreen,
        currentRoute 
      });
    }

    // SIMPLIFIED LOGIC: Only check if user is logged in
    if (!user) {
      // User is not signed in - redirect to onboarding
      if (!inAuthGroup && !inOnboardingGroup) { 
        if (__DEV__) {
          console.log('[RootLayout] User not logged in, redirecting to onboarding...');
        }
        router.replace('/(onboarding)/step5_gender');
      } else {
        if (__DEV__) {
          console.log('[RootLayout] User not logged in, staying in auth or onboarding group.');
        }
      }
    } else {
      // User IS signed in - redirect to dashboard
      if (!inAppGroup && !isResultsScreen && !isMealDetailScreen) { 
        if (__DEV__) {
          console.log('[RootLayout] User logged in, redirecting to dashboard...');
        }
        router.replace('/(tabs)');
      } else {
        if (__DEV__) {
          console.log('[RootLayout] User logged in, already in app or special screen.');
        }
      }
    }

  }, [user, isLoading, segments, router]);

  if (isLoading) {
     if (__DEV__) {
       console.log('[RootLayout] Auth loading, showing nothing.');
     }
     return null; 
  }

  if (__DEV__) {
    console.log('[RootLayout] Render Stacks');
  }
  return (
    // <AnimatePresence exitBeforeEnter>
      <Stack
        // key={segments.join('/')} // Use segments to form a key 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
        animation: 'fade',
        gestureEnabled: true, // Global default
      }}
    >
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} /> 
      <Stack.Screen name="(paywall)" options={{ headerShown: false }} /> 

      {/* Define the meal detail screen here */}
      <Stack.Screen 
        name="meal/[mealId]" 
        options={{ 
          headerShown: false, // Hide header for this screen
        }} 
      />
      {/* Define other root-level screens if needed */}
    </Stack>
    // </AnimatePresence>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Create custom themes with transparent backgrounds
  const customDefaultTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: 'transparent',
    },
  };

  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: 'transparent',
    },
  };

  const themeToUse = colorScheme === 'dark' ? customDarkTheme : customDefaultTheme;

  useEffect(() => {
    if (loaded || fontError) {
      SplashScreen.preventAutoHideAsync().catch(e => {
        console.warn("[RootLayout] SplashScreen.preventAutoHideAsync failed:", e);
      });
    }
  }, [loaded, fontError]);

  if (!loaded && !fontError) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <AuthProvider>
        <OnboardingProvider>
          <ThemeProvider value={themeToUse}> 
            <View style={{ flex: 1, backgroundColor: 'transparent' }}> 
              <GlossyBackground /> 
              <RootLayoutNav />
              <StatusBar style="dark" />
            </View>
          </ThemeProvider>
        </OnboardingProvider>
      </AuthProvider>
    </View>
  );
}
