# Seh AI - AI Powered Nutrition Tracker

**Status**: ✅ Working build with single commit history  
**Stack**: Expo React Native + Supabase + OpenAI Vision  
**Purpose**: Take food photos → Get nutrition data → Track meals  
**Platform**: iOS only (for now)

## 🚨 AI CODING RULES - READ FIRST

### 🙋‍♂️ WHEN IN DOUBT, ASK!
- **Unclear requirements? ASK!**
- **Not sure which file to edit? ASK!**
- **Unsure about approach? ASK!**
- **Less than 90% certain? ASK!**
- **Questions are ALWAYS better than assumptions**

### 🎯 KEEP IT SIMPLE STUPID (KISS Principle)
- **When multiple solutions exist, ALWAYS pick the simplest one**
- **Only fulfill the exact request - don't add fancy extras**
- **Don't over-engineer or add "nice to have" features**
- **Simple working code > Complex "better" code**
- **If tempted to add extra features, ask first**

#### Examples:
```
❌ User asks: "Fix the button color"
   AI adds: Color fix + animations + hover effects + accessibility improvements

✅ User asks: "Fix the button color" 
   AI changes: Only the button color, nothing else

❌ User asks: "Add user name display"
   AI adds: Name display + profile picture + online status + last seen

✅ User asks: "Add user name display"
   AI adds: Just the user name, nothing more
```

### Core Rules
1. **DO NOT modify existing working features without explicit request**
2. **DO NOT update dependencies unless critical security issue**
3. **DO NOT refactor code that already works**
4. **DO NOT edit unrelated files - ask for permission first**
5. **DO NOT add features that weren't requested**
6. **ALWAYS use simplest solution that maintains compatibility**
7. **PREFER fixing specific issues over architectural changes**
8. **ALWAYS use pnpm (only use npm if pnpm impossible)**

### Confidence Threshold
- **If you're not 90% certain this is the correct file/approach, ask first**
- **Better to ask 3 questions than make 1 wrong assumption**

## 🎯 How to Get Best Results from AI

### Effective Prompting Techniques

#### Use These Magic Phrases:
- **"Keep it simple"** - Forces AI to choose simplest approach
- **"Implement the simplest next step I can test"** - Gets minimal working increment
- **"Change only [specific file]"** - Prevents unwanted file modifications
- **"What's the simplest way to..."** - Gets focused solutions
- **"Think as long as you need and ask me questions if you need more info"** - Encourages thorough analysis and clarification

#### Give AI Time to Think:
```
✅ "Think as long as you need and ask me questions if you need more info. Then implement the simplest solution."
✅ "Take your time to understand this issue. Ask questions if unclear, then keep it simple."
✅ "Analyze this carefully and ask for clarification if needed before making changes."

Benefits:
- AI will analyze the problem thoroughly
- AI will ask clarifying questions instead of guessing
- Results in better, more targeted solutions
- Reduces back-and-forth iterations
```

#### Specific File Targeting:
```
✅ Good: "Think as long as you need. Add a loading spinner to components/camera/AnalysisOverlay.tsx only"
✅ Good: "Take your time to understand the issue, then fix only the login function in services/authUtils.ts"
✅ Good: "Analyze carefully and ask questions if needed. Update only the dashboard screen app/(tabs)/index.tsx"

❌ Avoid: "Add loading spinners" (too vague, might edit multiple files)
❌ Avoid: "Improve the login flow" (too broad, unpredictable changes)
```

#### Progressive Development:
```
✅ "Implement the simplest next step I can test"
✅ "Add just the basic UI first, no logic yet"
✅ "Make the minimal change to fix this error"

❌ "Build the complete feature"
❌ "Implement everything we discussed"
```

#### Boundary Setting:
```
✅ "Only modify the button styling, don't touch anything else"
✅ "Fix this one function, leave the rest unchanged"
✅ "Add this field to the form only, no validation yet"
```

