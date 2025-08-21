import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';
import { I18nManager } from 'react-native';
import { format } from 'date-fns';
import { ar as arLocale, enUS as enLocale } from 'date-fns/locale';
import { Alert } from 'react-native';
import * as Updates from 'expo-updates';

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
console.log(`🌐 Initial RTL setup: locale=${i18n.locale}, shouldBeRTL=${shouldBeRTLInitially}, currentRTL=${I18nManager.isRTL}`);

if (shouldBeRTLInitially && !I18nManager.isRTL) {
  console.log('🔄 Forcing RTL to true for Arabic');
  I18nManager.forceRTL(true);
  // Note: App needs to restart for RTL changes to take effect
} else if (!shouldBeRTLInitially && I18nManager.isRTL) {
  console.log('🔄 Forcing RTL to false for non-Arabic');
  I18nManager.forceRTL(false);
  // Note: App needs to restart for RTL changes to take effect
} else {
  console.log('✅ RTL state is already correct');
}

// Helper function to change language
export const changeLanguage = (locale: string) => {
  i18n.locale = locale;
  
  // Handle RTL for Arabic
  const shouldBeRTL = locale === 'ar';
  if (shouldBeRTL !== I18nManager.isRTL) {
    I18nManager.forceRTL(shouldBeRTL);
    
    // Force app reload to apply RTL changes immediately
    console.log(`🔄 RTL state changed: forcing app reload for ${locale} (RTL: ${shouldBeRTL})`);
    
    // Show user notification and reload
    Alert.alert(
      locale === 'ar' ? 'تغيير اللغة' : 'Language Change',
      locale === 'ar' 
        ? 'سيتم إعادة تشغيل التطبيق لتطبيق التغييرات'
        : 'App will restart to apply language changes',
      [
        {
          text: locale === 'ar' ? 'موافق' : 'OK',
          onPress: () => {
            // Force immediate reload
            if (__DEV__) {
              // In development, reload immediately
              setTimeout(() => Updates.reloadAsync(), 100);
            } else {
              // In production, reload immediately
              Updates.reloadAsync();
            }
          }
        }
      ],
      { cancelable: false }
    );
  }
};

// Helper function to get current locale
export const getCurrentLocale = () => i18n.locale;

// Helper function to check if current locale is RTL
export const isRTL = () => i18n.locale === 'ar';

// Helper function to format dates based on current locale
export const formatDate = (date: Date, formatString: string) => {
  const locale = i18n.locale === 'ar' ? arLocale : enLocale;
  return format(date, formatString, { locale });
};

// Helper function to format time with localized AM/PM
export const formatTime = (date: Date) => {
  if (i18n.locale === 'ar') {
    // For Arabic, use 24-hour format or localized time
    return format(date, 'h:mm a', { locale: arLocale });
  }
  return format(date, 'h:mm a', { locale: enLocale });
};

// Helper function to format date and time for meal logging
export const formatMealDateTime = (date: Date) => {
  if (i18n.locale === 'ar') {
    // For Arabic: "في ٤:٠١ ص، ١٧ أغسطس" 
    return format(date, 'h:mm a، d MMMM', { locale: arLocale });
  }
  // For English: "4:01 AM, Aug 17"
  return format(date, 'h:mm a, MMM d', { locale: enLocale });
};

export default i18n; 