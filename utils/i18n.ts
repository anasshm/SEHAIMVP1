import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';
import { I18nManager } from 'react-native';

// Import translation files
import en from '../locales/en.json';
import ar from '../locales/ar.json';

// Create and configure i18n instance
const i18n = new I18n({
  en,
  ar,
});

// Set initial locale based on device settings
const deviceLocale = getLocales()[0].languageCode || 'en';
i18n.locale = deviceLocale;

// Enable fallback to English if translation is missing
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

// Configure RTL for Arabic
const shouldBeRTLInitially = i18n.locale === 'ar';
if (shouldBeRTLInitially && !I18nManager.isRTL) {
  I18nManager.forceRTL(true);
  // Note: App needs to restart for RTL changes to take effect
} else if (!shouldBeRTLInitially && I18nManager.isRTL) {
  I18nManager.forceRTL(false);
  // Note: App needs to restart for RTL changes to take effect
}

// Helper function to change language
export const changeLanguage = (locale: string) => {
  i18n.locale = locale;
  
  // Handle RTL for Arabic
  const shouldBeRTL = locale === 'ar';
  if (shouldBeRTL !== I18nManager.isRTL) {
    I18nManager.forceRTL(shouldBeRTL);
    // Note: You may want to show a restart prompt to the user
  }
};

// Helper function to get current locale
export const getCurrentLocale = () => i18n.locale;

// Helper function to check if current locale is RTL
export const isRTL = () => i18n.locale === 'ar';

export default i18n; 