### Sample Effective Prompts:

**For Complex Issues:**
> "Think as long as you need and ask me questions if you need more info. What's the simplest way to fix the camera analysis not working?"

**For New Features:**
> "Take your time to understand the requirements. Ask questions if unclear. Then implement the simplest next step I can test: Add a basic logout button to the profile screen only"

**For Bug Investigation:**
> "Think as long as you need. Ask me for more details if needed. Then keep it simple and fix only the save button issue in components/camera/AnalysisOverlay.tsx"

## Troubleshooting Protocol

### When Fixes Don't Work (After 1 Failed Attempt)

If an AI fix doesn't resolve the issue:

1. **Stop trying random solutions**
2. **Search the web** for others who had the same error/issue
3. **Create a prioritized todo list** of potential solutions found
4. **Try only ONE solution at a time**
5. **Ask user to test after each attempt**

#### Example Process:
```
❌ First fix failed
🔍 Searching web for "expo camera children warning react native"
📋 Found 3 potential solutions:
   1. Use absolute positioning instead of children
   2. Update expo-camera to latest version  
   3. Wrap camera in View with specific props

🎯 Let's try solution #1 first. Please test this change.
```

### Web Search Strategy
- Include exact error messages in search
- Search for: "expo react native [error]", "stackoverflow [error]", "[library name] [issue]"
- Look for recent solutions (2023-2025)
- Prioritize solutions with multiple confirmations
- Focus on expo/react-native specific forums

### Solution Implementation
- **One change at a time** - never combine multiple solutions
- **Explain what each solution does** before implementing
- **Wait for test results** before trying next solution
- **Keep track of what was tried** to avoid repetition

## Quick Start

```bash
# Install dependencies (DO NOT update versions)
pnpm install

# Environment setup (.env exists but gitignored - ask if needed)
# Run the app
npx expo start
```

## File Edit Permissions

### ✅ Safe to Edit (with 90%+ confidence)
- `app/` - Main application screens
- `components/` - UI components
- `services/` - Business logic
- `utils/` - Utility functions
- `constants/` - App constants

### ⚠️ Ask First
- `package.json` - Dependencies
- `app.config.js` - App configuration
- `supabase/` - Database schemas
- Root config files
- Any file you're less than 90% sure about

## Commit Workflow

### When User Says "it works!" or "feature works finally!"
→ **Ask**: "Great! Would you like me to commit these changes?"

### When User Asks to Commit
→ **Ask**: "Please test one more time in Expo Go to make sure everything is correct. Ready to commit?"

### Testing Process
**Primary**: Expo Go app on physical iPhone  
**Always test before committing**: Load app → Test changed feature → Confirm working

## Core Features (ALL WORKING - DO NOT BREAK)

✅ **Food Analysis**: Take photo → AI analyzes → Get nutrition data  
✅ **Barcode Scanning**: Scan products → Get nutrition from database  
✅ **Meal History**: Track all meals with offline sync  
✅ **User Authentication**: Email/password + Google OAuth  
✅ **Onboarding Flow**: Collect user data → Paywall → Register  

## Project Structure

```
app/
├── (auth)/          # Login, register, OAuth callback
├── (onboarding)/    # User data collection + paywall
├── (tabs)/          # Main app: dashboard, camera, history, profile
│   ├── index.tsx    # Dashboard
│   ├── camera.tsx   # Food photo + analysis
│   ├── history.tsx  # Meal history
│   └── profile.tsx  # User settings
├── results/         # Food analysis results
└── meal/           # Meal details

services/
├── aiVisionService.ts      # OpenAI Vision API
├── mealService.ts          # Meal CRUD + offline sync
├── nutritionService.ts     # AI nutrition recommendations
├── productLookupService.ts # Barcode → nutrition data
└── db.ts                   # Supabase client

components/
├── camera/          # Camera UI + analysis overlay
├── food/            # Food analysis cards
└── ui/              # Reusable components
```

