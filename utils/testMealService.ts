import { uploadThumbnail, saveMeal, listMeals } from '@/services/mealService';
import { supabase } from '@/services/db';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { syncSupabaseAuth } from '@/services/authUtils';

/**
 * Tests the meal service functionality
 * This function can be called from a test button in the UI
 */
export const testMealService = async (): Promise<void> => {
  try {
    // Synchronize authentication between Supabase clients
    await syncSupabaseAuth();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Error', 'User not authenticated. Please sign in first.');
      return;
    }
    
    console.log('Starting test meal service with user:', user.id);
    
    // Create a test image using Expo FileSystem
    const testImageUrl = 'https://via.placeholder.com/300x200';
    const fileUri = FileSystem.cacheDirectory + 'test-meal.jpg';
    
    let blob: Blob;
    try {
      console.log('Downloading test image to:', fileUri);
      // Download the image to local filesystem
      await FileSystem.downloadAsync(testImageUrl, fileUri);
      console.log('Image downloaded successfully');
      
      // Read the file as base64
      const base64Data = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
      console.log('Image converted to base64, length:', base64Data.length);
      
      // Create a blob from the base64 data
      blob = await (await fetch(`data:image/jpeg;base64,${base64Data}`)).blob();
      console.log('Blob created, size:', blob.size);
    } catch (error: any) {
      console.error('Error preparing test image:', error);
      Alert.alert('Image Preparation Error', `Failed to prepare test image: ${error?.message || 'Unknown error'}`);
      return;
    }
    
    // Provide haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Upload the image
    console.log('Uploading test image...');
    Alert.alert('Testing', 'Uploading test image...');
    let thumbnailUrl;
    try {
      thumbnailUrl = await uploadThumbnail(blob);
      console.log('Image uploaded successfully:', thumbnailUrl);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      Alert.alert('Upload Error', `Failed to upload image: ${error?.message || 'Unknown error'}`);
      return;
    }
    
    // Save a test meal
    console.log('Saving test meal...');
    Alert.alert('Testing', 'Saving test meal...');
    const testMeal = {
      name: 'Test Meal ' + new Date().toLocaleTimeString(),
      thumbnail_url: thumbnailUrl,
      taken_at: new Date().toISOString(),
      calories: 500,
      protein: 25,
      carbs: 60,
      fats: 15
    };
    
    let savedMeal;
    try {
      savedMeal = await saveMeal(testMeal);
      console.log('Meal saved successfully:', savedMeal);
    } catch (error: any) {
      console.error('Error saving meal:', error);
      Alert.alert('Save Error', `Failed to save meal: ${error?.message || 'Unknown error'}`);
      return;
    }
    
    // List meals to verify
    console.log('Listing meals...');
    const meals = await listMeals();
    console.log('Meals retrieved:', meals.length);
    
    // Show success message
    Alert.alert(
      'Test Completed', 
      `Successfully created meal "${testMeal.name}".\n\nRetrieved ${meals.length} meals from database.`,
      [{ text: 'OK' }]
    );
  } catch (error: any) {
    console.error('Test failed:', error);
    Alert.alert('Test Failed', error?.message || 'Unknown error occurred');
  }
};
