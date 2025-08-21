import { Redirect } from 'expo-router';
import { useEffect } from 'react';

// This is the entry point of the app
// Redirect to the camera tab by default
export default function Index() {
  return <Redirect href="/(tabs)/camera" />
}
