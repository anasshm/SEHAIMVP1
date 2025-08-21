# SEHAI MVP1 - Food Tracking App

A React Native/Expo app for tracking food nutrition using AI-powered image analysis.

## Recent Updates

### January 2025
- **Google Authentication**: Fixed Google Sign-In integration with Supabase
  - Resolved nonce validation issues between Google OAuth and Supabase
  - Simplified authentication flow for better reliability
  - Added proper Google Sign-In configuration for iOS client IDs
  - Authentication now works seamlessly in development builds

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
- 🔐 Secure authentication with Supabase & Google OAuth
- 📱 Native iOS and Android support

## Tech Stack
- React Native / Expo
- TypeScript
- NativeWind (TailwindCSS)
- Supabase (Auth & Database)
- OpenAI Vision API
- i18n-js (Internationalization)

## Development Setup

### EAS Build Configuration
This project is configured with EAS Build for iOS development and testing on physical devices.

#### Prerequisites
- Expo CLI and EAS CLI installed globally
- Apple Developer account with valid certificates
- iPhone registered for development

#### Build Profiles
- **development**: For testing on registered devices with development client
- **preview**: Internal distribution builds  
- **production**: App Store release builds

#### Building for iPhone
```bash
# Build development version for testing
eas build --platform ios --profile development

# Build preview version
eas build --platform ios --profile preview
```

#### Development Workflow
```bash
# Start development server
npx expo start

# Install new dependencies safely
pnpm install

# Add package that needs build scripts
pnpm add --allow-build=package-name
```

### Package Management (pnpm)
This project uses pnpm with enhanced security via `onlyBuiltDependencies`:

```json
{
  "pnpm": {
    "onlyBuiltDependencies": [
      "react-native-elements",
      "unrs-resolver"
    ]
  }
}
```

**Benefits:**
- 🛡️ Prevents build failures from surprise install scripts
- 🎯 Only whitelisted packages can run install/postinstall scripts
- 🔒 Safer EAS cloud builds by blocking unknown scripts

**Adding New Dependencies:**
- Most packages: `pnpm add package-name` (scripts blocked by default)
- Packages needing scripts: `pnpm add --allow-build=package-name`
- Or manually add to `onlyBuiltDependencies` array in package.json

### Environment Variables
The app requires these environment variables for full functionality:

- `EXPO_PUBLIC_OPENAI_API_KEY` - OpenAI API key for food analysis
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL  
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` - Google OAuth web client
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` - Google OAuth iOS client

For EAS builds, set sensitive variables via:
```bash
# Required: Set OpenAI API key as EAS secret (not in eas.json for security)
eas secret:create --name EXPO_PUBLIC_OPENAI_API_KEY --value your_key_here

# Other secrets can also be set this way for production
eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value your_key_here
```

## File Directory

### Core App Files
- `app/(auth)/register.tsx` - Registration screen with haptic feedback on all buttons
- `app/(onboarding)/plan_results.tsx` - Nutrition plan results with Arabic support
- `services/googleAuthService.ts` - Google OAuth integration with Supabase
- `src/services/AuthContext.tsx` - Authentication context and state management
- `locales/en.json` - English translations
- `locales/ar.json` - Arabic translations
- `src/services/NutritionService.ts` - AI nutrition recommendations with Arabic brief generation
- `utils/i18n.ts` - Internationalization configuration with RTL support
- `components/LanguageSwitcher.tsx` - Language toggle component

### Build & Configuration
- `eas.json` - EAS Build configuration for iOS/Android builds
- `app.config.js` - Expo app configuration with bundle identifiers
- `package.json` - Dependencies and pnpm configuration with onlyBuiltDependencies
- `pnpm-workspace.yaml` - pnpm workspace configuration
- `pnpm-lock.yaml` - Lockfile for reproducible builds
