import React from 'react';
import { Platform, Switch, Text, View } from 'react-native';
import { useTheme } from '../theme';
import { Icon } from './ui';

export function ThemeSwitch({ compact = false }: { compact?: boolean }) {
  const { c, s, isDark, ready, setMode } = useTheme();
  return <View style={[s.row, { gap: compact ? 6 : 12, minHeight: 44 }]}>
    <Icon name={isDark ? 'moon-outline' : 'sunny-outline'} size={compact ? 16 : 22} color={c.accent} />
    {!compact && <View style={{ flex: 1, gap: 3 }}><Text style={s.h3}>Dark mode</Text><Text style={s.small}>{isDark ? 'A little easier after hours.' : 'A fresh look for the daytime.'}</Text></View>}
    <Switch accessibilityLabel="Dark mode" accessibilityHint="Switch between light and dark appearance. Your choice is saved on this device." value={isDark} disabled={!ready} onValueChange={dark => setMode(dark ? 'dark' : 'light')} trackColor={{ false: c.switchTrack, true: c.accent }} ios_backgroundColor={c.switchTrack} thumbColor={isDark ? c.onAccent : c.paper} {...(Platform.OS === 'web' ? { activeThumbColor: c.onAccent } : {})} />
  </View>;
}
