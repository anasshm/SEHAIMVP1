import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
// import { AnimatePresence } from 'moti';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from '@/src/services/AuthContext';
import { OnboardingProvider } from './OnboardingContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { GlossyBackground } from '@/components/ui/GlossyBackground';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { getScreenName } from '@/utils/onboarding/onboardingConfig';

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (user) { 
        try {
          const onboardingStatus = await AsyncStorage.getItem('onboardingComplete');
          if (__DEV__) {
            console.log('[RootLayout] Checked onboarding status:', onboardingStatus);
          }
          setIsOnboardingComplete(onboardingStatus === 'true');
        } catch (e) {
          console.error("[RootLayout] Failed to fetch onboarding status", e);
          setIsOnboardingComplete(false); 
        }
      } else {
        setIsOnboardingComplete(null); 
      }
    };

    checkOnboardingStatus();
  }, [user]); 

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
        isOnboardingComplete, 
        inAuthGroup, 
        inAppGroup, 
        inOnboardingGroup,
        inPaywallGroup,
        isResultsScreen,
        isMealDetailScreen,
        currentRoute 
      });
    }

    // --- RE-ENABLE REDIRECTS ---
    
    if (!user) {
      // User is not signed in.
      // Allow them to be in onboarding OR auth.
      // If they are anywhere else, redirect to register.
      if (!inAuthGroup && !inOnboardingGroup) { 
        if (__DEV__) {
          console.log('[RootLayout] Redirecting unauthenticated user to register...');
        }
        router.replace('/(auth)/register');
      } else {
        if (__DEV__) {
          console.log('[RootLayout] User not logged in, staying in auth or onboarding group.');
        }
      }
    } else {
      // User IS signed in.
      if (isOnboardingComplete === null) {
        // Still waiting for onboarding status from AsyncStorage
        if (__DEV__) {
          console.log('[RootLayout] Waiting for onboarding status check...');
        }
        // return; // Return might cause issues if commented out, just don't replace
      } 
      
      if (isOnboardingComplete === false) {
        // User logged in but onboarding NOT complete.
        // Send them to the START of onboarding IF they are not already in the onboarding or paywall group.
        if (!inOnboardingGroup && !inPaywallGroup) { 
          if (__DEV__) {
            console.log('[RootLayout] User logged in, onboarding incomplete. Redirecting to page 1 of onboarding...');
          }
        // Use the new navigation system - go to page 1
        const firstPageScreen = getScreenName(1);
        if (firstPageScreen) {
          router.replace(`/(onboarding)/${firstPageScreen}` as any);
        }
        } else {
          if (__DEV__) {
            console.log('[RootLayout] User logged in, onboarding incomplete, already in onboarding/paywall group. Staying.');
          }
        }
      } else if (isOnboardingComplete === true) {
        // User logged in AND onboarding IS complete, go to main app.
        // Do not redirect if user is already in the app group, on the results screen, OR on the meal detail screen
        if (!inAppGroup && !isResultsScreen && !isMealDetailScreen) { 
          if (__DEV__) {
            console.log('[RootLayout] Redirecting to main app (tabs)...');
          }
          router.replace('/(tabs)'); // Go to the main app
        }
      }
    }
    
    // --- END OF RE-ENABLED REDIRECTS ---

  }, [user, isLoading, isOnboardingComplete, segments, router]);

  if (isLoading || isOnboardingComplete === null && user) {
     if (__DEV__) {
       console.log('[RootLayout] Loading auth or onboarding status, returning null.');
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
