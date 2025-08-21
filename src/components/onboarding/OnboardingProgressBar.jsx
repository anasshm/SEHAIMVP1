import React from 'react';
import { View } from 'react-native';
import { styled } from 'nativewind';
import { isRTL } from '@/utils/i18n';

const StyledView = styled(View);

const OnboardingProgressBar = ({ progress, style }) => {
  // progress is a value between 0 and 1
  const clampedProgress = Math.max(0, Math.min(1, progress || 0));
  
  // For RTL support
  const containerStyle = isRTL() ? { flexDirection: 'row-reverse' } : {};

  return (
    <StyledView 
      className="w-full h-2 bg-onboarding-progress-unfilled rounded-full overflow-hidden" 
      style={[containerStyle, style]}
    >
      <StyledView
        className="h-full bg-onboarding-progress-filled rounded-full"
        style={{ width: `${clampedProgress * 100}%` }}
      />
    </StyledView>
  );
};

export default OnboardingProgressBar;
