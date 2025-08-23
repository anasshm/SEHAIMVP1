import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { palette } from '@/constants/Colors';
import i18n, { isRTL } from '@/utils/i18n';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NutritionRecommendation } from '@/src/services/NutritionService';

const NUTRITION_PLAN_STORAGE_KEY = '@nutritionPlan';

interface MacroEditModalProps {
  visible: boolean;
  onClose: () => void;
  nutritionPlan: NutritionRecommendation | null;
  onSave?: (updatedPlan: NutritionRecommendation) => void;
}

export default function MacroEditModal({ visible, onClose, nutritionPlan, onSave }: MacroEditModalProps) {
  const [editedCalories, setEditedCalories] = useState('');
  const [editedCarbs, setEditedCarbs] = useState('');
  const [editedProtein, setEditedProtein] = useState('');
  const [editedFats, setEditedFats] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  useEffect(() => {
    if (visible && nutritionPlan) {
      // Populate form with current values when modal opens
      setEditedCalories(nutritionPlan.targetCalories.toString());
      setEditedCarbs(nutritionPlan.targetCarbsGrams.toString());
      setEditedProtein(nutritionPlan.targetProteinGrams.toString());
      setEditedFats(nutritionPlan.targetFatsGrams.toString());
    }
  }, [visible, nutritionPlan]);

  const handleSaveEdit = async () => {
    if (!nutritionPlan) return;

    try {
      const updatedPlan: NutritionRecommendation = {
        ...nutritionPlan,
        targetCalories: parseInt(editedCalories) || nutritionPlan.targetCalories,
        targetCarbsGrams: parseInt(editedCarbs) || nutritionPlan.targetCarbsGrams,
        targetProteinGrams: parseInt(editedProtein) || nutritionPlan.targetProteinGrams,
        targetFatsGrams: parseInt(editedFats) || nutritionPlan.targetFatsGrams,
      };

      // Save to AsyncStorage
      await AsyncStorage.setItem(NUTRITION_PLAN_STORAGE_KEY, JSON.stringify(updatedPlan));
      
      // Call onSave callback if provided
      if (onSave) {
        onSave(updatedPlan);
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      console.log('[MacroEditModal] Nutrition plan updated successfully');
      
      // Close modal
      onClose();
      setFocusedInput(null);
    } catch (error) {
      console.error('[MacroEditModal] Error saving edited nutrition plan:', error);
    }
  };

  const handleCancelEdit = () => {
    onClose();
    setFocusedInput(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (!nutritionPlan) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleCancelEdit}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 20,
            padding: 20,
            width: '90%',
            maxWidth: 400,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 20,
              color: '#000',
            }}>
              {i18n.t('onboarding.planResults.editMacros')}
            </Text>

            {/* Input fields */}
            <View style={{ marginBottom: 15 }}>
              <View style={{ 
                flexDirection: isRTL() ? 'row-reverse' : 'row', 
                alignItems: 'center', 
                marginBottom: 8 
              }}>
                <MaterialCommunityIcons 
                  name="fire" 
                  size={20} 
                  color={palette.accent}
                  style={isRTL() ? { marginLeft: 8 } : { marginRight: 8 }}
                />
                <Text style={{ fontSize: 14, color: '#666', textAlign: isRTL() ? 'right' : 'left' }}>
                  {i18n.t('onboarding.planResults.calories')}
                </Text>
              </View>
              <TextInput
                style={{
                  borderWidth: 2,
                  borderColor: focusedInput === 'calories' ? palette.accent : '#E0E0E0',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  color: '#000',
                  backgroundColor: focusedInput === 'calories' ? '#F8F9FA' : 'white',
                  textAlign: isRTL() ? 'right' : 'left',
                  writingDirection: isRTL() ? 'rtl' : 'ltr',
                }}
                value={editedCalories}
                onChangeText={setEditedCalories}
                onFocus={() => setFocusedInput('calories')}
                onBlur={() => setFocusedInput(null)}
                keyboardType="numeric"
                placeholder={nutritionPlan?.targetCalories.toString()}
                placeholderTextColor="#999"
              />
            </View>

            <View style={{ marginBottom: 15 }}>
              <View style={{ 
                flexDirection: isRTL() ? 'row-reverse' : 'row', 
                alignItems: 'center', 
                marginBottom: 8 
              }}>
                <MaterialCommunityIcons 
                  name="barley" 
                  size={20} 
                  color={palette.carbs}
                  style={isRTL() ? { marginLeft: 8 } : { marginRight: 8 }}
                />
                <Text style={{ fontSize: 14, color: '#666', textAlign: isRTL() ? 'right' : 'left' }}>
                  {i18n.t('onboarding.planResults.carbs')} (g)
                </Text>
              </View>
              <TextInput
                style={{
                  borderWidth: 2,
                  borderColor: focusedInput === 'carbs' ? palette.carbs : '#E0E0E0',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  color: '#000',
                  backgroundColor: focusedInput === 'carbs' ? '#F8F9FA' : 'white',
                  textAlign: isRTL() ? 'right' : 'left',
                  writingDirection: isRTL() ? 'rtl' : 'ltr',
                }}
                value={editedCarbs}
                onChangeText={setEditedCarbs}
                onFocus={() => setFocusedInput('carbs')}
                onBlur={() => setFocusedInput(null)}
                keyboardType="numeric"
                placeholder={nutritionPlan?.targetCarbsGrams.toString()}
                placeholderTextColor="#999"
              />
            </View>

            <View style={{ marginBottom: 15 }}>
              <View style={{ 
                flexDirection: isRTL() ? 'row-reverse' : 'row', 
                alignItems: 'center', 
                marginBottom: 8 
              }}>
                <MaterialCommunityIcons 
                  name="food-drumstick" 
                  size={20} 
                  color={palette.protein}
                  style={isRTL() ? { marginLeft: 8 } : { marginRight: 8 }}
                />
                <Text style={{ fontSize: 14, color: '#666', textAlign: isRTL() ? 'right' : 'left' }}>
                  {i18n.t('onboarding.planResults.protein')} (g)
                </Text>
              </View>
              <TextInput
                style={{
                  borderWidth: 2,
                  borderColor: focusedInput === 'protein' ? palette.protein : '#E0E0E0',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  color: '#000',
                  backgroundColor: focusedInput === 'protein' ? '#F8F9FA' : 'white',
                  textAlign: isRTL() ? 'right' : 'left',
                  writingDirection: isRTL() ? 'rtl' : 'ltr',
                }}
                value={editedProtein}
                onChangeText={setEditedProtein}
                onFocus={() => setFocusedInput('protein')}
                onBlur={() => setFocusedInput(null)}
                keyboardType="numeric"
                placeholder={nutritionPlan?.targetProteinGrams.toString()}
                placeholderTextColor="#999"
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <View style={{ 
                flexDirection: isRTL() ? 'row-reverse' : 'row', 
                alignItems: 'center', 
                marginBottom: 8 
              }}>
                <FontAwesome5 
                  name="tint" 
                  size={20} 
                  color={palette.fats}
                  style={isRTL() ? { marginLeft: 8 } : { marginRight: 8 }}
                />
                <Text style={{ fontSize: 14, color: '#666', textAlign: isRTL() ? 'right' : 'left' }}>
                  {i18n.t('onboarding.planResults.fats')} (g)
                </Text>
              </View>
              <TextInput
                style={{
                  borderWidth: 2,
                  borderColor: focusedInput === 'fats' ? palette.fats : '#E0E0E0',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  color: '#000',
                  backgroundColor: focusedInput === 'fats' ? '#F8F9FA' : 'white',
                  textAlign: isRTL() ? 'right' : 'left',
                  writingDirection: isRTL() ? 'rtl' : 'ltr',
                }}
                value={editedFats}
                onChangeText={setEditedFats}
                onFocus={() => setFocusedInput('fats')}
                onBlur={() => setFocusedInput(null)}
                keyboardType="numeric"
                placeholder={nutritionPlan?.targetFatsGrams.toString()}
                placeholderTextColor="#999"
              />
            </View>

            {/* Buttons */}
            <View style={{ 
              flexDirection: isRTL() ? 'row-reverse' : 'row', 
              justifyContent: 'space-between' 
            }}>
              <TouchableOpacity
                onPress={handleSaveEdit}
                style={{
                  flex: 1,
                  marginRight: isRTL() ? 0 : 10,
                  marginLeft: isRTL() ? 10 : 0,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: palette.primary,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                  {i18n.t('onboarding.planResults.save')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCancelEdit}
                style={{
                  flex: 1,
                  marginLeft: isRTL() ? 0 : 10,
                  marginRight: isRTL() ? 10 : 0,
                  paddingVertical: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#E0E0E0',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#666', fontSize: 16, fontWeight: '600' }}>
                  {i18n.t('onboarding.planResults.cancel')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
