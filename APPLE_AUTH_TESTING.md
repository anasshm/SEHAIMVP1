# Apple Sign In - Phase 1 Testing Guide

## ✅ Setup Complete

All Phase 1 steps have been successfully implemented:

1. ✅ **Dependencies installed**: `expo-apple-authentication`
2. ✅ **App config updated**: Added `usesAppleSignIn: true` and plugin
3. ✅ **Apple auth service created**: `/services/appleAuthService.ts`
4. ✅ **Login UI updated**: Apple button added conditionally for iOS

## 🧪 How to Test Phase 1

### Step 1: Start Development Server
```bash
npx expo start --clear
```
**Note:** If you see "Unable to resolve module expo-apple-authentication" error:
1. Stop server (Ctrl+C)
2. Run `npx expo install --fix` (updates SDK dependencies)
3. Restart with `npx expo start --clear`

### Step 2: Test on iOS Simulator
1. Press `i` to open iOS Simulator
2. Wait for app to load
3. Navigate to the login screen (should auto-redirect from main page)

### Step 3: Verify Apple Button Visibility
**Expected Results:**
- ✅ On iOS: You should see both Google and Apple Sign In buttons
- ✅ On Android/Web: Only Google Sign In button (Apple button hidden)
- ✅ Apple button should be native black with rounded corners

### Step 4: Test Button Functionality (Basic)
**Without Supabase Configuration (Expected Behavior):**
- Tap Apple Sign In button
- iOS sign-in modal should appear
- Sign in with test Apple ID
- **Expected failure**: "Apple Sign In Failed" alert due to Supabase not configured yet
- **This is normal and expected at this stage**

### Step 5: Check Console Logs
**Expected Logs:**
```
✅ Apple sign-in successful: { email: "...", fullName: "...", hasIdentityToken: true }
❌ Supabase authentication error: [Error about unauthorized client]
```

## 🔍 Verification Checklist

Run the verification script:
```bash
node scripts/test-apple-auth-setup.js
```

**All items should be ✅:**
- Dependencies installed
- App config updated  
- Apple auth service exists
- Login page integration complete

## 🎯 Success Criteria for Phase 1

✅ **Configuration**: All setup steps completed without errors
✅ **UI Integration**: Apple button appears on iOS, hidden on other platforms
✅ **Basic Flow**: Button triggers Apple sign-in modal
✅ **Error Handling**: Graceful failure when Supabase not configured

## 🚀 Ready for Phase 2?

If all tests pass, you're ready to proceed to **Phase 2: Production Setup**:

1. Configure Apple Developer Portal
2. Add Apple Sign In capability to App ID
3. Configure Supabase with client IDs
4. Update iOS entitlements
5. Test EAS builds

## 🐛 Troubleshooting

### Apple Button Not Showing
- Check Platform.OS === 'ios'
- Verify `isAppleAuthAvailable()` returns true
- Check console for availability errors

### Sign-in Modal Not Appearing
- Ensure you're testing on iOS (simulator or device)
- Check if Apple Sign In is enabled in iOS Settings

### Build Errors (If Testing Builds)
- This is expected if you try to build now
- Wait for Phase 2 to configure provisioning profiles

## 📱 Test Devices

**Working Platforms:**
- ✅ iOS Simulator (recommended for Phase 1)
- ✅ Physical iOS device with iOS 13+

**Non-Working Platforms (Expected):**
- ❌ Android (button hidden, expected)
- ❌ Web (button hidden, expected)
- ❌ Expo Go on older iOS versions

---

**Phase 1 Status: ✅ COMPLETE**
**Ready for Phase 2: 🟡 PENDING APPROVAL**
