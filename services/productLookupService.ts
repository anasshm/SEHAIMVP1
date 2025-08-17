// services/productLookupService.ts

export interface ProductNutritionInfo {
  productName?: string;
  imageUrl?: string;
  servingSize?: string;
  calories?: number; // per serving
  protein?: number; // per serving, in grams
  carbs?: number; // per serving, in grams
  fat?: number; // per serving, in grams;
  errorMessage?: string; // To pass error messages to the UI
}

const KJ_TO_KCAL_CONVERSION_FACTOR = 0.239006;

export async function fetchProductDetails(barcode: string): Promise<ProductNutritionInfo> {
  const apiUrl = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      // This handles network errors, but not necessarily "product not found" which might return a 200 OK with status 0.
      console.error(`API request failed with status: ${response.status}`);
      return { errorMessage: `Network error: ${response.statusText}` };
    }

    const data = await response.json();

    if (data.status === 0 || !data.product) {
      console.log(`Product not found for barcode: ${barcode}. Status verbose: ${data.status_verbose}`);
      return { errorMessage: data.status_verbose || 'Product not found.' };
    }

    const product = data.product;
    const nutriments = product.nutriments || {};

    let caloriesPerServing: number | undefined;
    let proteinPerServing: number | undefined;
    let carbsPerServing: number | undefined;
    let fatPerServing: number | undefined;

    const servingQuantityString = product.serving_quantity || product.serving_size || '';
    const servingQuantityMatch = servingQuantityString.match(/([\d.]+)/);
    const servingQuantity = servingQuantityMatch ? parseFloat(servingQuantityMatch[0]) : 0;
    
    const nutritionDataPer = product.nutrition_data_per?.toLowerCase(); // 'serving', '100g', or undefined

    // Helper function to get nutrient value, converting from 100g if necessary
    const getNutrientPerServing = (nutrient100g?: any, nutrientServing?: any): number | undefined => {
      const val100g = parseFloat(nutrient100g);
      const valServing = parseFloat(nutrientServing);

      if (!isNaN(valServing)) {
        return valServing;
      }
      if (!isNaN(val100g) && servingQuantity > 0 && nutritionDataPer?.includes('100g')) {
        return (val100g / 100) * servingQuantity;
      }
      return undefined;
    };
    
    // Calories
    const energyKcalServing = parseFloat(nutriments['energy-kcal_serving']);
    const energyServingKj = parseFloat(nutriments['energy_serving']);
    const energyKcal100g = parseFloat(nutriments['energy-kcal_100g']);
    const energy100gKj = parseFloat(nutriments['energy_100g']);

    if (!isNaN(energyKcalServing)) {
        caloriesPerServing = energyKcalServing;
    } else if (!isNaN(energyServingKj)) { // kJ per serving
        caloriesPerServing = energyServingKj * KJ_TO_KCAL_CONVERSION_FACTOR;
    } else if (!isNaN(energyKcal100g) && servingQuantity > 0 && nutritionDataPer?.includes('100g')) {
        caloriesPerServing = (energyKcal100g / 100) * servingQuantity;
    } else if (!isNaN(energy100gKj) && servingQuantity > 0 && nutritionDataPer?.includes('100g')) { // kJ per 100g
        caloriesPerServing = (energy100gKj / 100) * servingQuantity * KJ_TO_KCAL_CONVERSION_FACTOR;
    }


    proteinPerServing = getNutrientPerServing(nutriments.proteins_100g, nutriments.proteins_serving);
    carbsPerServing = getNutrientPerServing(nutriments.carbohydrates_100g, nutriments.carbohydrates_serving);
    fatPerServing = getNutrientPerServing(nutriments.fat_100g, nutriments.fat_serving);
    

    return {
      productName: product.product_name || product.product_name_en || 'N/A',
      imageUrl: product.image_url || product.image_front_url,
      servingSize: product.serving_size || (servingQuantity ? `${servingQuantity}g` : 'N/A'),
      calories: caloriesPerServing !== undefined ? parseFloat(caloriesPerServing.toFixed(1)) : undefined,
      protein: proteinPerServing !== undefined ? parseFloat(proteinPerServing.toFixed(1)) : undefined,
      carbs: carbsPerServing !== undefined ? parseFloat(carbsPerServing.toFixed(1)) : undefined,
      fat: fatPerServing !== undefined ? parseFloat(fatPerServing.toFixed(1)) : undefined,
    };

  } catch (error: any) {
    console.error(`Error fetching product details for barcode ${barcode}:`, error);
    return { errorMessage: error.message || 'An unexpected error occurred.' };
  }
}
