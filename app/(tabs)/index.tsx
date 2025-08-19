import { View, Text, ScrollView, RefreshControl, FlatList, TouchableOpacity, ActivityIndicator, Button, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { listMeals, getMealsForDate } from '@/services/mealService';
import { format } from 'date-fns';
import { Meal } from '@/models/meal';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useColorScheme, InteractionManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { palette } from '@/constants/Colors'; // Import palette
import i18n, { isRTL } from '@/utils/i18n'; // Import i18n

// Import our new NativeWind styled components
import NutritionSummaryCard from '@/components/NutritionSummaryCard';
import RecentMealCard from '@/components/RecentMealCard';
import NutritionProgressSection from '@/components/NutritionProgressSection';
import DayCarousel from '@/components/dashboard/DayCarousel';


// Imports for AI Nutrition Plan
import { useOnboarding } from '../OnboardingContext'; 
import { getNutritionRecommendations, NutritionRecommendation } from '../../src/services/NutritionService';
import { useAuth } from '../../src/services/AuthContext'; 

const NUTRITION_PLAN_STORAGE_KEY = '@nutritionPlan';

interface ErrorWithMessage {
  message: string;
}

// Helper function for comparing dates (can be moved to a utils file later)
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ refreshTimestamp?: string }>();
  const lastRefreshTimestampRef = useRef<string | null>(null);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meals, setMeals] = useState<Meal[]>([]); // Potentially for other uses, or could be deprecated if only recent meals use new system
  const [mealsForSelectedDate, setMealsForSelectedDate] = useState<Meal[]>([]);

  // State for paginated "Recently logged" meals
  const [allFetchedRecentMeals, setAllFetchedRecentMeals] = useState<Meal[]>([]);
  const [displayedRecentMeals, setDisplayedRecentMeals] = useState<Meal[]>([]);
  const [recentMealsCurrentPage, setRecentMealsCurrentPage] = useState(1);
  const recentMealsPageSize = 4; // Show 4 items initially and load 4 more each time
  const [canLoadMoreRecentMeals, setCanLoadMoreRecentMeals] = useState(false);
  const [loading, setLoading] = useState(false); // General loading for initial/timestamped fetch
  const [refreshing, setRefreshing] = useState(false); // For pull-to-refresh
  const [nutritionTotals, setNutritionTotals] = useState<{ calories: number, protein: number, carbs: number, fat: number }>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [nutritionPlan, setNutritionPlan] = useState<NutritionRecommendation | null>(null);
  const [isFetchingPlan, setIsFetchingPlan] = useState(false); // Specific for plan fetching phase
  const [dataLoadedInitially, setDataLoadedInitially] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<ErrorWithMessage | null>(null);

  // State for AI Nutrition Plan
  const { onboardingData, isLoading: isOnboardingLoading } = useOnboarding();
  const { user } = useAuth(); 
  const [isAppReady, setIsAppReady] = useState(false); // New state for splash screen control 

  // --- Refetch data logic wrapped in useCallback ---
  const fetchAllData = useCallback(async (dateToFetchFor: Date = new Date()) => {
    console.log('[Dashboard] Fetching all data for date:', dateToFetchFor.toDateString());
    setLoading(true);
    setIsFetchingPlan(true);
    setIsError(false);
    setError(null); // Reset error state
    try {
      // Fetch meals
      const [fetchedMeals, fetchedMealsForDate] = await Promise.all([
        listMeals(),
        getMealsForDate(dateToFetchFor),
      ]);

      const sortedAllMeals = fetchedMeals.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setMeals(sortedAllMeals); // Keep this if `meals` state is used elsewhere for all meals
      
      // Handle paginated recent meals
      setAllFetchedRecentMeals(sortedAllMeals);
      setDisplayedRecentMeals(sortedAllMeals.slice(0, recentMealsPageSize));
      setRecentMealsCurrentPage(1);
      setCanLoadMoreRecentMeals(sortedAllMeals.length > recentMealsPageSize);

      // Sort meals for the selected date by recency before setting state
      const sortedFetchedMealsForDate = fetchedMealsForDate.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setMealsForSelectedDate(sortedFetchedMealsForDate);

      // Fetch or load nutrition plan
      let plan = nutritionPlan; // Use current plan if already set by initial load
      if (!plan) { // Fetch if no plan
        const storedPlanString = await AsyncStorage.getItem(NUTRITION_PLAN_STORAGE_KEY);
        if (storedPlanString) { 
          plan = JSON.parse(storedPlanString);
          setNutritionPlan(plan);
          console.log('[Dashboard] Loaded nutrition plan from AsyncStorage');
        } else if (onboardingData && onboardingData.isOnboardingComplete) {
          console.log('[Dashboard] Fetching new nutrition plan from API...');
          const userName = user?.user_metadata?.name; 
          plan = await getNutritionRecommendations(onboardingData, userName);
          if (plan) {
            setNutritionPlan(plan);
            await AsyncStorage.setItem(NUTRITION_PLAN_STORAGE_KEY, JSON.stringify(plan));
            console.log('[Dashboard] Fetched and saved new nutrition plan.');
          } else {
            console.warn('[Dashboard] Failed to fetch nutrition plan from API.');
          }
        } else if (!isOnboardingLoading) {
          console.log('[Dashboard] Onboarding not complete or data not available, cannot fetch plan.');
        }
      }

      const totals = {
        calories: fetchedMealsForDate.reduce((sum, meal) => sum + (meal.calories || 0), 0),
        protein: fetchedMealsForDate.reduce((sum, meal) => sum + (meal.protein || 0), 0),
        carbs: fetchedMealsForDate.reduce((sum, meal) => sum + (meal.carbs || 0), 0),
        fat: fetchedMealsForDate.reduce((sum, meal) => sum + (meal.fat || 0), 0),
      };
      setNutritionTotals(totals);
      setDataLoadedInitially(true); // Mark that data has been loaded at least once

    } catch (err) { // Use 'err' to avoid conflict with the state variable 'error'
      console.error("[Dashboard] Error fetching data:", err);
      setIsError(true);
      // Type guard for setting the error state
      if (err instanceof Error) {
        setError({ message: err.message });
      } else if (typeof err === 'string') {
        setError({ message: err });
      } else {
        setError({ message: "An unknown error occurred." });
      }
    } finally {
      setLoading(false);
      setIsFetchingPlan(false);
      setRefreshing(false);
      if (!isError && !isAppReady) {
        setIsAppReady(true); // Mark app as ready if data loaded successfully
      }
    }
  }, [onboardingData, isOnboardingLoading, user, isError, isAppReady]);

  // --- Use useFocusEffect to fetch data when screen is focused (conditionally) ---
  useFocusEffect(
    useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        const currentTimestamp = params.refreshTimestamp;
        console.log('[Dashboard] Focus effect. Timestamp param:', currentTimestamp, 'Last processed:', lastRefreshTimestampRef.current);

        if (currentTimestamp && currentTimestamp !== lastRefreshTimestampRef.current) {
          console.log('[Dashboard] New refresh timestamp detected, fetching data for selected date:', selectedDate.toDateString());
          lastRefreshTimestampRef.current = currentTimestamp;
          fetchAllData(selectedDate);
        } else if (!currentTimestamp && !dataLoadedInitially) {
          console.log('[Dashboard] Focus effect: No timestamp, initial data not loaded, fetching data for selected date:', selectedDate.toDateString());
          fetchAllData(selectedDate);
        } else {
          console.log('[Dashboard] No new refresh timestamp, or timestamp already processed, or initial data loaded. Skipping fetch.');
        }
      });

      return () => {
        console.log('[Dashboard] Screen out of focus, cancelling InteractionManager task.');
        task.cancel();
      };
    }, [fetchAllData, params.refreshTimestamp, dataLoadedInitially, selectedDate])
  );

  // --- Initial data load if not already loaded by focus effect --- 
  useEffect(() => {
    // This effect ensures that if the focus effect didn't trigger a fetch 
    // (e.g. no timestamp and dataLoadedInitially was somehow true, or app starts on this screen)
    // we still attempt a load if meals are empty.
    if (!dataLoadedInitially && mealsForSelectedDate.length === 0 && !loading && !refreshing) {
        console.log('[Dashboard] Initial useEffect load trigger (no data and not loading for selected date).');
        fetchAllData(selectedDate);
    }
  }, [dataLoadedInitially, fetchAllData, mealsForSelectedDate.length, loading, refreshing, selectedDate]);

  // Effect to hide splash screen once app is ready
  useEffect(() => {
    if (isAppReady) {
      SplashScreen.hideAsync().catch(e => {
        console.warn("[Dashboard] SplashScreen.hideAsync failed:", e);
      });
    }
  }, [isAppReady]);

  // --- Manual refresh logic ---
  const onRefresh = useCallback(() => {
    console.log('[Dashboard] Manual refresh triggered for selected date:', selectedDate.toDateString());
    setRefreshing(true);
    fetchAllData(selectedDate);
  }, [fetchAllData, selectedDate]);

  // --- Handle Date Selection from Carousel --- 
  const handleDateSelect = (newDate: Date) => {
    console.log('[Dashboard] Date selected:', newDate.toDateString());
    setSelectedDate(newDate);
    fetchAllData(newDate); // This will also reset recent meals pagination for the new context if needed
  };

  // --- Handle "Load More" for Recent Meals --- 
  const handleLoadMoreRecentMeals = () => {
    if (!canLoadMoreRecentMeals) return;

    const nextPage = recentMealsCurrentPage + 1;
    const newLimit = nextPage * recentMealsPageSize;
    
    setDisplayedRecentMeals(allFetchedRecentMeals.slice(0, newLimit));
    setRecentMealsCurrentPage(nextPage);
    setCanLoadMoreRecentMeals(allFetchedRecentMeals.length > newLimit);
  };



  if (!isAppReady && (loading || isFetchingPlan)) {
    // Show a full-screen loading indicator until the app is ready and splash hides
    return (
      <View style={[styles.container, styles.horizontal]}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}> 
      <ScrollView 
        style={{ flex: 1, backgroundColor: 'transparent' }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 48 }} 
        refreshControl={ 
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={palette.primary}
          />
        }
      >

        
        {/* Day Carousel */}
        <DayCarousel selectedDate={selectedDate} onDateSelect={handleDateSelect} />

        {/* AI Nutrition Plan - Moved to the top */}
        
        {isFetchingPlan && <View style={{ height: 128, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={palette.primary} /></View>}
        {isError && error && ( 
          <View style={{ backgroundColor: palette.surface, marginVertical: 16, padding: 16, borderRadius: 8, elevation: 2 }}>
            <Text style={{ color: palette.error, fontWeight: '600' }}>{i18n.t('dashboard.errorFetchingNutritionPlan')}</Text>
            <Text style={{ color: palette.error, marginTop: 8 }}>
              {error.message} 
            </Text>
          </View>
        )}
        {nutritionPlan && nutritionTotals && !isFetchingPlan && !isError && (
          <NutritionProgressSection 
            nutritionPlan={nutritionPlan} 
            currentIntake={nutritionTotals} 
          />
        )}
        

        {/* Recently logged Section */}
        
        <View style={{ marginBottom: 24 }}>
          <Text style={{ 
            marginTop: 24, 
            marginBottom: 8, 
            fontSize: 18, 
            fontWeight: '600', 
            color: palette.primary,
            textAlign: isRTL() ? 'right' : 'left'
          }}>{i18n.t('dashboard.recentlyLogged')}</Text> 
          {displayedRecentMeals.length === 0 && !loading && dataLoadedInitially ? (
            <View style={{ backgroundColor: palette.surface, borderRadius: 8, padding: 24, elevation: 2 }}>
              <Text style={{ 
                color: palette.primary, 
                fontSize: 20, 
                fontWeight: 'bold',
                textAlign: isRTL() ? 'right' : 'left'
              }}>{i18n.t('dashboard.noFoodUploaded')}</Text>
              <Text style={{ 
                color: palette.inactive, 
                fontSize: 16, 
                textAlign: 'center' 
              }}>{i18n.t('dashboard.startTrackingMeals')}</Text>
            </View>
          ) : (
            <FlatList<Meal>
              data={displayedRecentMeals} 
              keyExtractor={(item: Meal) => item.id.toString()} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{paddingBottom: 0}} // Adjusted paddingBottom as button will add margin
              renderItem={({ item }: { item: Meal }) => {
                return (
                  <TouchableOpacity 
                    activeOpacity={0.7} 
                    onPress={() => router.push(`/meal/${item.id}`)}
                  > 
                    <RecentMealCard meal={item} />
                  </TouchableOpacity>
                );
              }} 
              scrollEnabled={false}
            />
          )}
          {canLoadMoreRecentMeals && (
            <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMoreRecentMeals} activeOpacity={0.8}>
              <Text style={styles.loadMoreButtonText}>{i18n.t('dashboard.loadMore')}</Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Added from previous attempts, ensure these are suitable or adjust as needed
  contentContainer: {
    paddingBottom: 100, // Ensure space for FAB or other bottom elements
    // paddingHorizontal: 16, // This is applied to ScrollView's contentContainerStyle directly in JSX
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
    color: palette.primary, // Using primary for titles
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: palette.error, // Using error color from palette
    textAlign: 'center',
    marginBottom: 10,
  },
  loadMoreButton: {
    backgroundColor: palette.primary, 
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 25, // Full pill shape
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24, 
  },
  loadMoreButtonText: {
    color: palette.surface, // Using surface (white) for button text
    fontSize: 15,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.background, // Using background from palette
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
});