## Onboarding Flow - Complete Screen Reference

The onboarding flow consists of **12 screens** that collect user data, present the paywall, and complete registration. Most screens are **fully translated** with English/Arabic i18n support and RTL text handling.

### Onboarding Screens (`app/(onboarding)/`)

| Screen | File | Purpose | Translation Status |
|--------|------|---------|-------------------|
| **Paywall** | `paywall.tsx` | Access code entry + future payment options | ✅ **Fully translated** |
| **Experience** | `step2_experience.tsx` | "Have you tried other calorie tracking apps?" (Yes/No) | ✅ **Fully translated** |
| **Source** | `step3_source.tsx` | "How did you hear about us?" (Discovery method) | 🔄 **Needs translation** |
| **Workouts** | `step4_workouts.tsx` | "What types of workouts do you enjoy?" (Exercise preferences) | 🔄 **Needs translation** |
| **Gender** | `step5_gender.tsx` | "Choose your Gender" (Male/Female/Other) | ✅ **Fully translated** |
| **Goals** | `step6_goal.tsx` | "What is your goal?" (Lose/Maintain/Gain weight) | ✅ **Fully translated** |
| **Diet** | `step7_diet.tsx` | "Do you follow a specific diet?" (Classic/Pescatarian/Vegetarian/Vegan) | ✅ **Fully translated** |
| **Accomplishments** | `step8_accomplishments.tsx` | "What would you like to accomplish?" (Health goals) | ✅ **Fully translated** |
| **Obstacles** | `step9_obstacles.tsx` | "What's stopping you from reaching your goals?" (Challenges) | ✅ **Fully translated** |
| **Activity Level** | `step_activity_level.tsx` | "How many workouts per week?" (0-2/3-5/6+ with descriptions) | ✅ **Fully translated** |
| **Date of Birth** | `step_date_of_birth.tsx` | "When were you born?" (Day/Month/Year pickers) | ✅ **Fully translated** |
| **Height & Weight** | `step_height_weight.tsx` | "Enter your height and weight" (Metric units: cm/kg) | ✅ **Fully translated** |

### Translation Implementation

**Completed Screens (10/12):** All major data collection screens are fully localized
- ✅ Gender, Goals, Diet, Accomplishments, Obstacles, Activity Level, Date of Birth, Height/Weight, Experience, Paywall

**Remaining Screens (2/12):** Minor information gathering screens  
- 🔄 Source (`step3_source.tsx`) - Discovery method  
- 🔄 Workouts (`step4_workouts.tsx`) - Exercise preferences  

### Key Translation Features
- **Automatic Language Detection**: Based on device language settings
- **RTL Support**: Proper Arabic text display with right-to-left layout
- **Fallback System**: English fallback for missing translations  
- **Consistent Patterns**: All screens follow `i18n.t('onboarding.screen.key')` structure
- **Continue Buttons**: Universal `i18n.t('onboarding.common.continue')` → "Continue"/"متابعة"

### Onboarding Context (`OnboardingContext.tsx`)
Manages user data collection state across all screens:
- Stores responses from each step (gender, goals, height, weight, etc.)
- Controls flow navigation between screens
- Sets `isOnboardingComplete: true` after final registration
- Used by premium features to gate access

### Usage Example
```typescript
import i18n from '@/utils/i18n';

// Screen titles
{i18n.t('onboarding.gender.title')} // "Choose your Gender" / "اختر جنسك"

// Option labels  
{i18n.t('onboarding.goal.options.lose')} // "Lose weight" / "فقدان الوزن"

// Common buttons
{i18n.t('onboarding.common.continue')} // "Continue" / "متابعة"
```

## Key Implementation Details

### Authentication Flow
- `OnboardingContext` manages onboarding state
- `isOnboardingComplete` flag gates premium features
- Set to `true` ONLY after: data collection → paywall → registration

