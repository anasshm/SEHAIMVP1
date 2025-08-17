import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Dimensions, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { AnalysisProgress } from '@/components/camera/AnalysisProgress';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { palette } from '@/constants/Colors';
import { TitleSkeleton, NutritionCardSkeleton, DescriptionSkeleton } from '../skeleton';
import i18n from '@/utils/i18n';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// STEP 1: Layout Constants - Define 40/60 screen split with responsive adjustments
const SCREEN_SPLIT = {
  // Image section takes 40% of screen height
  imageSection: {
    heightPercentage: 0.4,
    height: screenHeight * 0.4,
    // STEP 6: Dynamic island safe area adjustments
    dynamicIslandSafeArea: 44, // Space for dynamic island on newer devices
  },
  // Results section takes 60% of screen height  
  resultsSection: {
    heightPercentage: 0.6,
    height: screenHeight * 0.6,
    // Account for padding and safe areas
    contentHeight: screenHeight * 0.6 - 40, // 20px top + 20px bottom padding
  },
  // Screen dimensions for reference with responsive breakpoints
  screen: {
    width: screenWidth,
    height: screenHeight,
    // STEP 6: Responsive breakpoints
    isSmallScreen: screenHeight < 700, // iPhone SE, smaller devices
    isLargeScreen: screenHeight > 900, // iPhone Pro Max, large devices
  },
};

// NUTRITION ICON AND COLOR MAPPING - Matches RecentMealCard.tsx
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

// STEP 4: Linked Layout System - Centralized positioning and sizing management
// All measurements come from results state and are automatically synchronized

