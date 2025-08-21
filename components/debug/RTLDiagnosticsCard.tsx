import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { palette } from '@/constants/Colors';
import { getRTLStatusForUI, logRTLDiagnostics, testRTLCorrectness } from '@/utils/rtlDiagnostics';

/**
 * RTL Diagnostics Card Component
 * 
 * This is a temporary debug component to display RTL status in the UI.
 * Add this to any screen to see real-time RTL diagnostic information.
 * 
 * Usage: <RTLDiagnosticsCard />
 */

interface RTLStatus {
  language: string;
  direction: string;
  expectedDirection: string;
  isCorrect: boolean;
  status: string;
  issues: string[];
}

export default function RTLDiagnosticsCard() {
  const [rtlStatus, setRtlStatus] = useState<RTLStatus | null>(null);

  const updateStatus = () => {
    const status = getRTLStatusForUI();
    setRtlStatus(status);
    
    // Log detailed diagnostics to console
    logRTLDiagnostics('RTL Diagnostics Card Update');
  };

  useEffect(() => {
    updateStatus();
    
    // Auto-refresh every 2 seconds to catch changes
    const interval = setInterval(updateStatus, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const handleDetailedLog = () => {
    const test = testRTLCorrectness();
    const diagnostics = logRTLDiagnostics('Manual Detailed Check');
    
    Alert.alert(
      'RTL Diagnostics',
      `Status: ${test.isCorrect ? 'CORRECT ✅' : 'INCORRECT ❌'}\n\n` +
      `Language: ${diagnostics.currentI18nLocale.toUpperCase()}\n` +
      `Layout: ${diagnostics.layoutDirection}\n` +
      `Expected: ${diagnostics.expectedLayoutDirection}\n\n` +
      (test.issues.length > 0 ? `Issues:\n${test.issues.join('\n')}` : 'No issues found!'),
      [{ text: 'OK' }]
    );
  };

  if (!rtlStatus) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading RTL Diagnostics...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, rtlStatus.isCorrect ? styles.correctBorder : styles.incorrectBorder]}>
      <Text style={styles.title}>🔍 RTL Diagnostics</Text>
      
      <View style={styles.row}>
        <Text style={styles.label}>Language:</Text>
        <Text style={[styles.value, styles.language]}>{rtlStatus.language}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Current Layout:</Text>
        <Text style={[styles.value, styles.direction]}>{rtlStatus.direction}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Expected Layout:</Text>
        <Text style={[styles.value, styles.expectedDirection]}>{rtlStatus.expectedDirection}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Status:</Text>
        <Text style={[
          styles.value, 
          styles.status, 
          rtlStatus.isCorrect ? styles.statusCorrect : styles.statusIncorrect
        ]}>
          {rtlStatus.status}
        </Text>
      </View>

      {rtlStatus.issues.length > 0 && (
        <View style={styles.issuesContainer}>
          <Text style={styles.issuesTitle}>Issues Found:</Text>
          {rtlStatus.issues.map((issue, index) => (
            <Text key={index} style={styles.issueText}>• {issue}</Text>
          ))}
        </View>
      )}
      
      <TouchableOpacity style={styles.button} onPress={handleDetailedLog}>
        <Text style={styles.buttonText}>Show Detailed Log</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.refreshButton} onPress={updateStatus}>
        <Text style={styles.buttonText}>🔄 Refresh</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  correctBorder: {
    borderColor: '#10B981', // Green border for correct
  },
  incorrectBorder: {
    borderColor: '#EF4444', // Red border for incorrect
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: palette.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  language: {
    color: '#8B5CF6', // Purple
  },
  direction: {
    color: '#3B82F6', // Blue
  },
  expectedDirection: {
    color: '#059669', // Green
  },
  status: {
    fontSize: 16,
  },
  statusCorrect: {
    color: '#10B981', // Green
  },
  statusIncorrect: {
    color: '#EF4444', // Red
  },
  issuesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FEF2F2', // Light red background
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  issuesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#B91C1C',
    marginBottom: 8,
  },
  issueText: {
    fontSize: 12,
    color: '#DC2626',
    marginBottom: 4,
    lineHeight: 16,
  },
  button: {
    backgroundColor: palette.primary,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  refreshButton: {
    backgroundColor: '#6B7280',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
