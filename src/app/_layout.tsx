import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Onboarding } from '../components/Onboarding';
import { AppStore, useApp } from '../store/AppStore';
import { AuthStore, useAuth } from '../store/AuthStore';
import { ThemeProvider, useTheme } from '../theme';

function RootNavigation() {
  const { c, isDark, ready: themeReady, storageError: themeError } = useTheme();
  const { state, ready, storageError } = useApp();
  const { error } = useAuth();
  if (!ready || !themeReady) return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: c.bg }}><ActivityIndicator color={c.accent} accessibilityLabel="Loading Rumorly" /></View>;
  return <><StatusBar style={isDark ? "light" : "dark"} />
    {(storageError || error || themeError) && <View style={{ backgroundColor: c.accentSoft, padding: 12 }}><Text accessibilityRole="alert" style={{ color: c.accent }}>{storageError || error || themeError}</Text></View>}
    {state.onboarded ? <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }} /> : <Onboarding />}
  </>;
}
export default function RootLayout() { return <SafeAreaProvider><ThemeProvider><AuthStore><AppStore><RootNavigation /></AppStore></AuthStore></ThemeProvider></SafeAreaProvider>; }