### Camera & Analysis
- Single-page experience with overlay
- Real-time progress animation during AI analysis
- Save/discard functionality with haptic feedback
- Auto-navigation to dashboard after save

### Offline Support
- Meals queue in AsyncStorage when offline
- Auto-sync when connection restored
- Handled by `mealService.ts` + `offlineQueue.ts`

## Environment Variables

```env
# Required for app to work (.env exists but gitignored)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_web_client_id
```

## Development Commands

```bash
# Package management (ALWAYS use pnpm first)
pnpm install              # Install dependencies
pnpm add [package]        # Add new package
# Only use npm if pnpm fails for specific task

# Development
npx expo start            # Start dev server
npx expo start --clear    # Start with cache cleared

# Type checking (run before committing)
npx tsc --noEmit

# Testing on device
# Use Expo Go app on iPhone - scan QR code
```

## Known Safe Warnings (Ignore These)

- `WARN: The <CameraView> component does not support children` - This is expected
- `WARN: [Layout children]: No route named "modal" exists` - This is expected

## Common AI Tasks

### Adding New Feature
1. **Ask questions** if requirements unclear
2. Create in appropriate directory following existing patterns
3. Use TypeScript + function components
4. Show changes → User tests in Expo Go → Ask to commit

### Fixing Bug
1. **Ask for clarification** if bug description unclear
2. Identify minimal files to change
3. Fix with smallest possible change
4. Show changes → User tests → Ask to commit

### Modifying UI
1. **Ask which specific component** if unclear
2. Find component in `components/` or `app/`
3. Follow existing style patterns
4. Test on iOS via Expo Go

## File Directory (Quick Reference)

- `CameraScreen` — `app/(tabs)/camera.tsx`: Camera + food analysis
- `AnalysisOverlay` — `components/camera/AnalysisOverlay.tsx`: Analysis UI overlay
- `DashboardScreen` — `app/(tabs)/index.tsx`: Main dashboard
- `LoginScreen` — `app/(auth)/login.tsx`: User authentication
- `OnboardingContext` — `app/OnboardingContext.tsx`: Onboarding state management
- `mealService` — `services/mealService.ts`: Meal data operations
- `aiVisionService` — `services/aiVisionService.ts`: OpenAI Vision integration
- `i18nConfig` — `utils/i18n.ts`: Internationalization configuration with Arabic RTL support
- `EnglishTranslations` — `locales/en.json`: English text translations
- `ArabicTranslations` — `locales/ar.json`: Arabic text translations

## ⚠️ IMPORTANT NOTES

1. **iOS Focus**: Primary platform, test with Expo Go on iPhone
2. **Google Auth**: Requires Google Cloud Console + Supabase setup
3. **Paywall**: Currently using access code for development
4. **Dependencies**: Pinned versions - ask before updating
5. **Environment**: .env file exists but gitignored

## AI Assistant Behavioral Guidelines

### Before Making Changes
1. **Read the request carefully**
2. **Ask questions if anything is unclear**
3. **Identify exact files that need modification**
4. **Ask permission for any file you're <90% sure about**

### While Making Changes
1. **Edit only necessary files**
2. **Use simplest approach that works**
3. **Follow existing code patterns**
4. **Maintain TypeScript types**

### After Making Changes
1. **Show what you changed**
2. **Wait for user to test in Expo Go**
3. **Listen for "it works" signals**
4. **Ask before committing**

### Question Examples
- "Which specific component should I modify for this UI change?"
- "Should I edit `services/mealService.ts` or create a new service?"
- "The requirement mentions 'dashboard' - do you mean `app/(tabs)/index.tsx`?"
- "I'm 80% sure this is the right approach - should I proceed or explore alternatives?"

---

**For AI Assistants**: This is a working production app. Ask questions liberally. Be cautious with file modifications. Test everything in Expo Go. Focus on minimal, working solutions over architectural improvements.