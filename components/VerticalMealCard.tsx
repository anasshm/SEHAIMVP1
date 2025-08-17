import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { Meal } from '@/models/meal';
import { format } from 'date-fns';

interface VerticalMealCardProps {
  meal: Meal;
  onPress?: () => void;
}

export function VerticalMealCard({ meal, onPress }: VerticalMealCardProps) {
  // Format the date to show date and time (e.g., "May 3, 2:10 PM")
  const formattedDateTime = meal.meal_time 
    ? format(new Date(meal.meal_time), 'MMM d, h:mm a')
    : '';

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <ThemedText style={styles.title} numberOfLines={1}>
          {meal.name}
        </ThemedText>
        <ThemedText style={styles.time}>{formattedDateTime}</ThemedText>
      </View>
      
      <View style={styles.contentRow}>
        <Image 
          source={{ uri: meal.image_url || 'https://via.placeholder.com/100' }} 
          style={styles.thumbnail} 
        />
        
        <View style={styles.nutritionContainer}>
          <View style={styles.nutritionRow}>
            <View style={styles.nutritionItem}>
              <ThemedText style={styles.nutritionLabel}>Calories</ThemedText>
              <ThemedText style={styles.nutritionValue}>{meal.calories}</ThemedText>
            </View>
            
            <View style={styles.nutritionItem}>
              <ThemedText style={styles.nutritionLabel}>Protein</ThemedText>
              <ThemedText style={styles.nutritionValue}>{meal.protein}g</ThemedText>
            </View>
          </View>
          
          <View style={styles.nutritionRow}>
            <View style={styles.nutritionItem}>
              <ThemedText style={styles.nutritionLabel}>Carbs</ThemedText>
              <ThemedText style={styles.nutritionValue}>{meal.carbs}g</ThemedText>
            </View>
            
            <View style={styles.nutritionItem}>
              <ThemedText style={styles.nutritionLabel}>Fat</ThemedText>
              <ThemedText style={styles.nutritionValue}>{meal.fat}g</ThemedText>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 14,
    opacity: 0.7,
  },
  contentRow: {
    flexDirection: 'row',
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 16,
  },
  nutritionContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  nutritionItem: {
    flex: 1,
  },
  nutritionLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});
