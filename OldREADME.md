# Seh AI - AI Powered Nutrition Tracker

## Overview

Seh AI is a mobile application built with Expo React Native that allows users to track their nutritional intake by simply taking a picture of their food. The app leverages AI (OpenAI Vision API) to analyze food images and provide detailed nutritional information (calories, protein, carbs, fat). This data, along with a food diary, is stored using Supabase as the backend.

## Development Status

This project is under active development. A Git repository has been initialized to track changes.

Recent focus areas include:
*   Refining the user onboarding and authentication flow, particularly the logic for when core features are unlocked (`isOnboardingComplete` flag).
*   Enhancing UI consistency and user experience across screens (e.g., onboarding selection styles, dashboard layout).
*   Improving interactions with the Supabase backend (authentication error handling, meal data storage, offline synchronization).

## Core Features

*   **AI-Powered Food Logging:** Capture or select a food image, or scan a product's barcode. The app uses OpenAI Vision for image analysis to identify food and estimate its nutritional content. Barcode scanning provides quick input (product database integration is a future step). The analysis results are displayed in a redesigned overlay featuring a prominent calories card, color-coded macro nutrient cards with icons, and detailed food descriptions for enhanced user experience.
*   **AI-Powered Nutrition Recommendations:** Utilizes OpenAI (GPT-4o-mini) to provide personalized daily nutrition targets (calories, protein, carbs, fats) and a motivational rationale based on user's onboarding data (age, gender, height, weight, activity level, goals). This is handled by `src/services/NutritionService.ts`.
*   **User Onboarding & Authentication Flow:**
    *   A comprehensive multi-step process (`app/(onboarding)/`) gathers user health details (height, weight, age, gender, activity level, dietary goals, obstacles).
    *   After data collection, the user is presented with a paywall (`app/(onboarding)/paywall.tsx`).
    *   Successful navigation past the paywall (e.g., via an access code) directs the user to a registration form (`app/(auth)/register-form.tsx`).
    *   Users create an account with their actual email and password. Upon successful registration:
        *   The `isOnboardingComplete` flag in `OnboardingContext` is set to `true`. **Crucially, this happens *after* registration (and by extension, after the paywall) to ensure that features requiring both collected data and successful access/payment (like the AI Nutrition Plan) are correctly gated.**
        *   The user is then navigated to the main application dashboard (`app/(tabs)/`).
*   **Supabase Integration:**
    *   **Authentication:** Secure user sign-up and login. Login error handling has been refined to present user-friendly messages (e.g., for 'Email not confirmed' or 'Invalid credentials') via `Alert`s, avoiding exposure of raw API errors.
    *   **Database:** Stores user profiles, meal logs (including detailed nutritional breakdowns like calories and macros), and other application data.
    *   **Storage:** Saves thumbnails of logged meal images.
*   **Dashboard & Meal History:** Users can view a summary of their daily nutritional intake and browse their history of logged meals. Several UI enhancements have been implemented on the dashboard (`app/(tabs)/index.tsx`):
    *   **"Recently Eaten" Section (`components/RecentMealCard.tsx`):
        *   Nutrient icon colors were updated for consistency with dashboard widgets.
        *   Nutrient value display was refined through iterative adjustments to icon sizes, text sizes, and fixed-width containers to ensure consistent alignment of all icons, irrespective of the numeric values.
        *   Calorie display was streamlined to show only the numeric value (e.g., "110"), while other macronutrients (protein, carbs, fat) retain their 'g' unit (e.g., "30g").
    *   **"Your Daily Targets" Section (`components/NutritionProgressSection.tsx`):
        *   The shadow effect on the main card was increased for better visual separation from the background.
        *   Vertical padding around the "Your Daily Targets" heading was adjusted for improved spacing and visual balance.
*   **Offline Meal Logging:** Meals can be logged even when the device is offline. Data is queued locally using `AsyncStorage` and synced to Supabase when connectivity is restored (primarily via `mealService.ts`).

## App Configuration

**Bundle Identifier:** `sehai.createvalue.app`
**App Scheme:** `sehai.createvalue.app`
**App Name:** `Seh AI` (Internal: `foodnsap`)

### Platform-Specific Settings:
- **iOS Bundle Identifier:** `sehai.createvalue.app`
- **Android Package Name:** `sehai.createvalue.app`
- **Deep Link Scheme:** `sehai.createvalue.app://`
- **OAuth Redirect URI:** `sehai.createvalue.app://auth/callback`

## Tech Stack

*   **Frontend:**
    *   Expo React Native
    *   Expo Router (for navigation)
    *   NativeWind (TailwindCSS for React Native styling)
    *   React Context (for state management like `OnboardingContext`, `AuthContext`)
*   **Backend:**
    *   Supabase (Database, Authentication, Storage)
*   **Artificial Intelligence:**
    *   OpenAI API (GPT-4o for vision-based food analysis, GPT-4o-mini for personalized nutrition recommendations)
*   **Local Storage:**
    *   `@react-native-async-storage/async-storage` (for onboarding data and offline queue)

## Project Structure Highlights

```
├── app/                     # Main application code (Expo Router)
│   ├── (auth)/              # Authentication screens (login, register)
│   ├── (onboarding)/        # Multi-step onboarding flow screens
│   │   ├── _layout.tsx      # Tab navigator configuration
│   │   ├── camera.tsx       # Camera & image selection for food logging
│   │   ├── history.tsx      # Meal history screen
│   │   ├── index.tsx        # Dashboard screen
│   │   └── profile.tsx      # User profile screen
│   ├── _layout.tsx          # Root layout navigator
│   └── OnboardingContext.tsx # Context for managing onboarding state
├── components/              # Reusable UI components
│   ├── camera/              # Camera specific UI (Overlay, Controls)
│   └── ui/                  # General UI elements (IconSymbol, etc.)
├── services/                # Core logic for backend interactions & utilities
│   ├── aiVisionService.ts   # Handles OpenAI API calls for image analysis
│   ├── authUtils.ts       # Supabase authentication helper functions
│   ├── db.ts                # Supabase client initialization
│   ├── mealService.ts       # Manages meal data interactions with Supabase, including meal saving and image thumbnail uploads.
│   └── NutritionService.ts  # Generates AI-powered personalized nutrition recommendations
├── store/                   # Application state management (e.g., offline queue)
│   └── offlineQueue.ts    # Logic for queueing actions when offline
├── models/                  # TypeScript interfaces for data structures
│   └── meal.ts              # Defines Meal and MealInput types
├── assets/                  # Static assets (images, fonts)
├── constants/               # App constants (e.g., Colors)
├── hooks/                   # Custom React hooks (e.g., useColorScheme)
├── .env.example             # Example environment variables file
└── package.json             # Project dependencies and scripts
```

## File Directory

- `TabLayout` — `app/(tabs)/_layout.tsx`: Configures the main bottom tab navigator.
- `RootStackLayout` — `app/_layout.tsx`: Defines the root stack navigator and app structure.
- `CameraScreen` — `app/(tabs)/camera.tsx`: Handles camera functionality, image selection, and barcode scanning with a manual toggle.
- `CameraControls` — `src/components/camera/CameraControls.tsx`: Provides UI controls for the camera screen, including capture, flash, gallery access, and barcode scanning toggle.
- `CameraOverlay` — `src/components/camera/CameraOverlay.tsx`: Displays instructional text, camera guides, and a visual indicator for barcode scanning mode.
- `AnalysisOverlay` — `components/camera/AnalysisOverlay.tsx`: Full-screen overlay component for displaying food analysis progress and results with redesigned nutrition layout featuring large calories card, macro nutrient cards with icons, and integrated food descriptions.
- `AnalysisProgress` — `components/camera/AnalysisProgress.tsx`: Circular progress indicator with animations for displaying analysis progress and stage information.
- `CustomTabBar` — `components/navigation/CustomTabBar.tsx`: Renders the custom bottom tab bar.
- `DashboardScreen` — `app/(tabs)/index.tsx`: Main user dashboard, displays nutritional summaries, daily targets, and recently logged meals with a "Load More" feature.
- `ResultsScreen` — `app/results/index.tsx`: Displays food analysis (from AI or barcode scan), handles meal saving (including thumbnail processing), and manages post-analysis user navigation.
- `AppColors` — `constants/Colors.ts`: Defines the application's color palette.
- `TailwindCSSConfig` — `tailwind.config.js`: Configures Tailwind CSS for styling.
- `AppConfig` — `app.config.js`: Expo app configuration including bundle identifier (sehai.createvalue.app), OAuth schemes, and platform settings.
- `ProjectReadme` — `README.md`: Main project documentation and overview file.
- `FoodAnalysisCard` — `components/food/FoodAnalysisCard.tsx`: Displays detailed AI-driven food analysis results.
- `ProfileScreen` — `app/(tabs)/profile.tsx`: User profile and application settings screen.
- `InfoCard` — `components/ui/InfoCard.tsx`: Reusable card component for displaying titled sections of information.
- `FieldRow` — `components/ui/FieldRow.tsx`: Displays a label and value/custom component in a row, with an optional bottom border.
- `productLookupService` — `services/productLookupService.ts`: Fetches product nutritional information from Open Food Facts API using a barcode.
- `aiVisionService` — `services/aiVisionService.ts`: Handles OpenAI Vision API calls for food image analysis.
- `ResultsLayout` — `app/results/_layout.tsx`: Configures the stack navigator for the results screen.
- `LoginScreen` — `app/(auth)/login.tsx`: Handles user login with email/password and Google OAuth authentication.
- `GoogleAuthService` — `src/services/googleAuth.ts`: Handles Google OAuth authentication flow with Supabase integration.
- `OAuthCallbackScreen` — `app/(auth)/callback.tsx`: Handles OAuth redirect callbacks and completes authentication flow.
- `EnvExample` — `env.example`: Environment variables template documenting required Google OAuth and API credentials.

