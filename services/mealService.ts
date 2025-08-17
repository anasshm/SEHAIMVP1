import { supabase } from '@/services/db';
import { Meal, MealInput } from '@/models/meal';
import NetInfo from '@react-native-community/netinfo';
import { addToQueue, QueueAction } from '@/store/offlineQueue';
import { syncSupabaseAuth } from '@/services/authUtils';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

/**
 * Helper function to convert base64 to ArrayBuffer
 */
function _base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Uploads a meal image to Supabase Storage
 * @param imageUri The local URI of the image to upload
 * @returns The public URL of the uploaded image
 */
export const uploadThumbnail = async (
  imageUri: string
): Promise<string> => {
  console.log('!!! [uploadThumbnail] Function called with imageUri:', imageUri);
  try {
    // Check network connectivity
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      throw new Error('No internet connection available for uploading image');
    }

    // Synchronize authentication between Supabase clients
    await syncSupabaseAuth();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Create a unique file name
    const fileExt = 'jpg';
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    // Try to create the bucket if it doesn't exist (this is a no-op if it exists)
    try {
      const { error: bucketError } = await supabase.storage.createBucket('thumbnails', {
        public: false
      });
      console.log('Bucket creation attempt:', bucketError ? 'Error: ' + bucketError.message : 'Success or already exists');
    } catch (bucketErr) {
      console.log('Bucket creation exception:', bucketErr);
      // Continue anyway, as the bucket might already exist
    }

    // Log the incoming image URI for debugging - This is now at the top of the function

    // Check file system information for the URI
    try {
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      console.log('[uploadThumbnail] FileSystem.getInfoAsync result for imageUri:', JSON.stringify(fileInfo, null, 2));
      if (!fileInfo.exists) {
        throw new Error(`File does not exist at URI: ${imageUri}`);
      }
      if (fileInfo.isDirectory) {
        throw new Error(`URI points to a directory, not a file: ${imageUri}`);
      }
      if (fileInfo.size === 0) {
        throw new Error(`File at URI is empty (0 bytes): ${imageUri}`);
      }
    } catch (fsError: any) {
      console.error('[uploadThumbnail] Error getting file info:', fsError);
      throw new Error(`Failed to get file info for URI: ${imageUri} - ${fsError.message}`);
    }

    // Process the image to reduce size
    console.log('!!! [uploadThumbnail] About to call ImageManipulator.manipulateAsync with URI:', imageUri);
    const manipResult = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 500 } }], // Resize to a reasonable thumbnail size
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    
    console.log('!!! [uploadThumbnail] ImageManipulator.manipulateAsync successful. Manipulated URI:', manipResult.uri, 'Original URI:', imageUri);
    // Read the image as base64
    console.log('!!! [uploadThumbnail] About to call FileSystem.readAsStringAsync with URI:', manipResult.uri);
    const base64Data = await FileSystem.readAsStringAsync(manipResult.uri, {
      encoding: FileSystem.EncodingType.Base64
    });
    
    console.log('!!! [uploadThumbnail] FileSystem.readAsStringAsync successful for URI:', manipResult.uri);
    // Convert base64 to ArrayBuffer
    const arrayBuffer = _base64ToArrayBuffer(base64Data);
    
    console.log('!!! [uploadThumbnail] ArrayBuffer created. About to upload to Supabase Storage. FileName:', fileName);
    // Upload the file to the thumbnails bucket as ArrayBuffer
    const { data, error } = await supabase.storage
      .from('thumbnails')
      .upload(fileName, arrayBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true // Changed to true to overwrite if needed
      });
    
    if (error) {
      console.error('Storage upload error:', error);
      
      // If we're getting a bucket not found error, try a different approach
      if (error.message?.includes('Bucket not found') || error.message?.includes('404')) {
        throw new Error(`Storage bucket 'thumbnails' not found. Please create it in the Supabase dashboard.`);
      }
      
      throw error;
    }
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('thumbnails')
      .getPublicUrl(data.path);
    
    return urlData.publicUrl;
  } catch (error: any) {
    console.error('!!! [uploadThumbnail] CAUGHT ERROR in uploadThumbnail:', error.message, error);
    throw error;
  }
};

/**
 * Saves a new meal to the database
 * @param meal The meal data to save
 * @returns The saved meal data
 */
