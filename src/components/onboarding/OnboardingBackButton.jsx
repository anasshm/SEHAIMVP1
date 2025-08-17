import React from 'react';
import { TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import Ionicons from '@expo/vector-icons/Ionicons'; // Import Ionicons

const StyledTouchableOpacity = styled(TouchableOpacity);

// You would typically use an icon library here, e.g., from expo/vector-icons
// For now, a simple text arrow:
const OnboardingBackButton = ({ onPress, style }) => {
  return (
    <StyledTouchableOpacity onPress={onPress} className="p-2" style={style}>
      {/* Use Ionicon instead of text */}
      <Ionicons name="chevron-back-outline" size={28} color="#1F2937" />{/* text-onboarding-text-primary */}
    </StyledTouchableOpacity>
  );
};

export default OnboardingBackButton;
