import { View, Text, ActivityIndicator } from "react-native";
import { FoodAnalysisResult } from "@/services/aiVisionService";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { styled } from "nativewind";
import { palette } from '@/constants/Colors';

interface Props { 
  result?: FoodAnalysisResult | null;
  isLoading?: boolean;
}

const StyledView = styled(View);
const StyledText = styled(Text);

export function FoodAnalysisCard({ result, isLoading = false }: Props) {
  return (
    <StyledView className="bg-white rounded-xl p-6 mb-6 shadow-md">
      <StyledText className="text-xl font-bold mb-6 text-center text-gray-800">Food Analysis</StyledText>
      
      {isLoading ? (
        <StyledView className="items-center justify-center py-6">
          <ActivityIndicator size="large" color="#4A90E2" className="mb-4" />
          <StyledText className="text-base font-semibold mb-2 text-center text-gray-800">Our AI is analyzing your food...</StyledText>
          <StyledText className="text-sm text-gray-500 text-center mb-4">Calculating nutritional information</StyledText>
          <StyledView className="flex-row justify-center mt-2">
            <Ionicons name="nutrition-outline" size={24} color="#4A90E2" className="mx-2" />
            <Ionicons name="analytics-outline" size={24} color="#4A90E2" className="mx-2" />
          </StyledView>
        </StyledView>
      ) : result ? (
        <StyledView className="w-full">
          <StyledText className="text-2xl font-semibold mb-6 text-center text-gray-800">{result.name}</StyledText>
          
          <StyledView className="flex-row justify-between mb-8 px-2">
            <StyledView className="items-center flex-1">
              <StyledText className="text-xl font-bold text-[#1D1923]">{result.calories}</StyledText>
              <StyledText className="text-sm text-gray-500 mt-1">calories</StyledText>
            </StyledView>
            
            <StyledView className="items-center flex-1">
              <StyledText className="text-xl font-bold text-[#E24D43]">{result.protein}g</StyledText>
              <StyledText className="text-sm text-gray-500 mt-1">protein</StyledText>
            </StyledView>
            
            <StyledView className="items-center flex-1">
              <StyledText className="text-xl font-bold text-[#D1A46F]">{result.carbs}g</StyledText>
              <StyledText className="text-sm text-gray-500 mt-1">carbs</StyledText>
            </StyledView>
            
            <StyledView className="items-center flex-1">
              <StyledText className="text-xl font-bold text-[#F6C45F]">{result.fat}g</StyledText>
              <StyledText className="text-sm text-gray-500 mt-1">fat</StyledText>
            </StyledView>
          </StyledView>
          
          <StyledText className="text-base leading-6 text-gray-700 mt-4 pt-4 border-t border-gray-100">{result.description}</StyledText>
        </StyledView>
      ) : (
        <StyledText className="text-base text-red-500 mt-2 text-center">No analysis available</StyledText>
      )}
    </StyledView>
  );
}

// Styles are now handled by NativeWind classes
