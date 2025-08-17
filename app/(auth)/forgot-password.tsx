import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/services/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '@/constants/Colors'; // Import palette

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const validateEmail = () => {
    if (!email) {
      setError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid');
      return false;
    }
    setError('');
    return true;
  };

  const handleResetPassword = async () => {
    setTouched(true);
    
    if (!validateEmail()) {
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err: any) { // Use 'err' to avoid conflict with 'error' state
      let errorMessage = 'An error occurred while sending the password reset email';
      
      // Supabase errors might be different, check common patterns
      if (err.message && err.message.toLowerCase().includes('user not found')) {
          errorMessage = 'No account found with this email address';
      } else if (err.message && err.message.toLowerCase().includes('invalid email')) {
          errorMessage = 'The email address is invalid';
      } else if (err.message) {
          errorMessage = err.message; // Use the actual error message if available
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1 px-6"
          contentContainerStyle={{ paddingTop: 40, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-row items-center justify-between mb-10">
            <TouchableOpacity 
              className="p-2" 
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={palette.primary} /> 
            </TouchableOpacity>
            <Text className="text-lg font-semibold">Reset Password</Text>
            <View className="w-10" /> 
          </View>
          
          {resetSent ? (
            <View className="items-center py-10">
              <Ionicons name="checkmark-circle-outline" size={60} color="#22c55e" className="mb-4" />
              <Text className="text-xl font-bold text-center mb-2">Email Sent!</Text>
              <Text className="text-base text-gray-600 text-center mb-6">
                We've sent a password reset link to {email}. Please check your email.
              </Text>
              <TouchableOpacity 
                style={{ backgroundColor: palette.primary }}
                className="py-3 px-6 rounded-lg w-full items-center"
                onPress={() => router.replace('/(auth)/login')}
              >
                <Text className="text-white font-semibold text-base">Back to Login</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View className="items-center mb-6">
                <View style={{ backgroundColor: palette.primary }} className="w-14 h-14 rounded-xl items-center justify-center mb-6">
                  <Ionicons name="flash" size={28} color="white" />
                </View>
              </View>
              
              <Text className="text-base text-gray-600 text-center mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </Text>
              
              <View className="mb-4">
                <TextInput
                  className="bg-gray-100 text-gray-800 p-4 rounded-md w-full"
                  placeholder="Enter your email"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onBlur={() => setTouched(true)}
                />
                {touched && error ? (
                  <Text className="text-red-500 mt-1">{error}</Text>
                ) : null}
              </View>
              
              <TouchableOpacity 
                style={{ backgroundColor: loading ? palette.inactive : palette.primary }}
                className={`py-4 rounded-lg items-center mt-4`}
                onPress={handleResetPassword}
                disabled={loading}
              >
                <Text className="text-white font-semibold text-lg">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
