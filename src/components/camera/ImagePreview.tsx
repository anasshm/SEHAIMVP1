import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface ImagePreviewProps {
  imageUri: string;
  onRetake: () => void;
  onAnalyze: () => void;
  onSave: () => void;
  onCancelAnalysis?: () => void;
  isAnalyzing?: boolean;
}

const { width, height } = Dimensions.get('window');

export function ImagePreview({
  imageUri,
  onRetake,
  onAnalyze,
  onSave,
  onCancelAnalysis,
  isAnalyzing = false,
}: ImagePreviewProps) {
  const colorScheme = useColorScheme();
  
  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.image} />
      
      {isAnalyzing ? (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <ThemedText style={styles.loadingText}>Analyzing your food...</ThemedText>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={onCancelAnalysis}
            >
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.button} onPress={onRetake}>
            <Ionicons name="refresh" size={24} color="white" />
            <ThemedText style={styles.buttonText}>Retake</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={onSave}>
            <Ionicons name="save" size={24} color="white" />
            <ThemedText style={styles.buttonText}>Save</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.analyzeButton, styles.button]} 
            onPress={onAnalyze}
          >
            <Ionicons name="nutrition" size={24} color="white" />
            <ThemedText style={styles.buttonText}>Analyze</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  image: {
    width,
    height: height - 150,
    resizeMode: 'contain', // Changed from 'cover' to 'contain' to show full image without cropping
    backgroundColor: '#000', // Black background for images that don't fill the screen
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 150,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  loadingContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
    borderRadius: 8,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  analyzeButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  buttonText: {
    color: 'white',
    marginTop: 5,
    fontSize: 14,
  },
});
