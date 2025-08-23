import React from 'react';
import { View, Text } from 'react-native';
import { styled } from 'nativewind';
import { isRTL } from '@/utils/i18n';

interface FieldRowProps {
  label: string | React.ReactNode;
  value?: string | number | React.ReactNode; // Used if 'right' prop is not provided
  right?: React.ReactNode; // Custom component for the right side (e.g., a Switch)
  isLast?: boolean; // If true, bottom border will be omitted
}

const StyledView = styled(View);
const StyledText = styled(Text);

export const FieldRow: React.FC<FieldRowProps> = ({ label, value, right, isLast = false }) => {
  const hasCustomRightContent = right !== undefined;
  const isArabic = isRTL();

  return (
    <StyledView 
      // Apply bottom border only if there's no custom 'right' content
      className={`flex-row justify-between items-center h-12 ${(!hasCustomRightContent && !isLast) ? 'border-b border-[#E1E3E8]' : ''}`}
      style={{ flexDirection: isArabic ? 'row-reverse' : 'row' }}
    >
      {typeof label === 'string' ? (
        <StyledText 
          className="text-[15px] text-[#1D1923]"
          style={{ textAlign: isArabic ? 'right' : 'left' }}
        >
          {label}
        </StyledText>
      ) : (
        label
      )}
      {hasCustomRightContent ? right : (
        typeof value === 'string' || typeof value === 'number' ? (
          <StyledText 
            className="text-[15px] font-semibold text-[#1D1923]"
            style={{ textAlign: isArabic ? 'left' : 'right' }}
          >
            {String(value)}
          </StyledText>
        ) : (
          value
        )
      )}
    </StyledView>
  );
};
