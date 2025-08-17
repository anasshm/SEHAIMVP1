import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { Meal } from '@/models/meal';
import { format } from 'date-fns';

interface MealCardProps {
  meal: Meal;
  onPress?: () => void;
}

export function MealCard({ meal, onPress }: MealCardProps) {
  // Format the date to show time (e.g., "2:10 PM")
  const formattedTime = meal.meal_time 
    ? format(new Date(meal.meal_time), 'h:mm a')
    : '';

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: meal.image_url || 'https://via.placeholder.com/100' }} 
        style={styles.thumbnail} 
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText style={styles.title} numberOfLines={1}>
            {meal.name}
          </ThemedText>
          <ThemedText style={styles.time}>{formattedTime}</ThemedText>
        </View>
        
        <View style={styles.nutritionRow}>
          <View style={styles.nutritionItem}>
            <ThemedText style={styles.nutritionValue}>{meal.calories}</ThemedText>
            <ThemedText style={styles.nutritionLabel}>calories</ThemedText>
          </View>
          
          <View style={styles.nutritionItem}>
            <ThemedText style={styles.nutritionValue}>{meal.protein}g</ThemedText>
            <ThemedText style={styles.nutritionLabel}>protein</ThemedText>
          </View>
          
          <View style={styles.nutritionItem}>
            <ThemedText style={styles.nutritionValue}>{meal.carbs}g</ThemedText>
            <ThemedText style={styles.nutritionLabel}>carbs</ThemedText>
          </View>
          
          <View style={styles.nutritionItem}>
            <ThemedText style={styles.nutritionValue}>{meal.fat}g</ThemedText>
            <ThemedText style={styles.nutritionLabel}>fat</ThemedText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 300,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  time: {
    fontSize: 14,
    opacity: 0.7,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  nutritionLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
});
