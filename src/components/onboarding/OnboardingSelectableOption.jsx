import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { styled } from 'nativewind';

const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledText = styled(Text);

const OnboardingSelectableOption = ({ label, onPress, isSelected, style, textStyle, icon }) => {
  const itemClasses = isSelected
    ? 'bg-onboarding-selected-bg border-onboarding-selected-bg'
    : 'bg-onboarding-unselected-bg border-onboarding-unselected-border';
  
  const textClasses = isSelected
    ? 'text-onboarding-selected-text'
    : 'text-onboarding-unselected-text';

  return (
    <StyledTouchableOpacity
      onPress={onPress}
      className={`py-4 px-4 my-2 border rounded-onboarding-card-radius items-center justify-center flex-row ${
        itemClasses
      }`}
      style={style}
    >
      {icon && <View className="mr-2">{icon}</View>}
      <StyledText className={`text-base font-medium ${textClasses}`} style={textStyle}>
        {label}
      </StyledText>
    </StyledTouchableOpacity>
  );
};

export default OnboardingSelectableOption;
