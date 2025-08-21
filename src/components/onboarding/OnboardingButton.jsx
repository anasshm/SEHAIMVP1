import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { styled } from 'nativewind';

const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledText = styled(Text);

const OnboardingButton = ({ title, onPress, style, textStyle, disabled }) => {
  return (
    <StyledTouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`py-3 px-6 bg-onboarding-button-bg rounded-onboarding-button-radius items-center justify-center ${
        disabled ? 'opacity-50' : ''
      }`}
      style={style} // Allows for additional inline styles or overrides if needed
    >
      <StyledText
        className="text-onboarding-button-text text-base font-semibold"
        style={textStyle}
      >
        {title}
      </StyledText>
    </StyledTouchableOpacity>
  );
};

export default OnboardingButton;
