/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const palette = {
  background: '#F9F9FB',
  surface:    '#FFFFFF',
  primary:    '#1D1923', // text & active nav
  accent:     '#1C1A23',   // New black accent, similar to primary
  protein:    '#E24D43',
  carbs:      '#D1A46F',
  fats:       '#F6C45F',
  inactive:   '#6E7685',   // Darker grey for inactive text/icons, subtitles, borders
  error:      '#D32F2F',      // Red for error messages
};
