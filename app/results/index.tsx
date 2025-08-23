import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { View, Text, TouchableOpacity, Alert, ScrollView, Image } from 'react-native'; // Added Image
import { useLocalSearchParams, useRouter } from 'expo-router';
import { analyzeFoodImage, FoodAnalysisResult } from '@/services/aiVisionService';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
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
import i18n, { isRTL } from '@/utils/i18n';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledImage = styled(Image); // For displaying the food image

// NUTRITION ICON AND COLOR MAPPING - Matches camera analysis
const getNutritionConfig = () => ({
  calories: {
    icon: 'fire' as const,
    iconLibrary: 'FontAwesome5' as const,
    color: palette.accent, // #1C1A23
    label: i18n.t('dashboard.calories'),
  },
  protein: {
    icon: 'food-drumstick' as const,
    iconLibrary: 'MaterialCommunityIcons' as const,
    color: palette.protein, // #E24D43
    label: i18n.t('dashboard.protein'),
  },
  carbs: {
    icon: 'barley' as const,
    iconLibrary: 'MaterialCommunityIcons' as const,
    color: palette.carbs, // #D1A46F
    label: i18n.t('dashboard.carbs'),
  },
  fats: {
    icon: 'tint' as const,
    iconLibrary: 'FontAwesome5' as const,
    color: palette.fats, // #F6C45F
    label: i18n.t('dashboard.fats'),
  },
});