// Layout Calculator - Computes all positions and sizes from results state
const calculateLayout = (screenDimensions: { width: number; height: number }, safeAreaBottom: number = 0) => {
  const { width: screenWidth, height: screenHeight } = screenDimensions;
  
  // STEP 6: Responsive layout adjustments
  const isSmallScreen = SCREEN_SPLIT.screen.isSmallScreen;
  const isLargeScreen = SCREEN_SPLIT.screen.isLargeScreen;
  
  // STEP 2: Safe Area Considerations - Ensure buttons never go below safe zone
  const safeAreaBottomPadding = Math.max(safeAreaBottom, 16); // Minimum 16px padding
  const buttonContainerHeight = isSmallScreen ? 70 : 80; // Fixed height including padding
  
  // STEP 2: Updated Layout - Use 40/60 split for optimal space usage with safe area
  const baseLayout = {
    image: {
      // Image FULLY fills the 40% section - no empty space
      width: screenWidth, // Full width of screen
      height: SCREEN_SPLIT.imageSection.height, // Full height of 40% section
      borderRadius: 0, // No border radius for full expansion
      maxHeight: SCREEN_SPLIT.imageSection.height, // Matches section height exactly
    },
    card: {
      padding: 0, // No padding - fill entire 60% section
      borderRadius: 20, // Rounded corners for better UI at the split line
      // Results section fills entire 60% section minus safe area
      maxHeight: SCREEN_SPLIT.resultsSection.height - safeAreaBottomPadding,
    },
    buttons: {
      height: isSmallScreen ? 46 : 50, // Smaller buttons on small screens
      paddingVertical: isSmallScreen ? 12 : 14,
      paddingHorizontal: isSmallScreen ? 16 : 20,
      borderRadius: 12,
      gap: 12,
      containerHeight: buttonContainerHeight, // Total container height including padding
      safeAreaBottom: safeAreaBottomPadding, // Safe area bottom padding
    },
    nutrition: {
      itemPadding: isSmallScreen ? 8 : 10, // More compact padding for smaller cards
      itemBorderRadius: 12,
      gridGap: isSmallScreen ? 6 : 8, // Tighter spacing between cards
      // Large Calories card (full width)
      caloriesCard: {
        minHeight: isSmallScreen ? 60 : 70, // Compact height for calories
        padding: isSmallScreen ? 12 : 14,
        marginBottom: isSmallScreen ? 8 : 10,
      },
      // Smaller macro cards (protein, carbs, fat - 1/3 width each)
      macroCard: {
        minHeight: isSmallScreen ? 50 : 60, // More compact than calories
        padding: isSmallScreen ? 8 : 10,
      },
      // Icon sizing
      iconSize: {
        calories: isSmallScreen ? 18 : 20, // Slightly larger for calories
        macro: isSmallScreen ? 16 : 18, // Smaller for macro nutrients
      },
    },
    // STEP 2: New description constraints to prevent button displacement
    description: {
      maxHeight: isSmallScreen ? 120 : 150, // Maximum height to prevent overflow
      collapsedLines: 2, // Number of lines when collapsed
      expandedMaxHeight: isSmallScreen ? 100 : 120, // Max height when expanded
    },
  };
  
  // Calculated spacing optimized for split layout and screen size
  const spacing = {
    imageToCard: 0, // No spacing between sections - they touch directly
    titleBottom: isSmallScreen ? 12 : 16,
    nutritionGridBottom: isSmallScreen ? 12 : 16, // Reduced from 16/20 to make room for description
    sectionPadding: isSmallScreen ? 16 : 20, // Only used inside results section
    descriptionBottom: isSmallScreen ? 8 : 12, // NEW: Spacing for description section
    // STEP 6: Dynamic island handling
    dynamicIslandTop: 0, // No top padding - image fills from very top
    // STEP 2: Safe area spacing
    safeAreaBottom: safeAreaBottomPadding,
  };
  
  // Computed layout positions for 40/60 split
  const positions = {
    // Image section (40% of screen) - FILLS COMPLETELY
    imageSection: {
      height: SCREEN_SPLIT.imageSection.height,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      paddingHorizontal: 0, // No horizontal padding - full width
      paddingTop: 0, // No top padding - starts from very top
      paddingBottom: 0, // No bottom padding - touches results section
    },
    imageContainer: {
      width: screenWidth, // Full screen width
      height: SCREEN_SPLIT.imageSection.height, // Full 40% height
      marginBottom: 0, // No margin needed
    },
    // Results section (60% of screen) - FILLS COMPLETELY with safe area consideration
    resultsSection: {
      height: SCREEN_SPLIT.resultsSection.height,
      paddingHorizontal: 0, // No horizontal padding - full width
      paddingVertical: 0, // No vertical padding - full height
      justifyContent: 'flex-start' as const,
      // STEP 2: Reserve space for fixed button container
      paddingBottom: buttonContainerHeight + safeAreaBottomPadding,
    },
    contentContainer: {
      flex: 1, // Take available space above button container
      width: '100%' as const,
    },
    resultsCard: {
      padding: spacing.sectionPadding, // Internal padding only
      width: '100%' as const,
      flex: 1, // Fill available space above buttons
    },
    title: {
      marginBottom: spacing.titleBottom,
    },
    nutritionGrid: {
      flex: 0, // Only take needed space for nutrition cards
      width: '100%' as const,
      paddingVertical: isSmallScreen ? 12 : 16, // Slightly reduced breathing room
      justifyContent: 'flex-start' as const, // Changed from space-evenly for new layout
      alignItems: 'center' as const,
      marginBottom: spacing.nutritionGridBottom, // Use calculated spacing
    },
    nutritionItem: {
      width: '47%' as const,
      padding: baseLayout.nutrition.itemPadding,
      marginBottom: baseLayout.nutrition.gridGap,
      minHeight: baseLayout.nutrition.caloriesCard.minHeight,
    },
    // STEP 3: Fixed button container positioning with safe area
    buttonContainer: {
      position: 'absolute' as const,
      bottom: safeAreaBottomPadding, // Fixed distance from screen bottom
      left: spacing.sectionPadding,
      right: spacing.sectionPadding,
      height: buttonContainerHeight,
      gap: baseLayout.buttons.gap,
    },
    button: {
      paddingVertical: baseLayout.buttons.paddingVertical,
      paddingHorizontal: baseLayout.buttons.paddingHorizontal,
    },
  };
  
  return {
    base: baseLayout,
    spacing,
    positions,
    // Split layout references
    split: SCREEN_SPLIT,
    // STEP 6: Responsive flags
    responsive: {
      isSmallScreen,
      isLargeScreen,
    },
    // STEP 2: Safe area information
    safeArea: {
      bottom: safeAreaBottomPadding,
      buttonContainerHeight,
    },
    // Computed totals for validation
    computed: {
      totalUsedHeight: 
        SCREEN_SPLIT.imageSection.height + 
        SCREEN_SPLIT.resultsSection.height,
      imageAspectRatio: positions.imageContainer.width / positions.imageContainer.height,
      resultsContentHeight: 
        spacing.titleBottom + 
        spacing.nutritionGridBottom + 
        spacing.descriptionBottom + // Include description spacing
        buttonContainerHeight + safeAreaBottomPadding, // Include fixed button space
      // NEW: Nutrition section height estimation for responsive layout
      nutritionSectionHeight:
        baseLayout.nutrition.caloriesCard.minHeight +
        baseLayout.nutrition.caloriesCard.marginBottom +
        baseLayout.nutrition.macroCard.minHeight,
      // STEP 2: Available space for scrollable content
      availableContentHeight: SCREEN_SPLIT.resultsSection.height - buttonContainerHeight - safeAreaBottomPadding - (spacing.sectionPadding * 2),
    },
  };
};