- `OnboardingContext` — `app/OnboardingContext.tsx`: Manages state and data for the multi-step user onboarding process.
- `StepHeightWeightScreen` — `app/(onboarding)/step_height_weight.tsx`: Captures user's height and weight during onboarding.
- `StepExperienceScreen` — `app/(onboarding)/step2_experience.tsx`: Asks user about their fitness experience level during onboarding.
- `StepSourceScreen` — `app/(onboarding)/step3_source.tsx`: Asks user how they heard about the app during onboarding.
- `StepWorkoutsScreen` — `app/(onboarding)/step4_workouts.tsx`: Asks user about their workout frequency during onboarding.
- `StepGenderScreen` — `app/(onboarding)/step5_gender.tsx`: Captures user's gender during onboarding.
- `StepGoalScreen` — `app/(onboarding)/step6_goal.tsx`: Asks user about their primary fitness goal during onboarding.
- `StepActivityLevelScreen` — `app/(onboarding)/step_activity_level.tsx`: Asks user about their general activity level during onboarding.
- `StepDietScreen` — `app/(onboarding)/step7_diet.tsx`: Asks user if they follow a specific diet during onboarding.
- `RecentMealCard` — `components/RecentMealCard.tsx`: Displays a single recently eaten meal with its nutritional information.
- `SkeletonCard` — `components/skeleton/SkeletonCard.tsx`: Base skeleton component with animated shimmer effect for loading states.
- `SkeletonText` — `components/skeleton/SkeletonText.tsx`: Skeleton component for text lines with configurable width and multiple line support.
- `TitleSkeleton` — `components/skeleton/TitleSkeleton.tsx`: Skeleton component specifically for food name/title areas.
- `NutritionCardSkeleton` — `components/skeleton/NutritionCardSkeleton.tsx`: Skeleton component that exactly matches nutrition card layout (calories + macro cards).
- `DescriptionSkeleton` — `components/skeleton/DescriptionSkeleton.tsx`: Skeleton component for the description section with multiple text lines and toggle button.
- `SkeletonComponents` — `components/skeleton/index.ts`: Export index for all skeleton loading components.

## Data Flow: AI Food Logging

1.  **Capture/Select Image:** User accesses the "Camera" tab (`app/(tabs)/camera.tsx`) and either takes a new photo or selects one from their device's gallery.
2.  **AI Analysis Request:** The image URI is passed to `services/aiVisionService.ts`.
3.  **OpenAI Vision API Call:** `aiVisionService.ts` sends the image to the OpenAI API (GPT-4o model).
4.  **Receive Nutritional Data:** OpenAI returns a structured JSON response containing the identified food name, a description, and estimated nutritional values (calories, protein, carbs, fat).
5.  **Save to Supabase & Local Cache:** 
    *   Meal details are saved to the `meals` table in Supabase via `services/mealService.ts`.
    *   A thumbnail is uploaded to Supabase Storage.
    *   Meal data is also cached locally (e.g., using `AsyncStorage` or a state management solution) to provide immediate UI updates and offline access, managed through `services/mealService.ts` which uses `store/offlineQueue.ts` for offline actions.
6.  **Display to User:** The newly logged meal appears in the user's history and contributes to their daily nutritional summary on the Dashboard.

## Onboarding and Initial Setup Flow

1.  **Data Collection (`app/(onboarding)/step*_*.tsx`):** The user proceeds through a series of screens to input personal data (height, weight, age, gender, activity level, dietary goals, obstacles).
2.  **Paywall (`app/(onboarding)/paywall.tsx`):** After completing data input in `step9_obstacles.tsx`, the user is directed to a paywall screen. (Currently bypassed with an access code for development).
3.  **Registration (`app/(auth)/register-form.tsx`):** Upon successful paywall completion, the user is navigated to the registration form to create an account using their email and password via Supabase.
4.  **Onboarding Completion & Dashboard Access:** After successful registration:
    *   The `setIsOnboardingComplete(true)` function from `OnboardingContext` is called within the registration success logic. As noted earlier, this timing is critical for ensuring features are unlocked only after the full onboarding (data + paywall + registration) is complete.
    *   The user is then redirected to the main application dashboard (`app/(tabs)/`).
5.  **Login (`app/(auth)/login.tsx`):** Existing users can log in. If a user attempts to log in with an unconfirmed email (when Supabase email confirmation is enabled), a user-friendly alert is displayed.

## Environment Variables

To run the application, you'll need to set up environment variables. Create a `.env` file in the project root (or configure them via `app.config.js`/`app.json` if using Expo's build services) with the following:

```
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration  
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key

# Google OAuth Configuration (required for Google Sign-In via Supabase)
# Only the Web Client ID is needed for Supabase OAuth
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_web_client_id
```

Replace the placeholder values with your actual credentials.

### Google OAuth Setup

1. **Google Cloud Console Setup:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create/select your project
   - Enable Google+ API
   - Go to APIs & Services > Credentials
   - Create OAuth 2.0 Client ID for **Web application**
   - Add authorized redirect URIs: `https://[your-supabase-ref].supabase.co/auth/v1/callback`
   - **Configure OAuth Consent Screen**: Set app name to `Seh AI` for proper branding
   - Note down the Web Client ID and Secret

2. **Supabase Configuration:**
   - Go to Supabase Dashboard > Authentication > Providers
   - Enable Google provider
   - Add your Google Client ID and Secret (from web application)
   - Set redirect URL to: `foodnsap://auth/callback`

3. **App Configuration:**
   - Add the Google Web Client ID to your `.env` file
   - The app uses Supabase OAuth with WebBrowser for cross-platform compatibility

## Offline Functionality

The application supports offline meal logging. If the device is offline when a user attempts to save a meal:

*   **`services/mealService.ts`**: Queues the meal data (including name, image URL, and all nutritional information like calories and macros) into `AsyncStorage` using the mechanisms in `store/offlineQueue.ts`.
*   **Syncing:** The exact trigger and mechanism for flushing this `AsyncStorage` queue from `mealService.ts` to Supabase upon reconnection should be verified and ensured for robustness. (The `services/nutritionService.ts` file contains a separate `flushOffline` mechanism for different action types, but its current usage and trigger are unclear and it does not appear to be called from the JS/TS codebase).

## Areas for Review & Potential Future Work

*   **Firebase Dependencies:** Firebase dependencies (`@react-native-firebase/app`, etc.) were previously included but found to be unused and have now been removed from the project.
*   **Offline Sync Robustness:** Ensure the trigger mechanism for syncing the main offline meal queue (from `mealService.ts` via `store/offlineQueue.ts`) is robust and handles various network state changes effectively.

## Development Log

**2025-01-XX: AnalysisOverlay Nutrition Layout Redesign**

**Objective:** Redesign the nutrition display in the food analysis overlay to match the app's design system with a more compact, visually appealing layout that includes proper iconography and makes room for food descriptions.

**Key Changes:**

*   **New Layout Structure (`components/camera/AnalysisOverlay.tsx`):**
    *   Replaced the previous 2x2 grid layout with a hierarchical design:
        *   Large prominent calories card with fire icon spanning full width
        *   Row of three smaller macro cards (protein, carbs, fat) with proper icons
        *   Food description section below nutrition cards
    *   Added proper rounded corners at the 40/60 split line with image bleeding behind for seamless visual integration
