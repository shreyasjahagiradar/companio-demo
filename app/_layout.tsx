import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function RootLayout() {
  useFrameworkReady();
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;

  return (
    <View style={[styles.appContainer, isLargeScreen && styles.appContainerLarge]}>
      <View style={[styles.mainContent, isLargeScreen && styles.mainContentLarge]}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding/login" />
          <Stack.Screen name="onboarding/practitioner" />
          <Stack.Screen name="onboarding/health-snapshot" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="reports/index" />
          <Stack.Screen name="reports/[id]" />
          <Stack.Screen name="checkin/symptoms" options={{ presentation: 'card' }} />
          <Stack.Screen name="checkin/gut" options={{ presentation: 'card' }} />
          <Stack.Screen name="checkin/meals" options={{ presentation: 'card' }} />
          <Stack.Screen name="checkin/lifestyle" options={{ presentation: 'card' }} />
          <Stack.Screen name="checkin/complete" options={{ presentation: 'card' }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#F4F7F5',
    alignItems: 'center',
  },
  appContainerLarge: {
    paddingHorizontal: Platform.OS === 'web' ? 96 : 0,
  },
  mainContent: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F0F4F2',
    borderBottomWidth: 4,
    borderBottomColor: '#1B3B2B', // Or another theme color that fits
  },
  mainContentLarge: {
    maxWidth: 2400,
    ...Platform.select({
      web: {
        boxShadow: '0px 0px 40px rgba(27, 59, 43, 0.08)',
      }
    })
  }
});
