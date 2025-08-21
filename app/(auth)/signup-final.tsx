import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Stack, useRouter, Link } from 'expo-router';
import { styled } from 'nativewind';
import { useAuth } from '@/src/services/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function SignUpFinalScreen() {
  const router = useRouter();
  const { signUp, signIn } = useAuth(); // Get both signIn and signUp
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); // Added fullName state
  const [confirmPassword, setConfirmPassword] = useState(''); // Added confirmPassword state
  const [isLoginView, setIsLoginView] = useState(false); // Toggle between SignUp and Login
  const [loading, setLoading] = useState(false);

  const handleAuthAction = async () => {
    setLoading(true);
    try {
      let error = null;
      if (isLoginView) {
        // Handle Login
        console.log('Attempting final login...');
        const result = await signIn(email, password);
        error = result.error;
      } else {
        // Handle Sign Up
        console.log('Attempting final signup...');
        // Pass fullName in metadata object
        const result = await signUp(email, password, { name: fullName });
        error = result.error;
      }

      if (error) {
        Alert.alert('Authentication Failed', error.message);
      } else {
        console.log('Authentication successful, marking onboarding complete...');
        // On successful login or signup, mark onboarding complete
        // await AsyncStorage.setItem('onboardingComplete', 'true'); // REMOVED: Moved to paywall
        console.log('Navigating to main app...');
        // Navigate to the main app, replacing the auth stack
        router.replace('/paywall'); // Navigate to Paywall instead of tabs
      }
    } catch (e: any) {
      console.error('Auth action failed:', e);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledView className="flex-1 justify-center bg-white p-6">
      <Stack.Screen options={{ 
          headerTitle: isLoginView ? 'Log In' : 'Create Account', 
          headerBackVisible: false, // No going back from here in this flow
          headerTitleAlign: 'center'
      }} />

      <StyledText className="text-2xl font-bold text-center mb-6">
        {isLoginView ? 'Welcome Back!' : 'Almost There!'}
      </StyledText>

      {!isLoginView && (
        <StyledTextInput
          className="border border-gray-300 p-3 rounded-lg mb-4 text-base"
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
          placeholderTextColor="#9ca3af"
        />
      )}

      <StyledTextInput
        className="border border-gray-300 p-3 rounded-lg mb-4 text-base"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#9ca3af"
      />
      <StyledTextInput
        className="border border-gray-300 p-3 rounded-lg mb-6 text-base"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#9ca3af"
      />

      {/* --- Added Confirm Password Input --- */} 
      {!isLoginView && (
        <StyledTextInput
          className="border border-gray-300 p-3 rounded-lg mb-6 text-base"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholderTextColor="#9ca3af"
        />
      )}
      {/* --- End Confirm Password Input --- */} 

      <StyledTouchableOpacity
        className="bg-blue-500 py-4 rounded-lg items-center mb-4"
        onPress={handleAuthAction}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <StyledText className="text-white font-semibold text-lg">
            {isLoginView ? 'Log In' : 'Create Account & Continue'}
          </StyledText>
        )}
      </StyledTouchableOpacity>

      <StyledTouchableOpacity onPress={() => setIsLoginView(!isLoginView)} className="items-center">
        <StyledText className="text-blue-500">
          {isLoginView ? 'Need an account? Sign Up' : 'Already have an account? Log In'}
        </StyledText>
      </StyledTouchableOpacity>

      {/* TODO: Add password reset link if needed */}
    </StyledView>
  );
}
