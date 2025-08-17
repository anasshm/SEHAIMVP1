import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/src/services/AuthContext';
import { palette } from '@/constants/Colors'; // Import palette
import i18n, { isRTL } from '@/utils/i18n';
import * as Haptics from 'expo-haptics';

export default function PaywallScreen() {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState('');

  const handleAccessCode = () => {
    if (accessCode.trim().toLowerCase() === 'bihfih123') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(auth)/register-form'); 
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(i18n.t('common.error'), i18n.t('onboarding.paywall.invalidCode'));
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Text 
        style={[styles.title, { textAlign: isRTL() ? 'right' : 'center', writingDirection: isRTL() ? 'rtl' : 'ltr' }]}
      >
        {i18n.t('onboarding.paywall.title')}
      </Text>
      <Text 
        style={[styles.subtitle, { textAlign: isRTL() ? 'right' : 'center', writingDirection: isRTL() ? 'rtl' : 'ltr' }]}
      >
        {i18n.t('onboarding.paywall.subtitle')}
      </Text>
      
      <TextInput
        style={[styles.input, { textAlign: isRTL() ? 'right' : 'left' }]}
        placeholder={i18n.t('onboarding.paywall.accessCodePlaceholder')}
        placeholderTextColor="#999"
        value={accessCode}
        onChangeText={setAccessCode}
        secureTextEntry 
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.button} onPress={handleAccessCode}>
        <Text style={styles.buttonText}>{i18n.t('onboarding.paywall.continueWithCode')}</Text>
      </TouchableOpacity>

      {/* Placeholder for actual payment options */}
      <Text 
        style={[styles.paymentPlaceholder, { textAlign: isRTL() ? 'right' : 'center', writingDirection: isRTL() ? 'rtl' : 'ltr' }]}
      >
        {i18n.t('onboarding.paywall.paymentPlaceholder')}
      </Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    color: '#666',
  },
  input: {
    width: '100%',
    padding: 15,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: palette.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  paymentPlaceholder: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});
