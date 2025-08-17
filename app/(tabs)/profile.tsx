import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '@/src/services/AuthContext';
import { useOnboarding } from '../OnboardingContext';
import { InfoCard } from '@/components/ui/InfoCard';
import { FieldRow } from '@/components/ui/FieldRow';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { onboardingData, isLoading: isOnboardingDataLoading } = useOnboarding();
  
  // User data state
  const [userData, setUserData] = useState({
    name: 'Guest User',
    email: '',
    notifications: true,
    darkMode: false,
  });
  
  // Update user data when auth state changes
  useEffect(() => {
    if (user) {
      console.log('User data updated from auth state:', user);
      setUserData({
        ...userData,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
      });
    } else {
      console.log('No user found, using guest data');
      setUserData({
        ...userData,
        name: 'Guest User',
        email: '',
      });
    }
  }, [user]);
  
  // Handle logout
  const handleLogout = async () => {
    try {
      console.log('Attempting to log out');
      await signOut();
      console.log('Logout successful');
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  // Handle opening legal links
  const openPrivacyPolicy = async () => {
    try {
      await WebBrowser.openBrowserAsync('https://createvaluellc.com/privacy');
    } catch (error) {
      console.error('Error opening Privacy Policy:', error);
      Alert.alert('Error', 'Unable to open Privacy Policy. Please try again.');
    }
  };

  const openTermsAndConditions = async () => {
    try {
      await WebBrowser.openBrowserAsync('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/');
    } catch (error) {
      console.error('Error opening Terms and Conditions:', error);
      Alert.alert('Error', 'Unable to open Terms and Conditions. Please try again.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f7' }}>
      <View className="flex-1 bg-app-bg">
      <View className="px-4 pb-4">
        <Text className="text-[32px] font-bold text-[#1D1923]">Profile</Text>
      </View>
      
      <ScrollView className="flex-1">
        {!user ? (
          <View className="p-4 items-center">
            <Text className="text-text-primary text-lg mb-4 text-center">Sign in to track your nutrition</Text>
            <TouchableOpacity 
              className="bg-blue-500 py-3 px-6 rounded-lg"
              onPress={() => router.push('/(auth)/login')}
            >
              <Text className="text-white font-semibold text-base">Sign In / Register</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View className="items-center p-4 mb-8">
              <View className="w-24 h-24 rounded-full bg-[#1C1A2333] justify-center items-center mb-3">
                <Text className="text-white text-[40px] font-bold">
                  {userData.name.charAt(0)}
                </Text>
              </View>
              <Text className="text-xl font-semibold text-[#1D1923] mb-1">{userData.name}</Text>
              {userData.email && <Text className="text-[15px] text-[#6E7685] mt-1">{userData.email}</Text>}
            </View>
          </>
        )}
        
        {/* Section for Onboarding Data */}
        {user && (
          <InfoCard title="My physical info">
            {isOnboardingDataLoading ? (
              <View className="p-4 items-center justify-center">
                <ActivityIndicator size="small" color="#4A90E2" />
              </View>
            ) : (
              <>
                <FieldRow 
                  label="Birthday"
                  value={onboardingData.dateOfBirth ? onboardingData.dateOfBirth : 'Not set'}
                />
                <FieldRow 
                  label="Height"
                  value={onboardingData.height 
                    ? `${onboardingData.height.value} ${onboardingData.height.unit}` 
                    : 'Not set'}
                />
                <FieldRow 
                  label="Weight"
                  value={onboardingData.weight 
                    ? `${onboardingData.weight.value} ${onboardingData.weight.unit}` 
                    : 'Not set'}
                  isLast={true}
                />
              </>
            )}
          </InfoCard>
        )}
        
        <InfoCard title="App settings">
            <FieldRow 
              label="Notifications"
              right={
                <Switch
                  value={userData.notifications}
                  onValueChange={(value) => setUserData({...userData, notifications: value})}
                  trackColor={{ false: '#C9CDD6', true: '#1D1923' }}
                  thumbColor="#FFF"
                />
              }
            />
        </InfoCard>
        
        <InfoCard title="Legal">
          <TouchableOpacity onPress={openPrivacyPolicy}>
            <FieldRow 
              label="Privacy Policy"
              right={
                <Text className="text-[15px] text-[#6E7685]">→</Text>
              }
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={openTermsAndConditions}>
            <FieldRow 
              label="Terms and Conditions"
              right={
                <Text className="text-[15px] text-[#6E7685]">→</Text>
              }
              isLast={true}
            />
          </TouchableOpacity>
        </InfoCard>
        
        {user && (
          <View className="px-4 mb-8">
            <TouchableOpacity 
              className="bg-[#D32F2F] rounded-[20px] py-[14px] items-center shadow-md"
              onPress={handleLogout}
            >
              <Text className="text-white text-[17px] font-semibold">Log Out</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      </View>
    </SafeAreaView>
  );
}
