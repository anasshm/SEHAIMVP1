#!/usr/bin/env node

/**
 * Verification script for Google Sign-in Phase 1 setup
 * This script checks that all installation and configuration steps were completed correctly
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Google Sign-in Phase 1 Setup...\n');

let allTestsPassed = true;

// Test 1: Check if package is installed in dependencies
console.log('📦 Test 1: Checking package installation...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const hasGoogleSignin = packageJson.dependencies && 
    packageJson.dependencies['@react-native-google-signin/google-signin'];
  
  if (hasGoogleSignin) {
    console.log('✅ @react-native-google-signin/google-signin found in dependencies');
    console.log(`   Version: ${packageJson.dependencies['@react-native-google-signin/google-signin']}`);
  } else {
    console.log('❌ @react-native-google-signin/google-signin NOT found in dependencies');
    allTestsPassed = false;
  }
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
  allTestsPassed = false;
}

// Test 2: Check if package is in onlyBuiltDependencies
console.log('\n🔒 Test 2: Checking onlyBuiltDependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const onlyBuiltDeps = packageJson.pnpm && packageJson.pnpm.onlyBuiltDependencies;
  
  if (onlyBuiltDeps && onlyBuiltDeps.includes('@react-native-google-signin/google-signin')) {
    console.log('✅ @react-native-google-signin/google-signin found in onlyBuiltDependencies');
  } else {
    console.log('❌ @react-native-google-signin/google-signin NOT found in onlyBuiltDependencies');
    allTestsPassed = false;
  }
} catch (error) {
  console.log('❌ Error checking onlyBuiltDependencies:', error.message);
  allTestsPassed = false;
}

// Test 3: Check if plugin is configured in app.config.js
console.log('\n⚙️ Test 3: Checking app.config.js plugin configuration...');
try {
  const appConfigPath = 'app.config.js';
  const appConfigContent = fs.readFileSync(appConfigPath, 'utf8');
  
  if (appConfigContent.includes('@react-native-google-signin/google-signin')) {
    console.log('✅ Google Sign-in plugin found in app.config.js');
    
    // Check for iosUrlScheme configuration
    if (appConfigContent.includes('iosUrlScheme')) {
      console.log('✅ iosUrlScheme configuration found');
      
      if (appConfigContent.includes('YOUR_IOS_CLIENT_ID')) {
        console.log('⚠️  iosUrlScheme still contains placeholder - needs real iOS Client ID');
      } else {
        console.log('✅ iosUrlScheme appears to be configured with real Client ID');
      }
    } else {
      console.log('❌ iosUrlScheme configuration NOT found');
      allTestsPassed = false;
    }
  } else {
    console.log('❌ Google Sign-in plugin NOT found in app.config.js');
    allTestsPassed = false;
  }
} catch (error) {
  console.log('❌ Error reading app.config.js:', error.message);
  allTestsPassed = false;
}

// Test 4: Check if node_modules contains the package
console.log('\n📁 Test 4: Checking node_modules...');
const nodeModulesPath = path.join('node_modules', '@react-native-google-signin', 'google-signin');
if (fs.existsSync(nodeModulesPath)) {
  console.log('✅ Package found in node_modules');
  
  // Check if package.json exists in the module
  const modulePackageJson = path.join(nodeModulesPath, 'package.json');
  if (fs.existsSync(modulePackageJson)) {
    try {
      const moduleInfo = JSON.parse(fs.readFileSync(modulePackageJson, 'utf8'));
      console.log(`   Module version: ${moduleInfo.version}`);
    } catch (error) {
      console.log('⚠️  Could not read module package.json');
    }
  }
} else {
  console.log('❌ Package NOT found in node_modules - run pnpm install');
  allTestsPassed = false;
}

// Test 5: Check bundle identifier consistency
console.log('\n🏷️ Test 5: Checking bundle identifier...');
try {
  const appConfigContent = fs.readFileSync('app.config.js', 'utf8');
  const iosBundleMatch = appConfigContent.match(/bundleIdentifier:\s*["']([^"']+)["']/);
  const androidPackageMatch = appConfigContent.match(/package:\s*["']([^"']+)["']/);
  
  if (iosBundleMatch) {
    console.log(`✅ iOS bundle identifier: ${iosBundleMatch[1]}`);
  } else {
    console.log('⚠️  iOS bundle identifier not found');
  }
  
  if (androidPackageMatch) {
    console.log(`✅ Android package name: ${androidPackageMatch[1]}`);
  } else {
    console.log('⚠️  Android package name not found');
  }
} catch (error) {
  console.log('❌ Error checking bundle identifiers:', error.message);
}

// Summary
console.log('\n' + '='.repeat(50));
if (allTestsPassed) {
  console.log('🎉 All Phase 1 tests passed!');
  console.log('\n📋 Next steps:');
  console.log('1. Create iOS OAuth Client ID in Google Console');
  console.log('2. Replace YOUR_IOS_CLIENT_ID in app.config.js with real iOS Client ID');
  console.log('3. Create Web OAuth Client ID in Google Console');
  console.log('4. Configure Supabase with Web Client credentials');
  console.log('5. Run: npx expo prebuild --clean');
  console.log('6. Build development version: eas build --platform ios --profile development');
} else {
  console.log('❌ Some tests failed. Please fix the issues above before proceeding.');
}
console.log('='.repeat(50));
