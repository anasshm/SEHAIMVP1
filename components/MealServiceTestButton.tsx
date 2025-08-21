import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { testMealService } from '@/utils/testMealService';
import * as Haptics from 'expo-haptics';

export function MealServiceTestButton() {
  const handlePress = async () => {
    try {
      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Confirm before running test
      Alert.alert(
        'Test Meal Service',
        'This will create a test meal with a placeholder image. Continue?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Run Test',
            onPress: async () => {
              try {
                await testMealService();
                // Success haptic feedback
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              } catch (error: any) {
                console.error('Test error:', error);
                // Error haptic feedback
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Alert.alert('Test Error', error?.message || 'An unknown error occurred');
              }
            }
          }
        ]
      );
    } catch (err) {
      console.error('Button press error:', err);
      Alert.alert('Error', 'Failed to start test');
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress}>
      <Text style={styles.buttonText}>Test Meal Service</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});
