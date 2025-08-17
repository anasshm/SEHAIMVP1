import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, View, Text, RefreshControl, ActivityIndicator, SafeAreaView, TouchableOpacity } from 'react-native';
import { listMeals } from '@/services/mealService';
import { Meal } from '@/models/meal';
import RecentMealCard from '@/components/RecentMealCard';
import { useRouter } from 'expo-router';

const MEALS_PER_PAGE = 15;

export default function HistoryScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();

  const fetchMeals = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) {
      setLoading(true);
    }
    setPage(0);
    setHasMore(true);
    try {
      const initialMeals = await listMeals(MEALS_PER_PAGE, 0);
      setMeals(initialMeals);
      if (initialMeals.length < MEALS_PER_PAGE) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching initial meals:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMoreMeals = useCallback(async () => {
    if (loadingMore || !hasMore || loading) {
      return;
    }

    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const offset = nextPage * MEALS_PER_PAGE;
      const newMeals = await listMeals(MEALS_PER_PAGE, offset);

      if (newMeals.length > 0) {
        setMeals((prevMeals) => [...prevMeals, ...newMeals]);
        setPage(nextPage);
      }
      
      if (newMeals.length < MEALS_PER_PAGE) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more meals:', error);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page, loading]);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator animating size="large" color="#000" />
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f7' }}>
      <View className="flex-1 bg-app-bg">
        <View className="px-4 pb-4"> 
          <Text className="text-3xl font-bold text-text-primary">Meal history</Text>
        </View>
        <FlatList
          data={meals}
          renderItem={({ item }: { item: Meal }) => (
            <View className="px-4">
              <TouchableOpacity 
                activeOpacity={0.7} 
                onPress={() => router.push(`/meal/${item.id}`)}
              >
                <RecentMealCard meal={item} />
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item: Meal) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => fetchMeals(true)}
              tintColor="#000"
            />
          }
          ListEmptyComponent={
            <View className="bg-card-bg rounded-card p-4 mx-4 border border-card-border mt-4">
              <Text className="text-text-secondary text-center">
                {loading ? 'Loading meals...' : 'No meals logged yet. Tap the Camera tab to log your first meal!'}
              </Text>
            </View>
          }
          onEndReached={loadMoreMeals}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      </View>
    </SafeAreaView>
  );
}
