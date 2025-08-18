# SEHAI MVP1 - Food Tracking App

A React Native/Expo app for tracking food nutrition using AI-powered image analysis.

## Recent Updates

### December 2024
- **Arabic Localization**: Full Arabic support added throughout the app
  - Plan results page now fully translated
  - Dynamic language switching with LanguageSwitcher component
  - RTL layout support for Arabic UI
  - Nutrition briefs generated in Arabic when language is set to Arabic
- **Enhanced UX**: 
  - Haptic feedback added to all authentication buttons
  - Cleaner plan results UI (removed redundant labels)
  - Improved Arabic text flow and terminology

### Features
- 📸 AI-powered food analysis via camera
- 🔍 Barcode scanning for packaged foods
- 📊 Nutrition tracking and daily goals
- 🌐 Multi-language support (English & Arabic)
- 🔐 Secure authentication with Supabase
- 📱 Native iOS and Android support

## Tech Stack
- React Native / Expo
- TypeScript
- NativeWind (TailwindCSS)
- Supabase (Auth & Database)
- OpenAI Vision API
- i18n-js (Internationalization)

## File Directory

- `app/(auth)/register.tsx` - Registration screen with haptic feedback on all buttons
- `app/(onboarding)/plan_results.tsx` - Nutrition plan results with Arabic support
- `locales/en.json` - English translations
- `locales/ar.json` - Arabic translations
- `src/services/NutritionService.ts` - AI nutrition recommendations with Arabic brief generation
- `utils/i18n.ts` - Internationalization configuration with RTL support
- `components/LanguageSwitcher.tsx` - Language toggle component