// Layout Manager - Single source of truth for all layout calculations
const LAYOUT = calculateLayout({ width: screenWidth, height: screenHeight });

// Linked Style System - All styles reference the same calculated layout
const createLinkedStyles = (layout: ReturnType<typeof calculateLayout>) => ({
  // Image container - FULLY EXPANDED to fill 40% section
  imageContainer: {
    width: layout.positions.imageContainer.width, // Full screen width
    height: layout.positions.imageContainer.height + layout.base.card.borderRadius, // Full 40% height + bleed
    borderRadius: layout.base.image.borderRadius, // No border radius
    overflow: 'hidden' as const,
    marginBottom: layout.positions.imageContainer.marginBottom,
    // Remove shadows since we're full screen
  },
  
  // STEP 4: Results Card - FULLY EXPANDED to fill 60% section
  resultsCard: {
    backgroundColor: palette.surface,
    borderTopLeftRadius: layout.base.card.borderRadius, // Rounded corners only at top
    borderTopRightRadius: layout.base.card.borderRadius, // Rounded corners only at top
    padding: layout.positions.resultsCard.padding, // Internal padding only
    width: layout.positions.resultsCard.width,
    flex: 1, // Fill the entire results section above buttons
    // STEP 5: Use flex column layout for controlled sections
    flexDirection: 'column' as const,
    justifyContent: 'flex-start' as const, // Start from top for better control
    // Remove shadows since we're full screen
  },
  
  // STEP 5: Fixed Top Section (Title + Nutrition) - Never scrolls
  fixedTopSection: {
    flex: 0, // Fixed size, never grows
    width: '100%' as const,
  },
  
  // Title section - compact but prominent
  titleSection: {
    width: '100%' as const,
    alignItems: 'center' as const,
    marginBottom: layout.positions.title.marginBottom,
    paddingBottom: 8, // Small separator
    borderBottomWidth: 1,
    borderBottomColor: palette.inactive + '20', // Subtle divider
  },
  
  // STEP 4: Enhanced Nutrition Grid - Better spacing and layout
  nutritionGrid: {
    flex: 0, // Only take needed space for nutrition cards
    width: '100%' as const,
    paddingVertical: layout.responsive.isSmallScreen ? 12 : 16, // Slightly reduced breathing room
    justifyContent: 'flex-start' as const, // Changed from space-evenly for new layout
    alignItems: 'center' as const,
    marginBottom: layout.positions.nutritionGrid.marginBottom, // Use calculated spacing
  },
  
  // STEP 5: Flexible Middle Section (Description) - Can scroll if needed
  flexibleMiddleSection: {
    flex: 1, // Takes remaining space between top section and buttons
    width: '100%' as const,
    // STEP 4: Constrain height to prevent button displacement
    maxHeight: layout.computed.availableContentHeight - layout.computed.nutritionSectionHeight - 60, // Reserve space for title and spacing
    minHeight: 80, // Minimum height for description area
  },
  
  // STEP 4: Scrollable description container
  scrollableDescriptionContainer: {
    flex: 1,
    width: '100%' as const,
  },
  
  // NEW: Large Calories Card - Full width, prominent display
  caloriesCard: {
    width: '100%' as const,
    backgroundColor: palette.background,
    borderRadius: layout.base.nutrition.itemBorderRadius,
    padding: layout.base.nutrition.caloriesCard.padding,
    alignItems: 'center' as const,
    minHeight: layout.base.nutrition.caloriesCard.minHeight,
    justifyContent: 'center' as const,
    marginBottom: layout.base.nutrition.caloriesCard.marginBottom,
    flexDirection: 'row' as const, // Icon and text in row
    paddingHorizontal: 0, // Remove horizontal padding for full width
    // Enhanced shadows for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // NEW: Faint circle background for calories icon
  caloriesIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.accent + '10', // Very faint accent color
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 16, // Space between icon circle and text
  },
  
  // NEW: Container for the 3 macro cards row
  macroRow: {
    flexDirection: 'row' as const,
    width: '100%' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    gap: 12, // 12pt gap between macro cards
  },
  
  // NEW: Smaller macro cards for protein, carbs, fat
  macroCard: {
    flex: 1, // Equal width for all macro cards
    backgroundColor: palette.background,
    borderRadius: layout.base.nutrition.itemBorderRadius,
    padding: layout.base.nutrition.macroCard.padding,
    alignItems: 'center' as const,
    minHeight: layout.base.nutrition.macroCard.minHeight,
    justifyContent: 'center' as const,
    // Enhanced shadows for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // NEW: Icon styling for nutrition cards
  nutritionIcon: {
    marginBottom: 4, // Small gap between icon and value
  },
  
  // STEP 3: Fixed Button Container - Absolute positioning with safe area
  buttonContainer: {
    position: layout.positions.buttonContainer.position,
    bottom: layout.positions.buttonContainer.bottom,
    left: layout.positions.buttonContainer.left,
    right: layout.positions.buttonContainer.right,
    height: layout.positions.buttonContainer.height,
    flexDirection: 'row' as const,
    gap: layout.positions.buttonContainer.gap,
    paddingTop: 16, // Separator from content
    backgroundColor: palette.surface, // Ensure background covers content below
    borderTopWidth: 1,
    borderTopColor: palette.inactive + '20', // Subtle top border
  },
  
  // Enhanced buttons with better proportions
  button: {
    flex: 1,
    backgroundColor: palette.background,
    borderRadius: layout.base.buttons.borderRadius,
    paddingVertical: 16, // Slightly larger touch target
    paddingHorizontal: layout.positions.button.paddingHorizontal,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 52, // Consistent button height
    borderWidth: 1,
    borderColor: palette.inactive,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  // Primary button - enhanced styling
  primaryButton: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  
  // STEP 4 & 5: Collapsible description drawer with proper constraints
  descriptionDrawer: {
    width: '100%' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: palette.inactive + '20', // Subtle top border
    // STEP 4: Allow content to grow naturally within ScrollView
  },
  
  // STEP 4: Scrollable description content
  descriptionScrollContent: {
    flexGrow: 1, // Allow content to grow and be scrollable
    paddingBottom: 60, // Increased padding to ensure Show less button is always visible
  },
  
  descriptionToggleButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    // Ensure toggle button stays at bottom of description area
    marginBottom: 0,
  },
  
  descriptionTextCollapsed: {
    fontSize: screenHeight < 700 ? 14 : 15,
    fontWeight: '400',
    color: palette.inactive,
    textAlign: 'center' as const,
    lineHeight: screenHeight < 700 ? 20 : 22,
  },
  
  descriptionTextExpanded: {
    fontSize: screenHeight < 700 ? 14 : 15,
    fontWeight: '400',
    color: palette.inactive,
    textAlign: 'center' as const,
    lineHeight: screenHeight < 700 ? 20 : 22,
    // No line limit when expanded
  },
  
  descriptionToggleText: {
    fontSize: screenHeight < 700 ? 12 : 13,
    fontWeight: '500',
    color: palette.primary,
    marginRight: 4,
  },
  
  // STEP 1: New inline layout styles for "Show less" button
  descriptionTextWithInlineButtonContainer: {
    width: '100%' as const,
    alignItems: 'flex-start' as const,
  },
  
  // STEP 5: Text Container Restructuring - Wrapper for expanded state
  descriptionExpandedWrapper: {
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
    justifyContent: 'space-between' as const,
    width: '100%' as const,
    flexWrap: 'wrap' as const,
  },
  
  // STEP 4 & 6: Enhanced Inline Toggle Button Style  
  descriptionToggleButtonInline: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 8,
    marginLeft: 8,
    borderRadius: 12,
    backgroundColor: palette.background,
    borderWidth: 1,
    borderColor: palette.primary + '20',
  },
  
  // STEP 6: Inline toggle text style
  descriptionToggleTextInline: {
    fontSize: screenHeight < 700 ? 12 : 13,
    fontWeight: '500',
    color: palette.primary,
    marginRight: 4,
  },
});

