#!/usr/bin/env node

/**
 * Configuration verification for Google Sign-in
 * Checks what's already configured and what still needs to be done
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Google Sign-in Configuration Status...\n');

let configComplete = true;

// Check 1: Environment variables
console.log('🌍 Step 1: Checking environment variables...');
const envPath = '.env';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ .env file exists');
  
  // Check for Google Web Client ID
  if (envContent.includes('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID')) {
    const webClientMatch = envContent.match(/EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=(.+)/);
    if (webClientMatch && webClientMatch[1] && !webClientMatch[1].includes('your_google')) {
      console.log('✅ EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is configured');
    } else {
      console.log('❌ EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID needs to be set');
      configComplete = false;
    }
  } else {
    console.log('❌ EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID not found in .env');
    configComplete = false;
  }
} else {
  console.log('❌ .env file not found');
  console.log('   📝 Create .env file based on env.example');
  configComplete = false;
}

// Check 2: app.config.js iOS URL Scheme
console.log('\n📱 Step 2: Checking iOS URL Scheme in app.config.js...');
try {
  const appConfigContent = fs.readFileSync('app.config.js', 'utf8');
  const urlSchemeMatch = appConfigContent.match(/iosUrlScheme["']:\s*["']([^"']+)["']/);
  
  if (urlSchemeMatch) {
    const urlScheme = urlSchemeMatch[1];
    if (urlScheme.includes('YOUR_IOS_CLIENT_ID')) {
      console.log('❌ iosUrlScheme still contains placeholder');
      console.log('   📝 Replace YOUR_IOS_CLIENT_ID with actual iOS Client ID');
      configComplete = false;
    } else {
      console.log('✅ iosUrlScheme is configured');
      console.log(`   Current: ${urlScheme}`);
    }
  } else {
    console.log('❌ iosUrlScheme not found in app.config.js');
    configComplete = false;
  }
} catch (error) {
  console.log('❌ Error reading app.config.js:', error.message);
  configComplete = false;
}

// Information gathering
console.log('\n📋 Configuration Checklist:');
console.log('\nTo complete setup, you need:');
console.log('1. 📱 iOS OAuth Client ID (from Google Console)');
console.log('   - Bundle ID should be: sehai.createvalue.app');
console.log('   - Used in: app.config.js iosUrlScheme');
console.log('');
console.log('2. 🌐 Web OAuth Client ID (from Google Console)');
console.log('   - Application type: Web application');
console.log('   - Used in: .env file as EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID');
console.log('');
console.log('3. 🔐 Web OAuth Client Secret (from Google Console)');
console.log('   - Same as Web Client ID but the secret');
console.log('   - Used in: Supabase Auth > Providers > Google');
console.log('');

// Supabase configuration check
console.log('🛢️ Supabase Configuration:');
console.log('In your Supabase dashboard:');
console.log('- Go to Authentication > Providers > Google');
console.log('- Set Client ID: [Your Web Client ID]');
console.log('- Set Client Secret: [Your Web Client Secret]');
console.log('- Add to Authorized Client IDs: [Your Web Client ID]');

console.log('\n' + '='.repeat(60));
if (configComplete) {
  console.log('🎉 Configuration appears complete!');
  console.log('📝 Ready to proceed to Phase 3: Code Implementation');
} else {
  console.log('⚠️  Configuration incomplete.');
  console.log('📝 Please complete the missing items above.');
}
console.log('='.repeat(60));

// Provide the next steps
console.log('\n🚀 Next Steps:');
if (!configComplete) {
  console.log('1. Complete the missing configuration items above');
  console.log('2. Run this script again to verify: node scripts/check-google-signin-config.js');
  console.log('3. Once complete, we can proceed to code implementation');
} else {
  console.log('1. Ready to proceed to Phase 3: Code Implementation');
  console.log('2. We will create the Google Auth service');
  console.log('3. Update the login screen with Google Sign-in button');
}
