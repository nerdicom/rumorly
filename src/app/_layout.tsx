import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Onboarding } from '../components/Onboarding';
import { AppStore, useApp } from '../store/AppStore';
import { AuthStore, useAuth } from '../store/AuthStore';
import { c } from '../theme';

function RootNavigation() {
  const { state, ready, storageError } = useApp();
  const { error } = useAuth();
  if (!ready) return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: c.bg }}><ActivityIndicator color={c.accent} accessibilityLabel="Loading Rumorly" /></View>;
  return <><StatusBar style="dark" />
    {(storageError || error) && <View style={{ backgroundColor: c.rose, padding: 12 }}><Text accessibilityRole="alert" style={{ color: c.accent }}>{storageError || error}</Text></View>}
    {state.onboarded ? <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }} /> : <Onboarding />}
  </>;
}
export default function RootLayout() { return <SafeAreaProvider><AuthStore><AppStore><RootNavigation /></AppStore></AuthStore></SafeAreaProvider>; }
