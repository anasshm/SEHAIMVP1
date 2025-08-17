import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock subscription packages (replace with data from RevenueCat later)
const MOCK_PACKAGES = [
  { id: 'yearly', title: 'Yearly', price: '$59.99/year', description: 'Save 50% - $4.99/month', popular: true },
  { id: 'monthly', title: 'Monthly', price: '$9.99/month', description: 'Billed monthly', popular: false },
];

// List of premium benefits
const PREMIUM_BENEFITS = [
  'Unlock detailed nutrition insights', 
  'Track unlimited meals & history', 
  'See weekly/monthly progress reports',
  'Access exclusive recipes & tips',
];

export default function PaywallScreen() {
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState<string>(MOCK_PACKAGES.find(p => p.popular)?.id || MOCK_PACKAGES[0]?.id || ''); // Default to popular or first

  const handlePurchase = async () => { 
    if (selectedPackage) {
      console.log('Attempting purchase for package:', selectedPackage);
      Alert.alert('Purchase Simulation', `You selected ${selectedPackage}. (Integration needed)`);
      
      // TODO: Implement actual purchase logic here
      // For now, we assume purchase is successful and proceed

      try {
        await AsyncStorage.setItem('onboardingComplete', 'true');
        router.replace('/(tabs)'); 
      } catch (e) {
        console.error('[Paywall] Navigation/Storage error', e); 
        Alert.alert('Error', 'Could not complete setup. Please try again.');
      }
    }
  };

  const handleRestore = async () => { 
    console.log('Attempting restore purchases');
    Alert.alert('Restore Simulation', 'Restore purchases functionality needs integration.');
    try {
      // TODO: Add actual restore logic from RevenueCat
      // If successful:
      await AsyncStorage.setItem('onboardingComplete', 'true'); 
      router.replace('/(tabs)'); 
    } catch (e) {
      console.error('[Paywall] Navigation/Storage error after restore', e); 
      Alert.alert('Error', 'Could not complete setup. Please try again.');
    }
  };
  
  // Function to skip the paywall / complete onboarding without purchase
  // (Could be linked to a 'Skip' button or triggered by back navigation if allowed)
  const completeOnboarding = async () => {
    try {
      // This function might not make sense for a hard paywall
      // For now, let's assume it acts like a successful 'purchase' for testing
      await AsyncStorage.setItem('onboardingComplete', 'true'); 
      router.replace('/(tabs)'); 
    } catch (e) {
      console.error('[Paywall] Navigation/Storage error (skipped)', e); 
      Alert.alert('Error', 'Could not complete setup. Please try again.');
    }
  };

  const renderPackageOption = (pkg: typeof MOCK_PACKAGES[0]) => {
    const isSelected = selectedPackage === pkg.id;
    return (
      <TouchableOpacity
        key={pkg.id}
        className={`p-4 border rounded-lg mb-3 relative ${_STYLES.optionBase} ${isSelected ? _STYLES.optionSelected : _STYLES.optionUnselected}`}
        onPress={() => setSelectedPackage(pkg.id)}
      >
        {pkg.popular && (
          <View className="absolute -top-2 right-2 bg-blue-500 px-2 py-0.5 rounded-full">
            <Text className="text-white text-xs font-semibold">Popular</Text>
          </View>
        )}
        <Text className={`${isSelected ? 'text-white' : 'text-gray-800'} text-lg font-bold mb-1`}>{pkg.title}</Text>
        <Text className={`${isSelected ? 'text-gray-200' : 'text-gray-600'} text-sm mb-1`}>{pkg.price}</Text>
        <Text className={`${isSelected ? 'text-gray-300' : 'text-gray-500'} text-xs`}>{pkg.description}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ 
          headerTitle: 'Go Premium',
          // Consider adding a 'Skip' or 'X' button here to call completeOnboarding
          headerLeft: () => null, // Keep back button from layout?
          headerRight: () => (
            <TouchableOpacity onPress={completeOnboarding} style={{ marginRight: 15 }}>
              <Text className="text-blue-600">Skip</Text>
            </TouchableOpacity>
          ),
          headerTitleAlign: 'center' 
      }} />
      
      <ScrollView 
        className="flex-1 p-6"
        contentContainerStyle={{ paddingBottom: 150 }} // Padding for the fixed buttons
      >
        <Text className="text-3xl font-bold mb-4 text-center text-gray-800">
          Unlock Foodnsap Premium
        </Text>
        
        {/* Benefits List */}
        <View className="my-6">
          {PREMIUM_BENEFITS.map((benefit, index) => (
            <View key={index} className="flex-row items-center mb-2">
              <Ionicons name="checkmark-circle" size={20} color="#22c55e" className="mr-2" />
              <Text className="text-base text-gray-700">{benefit}</Text>
            </View>
          ))}
        </View>

        {/* Package Selection */}
        {MOCK_PACKAGES.map(renderPackageOption)}

      </ScrollView>

      {/* Fixed Buttons at the bottom */}
      <View className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-200">
        <TouchableOpacity
          className={`py-4 rounded-full items-center mb-3 ${selectedPackage ? 'bg-blue-600' : 'bg-gray-300'}`}
          onPress={handlePurchase} 
          disabled={!selectedPackage}
        >
          <Text className={`text-lg font-semibold ${selectedPackage ? 'text-white' : 'text-gray-500'}`}>Start 7-Day Free Trial</Text> 
          {/* Adjust text based on actual trial availability */}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRestore} className="items-center mb-2">
          <Text className="text-blue-600 text-sm">Restore Purchase</Text>
        </TouchableOpacity>
        <Text className="text-xs text-gray-400 text-center">
          By continuing, you agree to our Terms of Service and Privacy Policy.
          {/* TODO: Add links to actual terms/privacy */} 
        </Text>
      </View>
    </View>
  );
}

// Reusing styles
const _STYLES = {
  optionBase: 'border-gray-200',
  optionUnselected: 'bg-gray-50',
  optionSelected: 'bg-gray-900 border-gray-900',
};
