import React from 'react';
import { View } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);

const OnboardingProgressBar = ({ progress, style }) => {
  // progress is a value between 0 and 1
  const clampedProgress = Math.max(0, Math.min(1, progress || 0));

  return (
    <StyledView className="w-full h-2 bg-onboarding-progress-unfilled rounded-full overflow-hidden" style={style}>
      <StyledView
        className="h-full bg-onboarding-progress-filled rounded-full"
        style={{ width: `${clampedProgress * 100}%` }}
      />
    </StyledView>
  );
};

export default OnboardingProgressBar;
