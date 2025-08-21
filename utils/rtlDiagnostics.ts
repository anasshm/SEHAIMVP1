import { I18nManager } from 'react-native';
import { getLocales } from 'expo-localization';
import i18n, { getCurrentLocale, isRTL } from './i18n';

/**
 * RTL Diagnostics Utility
 * 
 * This utility helps identify RTL/LTR issues by logging comprehensive
 * information about the current language and layout direction state.
 */

export interface RTLDiagnosticInfo {
  // Language Detection
  deviceLocale: string;
  deviceLanguageCode: string;
  currentI18nLocale: string;
  
  // RTL State
  isRTLFunction: boolean;
  reactNativeRTL: boolean;
  shouldBeRTL: boolean;
  
  // Computed States
  isLanguageArabic: boolean;
  isLanguageEnglish: boolean;
  isRTLMismatch: boolean;
  layoutDirection: 'LTR' | 'RTL';
  expectedLayoutDirection: 'LTR' | 'RTL';
  
  // System Information
  timestamp: string;
  appRestartNeeded: boolean;
}

/**
 * Get comprehensive RTL diagnostic information
 */
export const getRTLDiagnostics = (): RTLDiagnosticInfo => {
  const deviceLocales = getLocales();
  const deviceLocale = deviceLocales[0]?.languageCode || 'unknown';
  const deviceLanguageCode = deviceLocales[0]?.languageCode || 'unknown';
  const currentI18nLocale = getCurrentLocale();
  const isRTLFunction = isRTL();
  const reactNativeRTL = I18nManager.isRTL;
  
  // Determine what the state SHOULD be
  const shouldBeRTL = currentI18nLocale === 'ar';
  const isLanguageArabic = currentI18nLocale === 'ar';
  const isLanguageEnglish = currentI18nLocale === 'en';
  
  // Check for mismatches
  const isRTLMismatch = shouldBeRTL !== reactNativeRTL;
  const appRestartNeeded = isRTLMismatch;
  
  // Determine actual vs expected layout
  const layoutDirection = reactNativeRTL ? 'RTL' : 'LTR';
  const expectedLayoutDirection = shouldBeRTL ? 'RTL' : 'LTR';
  
  return {
    deviceLocale,
    deviceLanguageCode,
    currentI18nLocale,
    isRTLFunction,
    reactNativeRTL,
    shouldBeRTL,
    isLanguageArabic,
    isLanguageEnglish,
    isRTLMismatch,
    layoutDirection,
    expectedLayoutDirection,
    timestamp: new Date().toISOString(),
    appRestartNeeded,
  };
};

/**
 * Log RTL diagnostics to console with formatted output
 */
export const logRTLDiagnostics = (context: string = 'RTL Check') => {
  const diagnostics = getRTLDiagnostics();
  
  console.log('\n🔍 ===== RTL DIAGNOSTICS =====');
  console.log(`📍 Context: ${context}`);
  console.log(`⏰ Timestamp: ${diagnostics.timestamp}`);
  console.log('\n📱 DEVICE & LANGUAGE:');
  console.log(`   Device Locale: ${diagnostics.deviceLocale}`);
  console.log(`   Device Language Code: ${diagnostics.deviceLanguageCode}`);
  console.log(`   Current i18n Locale: ${diagnostics.currentI18nLocale}`);
  console.log(`   Is Language Arabic: ${diagnostics.isLanguageArabic}`);
  console.log(`   Is Language English: ${diagnostics.isLanguageEnglish}`);
  
  console.log('\n🔄 RTL STATE:');
  console.log(`   isRTL() Function: ${diagnostics.isRTLFunction}`);
  console.log(`   React Native RTL: ${diagnostics.reactNativeRTL}`);
  console.log(`   Should Be RTL: ${diagnostics.shouldBeRTL}`);
  
  console.log('\n📐 LAYOUT DIRECTION:');
  console.log(`   Current Layout: ${diagnostics.layoutDirection}`);
  console.log(`   Expected Layout: ${diagnostics.expectedLayoutDirection}`);
  
  console.log('\n⚠️  ISSUES:');
  console.log(`   RTL Mismatch: ${diagnostics.isRTLMismatch ? '❌ YES' : '✅ NO'}`);
  console.log(`   App Restart Needed: ${diagnostics.appRestartNeeded ? '❌ YES' : '✅ NO'}`);
  
  if (diagnostics.isRTLMismatch) {
    console.log('\n🚨 PROBLEM DETECTED:');
    console.log(`   Language is ${diagnostics.currentI18nLocale.toUpperCase()}`);
    console.log(`   Layout direction is ${diagnostics.layoutDirection}`);
    console.log(`   But should be ${diagnostics.expectedLayoutDirection}`);
    console.log('   This explains why the UI appears backwards!');
  }
  
  console.log('\n================================\n');
  
  return diagnostics;
};

/**
 * Quick test to verify if RTL is working correctly
 */
export const testRTLCorrectness = (): { isCorrect: boolean; issues: string[] } => {
  const diagnostics = getRTLDiagnostics();
  const issues: string[] = [];
  
  // Test 1: Language-direction consistency
  if (diagnostics.isRTLMismatch) {
    issues.push(`RTL mismatch: Language is ${diagnostics.currentI18nLocale} but layout is ${diagnostics.layoutDirection}`);
  }
  
  // Test 2: Function consistency
  if (diagnostics.isRTLFunction !== diagnostics.shouldBeRTL) {
    issues.push(`isRTL() function returns ${diagnostics.isRTLFunction} but should return ${diagnostics.shouldBeRTL}`);
  }
  
  // Test 3: React Native vs expected
  if (diagnostics.reactNativeRTL !== diagnostics.shouldBeRTL) {
    issues.push(`React Native RTL is ${diagnostics.reactNativeRTL} but should be ${diagnostics.shouldBeRTL}`);
  }
  
  return {
    isCorrect: issues.length === 0,
    issues
  };
};

/**
 * Test component to display RTL status in the UI
 */
export const getRTLStatusForUI = () => {
  const diagnostics = getRTLDiagnostics();
  const test = testRTLCorrectness();
  
  return {
    language: diagnostics.currentI18nLocale.toUpperCase(),
    direction: diagnostics.layoutDirection,
    expectedDirection: diagnostics.expectedLayoutDirection,
    isCorrect: test.isCorrect,
    status: test.isCorrect ? '✅ CORRECT' : '❌ INCORRECT',
    issues: test.issues
  };
};
