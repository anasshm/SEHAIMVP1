import React from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  ViewStyle, 
  TextStyle 
} from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const colorScheme = useColorScheme();
  const isPrimary = variant === 'primary';
  
  const buttonStyles = [
    styles.button,
    isPrimary 
      ? { backgroundColor: Colors[colorScheme ?? 'light'].tint } 
      : { 
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: Colors[colorScheme ?? 'light'].tint,
        },
    disabled && styles.buttonDisabled,
    style,
  ];
  
  const textStyles = [
    styles.text,
    isPrimary 
      ? { color: 'white' } 
      : { color: Colors[colorScheme ?? 'light'].tint },
    disabled && styles.textDisabled,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          color={isPrimary ? 'white' : Colors[colorScheme ?? 'light'].tint} 
          size="small" 
        />
      ) : (
        <ThemedText style={textStyles}>{title}</ThemedText>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  textDisabled: {
    opacity: 0.6,
  },
});

export default Button;
