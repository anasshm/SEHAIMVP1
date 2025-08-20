import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert, ActivityIndicator, Platform, Dimensions, Image } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { CameraOverlay } from '@/src/components/camera/CameraOverlay';
import { CameraControls } from '@/src/components/camera/CameraControls';
import { AnalysisOverlay } from '@/components/camera/AnalysisOverlay';
import { ProgressManager } from '@/utils/progressManager';
import { analyzeFoodImage } from '@/services/aiVisionService';
import { saveMeal, uploadThumbnail } from '@/services/mealService';
import { useColorScheme } from '@/hooks/useColorScheme';
import i18n from '@/utils/i18n';

// Define styles for the camera screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  cameraPreviewContainer: {
    flex: 1,
    // paddingBottom will be applied inline via style prop
  },
  camera: {
    flex: 1,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
  },
  permissionButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  analyzingContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '80%',
  },
  analyzingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  guideToggleButton: {
    position: 'absolute',
    // top will be applied inline
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30, // Matched to flash button
    padding: 10, // Matched to flash button
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white', 
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20, 
  },
  processingText: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: '600',
    color: '#333', 
  },
  flashButtonTopLeft: {
    position: 'absolute',
    // top will be applied inline
    left: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 30,
  },
});

export default function CameraScreen() {
  const insets = useSafeAreaInsets();
  const commonTopMargin = 16;

  // Calculate heights for alignment
  const topButtonIconSize = 24;
  const topButtonPadding = 10;
  const topButtonHeight = topButtonIconSize + (2 * topButtonPadding); // 24 + 20 = 44

  const pillTextFontSize = 16;
  const pillTextLineHeight = pillTextFontSize * 1.2; // 19.2
  const pillVerticalPadding = 8;
  const estimatedPillHeight = pillTextLineHeight + (2 * pillVerticalPadding); // 19.2 + 16 = 35.2

  // Calculate 'top' positions for center alignment
  const actualButtonTop = insets.top + commonTopMargin;
  const buttonsCenterY = actualButtonTop + (topButtonHeight / 2); // e.g., insets.top + 16 + 22 = insets.top + 38
  const actualPillTop = buttonsCenterY - (estimatedPillHeight / 2); // e.g., insets.top + 38 - 17.6 = insets.top + 20.4

  // For clarity, let's rename finalIconAndPillTop if it was used elsewhere, or ensure its use is specific.
  // The buttons will use actualButtonTop for their 'top' style.
  // The pill will use actualPillTop for its 'pillOffsetTop' prop.
  const screenHeight = Dimensions.get('window').height;
  const nudgeAmount = screenHeight * 0.05; // 5% of screen height
  const controlsHeight = 111; // Approx height of CameraControls
  const router = useRouter();
  const cameraRef = useRef<CameraView | null>(null);
  const isFocused = useIsFocused(); 
  
  // Permission states
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState<boolean | null>(null);
  const [hasGalleryPermission, setHasGalleryPermission] = useState<boolean | null>(null);
  
  // Camera states
  const [flashMode, setFlashMode] = useState<'on' | 'off' | 'auto'>('off');
  const [isCapturing, setIsCapturing] = useState(false);
  
  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisTimeout, setAnalysisTimeout] = useState<NodeJS.Timeout | null>(null);

  // NEW: Analysis Overlay State Variables (Step 2)
  const [showAnalysisOverlay, setShowAnalysisOverlay] = useState(false);
  const [capturedImageUri, setCapturedImageUri] = useState<string>('');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState('');
  const [analysisResults, setAnalysisResults] = useState<{
    name?: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  } | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // NEW: Progress Manager (Step 4)
  const progressManagerRef = useRef<ProgressManager | null>(null);

  // Barcode scanning state
  const [isBarcodeScannerActive, setIsBarcodeScannerActive] = useState(false); // User toggles this
  
  // UI states
  const [isProcessing, setIsProcessing] = useState(false); // Added for consistency
  
  // Use the camera permissions hook
  const [permission, requestPermission] = useCameraPermissions();

  // Helper function to get the correct flash icon name
  const getFlashIconName = () => {
    switch (flashMode) {
      case 'on':
        return 'flash';
      case 'off':
        return 'flash-off';
      case 'auto':
      default:
        return 'flash-outline'; // Default to auto or a general flash icon
    }
  };
  
  
  // Request permissions on component mount
  useEffect(() => {
    (async () => {
      // Request camera permissions
      if (permission) {
        setHasCameraPermission(permission.granted);
      } else {
        const cameraStatus = await requestPermission(); // Use requestPermission from useCameraPermissions
        setHasCameraPermission(cameraStatus.granted);
      }
      
      // Request media library permissions
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
      setHasMediaLibraryPermission(mediaLibraryPermission.status === 'granted');
      
      // Request image picker permissions
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasGalleryPermission(galleryStatus.status === 'granted');
    })();
  }, [permission]); // Added permission to dependency array

  // Handle barcode scanned
  const handleBarcodeScanned = (scanningResult: BarcodeScanningResult) => {
    if (!isBarcodeScannerActive || isAnalyzing || isCapturing) return; // Ignore if scanner is not active or other operations are in progress

    setIsBarcodeScannerActive(false); // Immediately deactivate to prevent re-scanning the same code

    console.log('Barcode Scanned:', scanningResult);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    router.push({
      pathname: '/results',
      params: { 
        barcodeType: scanningResult.type, 
        barcodeData: scanningResult.data,
        scanSource: 'barcode' // To differentiate from image analysis
      },
    });
    // setIsBarcodeScannerActive(false); // Controlled by toggle button now
  };
  
  // Navigate back to dashboard
  const navigateToDashboard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/index');
  };

  // Toggle barcode scanner active state
  const toggleBarcodeScanning = () => {
    setIsBarcodeScannerActive(prev => !prev);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  
  // Take a picture with the camera and analyze it immediately
  const handleTakePicture = async () => {
    if (!cameraRef.current || isCapturing || isAnalyzing) {
      console.log('Camera not ready or already capturing/analyzing.');
      return;
    }

    setIsCapturing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8, // Adjusted for potentially faster processing
        exif: true, // Keep exif for potential future use
        // base64: true, // Consider removing if not strictly needed for performance
      });

      if (photo && photo.uri) {
        try {
          const directory = FileSystem.cacheDirectory + 'foodsnap_temp_originals/';
          await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
          const fileName = `photo_${Date.now()}.jpg`;
          const newPersistentUri = directory + fileName;
          await FileSystem.copyAsync({ from: photo.uri, to: newPersistentUri });
          console.log('Photo copied to persistent URI for processing:', newPersistentUri);
          // Call processAndAnalyzeImage with the new persistent URI
          await processAndAnalyzeImage({
            uri: newPersistentUri,
            width: photo.width,
            height: photo.height,
            exif: photo.exif,
            base64: photo.base64,
          });
        } catch (e) {
          console.error("Error copying captured photo for processing:", e);
          Alert.alert(i18n.t('camera.imageProcessingError'), i18n.t('camera.couldNotPrepareImage'));
          setIsCapturing(false); // Reset capturing state on error
        }
      } else {
        Alert.alert(i18n.t('camera.captureError'), i18n.t('camera.captureFailed'));
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert(i18n.t('camera.error'), i18n.t('camera.errorTakingPicture'));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsCapturing(false);
    }
  };

  // Handle opening the gallery
  const handleGalleryOpen = async () => {
    try {
      // Check if we have permission
      if (!hasGalleryPermission) {
        const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!galleryStatus.granted) {
          Alert.alert(i18n.t('camera.permissionRequired'), i18n.t('camera.galleryPermissionNeeded'));
          return;
        }
        setHasGalleryPermission(galleryStatus.status === 'granted');
      }
      
      // Launch image picker without forcing cropping
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, 
        quality: 0.9,
        allowsMultipleSelection: false,
        exif: true, 
      });
      
      // Handle result
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        try {
          const directory = FileSystem.cacheDirectory + 'foodsnap_temp_originals/';
          await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
          const fileExtension = selectedImage.uri.split('.').pop() || 'jpg';
          const fileName = `gallery_${Date.now()}.${fileExtension}`;
          const newPersistentUri = directory + fileName;
          await FileSystem.copyAsync({ from: selectedImage.uri, to: newPersistentUri });
          console.log('Gallery image copied to persistent URI for processing:', newPersistentUri);
          // Call processAndAnalyzeImage with the new persistent URI
          await processAndAnalyzeImage({
            uri: newPersistentUri,
            width: selectedImage.width,
            height: selectedImage.height,
            exif: selectedImage.exif, // Pass exif if available
            base64: selectedImage.base64 ?? undefined
          });
        } catch (e) {
          console.error("Error copying gallery image for processing:", e);
          Alert.alert(i18n.t('camera.imageProcessingError'), i18n.t('camera.couldNotPrepareSelected'));
        }
      }
    } catch (error) {
      console.error('Error opening gallery:', error);
      Alert.alert(i18n.t('camera.error'), i18n.t('camera.failedToOpenGallery'));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };
  
  // Toggle flash mode
  const toggleFlashMode = () => {
    setFlashMode(prevMode => {
      if (prevMode === 'off') return 'on';
      if (prevMode === 'on') return 'auto';
      return 'off'; // 'auto' -> 'off'
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Camera action handlers
  
  // Take a picture with the camera and analyze it immediately
  const takePicture = async () => {
    if (!cameraRef.current) return;
    
    try {
      setIsCapturing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Use lower quality and disable base64 encoding for faster capture
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: false,
        exif: false,
        skipProcessing: true
      });
      
      setIsCapturing(false);
      
      // Provide haptic feedback for photo capture
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Process and analyze the image immediately instead of showing preview
      if (photo && photo.uri) {
        try {
          const directory = FileSystem.cacheDirectory + 'foodsnap_temp_originals/';
          await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
          const fileName = `photo_${Date.now()}.jpg`;
          const newPersistentUri = directory + fileName;
          await FileSystem.copyAsync({ from: photo.uri, to: newPersistentUri });
          console.log('Photo copied to persistent URI for processing:', newPersistentUri);
          // Call processAndAnalyzeImage with the new persistent URI
          await processAndAnalyzeImage({
            uri: newPersistentUri,
            width: photo.width,
            height: photo.height,
            exif: photo.exif, // Pass exif if available
            base64: photo.base64 ?? undefined
          });
        } catch (e) {
          console.error("Error copying captured photo for processing:", e);
          Alert.alert(i18n.t('camera.imageProcessingError'), i18n.t('camera.couldNotPrepareImage'));
        }
      } else {
        Alert.alert(i18n.t('camera.captureError'), i18n.t('camera.captureFailed'));
      }
      
    } catch (error) {
      console.error('Error taking picture:', error);
      setIsCapturing(false);
      Alert.alert(i18n.t('camera.error'), i18n.t('camera.failedToTakePicture'));
    }
  };
  
  // Cancel analysis and reset the camera
  const handleCancelAnalysis = () => {
    // Clear any existing timeout
    if (analysisTimeout) {
      clearTimeout(analysisTimeout);
      setAnalysisTimeout(null);
    }
    
    // Reset analyzing state
    setIsAnalyzing(false);
    
    // Provide haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Process and analyze image in one step
  const processAndAnalyzeImage = async (photo: {
    uri: string;
    width: number;
    height: number;
    exif?: any;
    base64?: string;
  }) => {
    try {
      setIsAnalyzing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (!photo || !photo.uri) {
        setIsAnalyzing(false);
        setIsCapturing(false);
        Alert.alert(i18n.t('camera.captureError'), i18n.t('camera.failedToCaptureImage'));
        return;
      }

      // 1. Copy the original photo to a persistent location
      let newUri: string;
      try {
        const directory = FileSystem.cacheDirectory + 'foodsnap_temp_originals/';
        await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
        
        const filename = `original_${Date.now()}.jpg`;
        newUri = directory + filename;
        
        await FileSystem.copyAsync({
          from: photo.uri,
          to: newUri,
        });
        
        console.log('Original photo saved to:', newUri);
      } catch (copyError) {
        console.error('Error copying photo:', copyError);
        setIsAnalyzing(false);
        setIsCapturing(false);
        Alert.alert(i18n.t('camera.saveError'), i18n.t('camera.failedToSaveImage'));
        return;
      }

      // 2. Show the analysis overlay with the captured image
      setCapturedImageUri(newUri);
      setShowAnalysisOverlay(true);
      setIsCapturing(false);

      // 3. Start the progress manager
      const progressManager = new ProgressManager({
        onProgressUpdate: (progress, stage) => {
          setAnalysisProgress(progress);
          setAnalysisStage(stage);
        },
        onStageComplete: (stageId) => {
          console.log(`Stage completed: ${stageId}`);
        },
        onAllComplete: () => {
          console.log('All progress stages completed');
          // Progress is complete, but we might still be waiting for AI results
          // The AI results will be handled separately
        }
      });

      progressManagerRef.current = progressManager;
      progressManager.start();

      // 4. Start AI analysis in parallel with progress
      let aiResults = null;
      try {
        console.log('Starting AI analysis...');
        aiResults = await analyzeFoodImage(newUri);
        console.log('AI analysis completed:', aiResults);
      } catch (aiError) {
        console.error('AI analysis failed:', aiError);
        // Continue with default results if AI fails
        aiResults = {
          name: "Analysis Error",
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          description: "Failed to analyze the image. Please try again."
        };
      }

      // 5. Wait for progress to reach at least 90% before showing results
      const waitForProgress = () => {
        return new Promise<void>((resolve) => {
          const checkProgress = () => {
            if (progressManager.getCurrentProgress() >= 90) {
              resolve();
            } else {
              setTimeout(checkProgress, 100);
            }
          };
          checkProgress();
        });
      };

      await waitForProgress();

      // 6. Set the results and show them
      setAnalysisResults(aiResults);
      setShowResults(true);
      setAnalysisProgress(100);
      setAnalysisStage(i18n.t('camera.analysisComplete'));
      setIsAnalyzing(false);

      console.log('Analysis complete with results:', aiResults);

    } catch (error) {
      console.error('Error in processAndAnalyzeImage:', error);
      setIsAnalyzing(false);
      setIsCapturing(false);
      setShowAnalysisOverlay(false);
      
      Alert.alert(
        i18n.t('camera.analysisError'),
        i18n.t('camera.failedToAnalyze'),
        [{ text: 'OK' }]
      );
    }
  };

  // NEW: Analysis Overlay Handler Functions (Step 2)
  const handleOverlayClose = () => {
    // Stop progress manager
    if (progressManagerRef.current) {
      progressManagerRef.current.stop();
    }
    
    // Reset all analysis states
    setShowAnalysisOverlay(false);
    setShowResults(false);
    setCapturedImageUri('');
    setAnalysisProgress(0);
    setAnalysisStage('');
    setAnalysisResults(null);
    setIsAnalyzing(false);
    setIsSaving(false);
    
    // Clear any existing timeout
    if (analysisTimeout) {
      clearTimeout(analysisTimeout);
      setAnalysisTimeout(null);
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleOverlaySave = async () => {
    if (!analysisResults || !capturedImageUri) {
      Alert.alert(i18n.t('camera.error'), i18n.t('camera.noResultsToSave'));
      return;
    }
    
    try {
      // Show loading state
      setIsSaving(true);
      setIsAnalyzing(true);
      setAnalysisStage(i18n.t('camera.savingMeal'));
      
      console.log('Starting meal save process...');
      console.log('Analysis results:', analysisResults);
      console.log('Image URI:', capturedImageUri);
      
      // 1. Upload the thumbnail first
      let thumbnailUrl = '';
      try {
        console.log('Uploading thumbnail...');
        thumbnailUrl = await uploadThumbnail(capturedImageUri);
        console.log('Thumbnail uploaded successfully:', thumbnailUrl);
      } catch (uploadError) {
        console.error('Thumbnail upload failed:', uploadError);
        // Continue without thumbnail - we can still save the meal
        console.log('Continuing without thumbnail...');
      }
      
      // 2. Prepare meal data
      const mealData = {
        name: analysisResults.name || 'Unknown Food',
        image_url: thumbnailUrl || undefined,
        meal_time: new Date().toISOString(),
        calories: analysisResults.calories || 0,
        protein: analysisResults.protein || 0,
        carbs: analysisResults.carbs || 0,
        fat: analysisResults.fat || 0,
      };
      
      console.log('Saving meal data:', mealData);
      
      // 3. Save the meal to database
      const savedMeal = await saveMeal(mealData);
      console.log('Meal saved successfully:', savedMeal);
      
      // 4. Success feedback and navigation
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Reset overlay state
      handleOverlayClose();
      
      // Navigate to dashboard with refresh timestamp
      router.push({
        pathname: '/',
        params: { refreshTimestamp: Date.now().toString() }
      });
      
    } catch (error) {
      console.error('Error saving meal:', error);
      setIsSaving(false);
      setIsAnalyzing(false);
      setAnalysisStage(i18n.t('camera.analysisComplete'));
      
      Alert.alert(
        i18n.t('camera.saveFailed'),
        i18n.t('camera.failedToSaveMeal'),
        [{ text: 'OK' }]
      );
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleOverlayDiscard = () => {
    // Show confirmation dialog
    Alert.alert(
      i18n.t('camera.discardAnalysis'),
      i18n.t('camera.discardConfirmation'),
      [
        {
          text: i18n.t('camera.cancel'),
          style: 'cancel',
        },
        {
          text: i18n.t('camera.discard'),
          style: 'destructive',
          onPress: () => {
            handleOverlayClose();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            
            // Navigate to dashboard after discarding
            router.push('/');
          },
        },
      ]
    );
  };
  
  // NEW: Progress Manager Callbacks (Step 4)
  const createProgressManager = () => {
    return new ProgressManager({
      onProgressUpdate: (progress: number, stage: string) => {
        setAnalysisProgress(progress);
        setAnalysisStage(stage);
      },
      onStageComplete: (stageId: string) => {
        console.log(`Stage completed: ${stageId}`);
        // Could add stage-specific logic here if needed
      },
      onAllComplete: () => {
        // This will be called when all stages reach 99%
        // We'll complete it manually when AI analysis finishes
        console.log('All progress stages completed, waiting for AI results...');
      },
    });
  };

  // Render loading state while permissions are being checked
  if (hasCameraPermission === null) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <ThemedText style={styles.permissionText}>{i18n.t('camera.requestingPermissions')}</ThemedText>
      </ThemedView>
    );
  }
  
  // Render permission request if camera permission is not granted
  if (hasCameraPermission === false) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.permissionText}>
          {i18n.t('camera.cameraPermissionNeeded')}
        </ThemedText>
        <TouchableOpacity 
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <ThemedText style={styles.permissionButtonText}>{i18n.t('camera.grantPermission')}</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }
  // Render camera view
  return (
    <ThemedView style={styles.container}>
      {/* Camera interface, only if permission is granted, focused, AND not analyzing */}
      {isFocused && !showAnalysisOverlay ? (
        <>
          {/* Container for CameraView and its overlaying controls */}
          <View style={[styles.cameraPreviewContainer, { paddingBottom: insets.bottom + controlsHeight + nudgeAmount }]}>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="back"
              flash={flashMode}
              barcodeScannerSettings={{
                barcodeTypes: ["qr", "ean13", "ean8", "upc_a", "upc_e", "code39", "code128", "pdf417", "aztec"],
              }}
              onBarcodeScanned={isBarcodeScannerActive ? handleBarcodeScanned : undefined}
            >
              <CameraOverlay
                showGuide={true}
                isPillBarcodeMode={isBarcodeScannerActive}
                isBarcodeModeActive={isBarcodeScannerActive}
                pillOffsetTop={actualPillTop}
              />
            </CameraView>

            {/* Absolutely positioned UI elements, siblings to CameraView, will overlay it */}
            <TouchableOpacity style={[styles.flashButtonTopLeft, { top: actualButtonTop }]} onPress={toggleFlashMode} disabled={isCapturing}>
              <Ionicons name={getFlashIconName()} size={topButtonIconSize} color="white" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.guideToggleButton, { top: actualButtonTop }]} onPress={navigateToDashboard} disabled={isCapturing}>
              <Ionicons name="close" size={topButtonIconSize} color="white" />
            </TouchableOpacity>
          </View>
          
          {/* CameraControls are typically at the bottom, outside the preview container but within the main focused view */}
          {!isProcessing && !isCapturing && (
            <CameraControls
              onCapture={handleTakePicture}
              onGalleryOpen={handleGalleryOpen}
              isCapturing={isCapturing}
              onToggleBarcodeScan={toggleBarcodeScanning}
              isBarcodeScanningActive={isBarcodeScannerActive}
            />
          )}
        </>
      ) : isFocused ? (
        // Show captured image as background when analysis overlay is visible (seamless experience)
        <View style={styles.camera}>
          {capturedImageUri && (
            <Image 
              source={{ uri: capturedImageUri }}
              style={styles.camera}
              resizeMode="cover"
            />
          )}
        </View>
      ) : (
        // Placeholder when not focused
        <View style={styles.camera} />
      )}

      {/* Analysis Overlay - shows captured image when visible */}
      <AnalysisOverlay
        visible={showAnalysisOverlay}
        capturedImageUri={capturedImageUri}
        analysisProgress={analysisProgress}
        analysisStage={analysisStage}
        analysisResults={analysisResults}
        showResults={showResults}
        isSaving={isSaving}
        onClose={handleOverlayClose}
        onSave={handleOverlaySave}
        onDiscard={handleOverlayDiscard}
      />
    </ThemedView>
  );
}
