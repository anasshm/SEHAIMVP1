import { palette } from '@/constants/Colors';

export const neumorphicLayerStyle = {
  backgroundColor: palette.surface,
  borderRadius: 20,
  shadowColor: '#00000022',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.07,
  shadowRadius: 12,
  elevation: 4, // Android
};
