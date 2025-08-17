import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { changeLanguage, getCurrentLocale } from '@/utils/i18n';
import { palette } from '@/constants/Colors';

const LanguageSwitcher: React.FC = () => {
  const currentLocale = getCurrentLocale();

  const toggleLanguage = () => {
    const newLocale = currentLocale === 'en' ? 'ar' : 'en';
    changeLanguage(newLocale);
    // Note: User will need to restart the app for RTL changes to take effect
  };

  return (
    <View style={{ alignItems: 'center', marginVertical: 16 }}>
      <TouchableOpacity
        onPress={toggleLanguage}
        style={{
          backgroundColor: palette.primary,
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: 'white', fontWeight: '600' }}>
          {currentLocale === 'en' ? 'عربي' : 'English'} 
        </Text>
      </TouchableOpacity>
      <Text style={{ color: palette.inactive, fontSize: 12, marginTop: 4 }}>
        Restart app for full RTL support
      </Text>
    </View>
  );
};

export default LanguageSwitcher; 