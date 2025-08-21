import React from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { styled } from 'nativewind';
import OnboardingBackButton from './OnboardingBackButton';
import OnboardingProgressBar from './OnboardingProgressBar';
import OnboardingButton from './OnboardingButton';

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);

const OnboardingPageLayout = ({
  title,
  subtitle,
  progress, // 0 to 1
  onBackPress,
  children, // Main content for the page
  continueButtonText = 'Continue',
  onContinuePress,
  isContinueDisabled = false,
  hideContinueButton = false,
  headerRight
}) => {
  const footerHeightPadding = 120; // Approximate height needed for the footer with p-10

  return (
    <StyledSafeAreaView className="flex-1 bg-onboarding-page-bg">
      {/* Header */}
      <StyledView className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <OnboardingBackButton onPress={onBackPress} />
        {headerRight ? headerRight : <StyledView className="w-10" />}
      </StyledView>

      {/* Progress Bar */}
      {typeof progress === 'number' && (
        <StyledView className="px-6 mb-3"> 
          <OnboardingProgressBar progress={progress} />
        </StyledView>
      )}

      <StyledScrollView 
        className="flex-1 px-6"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: footerHeightPadding }} 
        keyboardShouldPersistTaps="handled"
      >
        {/* Title and Subtitle */}
        {title && (
          <StyledText className="text-3xl font-bold text-onboarding-text-primary mb-2">
            {title}
          </StyledText>
        )}
        {subtitle && (
          <StyledText className="text-lg text-onboarding-text-secondary mb-8">
            {subtitle}
          </StyledText>
        )}

        {/* Main Content Area */}
        <StyledView className="flex-1 mb-8">
          {children}
        </StyledView>
      </StyledScrollView>

      {/* Footer - Continue Button */}
      {!hideContinueButton && (
        <StyledView className="absolute bottom-0 left-0 right-0 p-10 bg-white border-t border-onboarding-progress-bg">
          <OnboardingButton
            title={continueButtonText}
            onPress={onContinuePress}
            disabled={isContinueDisabled}
          />
        </StyledView>
      )}
    </StyledSafeAreaView>
  );
};

export default OnboardingPageLayout;
