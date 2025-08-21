#!/usr/bin/env node

/**
 * Test script to verify Google Sign-in package can be imported
 * This helps catch any installation issues early
 */

console.log('🧪 Testing Google Sign-in package import...\n');

try {
  // Test importing the main GoogleSignin class
  const { GoogleSignin } = require('@react-native-google-signin/google-signin');
  
  console.log('✅ Successfully imported GoogleSignin');
  console.log('   Available methods:', Object.getOwnPropertyNames(GoogleSignin).filter(name => typeof GoogleSignin[name] === 'function'));
  
  // Test importing GoogleSigninButton
  const { GoogleSigninButton } = require('@react-native-google-signin/google-signin');
  console.log('✅ Successfully imported GoogleSigninButton');
  
  // Test importing types (these might not be available in JS, but let's try)
  try {
    const statusCodes = require('@react-native-google-signin/google-signin').statusCodes;
    console.log('✅ Successfully imported statusCodes');
  } catch (e) {
    console.log('⚠️  statusCodes not available (normal in JS environment)');
  }
  
  console.log('\n🎉 Package import test passed!');
  console.log('📝 Note: This only tests import capability, not runtime functionality');
  console.log('   Runtime functionality requires a development build on a device');
  
} catch (error) {
  console.log('❌ Failed to import Google Sign-in package:');
  console.log('   Error:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Make sure pnpm install completed successfully');
  console.log('2. Check if the package exists in node_modules');
  console.log('3. Try running: pnpm install --force');
  process.exit(1);
}
