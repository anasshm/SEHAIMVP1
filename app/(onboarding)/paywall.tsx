import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/src/services/AuthContext';
import { palette } from '@/constants/Colors'; // Import palette

export default function PaywallScreen() {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState('');

  const handleAccessCode = () => {
    if (accessCode.trim().toLowerCase() === 'bihfih123') {
      router.replace('/(auth)/register-form'); 
    } else {
      Alert.alert('Error', 'Invalid access code. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={styles.title}>Unlock Full Access</Text>
      <Text style={styles.subtitle}>Enter your access code below to continue.</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Access Code"
        placeholderTextColor="#999"
        value={accessCode}
        onChangeText={setAccessCode}
        secureTextEntry 
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.button} onPress={handleAccessCode}>
        <Text style={styles.buttonText}>Continue with Code</Text>
      </TouchableOpacity>

      {/* Placeholder for actual payment options */}
      <Text style={styles.paymentPlaceholder}>Future payment options will be here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '80%',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: palette.primary, // Use palette.primary
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    width: '80%',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  paymentPlaceholder: {
    marginTop: 40,
    fontSize: 14,
    color: 'gray',
    fontStyle: 'italic',
  }
});