interface AnalysisOverlayProps {
  visible: boolean;
  capturedImageUri?: string;
  analysisProgress: number; // 0-100
  analysisStage: string;
  analysisResults?: {
    name?: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    description?: string;
  } | null;
  showResults: boolean;
  isSaving?: boolean;
  onClose?: () => void;
  onSave?: () => void;
  onDiscard?: () => void;
}

export function AnalysisOverlay({
  visible,
  capturedImageUri,
  analysisProgress,
  analysisStage,
  analysisResults,
  showResults,
  isSaving,
  onClose,
  onSave,
  onDiscard,
}: AnalysisOverlayProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = React.useState(false);
  
  // STEP 1: Get safe area insets for proper button positioning
  const insets = useSafeAreaInsets();
  
  // RESET DESCRIPTION STATE: Reset description expansion when overlay becomes invisible
  React.useEffect(() => {
    if (!visible) {
      setIsDescriptionExpanded(false);
    }
  }, [visible]);
  
  // RESET DESCRIPTION STATE: Reset description expansion when new analysis starts  
  React.useEffect(() => {
    if (!showResults) {
      setIsDescriptionExpanded(false);
    }
  }, [showResults]);
  
  // RESET DESCRIPTION STATE: Reset description expansion when new image is captured
  React.useEffect(() => {
    if (capturedImageUri) {
      setIsDescriptionExpanded(false);
    }
  }, [capturedImageUri]);
  
  // STEP 2: Create dynamic layout with safe area considerations
  const layout = React.useMemo(() => 
    calculateLayout({ width: screenWidth, height: screenHeight }, insets.bottom), 
    [insets.bottom]
  );
  
  // STEP 3: Generate linked styles from dynamic layout
  const linkedStyles = React.useMemo(() => createLinkedStyles(layout), [layout]);
  
  if (!visible) return null;

  // Determine what to display
  const isAnalyzing = !showResults;
  const displayName = showResults && analysisResults?.name ? analysisResults.name : i18n.t('camera.foodAnalysis');
  
  // Use real data if available, otherwise show dummy data
  const displayCalories = showResults && analysisResults?.calories ? analysisResults.calories : 0;
  const displayProtein = showResults && analysisResults?.protein ? Math.floor(analysisResults.protein) : 0;
  const displayCarbs = showResults && analysisResults?.carbs ? Math.floor(analysisResults.carbs) : 0;
  const displayFat = showResults && analysisResults?.fat ? Math.floor(analysisResults.fat) : 0;

  // Get localized nutrition config
  const NUTRITION_CONFIG = getNutritionConfig();

  return (
    // STEP 5: Replace Modal with full-screen positioned overlay
    <View style={styles.fullScreenOverlay}>
      {/* Background dim effect */}
      <View style={styles.backgroundDim} />
      
      {/* STEP 5: Direct 40/60 Split Implementation */}
      {/* Image Section - 40% of screen, overlaps with dynamic island */}
      <View style={styles.imageSection}>
        {capturedImageUri && (
          <View style={linkedStyles.imageContainer}>
            <Image 
              source={{ uri: capturedImageUri }} 
              style={styles.capturedImage}
              resizeMode="cover"
            />
            
            {/* 24pt Gradient Overlay at bottom - transparent to 15% black */}
            <LinearGradient
              colors={['transparent', 'rgba(0, 0, 0, 0.15)']}
              style={styles.heroImageGradientOverlay}
              pointerEvents="none"
            />
            
            {/* Loading indicator inside image during analysis */}
            {isAnalyzing && (
              <View style={styles.imageLoadingOverlay}>
                <AnalysisProgress 
                  progress={analysisProgress}
                  stage={analysisStage}
                  size={120}
                />
              </View>
            )}
          </View>
        )}
      </View>
      
      {/* Results Section - 60% of screen, consistent for both states */}
      <View style={styles.resultsSection}>
        <View style={linkedStyles.resultsCard}>
          {/* STEP 5: Fixed Top Section (Title + Nutrition) - Never scrolls */}
          <View style={linkedStyles.fixedTopSection}>
            {/* STEP 5: Title Section - consistent across states */}
            <View style={linkedStyles.titleSection}>
              {isAnalyzing ? (
                // Show skeleton during analysis
                <TitleSkeleton titleWidth="60%" />
              ) : (
                // Show real title when results are ready
                <ThemedText style={styles.resultsTitle}>
                  {displayName}
                </ThemedText>
              )}
            </View>
            
            {/* STEP 5: Nutrition Grid - shows skeleton during loading, real during results */}
            <View style={linkedStyles.nutritionGrid}>
              {isAnalyzing ? (
                // Show skeleton during analysis
                <NutritionCardSkeleton 
                  isSmallScreen={screenHeight < 700}
                />
              ) : (
                // Show real nutrition data when results are ready
                <>
                  {/* Large Calories Card - Full Width */}
                  <View style={linkedStyles.caloriesCard}>
                    <View style={linkedStyles.caloriesIconCircle}>
                      <FontAwesome5 
                        name={NUTRITION_CONFIG.calories.icon} 
                        size={layout.base.nutrition.iconSize.calories} 
                        color={NUTRITION_CONFIG.calories.color}
                        style={linkedStyles.nutritionIcon}
                      />
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <ThemedText style={styles.nutritionValue}>
                        {displayCalories}
                      </ThemedText>
                      <ThemedText style={styles.nutritionLabel}>{NUTRITION_CONFIG.calories.label}</ThemedText>
                    </View>
                  </View>
                  
                  {/* Macro Cards Row - Protein, Carbs, Fats */}
                  <View style={linkedStyles.macroRow}>
                    {/* Protein Card */}
                    <View style={linkedStyles.macroCard}>
                      <MaterialCommunityIcons 
                        name={NUTRITION_CONFIG.protein.icon} 
                        size={layout.base.nutrition.iconSize.macro} 
                        color={NUTRITION_CONFIG.protein.color}
                        style={linkedStyles.nutritionIcon}
                      />
                      <ThemedText style={styles.nutritionValueSmall}>
                        {displayProtein}g
                      </ThemedText>
                      <View style={{ height: 4 }} />
                      <ThemedText style={styles.nutritionUnitSmall}>{NUTRITION_CONFIG.protein.label}</ThemedText>
                    </View>
                    
                    {/* Carbs Card */}
                    <View style={linkedStyles.macroCard}>
                      <MaterialCommunityIcons 
                        name={NUTRITION_CONFIG.carbs.icon} 
                        size={layout.base.nutrition.iconSize.macro} 
                        color={NUTRITION_CONFIG.carbs.color}
                        style={linkedStyles.nutritionIcon}
                      />
                      <ThemedText style={styles.nutritionValueSmall}>
                        {displayCarbs}g
                      </ThemedText>
                      <View style={{ height: 4 }} />
                      <ThemedText style={styles.nutritionUnitSmall}>{NUTRITION_CONFIG.carbs.label}</ThemedText>
                    </View>
                    
                    {/* Fats Card */}
                    <View style={linkedStyles.macroCard}>
                      <FontAwesome5 
                        name={NUTRITION_CONFIG.fats.icon} 
                        size={layout.base.nutrition.iconSize.macro} 
                        color={NUTRITION_CONFIG.fats.color}
                        style={linkedStyles.nutritionIcon}
                      />
                      <ThemedText style={styles.nutritionValueSmall}>
                        {displayFat}g
                      </ThemedText>
                      <View style={{ height: 4 }} />
                      <ThemedText style={styles.nutritionUnitSmall}>{NUTRITION_CONFIG.fats.label}</ThemedText>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>
          
          {/* STEP 5: Flexible Middle Section (Description) - Can scroll if needed */}
          {isAnalyzing ? (
            // Show description skeleton during analysis
            <View style={linkedStyles.flexibleMiddleSection}>
              <DescriptionSkeleton 
                isSmallScreen={screenHeight < 700}
              />
            </View>
          ) : (
            // Show real description when results are ready
            showResults && analysisResults?.description && (
              <View style={linkedStyles.flexibleMiddleSection}>
                <ScrollView 
                  style={linkedStyles.scrollableDescriptionContainer}
                  contentContainerStyle={linkedStyles.descriptionScrollContent}
                  showsVerticalScrollIndicator={true}
                  bounces={true}
                  scrollEnabled={isDescriptionExpanded}
                  nestedScrollEnabled={true}
                >
                  <View style={linkedStyles.descriptionDrawer}>
                    {/* STEP 2 & 3: Conditional Rendering Logic */}
                    {!isDescriptionExpanded ? (
                      // COLLAPSED STATE (Show more) - Keep current working structure
                      <>
                        <ThemedText 
                          style={styles.descriptionTextCollapsed}
                          numberOfLines={2}
                        >
                          {analysisResults.description}
                        </ThemedText>
                        
                        <TouchableOpacity 
                          style={linkedStyles.descriptionToggleButton}
                          onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                          activeOpacity={0.7}
                        >
                          <ThemedText style={styles.descriptionToggleText}>
                            {i18n.t('camera.showDetails')}
                          </ThemedText>
                          <MaterialCommunityIcons 
                            name="chevron-down" 
                            size={16} 
                            color={palette.primary}
                          />
                        </TouchableOpacity>
                      </>
                    ) : (
                      // EXPANDED STATE (Show less) - Fixed layout to prevent button hiding
                      <>
                        <ThemedText style={styles.descriptionTextExpanded}>
                          {analysisResults.description}
                        </ThemedText>
                        
                        {/* FIXED: Keep original button styling and layout, just ensure it's always visible */}
                        <TouchableOpacity 
                          style={linkedStyles.descriptionToggleButton}
                          onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                          activeOpacity={0.7}
                        >
                          <ThemedText style={styles.descriptionToggleText}>
                            {i18n.t('camera.showLess')}
                          </ThemedText>
                          <MaterialCommunityIcons 
                            name="chevron-up" 
                            size={16} 
                            color={palette.primary}
                          />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </ScrollView>
              </View>
            )
          )}
        </View>
        
        {/* STEP 3: Fixed Button Container - Now positioned absolutely outside resultsCard */}
        {showResults && (
          <View style={[
            linkedStyles.buttonContainer, 
            !showResults && styles.hiddenButtons
          ]}>
            <TouchableOpacity 
              style={linkedStyles.button}
              onPress={onDiscard}
              activeOpacity={0.7}
              disabled={!showResults}
            >
              <ThemedText style={styles.buttonText}>{i18n.t('camera.discard')}</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[linkedStyles.button, linkedStyles.primaryButton]}
              onPress={onSave}
              activeOpacity={0.7}
              disabled={!showResults || isSaving}
            >
              <ThemedText style={[styles.buttonText, styles.primaryButtonText]}>
                {isSaving ? i18n.t('camera.savingMeal') : i18n.t('camera.saveMeal')}
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // STEP 5: Full-screen overlay with absolute positioning
  fullScreenOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 1000, // Ensure it's above camera
  },
  backgroundDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  // IMAGE SECTION - FILLS COMPLETE 40% WITH NO EMPTY SPACE
  imageSection: {
    position: 'absolute' as const,
    top: 0, // Start from very top of screen
    left: 0,
    right: 0,
    height: SCREEN_SPLIT.imageSection.height + 20, // Exactly 40% of screen + bleed for border radius
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0, // No padding - full width
    paddingTop: 0, // No padding - starts from top
    paddingBottom: 0, // No padding - resultsSection will overlap the bleed
  },
  // RESULTS SECTION - FILLS COMPLETE 60% WITH NO EMPTY SPACE
  resultsSection: {
    position: 'absolute' as const,
    top: SCREEN_SPLIT.imageSection.height, // Start exactly where image ends
    left: 0,
    right: 0,
    bottom: 0, // Extend to bottom of screen (full 60%)
    padding: 0, // No padding - results card handles internal spacing
  },
  capturedImage: {
    width: '100%',
    height: '100%',
  },
  imageLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Increased opacity from 0.3 to 0.6 for stronger dimming
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsTitle: {
    fontSize: screenHeight < 700 ? 20 : 22, // Responsive title size
    fontWeight: '600',
    color: palette.primary,
    textAlign: 'center',
  },
  nutritionValue: {
    fontSize: screenHeight < 700 ? 20 : 24, // Slightly reduced from 22/26
    fontWeight: '700',
    color: palette.primary,
    marginBottom: screenHeight < 700 ? 3 : 5, // Tighter spacing
  },
  nutritionLabel: {
    fontSize: screenHeight < 700 ? 10 : 12, // Slightly reduced from 11/13
    fontWeight: '500',
    color: palette.inactive,
    letterSpacing: 0.5,
  },
  buttonText: {
    fontSize: screenHeight < 700 ? 15 : 17, // Responsive button text
    fontWeight: '600',
    color: palette.primary,
  },
  primaryButtonText: {
    color: palette.surface,
  },
  dummyData: {
    color: palette.inactive,
  },
  hiddenButtons: {
    opacity: 0,
    pointerEvents: 'none', // Prevent any touch events during loading
    // Note: No height/dimension changes - buttons maintain full size when hidden
  },
  nutritionValueSmall: {
    fontSize: screenHeight < 700 ? 18 : 20, // Smaller than main nutrition value
    fontWeight: '700',
    color: palette.primary,
    marginBottom: screenHeight < 700 ? 2 : 4, // Tighter spacing
    textAlign: 'center' as const,
  },
  nutritionUnitSmall: {
    fontSize: screenHeight < 700 ? 10 : 12, // Smaller unit size
    fontWeight: '500',
    color: palette.inactive,
    letterSpacing: 0.5,
    textAlign: 'center' as const,
  },
  descriptionText: {
    fontSize: screenHeight < 700 ? 14 : 15, // Compact but readable
    fontWeight: '400',
    color: palette.inactive,
    textAlign: 'center' as const,
    lineHeight: screenHeight < 700 ? 20 : 22, // Good readability
  },
  descriptionTextCollapsed: {
    fontSize: screenHeight < 700 ? 14 : 15,
    fontWeight: '400',
    color: palette.inactive,
    textAlign: 'center' as const,
    lineHeight: screenHeight < 700 ? 20 : 22,
  },
  descriptionTextExpanded: {
    fontSize: screenHeight < 700 ? 14 : 15,
    fontWeight: '400',
    color: palette.inactive,
    textAlign: 'center' as const,
    lineHeight: screenHeight < 700 ? 20 : 22,
    // No line limit when expanded
  },
  descriptionToggleText: {
    fontSize: screenHeight < 700 ? 12 : 13,
    fontWeight: '500',
    color: palette.primary,
    marginRight: 4,
  },
  
  // STEP 1: New inline layout styles for "Show less" button
  descriptionTextWithInlineButtonContainer: {
    width: '100%' as const,
    alignItems: 'flex-start' as const,
  },
  
  // STEP 5: Text Container Restructuring - Wrapper for expanded state
  descriptionExpandedWrapper: {
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
    justifyContent: 'space-between' as const,
    width: '100%' as const,
    flexWrap: 'wrap' as const,
  },
  
  // STEP 4 & 6: Enhanced Inline Toggle Button Style  
  descriptionToggleButtonInline: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 8,
    marginLeft: 8,
    borderRadius: 12,
    backgroundColor: palette.background,
    borderWidth: 1,
    borderColor: palette.primary + '20',
  },
  
  // STEP 6: Inline toggle text style
  descriptionToggleTextInline: {
    fontSize: screenHeight < 700 ? 12 : 13,
    fontWeight: '500',
    color: palette.primary,
    marginRight: 4,
  },
  
  // 24pt Gradient Overlay at bottom of hero image
  heroImageGradientOverlay: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    bottom: 0,
    height: 24, // 24pt as specified
  },
}); 