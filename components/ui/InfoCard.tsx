import React from 'react';
import { View, Text } from 'react-native';
import { styled } from 'nativewind';
import { isRTL } from '@/utils/i18n';

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
}

const StyledView = styled(View);
const StyledText = styled(Text);

export const InfoCard: React.FC<InfoCardProps> = ({ title, children }) => {
  const isArabic = isRTL();
  
  return (
    <StyledView className="bg-white rounded-[20px] shadow-md mb-6 p-4">
      <StyledText 
        className="text-lg font-semibold text-[#1D1923] mb-3"
        style={{ textAlign: isArabic ? 'right' : 'left' }}
      >
        {title}
      </StyledText>
      {children}
    </StyledView>
  );
};
