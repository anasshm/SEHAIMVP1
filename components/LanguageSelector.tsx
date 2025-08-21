import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert } from 'react-native';
import { changeLanguage, getCurrentLocale } from '@/utils/i18n';
import i18n from '@/utils/i18n';
import { palette } from '@/constants/Colors';

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

const languages: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
];

const LanguageSelector: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const currentLocale = getCurrentLocale();

  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0];

  const handleLanguageSelect = (languageCode: string) => {
    if (languageCode !== currentLocale) {
      changeLanguage(languageCode);
      setModalVisible(false);
      
      // Show restart notification
      Alert.alert(
        i18n.t('profile.language'),
        i18n.t('profile.languageDescription'),
        [{ text: 'OK' }]
      );
    } else {
      setModalVisible(false);
    }
  };

  return (
    <View>
      <TouchableOpacity 
        onPress={() => setModalVisible(true)}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 4,
        }}
      >
        <Text style={{ 
          fontSize: 15, 
          color: '#6E7685',
          textAlign: currentLocale === 'ar' ? 'right' : 'left'
        }}>
          {currentLanguage.nativeName}
        </Text>
        <Text style={{ 
          fontSize: 15, 
          color: '#6E7685',
          marginLeft: currentLocale === 'ar' ? 0 : 8,
          marginRight: currentLocale === 'ar' ? 8 : 0,
        }}>
          {currentLocale === 'ar' ? '←' : '→'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 20,
            margin: 20,
            width: '80%',
            maxWidth: 300,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              marginBottom: 20,
              textAlign: 'center',
              color: '#1D1923',
            }}>
              {i18n.t('profile.language')}
            </Text>
            
            {languages.map((language) => (
              <TouchableOpacity
                key={language.code}
                onPress={() => handleLanguageSelect(language.code)}
                style={{
                  paddingVertical: 15,
                  paddingHorizontal: 10,
                  borderRadius: 8,
                  marginBottom: 8,
                  backgroundColor: currentLocale === language.code ? palette.primary + '20' : 'transparent',
                  borderWidth: currentLocale === language.code ? 1 : 0,
                  borderColor: currentLocale === language.code ? palette.primary : 'transparent',
                }}
              >
                <Text style={{
                  fontSize: 16,
                  color: currentLocale === language.code ? palette.primary : '#1D1923',
                  fontWeight: currentLocale === language.code ? '600' : '400',
                  textAlign: 'center',
                }}>
                  {language.nativeName}
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{
                marginTop: 10,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: '#f5f5f5',
              }}
            >
              <Text style={{
                textAlign: 'center',
                color: '#666',
                fontSize: 16,
              }}>
                {currentLocale === 'ar' ? 'إلغاء' : 'Cancel'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default LanguageSelector; 