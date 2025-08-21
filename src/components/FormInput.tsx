import React from 'react';
import { StyleSheet, View, TextInput, TextInputProps, Text } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  touched?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  touched,
  ...props
}) => {
  const colorScheme = useColorScheme();
  const showError = !!error && touched;
  
  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <TextInput
        style={[
          styles.input,
          { 
            color: Colors[colorScheme ?? 'light'].text,
            backgroundColor: Colors[colorScheme ?? 'light'].background,
            borderColor: showError 
              ? '#FF3B30' 
              : 'rgba(150, 150, 150, 0.3)'
          }
        ]}
        placeholderTextColor="rgba(150, 150, 150, 0.6)"
        {...props}
      />
      {showError && (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
});

export default FormInput;
