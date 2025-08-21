import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getMeal, deleteMeal } from '@/services/mealService'; // Assuming path to your meal service
import { Meal } from '@/models/meal'; // Assuming path to your Meal model
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import i18n, { isRTL, formatMealDateTime } from '@/utils/i18n';

// Helper component for consistent styling of nutrient cards
const NutrientDisplayCard = ({ iconName, iconType, iconColor, label, value, unit, cardClassName, textClassName, valueClassName, iconSize = 24 }: {
  iconName: any;
  iconType: 'FontAwesome5' | 'MaterialCommunityIcons';
  iconColor: string;
  label: string;
  value: string | number;
  unit?: string;
  cardClassName?: string;
  textClassName?: string;
  valueClassName?: string;
  iconSize?: number;
}) => {
  const IconComponent = iconType === 'FontAwesome5' ? FontAwesome5 : MaterialCommunityIcons;
  return (
    <View className={`bg-white rounded-lg p-3 items-center justify-center shadow border border-gray-200 ${cardClassName}`}>
      <IconComponent name={iconName} size={iconSize} color={iconColor} />
      <Text className={`text-sm text-gray-600 mt-1 ${textClassName}`}>{label}</Text>
      <Text className={`text-xl font-bold text-gray-800 ${valueClassName}`}>{value}{unit}</Text>
    </View>
  );
};

export default function MealDetailScreen() {
  const { mealId } = useLocalSearchParams<{ mealId: string }>();
  const router = useRouter();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const isArabic = isRTL();

  useEffect(() => {
    if (!mealId) {
        Alert.alert(i18n.t('history.mealDetail.error'), i18n.t('history.mealDetail.mealIdMissing'));
        setIsLoading(false);
        router.back();
        return;
    }
    setIsLoading(true);
    getMeal(mealId)
      .then(data => {
        if (!data) {
          Alert.alert(i18n.t('history.mealDetail.error'), i18n.t('history.mealDetail.mealNotFound'));
          router.back();
        } else {
          setMeal(data);
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch meal:', error);
        Alert.alert(i18n.t('history.mealDetail.error'), i18n.t('history.mealDetail.failedToLoad'));
        setIsLoading(false);
        router.back();
      });
  }, [mealId, router]);

  const handleDelete = async () => {
    if (!meal || !meal.id) return;

    Alert.alert(
      i18n.t('history.mealDetail.deleteMealTitle'),
      i18n.t('history.mealDetail.deleteConfirmation').replace('{mealName}', meal.name),
      [
        {
          text: i18n.t('history.mealDetail.cancel'),
          style: 'cancel',
        },
        {
          text: i18n.t('history.mealDetail.delete'),
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              const success = await deleteMeal(meal.id!);
              if (success) {
                Alert.alert(i18n.t('history.mealDetail.success'), i18n.t('history.mealDetail.mealDeletedSuccess'));
                // Pass refreshTimestamp to trigger dashboard refresh
                router.push({ 
                  pathname: '/(tabs)', // Assuming this is your dashboard route
                  params: { refreshTimestamp: Date.now().toString() } 
                });
              } else {
                Alert.alert(i18n.t('history.mealDetail.error'), i18n.t('history.mealDetail.failedToDelete'));
              }
            } catch (error) {
              console.error('Failed to delete meal:', error);
              Alert.alert(i18n.t('history.mealDetail.error'), i18n.t('history.mealDetail.deleteError'));
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return <View className="flex-1 justify-center items-center bg-app-bg"><ActivityIndicator size="large" /></View>;
  }

  if (!meal) {
    // Already handled in useEffect, but good as a fallback
    return <View className="flex-1 justify-center items-center bg-app-bg"><Text className="text-text-secondary">{i18n.t('history.mealDetail.mealNotFound')}</Text></View>;
  }

  const formattedTime = meal.meal_time ? formatMealDateTime(new Date(meal.meal_time)) : 'N/A';

  return (
    <ScrollView className="flex-1 bg-app-bg p-4 pt-12">
      {/* Added a back button for clarity */}
      <TouchableOpacity onPress={() => router.back()} className="absolute top-10 left-4 z-10 bg-gray-200 rounded-full p-2">
        <MaterialCommunityIcons name="chevron-left" size={24} color="#333" />
      </TouchableOpacity>

      <View className="bg-card-bg rounded-card p-4 mb-4 border border-card-border mt-8"> 
        {meal.image_url && (
          <Image 
            source={{ uri: meal.image_url }}
            className="w-full h-48 rounded-lg mb-4"
            resizeMode="cover"
          />
        )}
        <Text 
          className="text-text-primary text-2xl font-bold mb-2"
          style={{ textAlign: isArabic ? 'right' : 'left' }}
        >
          {meal.name}
        </Text>
        <Text 
          className="text-text-secondary text-sm mb-4"
          style={{ textAlign: isArabic ? 'right' : 'left' }}
        >
          {i18n.t('history.mealDetail.loggedAt')} {formattedTime}
        </Text>

        {/* Nutritional Information Section - Updated UI */}
        <View className="my-4">
          {/* Calories Card */}
          <NutrientDisplayCard
            iconType="FontAwesome5"
            iconName="fire"
            iconColor="#4A5568" // Darker grey for calories icon as per screenshot
            iconSize={28}
            label={i18n.t('history.mealDetail.calories')}
            value={meal.calories || 0}
            cardClassName="w-full py-4 mb-3"
            valueClassName="text-3xl"
          />

          {/* Protein, Carbs, Fat Row */}
          <View className="flex-row justify-between space-x-2">
            <NutrientDisplayCard
              iconType="MaterialCommunityIcons"
              iconName="food-drumstick"
              iconColor="#E53E3E" // Red for protein
              label={i18n.t('history.mealDetail.protein')}
              value={meal.protein || 0}
              unit="g"
              cardClassName="flex-1"
            />
            <NutrientDisplayCard
              iconType="MaterialCommunityIcons"
              iconName="barley"
              iconColor="#D69E2E" // Beige/brown for carbs (adjusted from screenshot)
              label={i18n.t('history.mealDetail.carbs')}
              value={meal.carbs || 0}
              unit="g"
              cardClassName="flex-1"
            />
            <NutrientDisplayCard
              iconType="FontAwesome5" // Using FontAwesome5 for a yellow icon, adjust if needed
              iconName="tint" // Changed from 'cheese' to 'tint' for a droplet, common for fat. Could also use 'burn' or a custom one.
              iconColor="#ECC94B" // Yellow for fat
              label={i18n.t('history.mealDetail.fat')}
              value={meal.fat || 0}
              unit="g"
              cardClassName="flex-1"
            />
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleDelete} 
          disabled={isDeleting}
          className="bg-red-500 p-3 rounded-lg items-center mt-4"
        >
          {isDeleting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-base">{i18n.t('history.mealDetail.deleteMeal')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}