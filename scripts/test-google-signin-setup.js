#!/usr/bin/env node

/**
 * Test script to verify the complete Google Sign-in setup
 * This checks configuration, imports, and readiness for testing
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Complete Google Sign-in Setup...\n');

let allTestsPassed = true;

// Test 1: Verify package installation and configuration
console.log('📦 Test 1: Package and Configuration...');
try {
  // Check package.json
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const hasPackage = packageJson.dependencies['@react-native-google-signin/google-signin'];
  const isInBuiltDeps = packageJson.pnpm?.onlyBuiltDependencies?.includes('@react-native-google-signin/google-signin');
  
  if (hasPackage && isInBuiltDeps) {
    console.log('✅ Package correctly installed and configured');
  } else {
    console.log('❌ Package installation issue');
    allTestsPassed = false;
  }
  
  // Check app.config.js
  const appConfig = fs.readFileSync('app.config.js', 'utf8');
  if (appConfig.includes('@react-native-google-signin/google-signin') && 
      appConfig.includes('iosUrlScheme') && 
      !appConfig.includes('YOUR_IOS_CLIENT_ID')) {
    console.log('✅ App configuration looks correct');
  } else {
    console.log('❌ App configuration issue');
    allTestsPassed = false;
  }
  
} catch (error) {
  console.log('❌ Configuration check failed:', error.message);
  allTestsPassed = false;
}

// Test 2: Verify environment variables
console.log('\n🌍 Test 2: Environment Variables...');
try {
  if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    const hasWebClientId = envContent.includes('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=') && 
                          !envContent.includes('your_google_web_client_id');
    const hasIosClientId = envContent.includes('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=') && 
                          !envContent.includes('your_google_ios_client_id');
    
    if (hasWebClientId && hasIosClientId) {
      console.log('✅ Google Client IDs configured in .env');
    } else {
      console.log('❌ Missing or incomplete Google Client IDs in .env');
      allTestsPassed = false;
    }
  } else {
    console.log('❌ .env file not found');
    allTestsPassed = false;
  }
} catch (error) {
  console.log('❌ Environment variables check failed:', error.message);
  allTestsPassed = false;
}

// Test 3: Verify service files exist
console.log('\n📁 Test 3: Service Files...');
const requiredFiles = [
  'services/googleAuthService.ts',
  'src/services/AuthContext.tsx',
  'src/services/supabase.ts',
  'app/(auth)/login.tsx'
];

for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} missing`);
    allTestsPassed = false;
  }
}

// Test 4: Check service integration
console.log('\n🔗 Test 4: Service Integration...');
try {
  const authContextContent = fs.readFileSync('src/services/AuthContext.tsx', 'utf8');
  if (authContextContent.includes('googleAuthService')) {
    console.log('✅ AuthContext integrated with native Google Auth service');
  } else {
    console.log('⚠️  AuthContext may not be using the native Google Auth service');
  }
  
  const loginScreenContent = fs.readFileSync('app/(auth)/login.tsx', 'utf8');
  if (loginScreenContent.includes('signInWithGoogle') && loginScreenContent.includes('handleGoogleSignIn')) {
    console.log('✅ Login screen has Google Sign-in implementation');
  } else {
    console.log('❌ Login screen missing Google Sign-in implementation');
    allTestsPassed = false;
  }
} catch (error) {
  console.log('❌ Service integration check failed:', error.message);
  allTestsPassed = false;
}

// Test 5: Next steps verification
console.log('\n🚀 Test 5: Readiness Check...');
const nextSteps = [];

if (!fs.existsSync('ios') || !fs.existsSync('android')) {
  nextSteps.push('Run: npx expo prebuild --clean');
}

nextSteps.push('Build development version: eas build --platform ios --profile development');
nextSteps.push('Install on physical iPhone');
nextSteps.push('Test Google Sign-in flow');

console.log('📋 Next steps to complete setup:');
nextSteps.forEach((step, index) => {
  console.log(`${index + 1}. ${step}`);
});

// Summary
console.log('\n' + '='.repeat(60));
if (allTestsPassed) {
  console.log('🎉 All setup tests passed!');
  console.log('📱 Ready for development build and testing');
  console.log('\n🔧 To test:');
  console.log('1. npx expo prebuild --clean (if needed)');
  console.log('2. eas build --platform ios --profile development');
  console.log('3. Install on iPhone and test Google Sign-in');
} else {
  console.log('❌ Some tests failed. Please fix the issues above before building.');
}
console.log('='.repeat(60));
