import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { View, Text, TouchableOpacity, Alert, ScrollView, Image } from 'react-native'; // Added Image
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FoodAnalysisCard } from '@/components/food/FoodAnalysisCard';
import { analyzeFoodImage, FoodAnalysisResult } from '@/services/aiVisionService';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors, palette } from '@/constants/Colors';
import { uploadThumbnail, saveMeal } from '@/services/mealService';
import { useAuth } from '@/src/services/AuthContext';
import { syncSupabaseAuth } from '@/services/authUtils';
import { supabase } from '@/services/db';
import { styled } from 'nativewind';
import { fetchProductDetails, ProductNutritionInfo } from '@/services/productLookupService';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledImage = styled(Image); // For displaying the food image

const styles = StyleSheet.create({
  barcodeText: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  savingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Ensure it's on top
  },
  savingText: {
    color: palette.surface,
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default function ResultsScreen() {
  const { imageUri, imageBase64, barcodeType, barcodeData, scanSource } = useLocalSearchParams<{ imageUri?: string; imageBase64?: string; barcodeType?: string; barcodeData?: string; scanSource?: 'image' | 'barcode' }>();
  const [result, setResult] = useState<FoodAnalysisResult | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [displayMode, setDisplayMode] = useState<'image' | 'barcode' | 'loading' | 'error'>('loading');
  const [productInfo, setProductInfo] = useState<ProductNutritionInfo | undefined>();
  const [productLoading, setProductLoading] = useState<boolean>(false);
  const [productError, setProductError] = useState<string | undefined>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (scanSource === 'barcode' && barcodeData) {
      // Barcode scan result - show loading state first
      setIsLoading(true);
      setDisplayMode('loading');
      setError(undefined);
      setProductError(undefined);
      
      fetchProductDetails(barcodeData)
        .then(info => {
          if (info.errorMessage) {
            // API returned an error message
            setError(info.errorMessage); // Use the main error state
            setDisplayMode('error');
            setProductInfo(undefined);
          } else if (!info.productName || info.productName === 'N/A' || info.productName === 'Unknown Product') {
            // Product name is missing or invalid
            setError('Product information not found or incomplete for this barcode.');
            setDisplayMode('error');
            setProductInfo(undefined);
          } else {
            // Valid product found - transform to FoodAnalysisResult format
            setProductInfo(info); // Keep original for the image URL
            
            // Create a FoodAnalysisResult from the barcode product info
            const barcodeResult: FoodAnalysisResult = {
              name: info.productName,
              calories: info.calories ?? 0,
              protein: info.protein ?? 0,
              carbs: info.carbs ?? 0,
              fat: info.fat ?? 0,
              description: (!info.calories && !info.protein && !info.carbs && !info.fat) 
                ? `Serving Size: ${info.servingSize || 'N/A'}. No detailed nutritional information found.`
                : `Serving Size: ${info.servingSize || 'N/A'}`
            };
            
            setResult(barcodeResult); // Use the same result state as for image analysis
            setDisplayMode('image'); // Use the same display mode as image analysis for consistent UI
          }
        })
        .catch(err => {
          console.error('Error fetching product details:', err);
          setError(err.message || 'Failed to fetch product details.');
          setDisplayMode('error');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (imageUri || imageBase64) { // Check for either imageUri or imageBase64
      setDisplayMode('loading');
      analyzeFood(); // This function sets isLoading and error internally
      // Set a timeout for image analysis
      timeoutId = setTimeout(() => {
        if (isLoading && displayMode === 'loading') { 
          console.log('Image analysis timeout reached');
          setError('Image analysis took too long.');
          setDisplayMode('error');
          setIsLoading(false);
        }
      }, 120000); // 120 seconds timeout
    } else {
      setError('No image or barcode data provided');
      setDisplayMode('error');
      setIsLoading(false);
      // Navigate back to camera if no data is provided at all
      timeoutId = setTimeout(() => {
        router.replace('/(tabs)/camera');
      }, 2000);
    }

    return () => clearTimeout(timeoutId);
  }, [imageUri, imageBase64, barcodeData, scanSource]); // Added imageBase64 to dependencies

  const analyzeFood = async () => {
    try {
      setIsLoading(true);
      setError(undefined);
      
      // Provide haptic feedback to indicate analysis has started
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Call the AI Vision service
      const dataToAnalyze = imageBase64 || imageUri;
      if (!dataToAnalyze) {
        console.error('No image URI or base64 data found for analysis.');
        setError('No image data found to analyze.');
        setIsLoading(false);
        setDisplayMode('error');
        Alert.alert('Error', 'No image data found. Please try again.', [{ text: 'OK', onPress: () => router.replace('/(tabs)/camera') }]);
        return;
      }
      
      console.log('Calling analyzeFoodImage with data type:', typeof dataToAnalyze);
      const analysisResult = await analyzeFoodImage(dataToAnalyze as string);
      console.log('Analysis result received:', analysisResult);
      
      // Update state with the result and change display mode
      setResult(analysisResult);
      setDisplayMode('image'); // Explicitly set to 'image' mode to show results
      
      // Provide success haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error('Error analyzing food:', err);
      setError('Failed to analyze the food image. Please try again.');
      setDisplayMode('error'); // Explicitly set to 'error' mode
      
      // Provide error haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      Alert.alert(
        'Analysis Error',
        'There was a problem analyzing your food image. Please try again.',
        [{ 
          text: 'OK', 
          onPress: () => {
            // Navigate back to camera on error
            router.replace('/(tabs)/camera');
          }
        }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    analyzeFood();
  };

  const handleBack = () => {
    // Navigate to dashboard (root of tabs)
    router.replace('/');
  };

  const handleSaveMeal = async () => {
    console.log('Starting meal save process');
    
    // Check if we have the necessary data to save a meal
    if (!result || !user) {
      console.log('Missing data:', { hasResult: !!result, hasUser: !!user });
      Alert.alert('Error', 'Missing data required to save meal');
      return;
    }
    
    // For barcode scans, we might not have imageUri but could have productInfo.imageUrl
    const hasImageSource = !!imageUri || (scanSource === 'barcode' && productInfo?.imageUrl);    
    if (!hasImageSource) {
      console.log('No image source available for thumbnail');
      Alert.alert('Warning', 'No image available for this meal. Continue anyway?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => saveMealWithOrWithoutImage() }
      ]);
      return;
    }
    
    // If we have all required data, proceed with saving
    await saveMealWithOrWithoutImage();
  };
  
  const saveMealWithOrWithoutImage = async () => {
    // Safety check - ensure we have result and user
    if (!result || !user) {
      Alert.alert('Error', 'Missing data required to save meal');
      return;
    }

    try {
      setIsSaving(true);
      
      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Ensure auth is synchronized
      await syncSupabaseAuth();
      
      let thumbnailUrl = 'https://via.placeholder.com/300x200?text=No+Image'; // Default placeholder
      let fileUriForUpload: string | undefined = undefined; // Declare here for logging in catch

      try {
        // Determine the image source for the thumbnail
        if (scanSource === 'image' && imageUri) {
          fileUriForUpload = imageUri;
        } else if (scanSource === 'barcode' && productInfo?.imageUrl) {
          console.log('[ResultsScreen] Barcode scan: Downloading product image for thumbnail from:', productInfo.imageUrl);
          const localUri = FileSystem.cacheDirectory + `temp_product_image_${Date.now()}.jpg`;
          await FileSystem.downloadAsync(productInfo.imageUrl, localUri);
          fileUriForUpload = localUri;
          console.log('[ResultsScreen] Product image downloaded to temporary URI:', fileUriForUpload);
        } else {
          console.log('[ResultsScreen] No valid image source found for thumbnail generation (imageUri or productInfo.imageUrl missing).');
          // No need to throw here, as we'll use the default placeholder if fileUriForUpload remains undefined.
        }

        if (fileUriForUpload) {
          console.log(`[ResultsScreen] Attempting to upload thumbnail with URI: ${fileUriForUpload}`);
          thumbnailUrl = await uploadThumbnail(fileUriForUpload);
          console.log(`[ResultsScreen] Thumbnail uploaded successfully, URL: ${thumbnailUrl}`);
        } else {
          console.log('[ResultsScreen] Skipping thumbnail upload as no valid fileUriForUpload was determined. Using placeholder.');
        }

      } catch (uploadError: any) {
        console.error(`[ResultsScreen] Error during thumbnail processing or upload. Attempted URI was: ${fileUriForUpload || 'not determined'}. Error message: ${uploadError.message}. Full error:`, uploadError);
        // thumbnailUrl already defaults to placeholder, no need to set it again unless specifically resetting after a failed attempt.
      }
      
      // Try direct SQL insertion to bypass schema cache issues
      try {
        // Double-check user authentication
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) {
          throw new Error('User not authenticated');
        }
        
        // Prepare meal data based on the expected parameters from the error message
        // The function expects: insert_meal(p_calories, p_carbs, p_fat, p_name, p_protein, p_thumbnail_url)
        const mealData = {
          p_name: result.name,
          p_calories: result.calories,
          p_protein: result.protein,
          p_carbs: result.carbs,
          p_fat: result.fat,
          p_thumbnail_url: thumbnailUrl,
        };
        
        console.log('Attempting to save meal with data:', mealData);
        
        // Try RPC call with the correct parameters
        const { data, error } = await supabase.rpc('insert_meal', mealData);
        
        if (error) {
          throw error;
        }
        
        console.log('Meal saved successfully:', data);
        
        // Provide success haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Show success message
        Alert.alert('Success', 'Meal saved successfully', [
          { text: 'OK', onPress: () => router.replace('/') }
        ]);
      } catch (insertError: any) {
        console.error('Error saving meal:', insertError);
        Alert.alert('Error', 'Failed to save meal: ' + (insertError.message || 'Unknown error'));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setIsSaving(false); // Ensure saving state is reset after the DB operation
      }
      // Redundant notification and navigation block removed
    } catch (err: any) {
      console.error('Error saving meal:', err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', `Failed to save meal: ${err?.message || 'Unknown error'}`);
      // Ensure isSaving is false if an error occurred before the inner finally block
      if (isSaving) {
          setIsSaving(false);
      }
    }
  };

  const handleCancel = () => {
    // If analysis is ongoing, don't interrupt
    if (isLoading || isSaving) return;
    router.replace('/(tabs)/camera');
  };

  return (
    <StyledView className="flex-1" style={{ backgroundColor: '#F8F9FA' }}>
      {/* Main content area */}
      <StyledView className="flex-1 pt-24">
        {/* Loading State - Uses FoodAnalysisCard's built-in loading UI */}
        {displayMode === 'loading' && isLoading && !error && (
          <FoodAnalysisCard isLoading={true} />
        )}

        {/* Error Display */}
        {displayMode === 'error' && error && (
          <StyledView className="items-center p-6">
            <Ionicons name="alert-circle-outline" size={60} color={palette.error} />
            <ThemedText type="subtitle" style={{ color: palette.error, marginTop: 10, textAlign: 'center' }}>
              {error}
            </ThemedText>
            <StyledTouchableOpacity
              className="mt-6 py-3 px-6 rounded-lg"
              style={{ backgroundColor: palette.primary }}
              onPress={handleBack}
            >
              <ThemedText type="defaultSemiBold" style={{ color: palette.surface }}>Go Back</ThemedText>
            </StyledTouchableOpacity>
          </StyledView>
        )}

        {/* Unified Results Display for both image analysis and barcode scan */}
        {displayMode === 'image' && !isLoading && result && !error && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
            {/* Show image if available (either from camera or product info) */}
            {(scanSource === 'image' && imageUri) && (
              <StyledImage
                source={{ uri: imageUri }}
                className="w-full h-60"
                resizeMode="cover"
              />
            )}
            {(scanSource === 'barcode' && productInfo?.imageUrl) && (
              <StyledImage
                source={{ uri: productInfo.imageUrl }}
                className="w-full h-60"
                resizeMode="contain"
              />
            )}
            
            {/* Food Analysis Card - works for both image analysis and barcode data */}
            <FoodAnalysisCard result={result} />
            
            {/* Action Buttons */}
            <StyledView className="flex-row justify-around mt-4 mb-6 px-4">
              <StyledTouchableOpacity
                className="py-3 px-8 rounded-lg"
                style={{ backgroundColor: palette.inactive }}
                onPress={handleBack}
              >
                <ThemedText type="defaultSemiBold" style={{ color: palette.surface }}>Back</ThemedText>
              </StyledTouchableOpacity>
              <StyledTouchableOpacity
                className="py-3 px-8 rounded-lg"
                style={{ backgroundColor: palette.primary }}
                onPress={handleSaveMeal}
              >
                <ThemedText type="defaultSemiBold" style={{ color: palette.surface }}>Save Meal</ThemedText>
              </StyledTouchableOpacity>
            </StyledView>
          </ScrollView>
        )}
      </StyledView>

      {/* Saving Meal Overlay */}
      {isSaving && (
        <StyledView style={styles.savingOverlay}>
          <ActivityIndicator size="large" color={palette.surface} />
          <StyledText style={styles.savingText}>Saving Meal...</StyledText>
        </StyledView>
      )}
    </StyledView>
  );
}
