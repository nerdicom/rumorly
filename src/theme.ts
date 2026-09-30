import { Platform, StyleSheet } from 'react-native';

export const c = {
  bg: '#FAF7F2', paper: '#FFFFFF', ink: '#2B1824', muted: '#746A70',
  line: '#E9E1DF', accent: '#AC3154', rose: '#F8E5EB', lime: '#E2F7A2',
  plum: '#35202F', green: '#365A42', softGreen: '#E9F0E7', blue: '#325B79',
};
export const serif = Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia, "Times New Roman", serif', default: 'serif' });
export const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  h1: { fontFamily: serif, fontSize: 38, lineHeight: 43, letterSpacing: -1.3, color: c.ink },
  h2: { fontFamily: serif, fontSize: 26, lineHeight: 32, color: c.ink, letterSpacing: -0.4 },
  h3: { fontSize: 17, fontWeight: '700', color: c.ink, lineHeight: 24 },
  body: { fontSize: 15, lineHeight: 23, color: c.muted },
  small: { fontSize: 12, lineHeight: 18, color: c.muted },
  label: { fontSize: 10, fontWeight: '800', letterSpacing: 1.8, color: c.accent },
  card: { backgroundColor: c.paper, borderWidth: 1, borderColor: c.line, borderRadius: 22, padding: 20, gap: 14 },
  input: { backgroundColor: c.paper, borderColor: c.line, borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: c.ink, minHeight: 52 },
});
