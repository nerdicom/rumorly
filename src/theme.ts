import { Platform, StyleSheet } from 'react-native';

export const c = {
  bg: '#F7EFFF', paper: '#FFFFFF', ink: '#28113E', muted: '#594765',
  line: '#E5D7EE', accent: '#7126A5', rose: '#F9E0F5', lime: '#EAFF92',
  plum: '#381454', green: '#24583D', softGreen: '#DFF8E9', blue: '#2455A4',
  pink: '#B71971',
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
  card: { backgroundColor: c.paper, borderWidth: 1, borderColor: c.line, borderRadius: 22, padding: 20, gap: 14, boxShadow: '0 5px 18px rgba(56, 20, 84, 0.06)' },
  input: { backgroundColor: c.paper, borderColor: c.line, borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: c.ink, minHeight: 52 },
});