const styles = StyleSheet.create({
  barcodeText: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  // Macro card styles matching camera analysis
  nutritionContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  nutritionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: palette.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  caloriesCard: {
    width: '100%',
    backgroundColor: palette.background,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    minHeight: 70,
    justifyContent: 'center',
    marginBottom: 10,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  caloriesIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.accent + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  macroRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  macroCard: {
    flex: 1,
    backgroundColor: palette.background,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    minHeight: 60,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  nutritionIcon: {
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.primary,
    marginBottom: 5,
  },
  nutritionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: palette.inactive,
    letterSpacing: 0.5,
  },
  nutritionValueSmall: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  nutritionUnitSmall: {
    fontSize: 12,
    fontWeight: '500',
    color: palette.inactive,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  // Button styles matching camera analysis
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: palette.inactive + '20',
  },
  button: {
    flex: 1,
    backgroundColor: palette.background,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    borderWidth: 1,
    borderColor: palette.inactive,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: palette.primary,
  },
  primaryButtonText: {
    color: palette.surface,
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
        Alert.alert(i18n.t('common.error'), i18n.t('common.noImageDataFound'), [{ text: i18n.t('common.ok'), onPress: () => router.replace('/(tabs)/camera') }]);
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
        i18n.t('common.analysisError'),
        i18n.t('common.problemAnalyzingImage'),
        [{ 
          text: i18n.t('common.ok'), 
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
      Alert.alert(i18n.t('common.error'), i18n.t('common.missingDataToSaveMeal'));
      return;
    }
    
    // For barcode scans, we might not have imageUri but could have productInfo.imageUrl
    const hasImageSource = !!imageUri || (scanSource === 'barcode' && productInfo?.imageUrl);    
    if (!hasImageSource) {
      console.log('No image source available for thumbnail');
      Alert.alert(i18n.t('common.warning'), i18n.t('common.noImageAvailableContinue'), [
        { text: i18n.t('common.cancel'), style: 'cancel' },
        { text: i18n.t('common.continue'), onPress: () => saveMealWithOrWithoutImage() }
      ]);
      return;
    }
    
    // If we have all required data, proceed with saving
    await saveMealWithOrWithoutImage();
  };
  
  const saveMealWithOrWithoutImage = async () => {
    // Safety check - ensure we have result and user
    if (!result || !user) {
      Alert.alert(i18n.t('common.error'), i18n.t('common.missingDataToSaveMeal'));
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
        Alert.alert(i18n.t('common.success'), i18n.t('common.mealSavedSuccessfully'), [
          { text: i18n.t('common.ok'), onPress: () => router.replace('/') }
        ]);
      } catch (insertError: any) {
        console.error('Error saving meal:', insertError);
        Alert.alert(i18n.t('common.error'), i18n.t('common.failedToSaveMeal') + ': ' + (insertError.message || i18n.t('common.unknownError')));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setIsSaving(false); // Ensure saving state is reset after the DB operation
      }
      // Redundant notification and navigation block removed
    } catch (err: any) {
      console.error('Error saving meal:', err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(i18n.t('common.error'), `${i18n.t('common.failedToSaveMeal')}: ${err?.message || i18n.t('common.unknownError')}`);
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
        {/* Loading State */}
        {displayMode === 'loading' && isLoading && !error && (
          <StyledView className="items-center p-6">
            <ActivityIndicator size="large" color={palette.primary} />
            <ThemedText type="subtitle" style={{ marginTop: 16, color: palette.primary }}>
              {scanSource === 'barcode' ? 'Looking up product information...' : 'Analyzing your food...'}
            </ThemedText>
          </StyledView>
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
            
            {/* Food Title */}
            <StyledView style={styles.nutritionContainer}>
              <ThemedText style={styles.nutritionTitle}>
                {result.name}
              </ThemedText>
              
              {/* Macro Cards - matches camera analysis design */}
              {(() => {
                const NUTRITION_CONFIG = getNutritionConfig();
                const isArabic = isRTL();
                const gramUnit = isArabic ? 'جم' : 'g';
                
                return (
                  <>
                    {/* Large Calories Card - Full Width */}
                    <View style={styles.caloriesCard}>
                      <View style={styles.caloriesIconCircle}>
                        <FontAwesome5 
                          name={NUTRITION_CONFIG.calories.icon} 
                          size={20} 
                          color={NUTRITION_CONFIG.calories.color}
                          style={styles.nutritionIcon}
                        />
                      </View>
                      <View style={{ alignItems: 'center' }}>
                        <ThemedText style={styles.nutritionValue}>
                          {result.calories}
                        </ThemedText>
                        <ThemedText style={styles.nutritionLabel}>{NUTRITION_CONFIG.calories.label}</ThemedText>
                      </View>
                    </View>
                    
                    {/* Macro Cards Row - Protein, Carbs, Fats */}
                    <View style={[styles.macroRow, isArabic && { flexDirection: 'row-reverse' }]}>
                      {/* Protein Card */}
                      <View style={styles.macroCard}>
                        <MaterialCommunityIcons 
                          name={NUTRITION_CONFIG.protein.icon} 
                          size={18} 
                          color={NUTRITION_CONFIG.protein.color}
                          style={styles.nutritionIcon}
                        />
                        <ThemedText style={styles.nutritionValueSmall}>
                          {Math.floor(result.protein)}{gramUnit}
                        </ThemedText>
                        <View style={{ height: 4 }} />
                        <ThemedText style={styles.nutritionUnitSmall}>{NUTRITION_CONFIG.protein.label}</ThemedText>
                      </View>
                      
                      {/* Carbs Card */}
                      <View style={styles.macroCard}>
                        <MaterialCommunityIcons 
                          name={NUTRITION_CONFIG.carbs.icon} 
                          size={18} 
                          color={NUTRITION_CONFIG.carbs.color}
                          style={styles.nutritionIcon}
                        />
                        <ThemedText style={styles.nutritionValueSmall}>
                          {Math.floor(result.carbs)}{gramUnit}
                        </ThemedText>
                        <View style={{ height: 4 }} />
                        <ThemedText style={styles.nutritionUnitSmall}>{NUTRITION_CONFIG.carbs.label}</ThemedText>
                      </View>
                      
                      {/* Fats Card */}
                      <View style={styles.macroCard}>
                        <FontAwesome5 
                          name={NUTRITION_CONFIG.fats.icon} 
                          size={18} 
                          color={NUTRITION_CONFIG.fats.color}
                          style={styles.nutritionIcon}
                        />
                        <ThemedText style={styles.nutritionValueSmall}>
                          {Math.floor(result.fat)}{gramUnit}
                        </ThemedText>
                        <View style={{ height: 4 }} />
                        <ThemedText style={styles.nutritionUnitSmall}>{NUTRITION_CONFIG.fats.label}</ThemedText>
                      </View>
                    </View>
                  </>
                );
              })()}
              
              {/* Serving Size / Description */}
              {result.description && (
                <ThemedText style={{ 
                  marginTop: 16, 
                  fontSize: 14, 
                  color: palette.inactive, 
                  textAlign: 'center',
                  paddingTop: 16,
                  borderTopWidth: 1,
                  borderTopColor: palette.inactive + '20'
                }}>
                  {result.description}
                </ThemedText>
              )}
            </StyledView>
            
            {/* Action Buttons - matching camera analysis style */}
            <StyledView style={[styles.buttonContainer, isRTL() && { flexDirection: 'row-reverse' }]}>
              <TouchableOpacity 
                style={styles.button}
                onPress={handleBack}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.buttonText}>{i18n.t('camera.cancel')}</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton]}
                onPress={handleSaveMeal}
                activeOpacity={0.7}
                disabled={isSaving}
              >
                <ThemedText style={[styles.buttonText, styles.primaryButtonText]}>
                  {isSaving ? i18n.t('camera.savingMeal') : i18n.t('camera.saveMeal')}
                </ThemedText>
              </TouchableOpacity>
            </StyledView>
          </ScrollView>
        )}
      </StyledView>


    </StyledView>
  );
}