*   **Icon Integration & Color Consistency:**
    *   Added `MaterialCommunityIcons` and `FontAwesome5` support with proper icon mapping
    *   Implemented consistent color scheme matching `RecentMealCard.tsx`:
        *   Calories: Fire icon with `palette.accent` (#1C1A23)
        *   Protein: Drumstick icon with `palette.protein` (#E24D43)
        *   Carbs: Barley icon with `palette.carbs` (#D1A46F)
        *   Fat: Tint icon with `palette.fats` (#F6C45F)
*   **Compact Typography & Spacing:**
    *   Reduced font sizes and spacing throughout to accommodate new sections
    *   Implemented separate styling for large calories card vs smaller macro cards
    *   Added responsive behavior for different screen sizes
*   **Food Description Integration:**
    *   Added dedicated section for AI-generated food descriptions using existing `analysisResults.description` field
    *   Positioned between nutrition cards and action buttons with proper spacing and subtle styling
*   **Data Display Improvements:**
    *   Removed decimal places from macro nutrient values (e.g., "24g" instead of "24.5g")
    *   Maintained calories as primary metric with largest visual prominence
*   **Layout System Enhancements:**
    *   Restructured `calculateLayout` function with new nutrition-specific configurations
    *   Added proper spacing calculations and responsive breakpoints
    *   Optimized flex layouts for consistent positioning across devices

**Impact:** The analysis overlay now provides a much more polished, consistent user experience that matches the app's design system while maintaining all functionality. The new layout is more compact, visually appealing, and informative.

**Files Primarily Affected:**

*   `components/camera/AnalysisOverlay.tsx`: Complete layout redesign with new styling system
*   Icon libraries integration for consistent visual language
*   Responsive design improvements for various screen sizes

**2025-05-19: "Load More" for Recent Meals & Refresh Investigation**

**Objective:** Enhance user experience on the dashboard by paginating the "Recently logged" meals list and ensure smooth data refresh after adding new meals.

**Key Changes:**

*   **Dashboard Screen (`app/(tabs)/index.tsx`):**
    *   Implemented a "Load More" functionality for the "Recently logged" meals section.
        *   Introduced state variables (`allFetchedRecentMeals`, `displayedRecentMeals`, `recentMealsCurrentPage`, `recentMealsPageSize`, `canLoadMoreRecentMeals`, `dataLoadedInitially`) to manage pagination.
        *   Modified `fetchAllData` to sort all fetched recent meals and set up the initial paginated view.
        *   Added `handleLoadMoreRecentMeals` function to append the next set of meals to `displayedRecentMeals`.
        *   Added a "Load More" button (`TouchableOpacity`) that appears conditionally and triggers `handleLoadMoreRecentMeals`.
        *   Updated styles for the new button and related text elements, ensuring consistency with the app's color palette.
    *   Investigated the existing data refresh mechanism triggered by `refreshTimestamp` when navigating back from meal saving.
        *   Confirmed that `app/results/index.tsx` correctly sends a `refreshTimestamp` when navigating to the dashboard after saving a meal via the `insert_meal` RPC.
        *   Discussed potential visual improvements for the loading state during these refreshes to prevent jarring full-screen overlays.

**Files Primarily Affected:**

*   `app/(tabs)/index.tsx`
*   `app/results/index.tsx` (Reviewed for navigation logic)
*   `services/mealService.ts` (Reviewed for meal saving logic)

**2025-05-19: Page Transition and Login Loading Improvements**

**Objective:** Enhance page transition smoothness and investigate loading indicators for a more polished user experience.

**Key Changes:**

*   **Root Navigator Animation (`app/_layout.tsx`):**
    *   Modified the default `screenOptions` for the root `Stack` navigator to use `animation: 'fade'`. This aims to provide a smoother visual transition between screens.
    *   Initially considered `detachPreviousScreen: false` but removed it due to TypeScript errors indicating it's not a supported option for the default native stack navigator used by Expo Router.
*   **Login Screen Loading State (`app/(auth)/login.tsx`):**
    *   Investigated the loading indicator on the "Log In" button.
    *   Confirmed that the button correctly uses a text change (e.g., "Logging in...") and a `disabled` state during asynchronous operations, without employing a separate spinner/ActivityIndicator component. This addresses concerns about a potentially redundant or clunky spinner on the button itself.

**Files Primarily Affected:**

*   `app/_layout.tsx`
*   `app/(auth)/login.tsx` (Reviewed)


**2025-05-19: Thumbnail Upload Fix & Navigation Logic**

**Objective:** Resolve persistent issues with camera/gallery image thumbnails not uploading correctly due to invalid or temporary image URIs.

**Key Changes:**

*   **Persistent URI Handling (`app/(tabs)/camera.tsx`):**
    *   Refactored `processAndAnalyzeImage` to robustly copy captured/selected images to a persistent local URI (`newUri`) *before* any further processing or navigation.
    *   Ensured this `newUri` is consistently passed as `imageUri` to the `/results` screen.
    *   Consolidated navigation logic to prevent multiple or incorrect `router.push` calls that could lead to URI mismatches.
    *   Corrected calls to `processAndAnalyzeImage` from `handleTakePicture`, `handleGalleryOpen`, and `takePicture` to explicitly pass parameters, resolving TypeScript type errors and ensuring the correct photo object structure is used.
*   **Enhanced Logging (`app/results/index.tsx`, `services/mealService.ts`):**
    *   Added detailed logging in `app/results/index.tsx` to track `imageUri` reception and usage.
    *   Implemented extensive, distinct logging points within `uploadThumbnail` in `services/mealService.ts` to trace the URI through manipulation, file system reading, and Supabase upload stages.
*   **Bug Fix (`services/mealService.ts`):**
    *   Corrected a previously corrupted function signature for `uploadThumbnail`.

**Impact:** These changes ensure a valid, persistent image URI is used for thumbnail generation, which should lead to successful uploads and resolve the "No image available for thumbnail" errors.

**Files Primarily Affected:**

*   `app/(tabs)/camera.tsx`
*   `app/results/index.tsx`
*   `services/mealService.ts`

**2025-01-11: Google Authentication Implementation**

**Objective:** Implement comprehensive Google OAuth authentication to complement the existing email/password system, enabling users to sign in with their Google accounts seamlessly.

**Implementation Approach:**

*   **Technology Choice:** Initially attempted React Native Google Sign-In (`@react-native-google-signin/google-signin`) but encountered native module compatibility issues with Expo managed workflow. **Migrated to Expo AuthSession with Supabase OAuth** for better cross-platform compatibility and reduced complexity.

**Key Changes:**

*   **Google Authentication Service (`src/services/googleAuth.ts`):**
    *   Implemented `signInWithGoogle()` using Supabase's built-in OAuth with WebBrowser for authentication flow
    *   Added proper error handling for user cancellation, network issues, and OAuth failures
    *   Integrated with existing Supabase authentication system for seamless user session management
    *   Simplified approach removes need for platform-specific client IDs (only Web Client ID required)

*   **AuthContext Integration (`src/services/AuthContext.tsx`):**
    *   Extended AuthContext with `signInWithGoogle` method and `isGoogleLoading` state
    *   Added Google sign-in configuration on app startup
    *   Enhanced sign-out to properly handle Google OAuth sessions
    *   Maintained backward compatibility with existing email/password authentication

*   **UI Implementation (`app/(auth)/login.tsx`, `app/(auth)/register.tsx`):**
    *   Replaced "Coming Soon" alerts with functional Google authentication
    *   Added proper loading states ("Signing in...") during OAuth process
    *   Implemented comprehensive error handling with user-friendly messages
    *   Maintained consistent UI/UX with existing authentication flows

*   **Deep Link Configuration (`app.config.js`, `app/(auth)/callback.tsx`):**
    *   Added `foodnsap://` URL scheme for OAuth redirects
    *   Created callback screen for handling OAuth returns with proper loading UI
    *   Configured linking for seamless authentication flow

*   **Dependency Management:**
    *   Removed `@react-native-google-signin/google-signin` package
    *   Utilized existing `expo-auth-session` and `expo-web-browser` packages
    *   Added `expo-crypto` for secure state generation in OAuth flow

**Configuration Requirements:**

*   **Simplified Setup:** Only requires Google Web Client ID (no longer needs iOS/Android specific IDs)
*   **Supabase Integration:** OAuth flow handled entirely through Supabase with `foodnsap://auth/callback` redirect
*   **Environment Variables:** Updated to require only `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`

**Impact:** Users can now authenticate using Google accounts with a streamlined, cross-platform compatible implementation. The OAuth flow integrates seamlessly with existing Supabase authentication, maintaining session consistency across the app.

**Files Created:**
*   `src/services/googleAuth.ts` - Google authentication service
*   `app/(auth)/callback.tsx` - OAuth redirect handler
*   `env.example` - Environment variable template

**Files Modified:**
*   `src/services/AuthContext.tsx` - Google auth integration  
*   `app/(auth)/login.tsx` - Google sign-in UI
*   `app/(auth)/register.tsx` - Google sign-in UI
*   `app.config.js` - Deep link configuration
*   `README.md` - Updated setup instructions

**Next Steps:** 
1. Configure Google Cloud Console with Web OAuth 2.0 Client ID
2. Set up Supabase Google provider with proper redirect URL
3. Add environment variable with Google Client ID
4. Test authentication flow in development environment

**2025-05-19: Camera UI/UX Enhancements**

**Objective:** Improve the camera screen's user interface and experience by adjusting layout, spacing, element styling, and control positioning.

**Key Changes:**

*   **Safe Area and Layout Adjustments (`app/(tabs)/camera.tsx`):**
    *   Ensured camera preview respects bottom safe area and does not overlap with `CameraControls` by adding dynamic `paddingBottom` to the camera preview container. This padding accounts for control height, safe area insets, and an additional nudge.
    *   Nudged the entire camera preview area upwards by 5% of the screen height to improve visual focus.
    *   Corrected JSX structure for camera view and overlay elements.
*   **Camera Controls (`src/components/camera/CameraControls.tsx`):**
    *   Fixed an issue where `insets.bottom` was not correctly applied as an inline style for the controls container.
    *   Swapped the positions of the "Gallery" and "Barcode" buttons in the bottom controls.
*   **Camera Overlay Pill (`src/components/camera/CameraOverlay.tsx`):**
    *   Adjusted the background opacity of the instructional pill to `rgba(0, 0, 0, 0.4)` to match the bottom controls.
    *   Modified the pill's styling to dynamically hug its text content by removing fixed `width` and `height` and relying on `padding`. Added `maxWidth` to prevent it from becoming excessively wide and overlapping with top icons.

**Files Primarily Affected:**

*   `app/(tabs)/camera.tsx`
*   `src/components/camera/CameraControls.tsx`
*   `src/components/camera/CameraOverlay.tsx`

**2025-05-18: Onboarding Color Consistency & Supabase Fix**

**Objective:** Standardize button and selection colors across the onboarding flow to use the app's primary color (`#1D1923`) and resolve a Supabase initialization error.

**Key Changes:**

*   **Supabase Initialization (`services/db.ts`):**
    *   Resolved a `ReferenceError: window is not defined` by explicitly configuring the Supabase client to use `@react-native-async-storage/async-storage` for session storage. This is crucial for React Native environments.
*   **Paywall Screen (`app/(onboarding)/paywall.tsx`):**
    *   Replaced a hardcoded blue color for the "Continue with Code" button with `palette.primary` from `constants/Colors.ts`.
*   **Tailwind Configuration (`tailwind.config.js`):**
    *   The custom theme color `'onboarding-primary'` was previously set to a blue value. This has been updated to `#1D1923` to match `palette.primary`, ensuring NativeWind classes like `bg-onboarding-primary` use the correct theme color.
*   **Onboarding Screens Styling (`app/(onboarding)/step8_accomplishments.tsx`, `app/(onboarding)/step9_obstacles.tsx`):**
    *   Refactored these screens to directly use `palette.primary` for button backgrounds, selected option backgrounds/borders, and text/icon colors within these elements.
    *   This change moves away from relying on the (now corrected) `bg-onboarding-primary` Tailwind class for these specific components, making the color sourcing more explicit and consistent with other onboarding screens.
    *   Resolved lint errors related to incorrect `_styles` references that were introduced in a previous attempt to modify these files.
*   **General Guidance:** Provided comprehensive steps for cache clearing (Metro, NativeWind, Expo Go app) to ensure UI changes are correctly reflected after style and configuration updates.

**Files Primarily Affected:**

*   `services/db.ts`
*   `app/(onboarding)/paywall.tsx`
*   `tailwind.config.js`
*   `app/(onboarding)/step8_accomplishments.tsx`
*   `app/(onboarding)/step9_obstacles.tsx`
*   `constants/Colors.ts` (referenced for color consistency)


**2025-05-18: Onboarding UI Consistency - Button Colors**

**Objective:** Ensure a consistent and cohesive user interface across all onboarding screens by updating the primary action buttons (e.g., "Continue") and selectable option styles to use the application's primary theme color.

**Key Changes:**

*   **Color Standardization (`constants/Colors.ts`):** Utilized the `palette.primary` color for all "Continue" buttons and selected option backgrounds/borders across the onboarding flow.
*   **Onboarding Screen Updates (`app/(onboarding)/step*_*.tsx`):**
    *   Modified `step_height_weight.tsx`, `step2_experience.tsx`, `step3_source.tsx`, `step4_workouts.tsx`, `step5_gender.tsx`, `step6_goal.tsx`, `step_activity_level.tsx`, and `step7_diet.tsx`.
    *   Imported `palette` from `constants/Colors` in each relevant file.
    *   Refactored styling for "Continue" buttons to use `palette.primary` when active and a consistent gray for inactive states.
    *   Updated selectable options (e.g., "Yes/No" choices, multiple-choice selections) to use `palette.primary` for background and border when an option is selected.
    *   Removed local `_STYLES` constants previously used for option styling in favor of direct `palette` usage or more streamlined inline/Tailwind class application.

**Files Primarily Affected:**

*   `app/(onboarding)/step_height_weight.tsx`
*   `app/(onboarding)/step2_experience.tsx`
*   `app/(onboarding)/step3_source.tsx`
*   `app/(onboarding)/step4_workouts.tsx`
*   `app/(onboarding)/step5_gender.tsx`
*   `app/(onboarding)/step6_goal.tsx`
*   `app/(onboarding)/step_activity_level.tsx`
*   `app/(onboarding)/step7_diet.tsx`
*   `constants/Colors.ts` (referenced for color consistency)

**2025-05-18: Barcode Scanning with Nutritional Information Lookup**

**Objective:** Enhance the barcode scanning functionality by integrating the Open Food Facts API to fetch and display nutritional information for scanned products, providing a consistent user experience with the existing food image analysis flow.

**Key Changes:**

*   **New Service Implementation:**
    *   Created `services/productLookupService.ts` to handle fetching nutritional information from the Open Food Facts API.
    *   Implemented the `fetchProductDetails` function to retrieve product data using barcodes, including name, image URL, serving size, and nutritional values (calories, protein, carbs, fat).
    *   Added robust error handling for API failures, product not found scenarios, and incomplete data.

*   **ResultsScreen Enhancements (`app/results/index.tsx`):**
    *   Unified the user experience between barcode scanning and image analysis with consistent loading screens and results display.
    *   Implemented data transformation to convert barcode API responses into the same format used for AI image analysis results.
    *   Updated the `FoodAnalysisCard` component to display both types of results with the same visual style.
    *   Enhanced the meal saving functionality to work with both image analysis and barcode scan results, including support for downloading remote product images as thumbnails.

*   **Error Handling Improvements:**
    *   Added clear error states for cases where product information is incomplete or unavailable.
    *   Implemented consistent error messaging and display across both barcode scanning and image analysis.

**Files Primarily Affected:**

*   `services/productLookupService.ts` (new)
*   `app/results/index.tsx`

**2025-05-18: Barcode Scanning Integration**

**Objective:** Implement barcode scanning functionality within the camera screen, allowing users to toggle scanning mode via a dedicated button.

**Key Changes:**

*   **`CameraControls.tsx` (`src/components/camera/CameraControls.tsx`):**
    *   Added a new toggle button to activate or deactivate barcode scanning mode.
    *   The button's icon changes to reflect the current scanning state (active/inactive).
*   **`CameraScreen.tsx` (`app/(tabs)/camera.tsx`):**
    *   Integrated state management (`isBarcodeScannerActive`) to control when the `CameraView` attempts to scan barcodes.
    *   The `onBarcodeScanned` callback is now conditionally passed to `CameraView` based on `isBarcodeScannerActive`.
    *   Implemented logic to automatically deactivate the scanner immediately after a successful scan and when the resulting alert is dismissed, preventing continuous scanning loops and requiring user re-activation for new scans.

**Files Primarily Affected:**

*   `app/(tabs)/camera.tsx`
*   `src/components/camera/CameraControls.tsx`


**2025-05-18: Food Analysis Screen Enhancements & README Update**

**Objective:** Improve the user experience on the "Food Analysis" results page and enhance project documentation.

**Key Changes:**

*   **Food Analysis Screen UX/UI (`app/results/index.tsx`, `components/food/FoodAnalysisCard.tsx`):**
    *   Implemented a full-screen loading overlay for the "Save Meal" action, providing clearer feedback to the user.
    *   Updated the "Save Meal" button's background color to `#1C1A23` for consistency with the app's primary accent color.
    *   Standardized nutrient value colors (calories, protein, carbs, fat) on the analysis card to match the app's defined palette (`constants/Colors.ts`), aligning with dashboard widgets.
*   **Documentation (`README.md`):**
    *   Introduced a "## File Directory" section to list key project files and their brief descriptions, improving navigability for developers.
    *   Updated existing file entries and added new ones for `FoodAnalysisCard.tsx`.

**Files Primarily Affected:**

*   `app/results/index.tsx`
*   `components/food/FoodAnalysisCard.tsx`
*   `README.md`

**2025-05-18: Improved Login Error Handling & Dashboard Loading**

**Objective:** Enhance user experience by refining how login errors are displayed in the console and by ensuring a smoother loading sequence for the main dashboard.

**Key Changes:**

*   **Login Error Console Output (AuthContext):**
    *   Modified `src/services/AuthContext.tsx` to change `console.error` calls related to Supabase sign-in errors to `console.warn`.
    *   **Benefit:** Prevents raw authentication errors (like "Invalid login credentials") from appearing as critical "ERROR" logs in the developer console during expected scenarios (e.g., incorrect password entry). This provides a cleaner console experience while still logging the necessary information as a warning for debugging. User-facing `Alert` messages remain friendly and unchanged.
*   **Dashboard Loading Experience (Splash Screen & Conditional Rendering):**
    *   Integrated `expo-splash-screen` more deeply to manage the transition from app launch to a fully rendered dashboard.
    *   **`app/_layout.tsx`:** Updated to call `SplashScreen.preventAutoHideAsync()` after fonts are loaded. This keeps the native splash screen visible until explicitly hidden by the application.
    *   **`app/(tabs)/index.tsx` (DashboardScreen):**
        *   Added logic to call `SplashScreen.hideAsync()` only after essential dashboard data (meals, nutrition plan, etc.) has been successfully fetched and the screen is ready to render.
        *   Implemented a full-screen `ActivityIndicator` that displays if the dashboard is still fetching its initial data *before* the splash screen is hidden.
    *   **Benefit:** Addresses the "flash of unstyled content" or staggered loading effect previously observed. The dashboard now appears more cohesively, improving the perceived performance and professionalism of the initial screen load after login.

**Files Primarily Affected:**

*   `src/services/AuthContext.tsx`
*   `app/_layout.tsx`
*   `app/(tabs)/index.tsx`


**2025-05-14: Meal Detail Screen - Nutrient Display Update**

**Objective:** Initially, the goal was to implement an inline editing feature for nutritional values (Calories, Protein, Carbs, Fat) on the MealDetailScreen. However, due to persistent rendering warnings and a strategic decision to simplify, the focus shifted to ensuring a clear, non-editable display of these values, matching a specific UI layout.

**Key Changes and Current State:**

*   **Initial Inline Editing Implementation (Now Reverted/Simplified):**
    *   An `InlineEditableNumber` component (`components/InlineEditableNumber.tsx`) was created to allow users to tap a nutrient value, turn it into an input, and save or cancel changes.
    *   This component was integrated into `app/meal/[mealId].tsx` for Calories, Protein, Carbs, and Fat.
    *   The `EditNutrientModal` was removed in favor of this inline approach.
    *   A `handleNutrientSave` function was added to `MealDetailScreen` to process updates via `mealService.updateMeal`.
*   **Troubleshooting Rendering Warnings:**
    *   A persistent "Text strings must be rendered within a <Text> component" warning appeared. Various attempts were made to resolve this within `InlineEditableNumber` and its usage in `MealDetailScreen`, including:
        *   Ensuring all strings and dynamic values were wrapped in `<Text>`.
        *   Explicitly casting props to strings.
        *   Testing removal of `iconComponent` props.
        *   Refactoring `mealId` extraction from `useLocalSearchParams` in `MealDetailScreen`.
    *   The warning's source seemed to shift or be indirectly related to these components, proving difficult to pinpoint.
*   **Reversion to Static Nutrient Display (Current Implementation):**
    *   To move forward and address the UI/UX goals, the decision was made to make the nutrient display non-editable but retain a specific visual layout.
    *   The `InlineEditableNumber` component was significantly simplified:
        *   Editing state, input fields, and save/cancel logic were removed.
        *   It now functions as a static display component, taking label, value, unit, and icon.
    *   Subsequently, to precisely match a desired layout provided by the USER (similar to a previous version or dashboard style):
        *   The `InlineEditableNumber` component usage was removed from the nutrient section in `app/meal/[mealId].tsx`.
        *   The nutrient display (Calories, Protein, Carbs, Fat) was rebuilt directly within `MealDetailScreen.tsx` using `StyledView`, `StyledText`, `MaterialCommunityIcons`, and `FontAwesome5` for icons.
        *   The layout now features a full-width card for "Calories" and a row of three smaller cards for "Protein," "Carbs," and "Fat" beneath it.
        *   Icons and colors for these nutrients were updated to be consistent with those used in `RecentMealCard.tsx` and a target screenshot provided by the user.

**Files Primarily Affected:**

*   `app/meal/[mealId].tsx`: Major changes to implement and then revert/replace nutrient display logic. Contains the current static display.
*   `components/InlineEditableNumber.tsx`: Created for inline editing, then simplified to a display-only component. Currently not used by `MealDetailScreen` after the latest layout revision but still exists in the codebase.
*   `services/mealService.ts`: `updateMeal` function was intended for use with inline editing.

**Current Status & Next Steps for Developer:**

*   The `MealDetailScreen` now statically displays nutrient information according to the specified layout.
*   The persistent "Text strings must be rendered within a <Text> component" warning was still present the last time we checked, even after refactoring `useLocalSearchParams` and simplifying the display. The developer should investigate this further. It might be related to routing, context providers, or a component higher up in the render tree as suggested by the call stack.
*   The `InlineEditableNumber.tsx` component is no longer in active use on this screen. A decision can be made whether to remove it from the project or keep it for future reference if editable nutrients are revisited.
*   Verify the final look and feel of the nutrient display on `MealDetailScreen` against the desired UI, ensuring all styling (fonts, spacing, colors, borders) is accurate.
*   Test navigation to and from the `MealDetailScreen` to ensure `mealId` parameter handling is robust.

**Blockers/Known Issues:**

*   The primary remaining issue is the "Text strings must be rendered within a <Text> component" warning. The last reported source was related to `useLocalSearchParams` in `MealDetailScreen`, but this could be a misleading symptom.

**2025-05-14 (Continued): UI Enhancements - Navigation & Iconography**

**Objective:** Improve user experience by ensuring consistent navigation and visual cues across different sections of the application, particularly concerning meal details and nutritional information display.

**Key Changes:**

*   **Meal History Navigation:**
    *   Implemented navigation from individual meal items listed on the "History" screen (`app/(tabs)/history.tsx`) to their respective "Meal Detail" pages (`app/meal/[mealId].tsx`). This was achieved by wrapping the `RecentMealCard` component in a `TouchableOpacity` and using `router.push` for navigation.
*   **Fat Icon Consistency:**
    *   **Dashboard - Recently Eaten:** Updated the "Fat" icon in `components/RecentMealCard.tsx` (used on the dashboard's "Recently Eaten" list) to use the `FontAwesome5` `tint` icon (a droplet). The icon's color (`#FFC107`) was preserved.
    *   **Dashboard - Daily Targets Widget:**
        *   Refactored `components/ProgressDisplayCard.tsx` to support multiple icon libraries by adding `iconType` and `fa5IconName` props. This allows the component to render icons from either `MaterialCommunityIcons` or `FontAwesome5`.
        *   Updated the "Fat" display within the "Daily Targets" widget (`components/NutritionProgressSection.tsx`) to use the `FontAwesome5` `tint` icon, leveraging the enhanced `ProgressDisplayCard`. The original color for the fat icon in this widget (`#FFC107`) was maintained.

**Files Primarily Affected:**

*   `app/(tabs)/history.tsx`: Added `TouchableOpacity` and navigation logic.
*   `components/RecentMealCard.tsx`: Changed the "Fat" icon to `FontAwesome5` `tint`.
*   `components/ProgressDisplayCard.tsx`: Refactored to support multiple icon libraries.
*   `components/NutritionProgressSection.tsx`: Updated to pass new props to `ProgressDisplayCard` for the "Fat" icon.

**2025-05-14 (Continued): Dashboard UI & Typography Overhaul**

**Objective:** Modernize the dashboard's appearance with a neumorphic design and refine typography for clarity and consistency, adhering to platform guidelines.

**Key Changes:**

*   **Dashboard UI Enhancements:**
    *   Implemented a neumorphic design for calorie and macro nutrient cards in `NutritionProgressSection.tsx` and `ProgressDisplayCard.tsx`.
    *   Updated `ProgressDisplayCard.tsx` to display remaining/exceeded nutrient amounts (e.g., "52g left").
    *   Adjusted text alignment in macro cards to left-aligned.
    *   Ensured progress rings start consistently at 3 o'clock (`rotation={0}`).
*   **Typography and Styling:**
    *   Standardized labels (e.g., "Protein left", "Nutrition tips") to sentence case.
    *   Applied SF-Pro inspired styling (15pt font, 17pt line height) to dashboard sub-labels.
    *   Verified text contrast ratios (>= 4.5:1 AA).
*   **Utility Styles:**
    *   Created `neumorphicLayerStyle` in `utils/styles.ts` for consistent neumorphic styling.

**Files Primarily Affected:**

*   `components/ProgressDisplayCard.tsx`
*   `components/NutritionProgressSection.tsx`
*   `components/ui/ProgressRing.tsx`
*   `utils/styles.ts`
*   `app/(tabs)/index.tsx` (for "Nutrition tips" casing)
*   `app/(tabs)/history.tsx` (for "Meal history" casing)
*   `app/(tabs)/profile.tsx` (for "My physical info", "App settings" casing)

## Setup and Running the App

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd foodnsap # Or your project's directory name
    ```
2.  **Install dependencies:**
    ```bash
    pnpm install
    ```
    **Note:** This project uses pnpm as the package manager. Make sure you have pnpm installed globally (`npm install -g pnpm`) or use npx (`npx pnpm install`).
3.  **Set up Environment Variables:**
    Create a `.env` file in the root of the project and add your Supabase and OpenAI API keys as described in the "Environment Variables" section.
4.  **Run the application:**
    ```bash
    expo start
    ```
    This will open the Expo development server. You can then run the app on an iOS simulator/device, Android emulator/device, or in a web browser.

---

## Project Handover Notes: Calorie & Nutrition AI App (Session Summary)

### 1. Project Overview

This is a mobile application built with Expo (React Native) designed to be an AI-powered calorie and nutrition tracker. The core goal is to provide users with personalized nutrition plans based on data collected during an onboarding process.

### 2. Technology Stack

*   **Framework**: Expo SDK (latest stable version, check `package.json`)
*   **Language**: TypeScript
*   **UI**: React Native
*   **Styling**: NativeWind (TailwindCSS for React Native - pinned to `3.3.2` due to potential compatibility issues with newer versions)
*   **Navigation**: Expo Router (File-based routing)
*   **Backend**: Supabase
    *   Authentication (Email/Password, Google Sign-In)
    *   Database (PostgreSQL)
*   **Local Storage**: AsyncStorage (Used for persisting some state, e.g., onboarding status)
*   **State Management**: React Context API (specifically `OnboardingContext`)
*   **Package Manager**: PNPM

### 3. Project Structure

*   **`app/`**: Contains all screens and routing logic, organized using Expo Router conventions.
    *   `(auth)/`: Screens related to authentication (Login, Sign Up).
    *   `(onboarding)/`: Multi-step onboarding screens (`step1_intro.tsx` to `step9_obstacles.tsx`, `paywall.tsx`).
    *   `(tabs)/`: Main application screens after login (`_layout.tsx`, `dashboard.tsx`, `profile.tsx`).
    *   `_layout.tsx`: Root layout, potentially managing global providers.
*   **`components/`**: Reusable UI components.
*   **`src/`**: Core logic and services.
    *   `contexts/`: React Context providers (e.g., `OnboardingContext.tsx`).
    *   `services/`: Modules for interacting with external services like Supabase (`supabaseClient.ts`).
*   **`assets/`**: Static assets like images and fonts.
*   **`.env`**: **Crucial**: Contains environment variables for Supabase URL, Anon Key, and potentially others like OpenAI keys. This file is not checked into Git and must be created locally.
*   **`pnpm-lock.yaml`**: Defines exact dependency versions. Use `pnpm install` for setup.
*   **`tailwind.config.js`**: Configuration for NativeWind/TailwindCSS.

### 4. Key Features & Functionality

*   **User Authentication**:
    *   Sign up/Login with Email & Password.
    *   Google Sign-In (integration exists, ensure Supabase OAuth setup is correct).
    *   Managed via Supabase Auth.
*   **Onboarding Flow**:
    *   A multi-step process (currently 9 steps + paywall) collecting user data: Name, Date of Birth, Height, Weight, Activity Level, Fitness Goals, Dietary Restrictions, Health Obstacles.
    *   Data is collected progressively and stored within the `OnboardingContext`.
    *   On successful completion of step 9, data should be saved (ensure this happens reliably, possibly via Supabase).
*   **Profile Screen**:
    *   Displays the data collected during the onboarding flow.
    *   Fetches data likely from `OnboardingContext` or potentially AsyncStorage/Supabase after persistence.
*   **Dashboard Screen**:
    *   Intended to be the main screen displaying the AI Nutrition Plan and other core features.
    *   Access is currently gated by the `isOnboardingComplete` flag in `OnboardingContext`.
*   **Paywall**:
    *   A basic screen (`app/(onboarding)/paywall.tsx`) currently exists, primarily created to resolve a routing error.
    *   Intended to gate access to the full application features (like the Dashboard/AI Plan) after onboarding data collection.
    *   Likely involves validating an Access Code, potentially against a Supabase table.

### 5. Critical Logic: Onboarding Completion & Paywall (`isOnboardingComplete`)

*   **Context**: We identified a crucial logic issue (documented in Memory `fd18db94...`). The `OnboardingContext` provides a state variable `isOnboardingComplete` and a setter `setIsOnboardingComplete`.
*   **Current Issue**: The `setIsOnboardingComplete(true)` function is currently called at the end of the data collection phase in `app/(onboarding)/step9_obstacles.tsx`.
*   **Required Change**: This is incorrect for gating paid features. `isOnboardingComplete` should represent the user having successfully completed *both* data collection *and* passing the paywall (e.g., entering a valid access code).
*   **Action Needed**:
    1.  Remove the `setIsOnboardingComplete(true)` call from `step9_obstacles.tsx`.
    2.  Implement logic in `step9_obstacles.tsx` to reliably save the collected onboarding data (e.g., to Supabase or AsyncStorage) and navigate to the `paywall.tsx` screen.
    3.  Implement the actual paywall logic in `paywall.tsx` (e.g., access code validation).
    4.  Upon successful validation in `paywall.tsx`, *then* call `setIsOnboardingComplete(true)` from the `OnboardingContext`.
    5.  Ensure navigation proceeds correctly from the paywall to the main app (`(tabs)/dashboard`).
*   **Goal**: Separate the state of "onboarding data collected" from "paid feature access unlocked".

### 6. Backend Setup (Supabase)

*   A Supabase project is required.
*   **Authentication**: Configure Email/Password and Google OAuth providers in the Supabase dashboard.
*   **Database**: Tables will be needed to store user profiles, onboarding data, potentially access codes, and meal/nutrition data. Schema design needs consideration.
*   **Environment Variables**: Create a `.env` file in the root of the project and add:
    ```env
    EXPO_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    # Add any other keys like OpenAI API Key if needed
    ```
*   **RLS Policies**: Implement Row Level Security policies in Supabase to ensure users can only access their own data.

### 7. State Management

*   **`OnboardingContext`**: Manages state during the onboarding flow (`onboardingData`, `isOnboardingComplete`, etc.).
*   **`AsyncStorage`**: Used for persisting some state locally between app sessions. Check its usage, particularly around storing the onboarding completion status or user session tokens.
*   **Supabase**: The ultimate source of truth for persistent user data.

### 8. Styling

*   NativeWind is used for utility-first CSS styling, similar to TailwindCSS. Refer to `tailwind.config.js`.
*   Recent work focused on standardizing styles, e.g., using `bg-onboarding-primary` for selected options on onboarding screens. Maintain consistency.

### 9. Recent Development Activity (This Session)

*   Discussed and identified the need to refactor the `isOnboardingComplete` logic (see section 5).
*   Ensured `pnpm install` works correctly and dependencies are up-to-date.
*   Ran the app using `npx expo start` and facilitated testing via Expo Go.
*   Reviewed project structure and existing code related to onboarding and context based on provided memories.
*   Recalled previous updates: standardized styles on onboarding screens (`bg-onboarding-primary`) and created basic `paywall.tsx` to fix routing (Memory `15085574...`).
*   Updated this `README.md` with these handover notes.

### 10. Getting Started

1.  **Clone**: Clone the repository.
2.  **Environment**: Set up the `.env` file with Supabase credentials (and any other required API keys).
3.  **Install**: Run `pnpm install` (ensure pnpm is installed globally: `npm install -g pnpm`).
4.  **Run**: Run `npx expo start`.
5.  **Test**: Scan the QR code using the Expo Go app on a physical device (iOS or Android) or run on an emulator/simulator.

**2025-01-XX: Package Management & Documentation Update**

**Objective:** Ensure proper package installation and update project documentation for new developers.

**Key Changes:**

*   **Package Manager Verification:** 
    *   Confirmed project uses `pnpm` as package manager (evidenced by `pnpm-lock.yaml` file)
    *   Successfully installed all dependencies using `pnpm install` from existing lock file
    *   Updated installation instructions in README to reflect correct package manager
*   **Documentation Updates:**
    *   Updated "Setup and Running the App" section to use `pnpm install` instead of `npm install`
    *   Added notes about pnpm requirement and installation instructions
    *   Enhanced Project Handover Notes to include pnpm specification
    *   Following filesystem rule: confirmed File Directory section is current and comprehensive

**Files Primarily Affected:**
*   `README.md`: Updated installation instructions and project handover notes
*   Dependencies: All packages successfully installed from `pnpm-lock.yaml`

**Current Status:**
*   ✅ All dependencies properly installed using pnpm
*   ✅ Package manager documentation updated
*   ✅ Installation instructions corrected for new developers
*   ✅ Project ready for development with proper dependency management

**2025-01-XX: Google Authentication Implementation**

**Objective:** Implement complete Google OAuth authentication with Supabase integration following the comprehensive step-by-step plan.

**Key Changes:**

*   **Google Authentication Service (`src/services/googleAuth.ts`):**
    *   Created comprehensive Google Sign-In service with React Native Google Sign-In integration
    *   Implemented token exchange with Supabase using `signInWithIdToken`
    *   Added robust error handling for all Google Sign-In scenarios (cancellation, Play Services unavailable, etc.)
    *   Configured automatic Google Sign-In setup with environment variable support
    *   Included helper functions for sign-out and user status checking
*   **Supabase Service Extension (`src/services/supabase.ts`):**
    *   Added `signInWithGoogleOAuth` function for OAuth flow support
    *   Configured deep link redirect to `foodnsap://auth/callback`
*   **AuthContext Integration (`src/services/AuthContext.tsx`):**
    *   Extended AuthContext interface with `signInWithGoogle` and `isGoogleLoading` properties
    *   Implemented Google authentication flow with proper state management
    *   Added Google Sign-In configuration on app startup
    *   Enhanced sign-out to include Google sign-out for complete session cleanup
*   **UI Implementation:**
    *   **Login Screen (`app/(auth)/login.tsx`):** Replaced "Coming Soon" alert with functional Google sign-in
    *   **Register Screen (`app/(auth)/register.tsx`):** Added working Google authentication option
    *   **OAuth Callback Handler (`app/(auth)/callback.tsx`):** Created dedicated screen for OAuth redirect handling
    *   Added loading states and proper error messaging for Google authentication
*   **Deep Link Configuration (`app.config.js`):**
    *   Added linking configuration for OAuth callback handling
    *   Configured `foodnsap://` URL scheme for authentication redirects
*   **Environment Variables (`env.example`):**
    *   Created comprehensive environment variables template
    *   Documented all required Google OAuth Client IDs (Web, iOS, Android)
    *   Added setup instructions for Google Cloud Console configuration

**Dependencies Added:**
*   `expo-auth-session`: For OAuth flow management
*   `expo-crypto`: For cryptographic operations
*   `expo-web-browser`: Already installed
*   `@react-native-google-signin/google-signin`: Already installed

**Configuration Required:**
1. **Google Cloud Console Setup:**
   - Create OAuth 2.0 Client IDs for Web, iOS, and Android
   - Configure OAuth consent screen
   - Enable Google+ API
2. **Supabase Configuration:**
   - Enable Google provider in Authentication settings
   - Add Google Client ID and Secret from web application
   - Set redirect URL to `foodnsap://auth/callback`
3. **Environment Variables:**
   - Copy `env.example` to `.env`
   - Add Google Client IDs from Google Cloud Console
   - Configure Supabase credentials

**Files Primarily Affected:**
*   `src/services/googleAuth.ts`: New Google authentication service
*   `src/services/AuthContext.tsx`: Extended with Google authentication
*   `src/services/supabase.ts`: Added OAuth support
*   `app/(auth)/login.tsx`: Implemented Google sign-in functionality
*   `app/(auth)/register.tsx`: Added Google authentication option
*   `app/(auth)/callback.tsx`: New OAuth callback handler
*   `app.config.js`: Deep link configuration
*   `env.example`: Environment variables documentation

**Next Steps for Implementation:**
1. Set up Google Cloud Console OAuth credentials
2. Configure Supabase Google provider settings
3. Create `.env` file with actual credentials
4. Test Google authentication flow on iOS and Android
5. Verify OAuth callback handling works correctly

**Current Status:**
*   ✅ Google authentication service implemented
*   ✅ UI components updated with working Google sign-in
*   ✅ OAuth callback handling configured
*   ✅ Deep link support added
*   ✅ Environment variables documented
*   🔄 **Requires Google Cloud Console & Supabase configuration**

### 11. Key Areas for Future Development

*   **Implement `isOnboardingComplete` Refactor**: This is the highest priority.
*   **Build Paywall Logic**: Validate access codes, handle success/failure states.
*   **Save Onboarding Data**: Ensure data collected is reliably saved to Supabase upon completion of step 9.
*   **Develop Dashboard/AI Features**: Implement the core nutrition planning functionality.
*   **Supabase Integration**: Flesh out database interactions (saving/fetching meals, user data).
*   **Error Handling**: Add robust error handling, especially for network requests and Supabase interactions.
*   **Testing**: Develop a more formal testing strategy (unit, integration tests).

### 12. Conclusion

The project has a solid foundation using modern technologies. The immediate focus should be correcting the onboarding completion logic to accurately reflect access granted post-paywall. After that, building out the paywall functionality and the core AI nutrition features are the main next steps. Ensure careful handling of user data and Supabase integration.

**2025-01-14: Single-Page Analysis Implementation - Steps 1 & 2**

**Objective:** Transform the multi-page food analysis flow into a seamless single-page experience similar to Cal AI app, where users never leave the camera screen during analysis.

**Key Changes:**

*   **Step 1 - Analysis Overlay Component (`components/camera/AnalysisOverlay.tsx`):**
    *   Created full-screen overlay component that appears on top of camera view
    *   Includes captured image display, progress indicator, and results section
    *   Handles three states: analyzing, showing results, and action buttons (save/discard)
    *   Integrated with existing app color scheme and styling patterns

*   **Step 2 - Camera State Management (`app/(tabs)/camera.tsx`):**
    *   Added state variables for overlay visibility, progress tracking, and results
    *   Integrated AnalysisOverlay component into camera screen
    *   Modified image capture flow to show overlay instead of navigation
    *   Added handler functions for overlay actions (close, save, discard)

*   **Step 3 - Progress Indicator Component (`components/camera/AnalysisProgress.tsx`):**
    *   Created animated circular progress indicator with SVG
    *   Includes smooth progress animations and pulsing effects
    *   Displays progress percentage and current stage text
    *   Integrated into AnalysisOverlay for better visual feedback

*   **Step 4 - Progress Management (`utils/progressManager.ts`):**
    *   Implemented structured 4-stage progress system (0-30%, 31-60%, 61-90%, 91-100%)
    *   Each stage has realistic timing and smooth transitions
    *   Provides callbacks for progress updates and stage completion
    *   Replaces simple simulation with professional progress tracking

**2025-01-14: Real AI Integration - Step 1 Complete**

**Objective:** Replace sample data with real AI analysis using the existing aiVisionService.

**Key Changes:**

*   **Real AI Integration (`app/(tabs)/camera.tsx`):**
    *   Integrated `analyzeFoodImage` from `services/aiVisionService.ts`
    *   AI analysis runs in parallel with progress manager for optimal UX
    *   Added proper error handling for AI failures with fallback results
    *   Synchronizes AI completion with progress completion (waits for 90% progress)
    *   Results now show real nutrition data from OpenAI GPT-4 Vision analysis

*   **Progress Manager Enhancement (`utils/progressManager.ts`):**
    *   Added `getCurrentProgress()` method for synchronization
    *   Improved progress tracking with proper state management
    *   Enhanced timing and stage transitions for better user experience

**2025-01-14: Save/Discard Functionality - Step 2 Complete**

**Objective:** Implement functional Save and Discard buttons that actually save meals to the database and provide proper user feedback.

**Key Changes:**

*   **Save Functionality (`app/(tabs)/camera.tsx`):**
    *   Integrated with existing `saveMeal` and `uploadThumbnail` from `services/mealService.ts`
    *   Uploads captured image as thumbnail to Supabase Storage
    *   Saves meal data with real nutrition information to database
    *   Shows loading state during save process ("Saving meal...")
    *   Handles thumbnail upload failures gracefully (continues without thumbnail)
    *   Provides success feedback with haptic notification
    *   Navigates to dashboard with refresh timestamp after successful save

*   **Discard Functionality (`app/(tabs)/camera.tsx`):**
    *   Added confirmation dialog to prevent accidental discards
    *   Provides clear "Cancel" and "Discard" options
    *   Proper haptic feedback on discard action
    *   Updated to navigate to dashboard instead of staying on camera

*   **Button Fix (`components/camera/AnalysisOverlay.tsx`):**
    *   Fixed non-clickable buttons by converting from View to TouchableOpacity
    *   Connected buttons to onSave and onDiscard handler functions
    *   Added visual feedback with shadows and activeOpacity
    *   Improved button styling for better user experience

*   **Error Handling:**
    *   Comprehensive error handling for save failures
    *   User-friendly error messages with retry options
    *   Maintains overlay state on errors (doesn't close unexpectedly)
    *   Detailed logging for debugging save process

**2025-01-14: UI Polish and Smooth Transitions - Step 4 Complete**

**Objective:** Create a seamless, professional analysis experience with smooth transitions and no layout shifts.

**Key Changes:**

*   **Redesigned Analysis Layout (`components/camera/AnalysisOverlay.tsx`):**
    *   Results container now shows immediately with consistent layout
    *   No more jarring transitions between analysis and results states
    *   Loading indicator moved inside the captured image for cleaner design
    *   Nutrition cards display immediately with dummy data, then transition to real data

*   **Smooth Content Transitions:**
    *   **Stage Text**: Transitions from analysis stages ("Analyzing food...") to "Here are your results"
    *   **Food Name**: Changes from "Food Analysis" placeholder to real food name
    *   **Nutrition Values**: Smooth transition from dummy data (0, 0g, 0g, 0g) to real AI results
    *   **Visual Feedback**: Dummy data appears in lighter color, real data in normal color

*   **Enhanced User Experience:**
    *   Users see the final layout immediately upon taking a photo
    *   No layout shifts or content jumping during the analysis process
    *   Professional loading state with progress indicator inside the image
    *   Save/Discard buttons appear only when results are ready

*   **Technical Improvements:**
    *   Simplified component logic with better state management
    *   Consistent styling and spacing throughout the analysis flow
    *   Improved accessibility with clear visual hierarchy

*   **Results-First Layout System:**
    *   Single source of truth comes from the results state layout
    *   Loading state automatically inherits all measurements from results
    *   Perfect alignment guaranteed when editing results layout
    *   `RESULTS_LAYOUT` constants define all positioning and sizing
    *   Changes to results automatically apply to loading state

*   **Linked Layout Architecture (Step 4 Complete):**
    *   **Centralized Layout Calculator**: `calculateLayout()` computes all positions from results state
    *   **Single Source of Truth**: `LAYOUT` object contains all measurements and positioning
    *   **Automatic Synchronization**: Both states reference identical calculated values
    *   **Consistent Layout Application**: Loading and results use identical style objects
    *   **Future-Proof Design**: Change one value → both states update automatically
    *   **No Manual Synchronization**: Results state is the truth, loading inherits everything
    *   **Built-in Validation**: Computed totals ensure layout consistency
    *   **Hierarchical Organization**: Base measurements → Spacing → Final positions

*   **Performance Optimizations:**
    *   **Camera Freeze During Analysis**: Camera view stops when analysis overlay is visible
    *   **Battery Conservation**: No unnecessary camera processing during analysis
    *   **Seamless Image Background**: Shows captured image as background when camera is frozen
    *   **Resource Management**: Only captured image is shown, live camera feed is paused
    *   **Improved User Experience**: Eliminates distracting camera movement, maintains visual continuity

**Current Status:**
*   ✅ Single-page analysis experience implemented
*   ✅ Real AI integration working with OpenAI GPT-4 Vision
*   ✅ Professional progress indicators with 4-stage system
*   ✅ Save/Discard functionality fully working
*   ✅ Database integration for meal logging
*   ✅ Dashboard refresh integration working
*   ✅ UI polish and smooth transitions implemented
*   ✅ Results-first layout system with automatic synchronization
*   ✅ Linked layout architecture with centralized control
*   🎉 **Complete end-to-end food analysis flow ready for production!**

**2025-01-17: GitHub Repository Migration & Setup**

**Objective:** Successfully link the local project to the new GitHub repository (SehAI_MVP) and set up proper version control for collaborative development.

**Key Changes:**

*   **Repository Migration:**
    *   Successfully changed remote origin from `SEH_NecesseryfeaturesOnlys.git` to `SehAI_MVP.git`
    *   Pushed existing codebase to new repository with complete project history
    *   Created both `main` and `2nd-attemp-august` branches on GitHub
    *   Maintained all existing development work and commit history

*   **Branch Structure:**
    *   **`main` branch:** Primary production-ready branch
    *   **`2nd-attemp-august` branch:** Current development branch with latest features
    *   Both branches contain identical codebase and complete project files

*   **Repository Setup:**
    *   Successfully uploaded 692 objects with complete project structure
    *   All assets, dependencies, and configuration files properly synchronized
    *   README.md updated with repository linking documentation

**Files Primarily Affected:**

*   Git configuration and remote origin settings
*   All project files successfully uploaded to new repository
*   README.md updated with migration documentation

**Current Status:**
*   ✅ Project successfully linked to GitHub repository: https://github.com/anasshm/SehAI_MVP.git
*   ✅ All project files and history preserved in new repository
*   ✅ Both main and development branches available on GitHub
*   ✅ Repository ready for collaborative development and deployment

**2025-01-14: Analysis Overlay UX Improvements & Visual Polish**

**Objective:** Fix critical UX issues with the Show more/less button, add professional visual effects, and enhance the progress ring design for better user experience.

**Key Changes:**

*   **Show More/Less Button State Management (`components/camera/AnalysisOverlay.tsx`):**
    *   **Fixed State Persistence Issue**: Description expansion state now properly resets when:
        *   Overlay becomes invisible (`visible` prop changes)
        *   New analysis starts (`showResults` changes)
        *   New image is captured (`capturedImageUri` changes)
    *   **Enhanced Layout Structure**: Implemented proper scrollable containers with:
        *   Fixed top section (title + nutrition) - never scrolls
        *   Flexible middle section (description) - scrollable when expanded
        *   Fixed bottom section (buttons) - always visible and properly positioned
    *   **Improved Button Positioning**: Show less button now stays visible with:
        *   Increased ScrollView bottom padding (60px) for proper spacing
        *   Constrained description container to prevent button displacement
        *   Maintained original button styling and behavior

*   **24pt Gradient Overlay Implementation (`components/camera/AnalysisOverlay.tsx`):**
    *   **Professional Visual Enhancement**: Added subtle gradient overlay at bottom of hero image
        *   Gradient: transparent → rgba(0, 0, 0, 0.15) (15% black)
        *   Height: 24pt as specified for design consistency
        *   Purpose: Ensures readability of white card junction and reduces visual abruptness
    *   **Technical Implementation**: Used `expo-linear-gradient` with proper absolute positioning
    *   **Non-Interactive Design**: Added `pointerEvents="none"` to prevent touch interference

*   **Progress Ring Redesign & Text Centering (`components/camera/AnalysisProgress.tsx`):**
    *   **Enhanced Dimming Effect**: Increased overlay opacity from 30% to 60% for stronger, more professional appearance
    *   **Perfect Text Centering**: Completely redesigned text positioning system:
        *   **Container Alignment**: Added explicit width/height constraints matching circle interior
        *   **Layer Coordination**: Proper z-index stacking (SVG: z-index 1, text: z-index 2)
        *   **Typography Optimization**: Reduced font size (32px → 28px) with enhanced line height and letter spacing
        *   **Cross-Platform Compatibility**: Added Android-specific fixes (`includeFontPadding: false`, `textAlignVertical: 'center'`)
    *   **Visual Hierarchy Improvements**:
        *   **White Ring Design**: Consistent white color (#FFFFFF) for clean, professional appearance
        *   **Enhanced Stage Text**: Significantly improved readability and prominence:
            *   Font size increased from 12px to 18px (50% larger)
            *   Font weight increased from 400 to 600 for better prominence
            *   Opacity increased from 70% to 90% for better contrast
            *   Enhanced text shadows and letter spacing for improved readability
        *   **Improved Stroke**: Increased width from 8px to 12px for better visibility
    *   **Technical Fixes**: Removed layout conflicts and positioning issues that caused text cutoff

*   **Safe Area Integration (`components/camera/AnalysisOverlay.tsx`):**
    *   **Proper Button Positioning**: Implemented `useSafeAreaInsets()` for safe area-aware button placement
    *   **Dynamic Layout Calculation**: Button container now accounts for device safe area bottom
    *   **Responsive Design**: Layout automatically adapts to different device screen configurations

**Impact:**
*   ✅ **Fixed Critical UX Bug**: Show more/less state no longer persists between different images
*   ✅ **Professional Visual Design**: Added subtle gradient overlay for design consistency
*   ✅ **Perfect Progress Ring**: Text now perfectly centered with no cutoff issues
*   ✅ **Enhanced Readability**: Stage text much more prominent and readable during analysis
*   ✅ **Safe Area Compliance**: Buttons never go below safe zone on any device
*   ✅ **Improved User Experience**: Smooth, professional analysis flow with consistent behavior

**Technical Achievements:**
*   Implemented proper React useEffect hooks for state management lifecycle
*   Added comprehensive safe area handling for cross-device compatibility
*   Created robust text centering system with explicit positioning constraints
*   Enhanced visual hierarchy with improved typography and color management
*   Fixed complex layout issues with ScrollView and button positioning conflicts

## **Technical Architecture: Linked Layout System**

### **How It Works:**

```javascript
// 1. Single Calculation Function
const calculateLayout = (screenDimensions) => {
  const baseLayout = { /* results state measurements */ };
  const spacing = { /* calculated from base */ };
  const positions = { /* computed final positions */ };
  return { base, spacing, positions, computed };
};

// 2. Single Source of Truth
const LAYOUT = calculateLayout({ width: screenWidth, height: screenHeight });

// 3. Linked Styles (both states use these)
const linkedStyles = createLinkedStyles(LAYOUT);
```

### **Future-Proof Editing Examples:**

**Change Button Height:**
```javascript
// Edit in calculateLayout() baseLayout.buttons.height
buttons: { height: 64 } // Changed from 56 to 64
// → Both loading and results states automatically update
```

**Modify Card Padding:**
```javascript
// Edit in calculateLayout() baseLayout.card.padding  
card: { padding: 32 } // Changed from 24 to 32
// → All spacing automatically recalculates and applies
```

**Adjust Image Size:**
```javascript
// Edit in calculateLayout() baseLayout.image
image: { width: screenWidth * 0.9 } // Changed from 0.8 to 0.9
// → Image container updates in both states instantly
```

### **Benefits:**
- ✅ **Edit Once, Apply Everywhere**: Change any measurement → both states update
- ✅ **Perfect Alignment**: Mathematical guarantee of identical positioning  
- ✅ **No Synchronization Bugs**: Impossible to have mismatched layouts
- ✅ **Maintainable Code**: Single place to edit all layout values
- ✅ **Validation Built-in**: Computed totals catch layout inconsistencies

### **Developer Quick Reference:**

**To Edit Layout (components/camera/AnalysisOverlay.tsx):**

1. **Find `calculateLayout()` function** (line ~15)
2. **Edit `baseLayout` object** - This is your single source of truth
3. **Save file** - Both loading and results states update automatically

**Common Edits:**
- **Image size**: `baseLayout.image.width/height`
- **Card styling**: `baseLayout.card.padding/borderRadius`  
- **Button dimensions**: `baseLayout.buttons.height/padding`
- **Spacing**: `spacing.imageToCard/stageTextBottom/etc`

**What Updates Automatically:**
- ✅ Loading state layout
- ✅ Results state layout  
- ✅ All positioning calculations
- ✅ Style object generation
- ✅ Layout validation

**No Manual Sync Required** - The system handles everything!