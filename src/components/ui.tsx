import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View, type ColorValue, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ModerationStatus, StoryStatus } from '../domain/types';
import { useTheme } from '../theme';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];
export function Icon({ name, size = 20, color }: { name: IconName; size?: number; color?: ColorValue }) {
  const { c } = useTheme();
  return <Ionicons name={name} size={size} color={color ?? c.ink} />;
}
export function Button({ label, onPress, icon, secondary, disabled, small, testID }: { label: string; onPress: () => void; icon?: IconName; secondary?: boolean; disabled?: boolean; small?: boolean; testID?: string }) {
  const { c } = useTheme();
  return <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [styles.button, { backgroundColor: secondary ? c.paper : c.accent, borderColor: secondary ? c.line : c.accent, borderWidth: 1 }, small && { minHeight: 44, paddingHorizontal: 15 }, { opacity: disabled ? 0.45 : pressed ? 0.7 : 1 }]}>
    {icon && <Icon name={icon} color={secondary ? c.ink : c.onAccent} size={18} />}
    <Text style={{ color: secondary ? c.ink : c.onAccent, fontWeight: '700', fontSize: small ? 13 : 15 }}>{label}</Text>
  </Pressable>;
}
export function IconButton({ icon, label, onPress, active = false, disabled = false }: { icon: IconName; label: string; onPress: () => void; active?: boolean; disabled?: boolean }) {
  const { c } = useTheme();
  return <Pressable disabled={disabled} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: active, disabled }} onPress={onPress} style={({ pressed }) => [styles.iconButton, { backgroundColor: active ? c.accentSoft : 'transparent', opacity: pressed ? 0.5 : 1 }]}>
    <Icon name={icon} color={active ? c.accent : c.ink} />
  </Pressable>;
}
export function Page({ children, back, title, style }: { children: React.ReactNode; back?: boolean; title?: string; style?: StyleProp<ViewStyle> }) {
  const { c, s } = useTheme();
  return <View style={{ flex: 1, backgroundColor: c.bg }}>
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.page, style]}>
        {back && <View style={s.between}><IconButton icon="arrow-back" label="Go back" onPress={() => router.canGoBack() ? router.back() : router.replace('/')} /><Text style={s.h3}>{title}</Text><View style={{ width: 44 }} /></View>}
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  </View>;
}
export function Brand({ large = false }: { large?: boolean }) {
  const { c, s } = useTheme();
  return <View style={[s.row, { gap: 2 }]}><Text style={{ fontSize: large ? 56 : 31, fontWeight: '900', letterSpacing: -1.8, color: c.ink }}>rumorly</Text><Text style={{ fontSize: large ? 60 : 34, fontWeight: '900', color: c.accent }}>.</Text></View>;
}
export function Badge({ status }: { status: StoryStatus | ModerationStatus | 'Pending' }) {
  const { c } = useTheme();
  const updated = status === 'Updated';
  return <View style={{ alignSelf: 'flex-start', backgroundColor: updated ? c.softGreen : status === 'Developing' ? c.accentSoft : c.neutral, borderRadius: 6, paddingHorizontal: 9, paddingVertical: 5 }}><Text style={{ fontSize: 10, fontWeight: '800', letterSpacing: 0.4, color: updated ? c.green : c.muted }}>{status.toUpperCase()}</Text></View>;
}
export function Empty({ title, body, icon = 'chatbubble-ellipses-outline' }: { title: string; body: string; icon?: IconName }) {
  const { c, s } = useTheme();
  return <View style={[s.card, { alignItems: 'center', paddingVertical: 36 }]}><Icon name={icon} size={34} color={c.accent} /><Text style={[s.h3, { textAlign: 'center' }]}>{title}</Text><Text style={[s.body, { textAlign: 'center' }]}>{body}</Text></View>;
}
export function Notice({ children }: { children: React.ReactNode }) {
  const { c } = useTheme();
  return <View style={{ backgroundColor: c.accentSoft, padding: 14, borderRadius: 12 }}><Text accessibilityRole="alert" style={{ color: c.accent, fontSize: 13, lineHeight: 20 }}>{children}</Text></View>;
}
const styles = StyleSheet.create({
  page: { paddingHorizontal: 22, paddingTop: 10, paddingBottom: 40, gap: 22, width: '100%', maxWidth: 620, alignSelf: 'center', flexGrow: 1 },
  button: { borderRadius: 14, minHeight: 54, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  iconButton: { height: 44, width: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
