# SEHAI MVP1 - Food Tracking App

A React Native/Expo app for tracking food nutrition using AI-powered image analysis.

## Recent Updates

### January 2025
- **Google Authentication**: Complete Google Sign-In integration with Supabase
  - Resolved nonce validation issues between Google OAuth and Supabase
  - Simplified authentication flow for better reliability
  - Added proper Google Sign-In configuration for iOS client IDs
  - Fixed sign-out functionality with updated API compatibility
  - Replaced Apple Sign-In placeholders with working Google authentication
  - Authentication now works seamlessly in development and production builds

- **Navigation & UX Improvements**: Enhanced app startup and user flow
  - Fixed app startup to show proper landing page instead of jumping to onboarding
  - App now starts with "Calorie tracking made easy" landing page
  - Improved food analysis loading page with Seh AI branding
  - Removed gray divider and added company logo during analysis
  - Optimized logo positioning for compact, professional layout

- **Enhanced Arabic Localization**: Comprehensive Arabic language support
  - Added Arabic units in profile page: cm → سم, kg → كغ
  - Updated nutrition widgets to show جم instead of g in Arabic
  - Improved personal information section translation
  - Language-aware unit display throughout the app
  - Professional Arabic terminology in all user-facing text

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
- 📸 AI-powered food analysis via camera with Seh AI branding
- 🔍 Barcode scanning for packaged foods
- 📊 Nutrition tracking and daily goals with Arabic units (جم, سم, كغ)
- 🌐 Complete multi-language support (English & Arabic) with RTL
- 🔐 Secure authentication with Supabase & Google OAuth
- 📱 Native iOS and Android support with EAS Build
- 🎨 Professional branded loading experience during food analysis
- 🔄 Seamless user flow from landing page to dashboard

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
- `app/_layout.tsx` - Root navigation logic and authentication routing
- `app/(auth)/login.tsx` - Login page with Google Sign-In integration
- `app/(auth)/register.tsx` - Landing page with "Calorie tracking made easy" 
- `app/(onboarding)/save_progress.tsx` - Save progress page with Google authentication
- `app/(tabs)/profile.tsx` - Profile page with Arabic units (سم, كغ)
- `services/googleAuthService.ts` - Complete Google OAuth integration with Supabase
- `src/services/AuthContext.tsx` - Authentication context and state management
- `components/camera/AnalysisOverlay.tsx` - Food analysis with Seh AI branding
- `components/ProgressDisplayCard.tsx` - Nutrition widgets with Arabic units (جم)
- `locales/en.json` - English translations and units
- `locales/ar.json` - Arabic translations with native units
- `utils/i18n.ts` - Internationalization with RTL and unit localization

### Build & Configuration
- `eas.json` - EAS Build configuration for iOS/Android builds
- `app.config.js` - Expo app configuration with bundle identifiers
- `package.json` - Dependencies and pnpm configuration with onlyBuiltDependencies
- `pnpm-workspace.yaml` - pnpm workspace configuration
- `pnpm-lock.yaml` - Lockfile for reproducible builds
