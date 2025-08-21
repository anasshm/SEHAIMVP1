import { FoodItem, MealItem } from "@/models/nutrition";

export function calcMealTotals(
  foods: Record<string, FoodItem>,
  mealItems: MealItem[]
) {
  let calories = 0, protein = 0, carbs = 0, fat = 0;
  mealItems.forEach(item => {
    const food = foods[item.food_id];
    if (!food) return;
    calories += food.calories * item.portion_mult;
    protein  += food.protein  * item.portion_mult;
    carbs    += food.carbs    * item.portion_mult;
    fat      += food.fat      * item.portion_mult;
  });
  return { calories, protein, carbs, fat };
}
