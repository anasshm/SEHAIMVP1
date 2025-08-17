import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/services/AuthContext';
import { useOnboarding } from '../OnboardingContext';
import { Ionicons } from '@expo/vector-icons';
import { styled } from 'nativewind';
import { palette } from '@/constants/Colors'; // Import palette
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create styled components with NativeWind
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);
const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView);
const StyledTextInput = styled(TextInput);

export default function RegisterFormScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { setIsOnboardingComplete } = useOnboarding();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = { 
      name: '', 
      email: '', 
      password: '', 
      confirmPassword: '' 
    };

    // Name validation
    if (!name.trim()) {
      newErrors.name = 'Name is required';
      valid = false;
    }

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      valid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      valid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleRegister = async () => {
    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Pass the name as metadata to the signUp function
      await signUp(email, password, { name: name }); 
      
      // Set onboarding complete flag in context
      setIsOnboardingComplete(true);
      console.log('[RegisterForm] OnboardingContext: isOnboardingComplete set to true.');

      // Set onboarding complete flag in AsyncStorage (already exists, good for persistence)
      await AsyncStorage.setItem('onboardingComplete', 'true');
      console.log('[RegisterForm] Onboarding complete flag set.');

      // Navigate immediately after setting the flag
      // RootLayoutNav will handle showing the main app
      router.replace('/(tabs)'); 

      // Show success alert (user will already be navigating away)
      Alert.alert(
        'Registration Successful',
        'Your account has been created successfully!',
        [{ text: 'OK' }] // Simple OK button, no navigation action needed here
      );
    } catch (error: any) {
      let errorMessage = 'An error occurred during registration';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'The email address is invalid';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'The password is too weak';
      }
      
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledView className="flex-1 bg-white">
      <StyledKeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <StyledScrollView 
          className="flex-1 px-6"
          contentContainerStyle={{ paddingTop: 40, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with Cancel button and title */}
          <StyledView className="flex-row items-center justify-between mb-10">
            <StyledTouchableOpacity 
              className="p-2" 
              onPress={() => router.back()}
            >
              <StyledText style={{ color: palette.primary }} className="text-base">Cancel</StyledText>
            </StyledTouchableOpacity>
            <StyledText className="text-lg font-semibold">Create Account</StyledText>
            <StyledView className="w-14" />
          </StyledView>

          {/* App Logo */}
          <StyledView className="items-center mb-6">
            <StyledView style={{ backgroundColor: palette.primary }} className="w-14 h-14 rounded-xl items-center justify-center mb-6">
              <Ionicons name="flash" size={28} color="white" />
            </StyledView>
          </StyledView>
          
          {/* Registration form - All fields */}
          <StyledView className="mb-4">
            <StyledTextInput
              className="bg-gray-100 text-gray-800 p-4 rounded-md w-full"
              placeholder="Full Name"
              placeholderTextColor="#9ca3af"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              onBlur={() => setTouched({ ...touched, name: true })}
            />
            {touched.name && errors.name ? (
              <StyledText className="text-red-500 mt-1">{errors.name}</StyledText>
            ) : null}
          </StyledView>
          
          <StyledView className="mb-4">
            <StyledTextInput
              className="bg-gray-100 text-gray-800 p-4 rounded-md w-full"
              placeholder="Email"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onBlur={() => setTouched({ ...touched, email: true })}
            />
            {touched.email && errors.email ? (
              <StyledText className="text-red-500 mt-1">{errors.email}</StyledText>
            ) : null}
          </StyledView>
          
          <StyledView className="mb-4">
            <StyledTextInput
              className="bg-gray-100 text-gray-800 p-4 rounded-md w-full"
              placeholder="Password"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              onBlur={() => setTouched({ ...touched, password: true })}
            />
            {touched.password && errors.password ? (
              <StyledText className="text-red-500 mt-1">{errors.password}</StyledText>
            ) : null}
          </StyledView>
          
          <StyledView className="mb-6">
            <StyledTextInput
              className="bg-gray-100 text-gray-800 p-4 rounded-md w-full"
              placeholder="Confirm Password"
              placeholderTextColor="#9ca3af"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              onBlur={() => setTouched({ ...touched, confirmPassword: true })}
            />
            {touched.confirmPassword && errors.confirmPassword ? (
              <StyledText className="text-red-500 mt-1">{errors.confirmPassword}</StyledText>
            ) : null}
          </StyledView>
          
          <StyledTouchableOpacity 
            style={{ backgroundColor: loading ? palette.inactive : palette.primary }}
            className="py-4 rounded-lg items-center mt-6"
            onPress={handleRegister}
            disabled={loading}
          >
            <StyledText className="text-white font-semibold text-lg">
              {loading ? 'Creating Account...' : 'Create Account'}
            </StyledText>
          </StyledTouchableOpacity>

          {/* Link to Login */}
          <StyledView className="flex-row justify-center mt-8">
            <StyledText className="text-gray-600 mr-1">Already have an account?</StyledText>
            <StyledTouchableOpacity onPress={() => router.push('/(auth)/login')}> 
              <StyledText style={{ color: palette.primary }} className="font-semibold">Log In</StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </StyledScrollView>
      </StyledKeyboardAvoidingView>
    </StyledView>
  );
}

// Styles are now handled by NativeWind classes
