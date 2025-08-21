/**
 * Represents a meal stored in the database
 */
export interface Meal {
  id: string;
  user_id: string;
  name: string;
  image_url?: string;
  meal_time: string; // ISO date string
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  created_at: string; // ISO date string
}

/**
 * Input data for creating a new meal
 */
export interface MealInput {
  name: string;
  image_url?: string;
  meal_time?: string; // ISO date string, defaults to now()
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}
