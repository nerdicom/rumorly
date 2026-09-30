import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Onboarding } from '../components/Onboarding';
import { AppStore, useApp } from '../store/AppStore';
import { c } from '../theme';

function RootNavigation() {
  const { state, ready, storageError } = useApp();
  if (!ready) return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: c.bg }}><ActivityIndicator color={c.accent} accessibilityLabel="Loading Rumorly" /></View>;
  return <><StatusBar style="dark" />
    {storageError && <View style={{ backgroundColor: c.rose, padding: 12 }}><Text accessibilityRole="alert" style={{ color: c.accent }}>{storageError}</Text></View>}
    {state.onboarded ? <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }} /> : <Onboarding />}
  </>;
}
export default function RootLayout() { return <SafeAreaProvider><AppStore><RootNavigation /></AppStore></SafeAreaProvider>; }
