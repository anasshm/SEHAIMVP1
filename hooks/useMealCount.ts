import { useState, useEffect } from 'react';
import { listMeals } from '@/services/mealService';

export function useMealCount() {
  const [mealCount, setMealCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMealCount = async () => {
      try {
        setIsLoading(true);
        const meals = await listMeals();
        setMealCount(meals.length);
      } catch (error) {
        console.error('Error fetching meal count:', error);
        setMealCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMealCount();
  }, []);

  return { mealCount, isLoading, hasMeals: mealCount > 0 };
} 