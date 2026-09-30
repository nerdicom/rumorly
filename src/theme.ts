import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SystemUI from 'expo-system-ui';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Appearance, Platform, StyleSheet } from 'react-native';

export type ThemeMode = 'light' | 'dark';
export const THEME_STORAGE_KEY = 'rumorly:appearance:v1';
const lightColors = {
  bg: '#F6F5FA', paper: '#FFFFFF', ink: '#252135', muted: '#696377',
  line: '#E3DFEC', accent: '#6842D6', accentSoft: '#EEE8FC', onAccent: '#FFFFFF',
  panel: '#EEE8FC', panelLine: '#DBD0F6', highlight: '#DDD0FF',
  green: '#236544', softGreen: '#E2F2E9', blue: '#345A9C', softBlue: '#E7EEFC',
  neutral: '#EEECF3', switchTrack: '#9185A7', shadow: 'rgba(38, 28, 65, 0.04)',
};
type Palette = { [K in keyof typeof lightColors]: string };
const darkColors: Palette = {
  bg: '#111118', paper: '#1C1B27', ink: '#F4F0FF', muted: '#B2ABBF',
  line: '#373241', accent: '#BCA2FF', accentSoft: '#332847', onAccent: '#211436',
  panel: '#272033', panelLine: '#453657', highlight: '#49355F',
  green: '#8CD9AE', softGreen: '#1F372C', blue: '#A6C7FF', softBlue: '#26354F',
  neutral: '#2A2733', switchTrack: '#70647F', shadow: 'rgba(0, 0, 0, 0.12)',
};
export const serif = Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia, "Times New Roman", serif', default: 'serif' });
function makeStyles(c: Palette) {
  return StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    h1: { fontFamily: serif, fontSize: 38, lineHeight: 43, letterSpacing: -1.3, color: c.ink },
    h2: { fontFamily: serif, fontSize: 26, lineHeight: 32, color: c.ink, letterSpacing: -0.4 },
    h3: { fontSize: 17, fontWeight: '700', color: c.ink, lineHeight: 24 },
    body: { fontSize: 15, lineHeight: 23, color: c.muted },
    small: { fontSize: 12, lineHeight: 18, color: c.muted },
    label: { fontSize: 10, fontWeight: '800', letterSpacing: 1.8, color: c.accent },
    card: { backgroundColor: c.paper, borderWidth: 1, borderColor: c.line, borderRadius: 22, padding: 20, gap: 14, boxShadow: `0 4px 16px ${c.shadow}` },
    input: { backgroundColor: c.paper, borderColor: c.line, borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: c.ink, minHeight: 52 },
  });
}
const themes = {
  light: { c: lightColors, s: makeStyles(lightColors) },
  dark: { c: darkColors, s: makeStyles(darkColors) },
};
type ThemeContextValue = typeof themes.light & {
  mode: ThemeMode; isDark: boolean; ready: boolean; storageError: string;
  setMode: (mode: ThemeMode) => void;
};
const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Device appearance stays separate from account and demo data. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => Appearance.getColorScheme() === 'dark' ? 'dark' : 'light');
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState('');
  const pendingWrites = useRef(Promise.resolve());
  const latestWrite = useRef(0);
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(THEME_STORAGE_KEY).then(saved => {
      if (active && (saved === 'light' || saved === 'dark')) setModeState(saved);
    }).catch(() => {
      if (active) setStorageError('Your appearance preference could not be loaded. You can still switch themes.');
    }).finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);
  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    setStorageError('');
    const request = ++latestWrite.current;
    // Serialize writes so rapid toggles cannot restore an older preference.
    pendingWrites.current = pendingWrites.current.then(() => AsyncStorage.setItem(THEME_STORAGE_KEY, next)).catch(() => {
      if (latestWrite.current === request) setStorageError('This theme is active, but could not be saved for next time. Try the switch again.');
    });
  }, []);
  const theme = themes[mode];
  useEffect(() => {
    if (!ready) return;
    if (Platform.OS !== 'web') Appearance.setColorScheme(mode);
    else if (typeof document !== 'undefined') document.documentElement.style.colorScheme = mode;
    void SystemUI.setBackgroundColorAsync(theme.c.bg).catch(() => {});
  }, [mode, ready, theme]);
  const value = useMemo(() => ({ ...theme, mode, isDark: mode === 'dark', ready, storageError, setMode }), [theme, mode, ready, storageError, setMode]);
  return React.createElement(ThemeContext.Provider, { value }, children);
}
export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be inside ThemeProvider');
  return value;
}
