import { DimensionValue } from 'react-native'; 

export const RING_PRESETS = {
  large: 120,   // calories card
  small: 70,    // macro cards
};

interface CardPresetValue {
  width: DimensionValue; 
  height: number;
}

export const CARD_PRESETS: {
  large: CardPresetValue;
  small: CardPresetValue;
} = {
  large: { width: '100%', height: 200 }, 
  small: { width: 110, height: 150 },    
};