export const saveMeal = async (meal: MealInput): Promise<Meal> => {
  try {
    // Check network connectivity
    const netState = await NetInfo.fetch();
    
    // Synchronize authentication between Supabase clients
    await syncSupabaseAuth();
    
    // Log the meal data being saved for debugging
    console.log('Saving meal data:', meal);
    
    // Create a sanitized version of the meal data that only includes columns we know exist
    const sanitizedMeal = {
      name: meal.name,
      image_url: meal.image_url,
      meal_time: meal.meal_time || new Date().toISOString(),
      calories: meal.calories || 0,
      protein: meal.protein || 0,
      carbs: meal.carbs || 0,
      fat: meal.fat || 0
    };
    
    if (!netState.isConnected) {
      // Store action in offline queue
      await addToQueue({
        type: 'INSERT',
        table: 'meals',
        data: sanitizedMeal
      });
      
      // Return a mock meal for offline mode
      return {
        id: `offline-${Date.now()}`,
        user_id: 'offline',
        name: sanitizedMeal.name,
        image_url: sanitizedMeal.image_url,
        meal_time: sanitizedMeal.meal_time,
        calories: sanitizedMeal.calories,
        protein: sanitizedMeal.protein,
        carbs: sanitizedMeal.carbs,
        fat: sanitizedMeal.fat,
        created_at: new Date().toISOString()
      };
    }
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Insert the sanitized meal into the database
    const { data, error } = await supabase
      .from('meals')
      .insert({ ...sanitizedMeal, user_id: user.id })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving meal:', error);
    throw error;
  }
};

/**
 * Retrieves meals for the current user
 * @param limit The maximum number of meals to return
 * @param offset The number of meals to skip
 * @returns An array of meal data
 */
/**
 * Gets meals for the current day only
 * @returns An array of today's meal data
 */
export const getTodaysMeals = async (): Promise<Meal[]> => {
  try {
    // Synchronize authentication between Supabase clients
    await syncSupabaseAuth();
    
    // Calculate today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Format dates for Postgres
    const todayStr = today.toISOString();
    const tomorrowStr = tomorrow.toISOString();
    
    // Query meals from today only
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .gte('meal_time', todayStr)
      .lt('meal_time', tomorrowStr)
      .order('meal_time', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting today\'s meals:', error);
    return [];
  }
};

/**
 * Gets meals for a specific date
 * @param dateToFetch The date for which to retrieve meals
 * @returns An array of meal data for the specified date
 */
export const getMealsForDate = async (dateToFetch: Date): Promise<Meal[]> => {
  try {
    // Synchronize authentication between Supabase clients
    await syncSupabaseAuth();

    // Calculate the date range for the given dateToFetch
    const startDate = new Date(dateToFetch);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    // Format dates for Postgres
    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Fetch meals within the date range for the current user
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', user.id)
      .gte('meal_time', startDateStr)
      .lt('meal_time', endDateStr)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching meals for date:', dateToFetch, error);
    throw error;
  }
};

export const listMeals = async (
  limit: number = 20,
  offset: number = 0
): Promise<Meal[]> => {
  try {
    // Synchronize authentication between Supabase clients
    await syncSupabaseAuth();
    
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .order('meal_time', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error listing meals:', error);
    return [];
  }
};

/**
 * Gets a single meal by ID
 * @param id The meal ID to retrieve
 * @returns The meal data or null if not found
 */
export const getMeal = async (id: string): Promise<Meal | null> => {
  try {
    // Skip API call for local IDs
    if (id.startsWith('local_')) {
      return null;
    }
    
    // Synchronize authentication between Supabase clients
    await syncSupabaseAuth();
    
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting meal:', error);
    return null;
  }
};

/**
 * Updates an existing meal
 * @param id The ID of the meal to update
 * @param updates The fields to update
 * @returns The updated meal data
 */
export const updateMeal = async (
  id: string, 
  updates: Partial<MealInput>
): Promise<Meal | null> => {
  try {
    // Check network connectivity
    const netState = await NetInfo.fetch();
    
    // Synchronize authentication between Supabase clients
    await syncSupabaseAuth();
    
    if (!netState.isConnected) {
      // Store action in offline queue
      await addToQueue({
        type: 'UPDATE',
        table: 'meals',
        id,
        data: updates,
      } as QueueAction);
      
      return null;
    }
    
    const { data, error } = await supabase
      .from('meals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating meal:', error);
    return null;
  }
};

/**
 * Deletes a meal by ID
 * @param id The ID of the meal to delete
 * @returns True if successful, false otherwise
 */
export const deleteMeal = async (id: string): Promise<boolean> => {
  try {
    // Check network connectivity
    const netState = await NetInfo.fetch();
    
    // Synchronize authentication between Supabase clients
    await syncSupabaseAuth();
    
    if (!netState.isConnected) {
      // Store action in offline queue
      await addToQueue({
        type: 'DELETE',
        table: 'meals',
        id,
      } as QueueAction);
      
      return true;
    }
    
    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting meal:', error);
    return false;
  }
};
