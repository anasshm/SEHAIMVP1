import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
// import { ThemedText } from '@/components/ThemedText'; // Not used
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import i18n from '@/utils/i18n';

interface CameraControlsProps {
  onCapture: () => void;
  onGalleryOpen: () => void;
  isCapturing?: boolean;
  onToggleBarcodeScan: () => void;
  isBarcodeScanningActive: boolean;
}

export function CameraControls({
  onCapture,
  onGalleryOpen,
  isCapturing = false,
  onToggleBarcodeScan,
  isBarcodeScanningActive,
}: CameraControlsProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const iconColor = Colors[colorScheme ?? 'light'].text; 
  const activeColor = Colors.light.tint;


  return (
    <View style={[styles.container, { bottom: insets.bottom }]}>
      <View style={styles.leftControls}> 
        <View style={styles.controlButtonContainer}>
          <TouchableOpacity style={styles.button} onPress={onGalleryOpen} disabled={isCapturing}>
            <Ionicons name="images" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.labelText}>{i18n.t('camera.gallery')}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.captureButton, isCapturing && styles.disabledButton]} 
        onPress={onCapture}
        disabled={isCapturing}
      >
        <View style={styles.captureButtonInner} />
      </TouchableOpacity>

      <View style={styles.rightControls}>
        <View style={styles.controlButtonContainer}>
          <TouchableOpacity style={styles.button} onPress={onToggleBarcodeScan} disabled={isCapturing}>
            <Ionicons 
              name="barcode-outline" 
              size={28} 
              color={isBarcodeScanningActive ? activeColor : "white"} 
            />
          </TouchableOpacity>
          <Text style={styles.labelText}>{i18n.t('camera.barcode')}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  leftControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  container: {
    position: 'absolute',
    // bottom will be applied inline
    width: '100%',
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingTop: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  captureButtonInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'white',
  },
  disabledButton: {
    opacity: 0.5,
  },
  rightControls: {
    flexDirection: 'row',
  },
  controlButtonContainer: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  labelText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});
