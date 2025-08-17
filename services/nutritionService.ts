import { supabase } from "./db";
import { FoodItem, Meal, MealItem } from "@/models/nutrition";
import { enqueue, flushQueue } from "@/store/offlineQueue";
import NetInfo from "@react-native-community/netinfo";

/** insert or update a food item */
export async function upsertFood(food: FoodItem) {
  const online = (await NetInfo.fetch()).isConnected;
  if (!online) {
    await enqueue({ type: "upsertFood", payload: food });
    return;
  }
  await supabase.from("food_items").upsert(food);
}

/** create a meal with items */
export async function saveMeal(meal: Meal) {
  const online = (await NetInfo.fetch()).isConnected;
  if (!online) {
    await enqueue({ type: "saveMeal", payload: meal });
    return;
  }
  const { data, error } = await supabase
    .from("meals")
    .insert({ meal_time: meal.meal_time })
    .select("id")
    .single();
  if (error || !data?.id) throw error ?? new Error("No meal id");
  const mealId = data.id;
  const mealItems: MealItem[] = meal.items.map(i => ({ ...i }));
  await supabase.from("meal_items").insert(
    mealItems.map(i => ({ meal_id: mealId, ...i }))
  );
}

/** call on app resume / network restore */
export async function flushOffline() {
  await flushQueue(async action => {
    if (action.type === "upsertFood") await upsertFood(action.payload);
    if (action.type === "saveMeal")   await saveMeal(action.payload);
  });
}
