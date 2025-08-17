import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons
import i18n from '@/utils/i18n';

interface CameraOverlayProps {
  showGuide?: boolean;
  isPillBarcodeMode?: boolean; // Renamed for clarity: controls the text in the top pill
  isBarcodeModeActive?: boolean; // New prop: controls the large visual overlay
  pillOffsetTop?: number;
}

export function CameraOverlay({
  showGuide = true,
  isPillBarcodeMode = false,
  isBarcodeModeActive = false, // New prop
  pillOffsetTop = 0,
}: CameraOverlayProps) {
  // The pill guide text remains as is, controlled by isPillBarcodeMode
  const pillGuide = showGuide && (
    <View style={[styles.guideContainer, { top: pillOffsetTop }]}>
      <ThemedText style={styles.guideText}>
        {isPillBarcodeMode
          ? i18n.t('camera.pointCameraAtBarcode')
          : i18n.t('camera.captureYourFood')}
      </ThemedText>
    </View>
  );

  // New: Large visual indicator for barcode scanning mode
  const barcodeModeIndicator = isBarcodeModeActive && (
    <View style={styles.barcodeIndicatorOverlay}>
      <View style={styles.barcodeIndicatorBox}>
        {/* Icon removed as per request */}
      </View>
      <ThemedText style={styles.barcodeIndicatorText}>
        {i18n.t('camera.readyToScanBarcode')}
      </ThemedText>
    </View>
  );

  if (!showGuide && !isBarcodeModeActive) return null; // Return null if neither should be shown

  return (
    <View style={styles.container}>
      {pillGuide}
      {barcodeModeIndicator}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start', // Changed to flex-start for pill positioning
    alignItems: 'center',
  },
  guideContainer: {
    position: 'absolute', // Keep pill absolutely positioned
    // top will be applied inline via pillOffsetTop
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 16,
    maxWidth: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    alignSelf: 'center',
    justifyContent: 'center',
    zIndex: 1, // Ensure pill is above barcode indicator if they overlap (though they shouldn't much)
  },
  guideText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'normal',
    lineHeight: 16 * 1.2,
    textAlign: 'center',
  },
  // Styles for the new barcode mode indicator
  barcodeIndicatorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent', // Changed to fully transparent
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0, // Behind the pill if necessary
  },
  barcodeIndicatorBox: {
    width: 350, // Increased width
    height: 350, // Increased height
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 3, // Keep border noticeable
    borderRadius: 30, // Slightly increased border radius for larger size
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // Added subtle gray tint inside the box
    // justifyContent and alignItems are no longer needed if there's no child
    marginBottom: 20, // Space between box and text
  },
  barcodeIndicatorText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
});
