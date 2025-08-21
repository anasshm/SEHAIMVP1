import React from 'react';
import { AnimatedCircularProgress, CircularProgressProps } from 'react-native-circular-progress';
import { RING_PRESETS } from '@/utils/ringSizes';

interface ProgressRingProps extends Omit<CircularProgressProps, 'size' | 'width' | 'backgroundWidth'> {
  presetSize?: 'large' | 'small';
  // fill is already part of CircularProgressProps
  // tintColor is already part of CircularProgressProps
}

const ProgressRing: React.FC<ProgressRingProps> = ({ presetSize = 'large', ...rest }) => {
  const diameter = RING_PRESETS[presetSize];
  const ringWidth = presetSize === 'small' ? 6 : 8;

  return (
    <AnimatedCircularProgress
      size={diameter}
      width={ringWidth}
      backgroundWidth={ringWidth} // Assuming backgroundWidth should match width
      rotation={0} // Changed from -90 to 0
      {...rest}
    />
  );
};

export default ProgressRing;
