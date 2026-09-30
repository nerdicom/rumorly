import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useApp } from '../store/AppStore';
import { ThemeSwitch } from './ThemeSwitch';
import { serif, useTheme } from '../theme';
import { Brand, Button, Icon, Page } from './ui';
import { AuthForm } from './AuthForm';
import { FeaturePanel } from './FeaturePanel';

export function Onboarding() {
  const { c, s } = useTheme();
  const { dispatch } = useApp();
  const [accepted, setAccepted] = useState(false);
  const [account, setAccount] = useState(false);
  if (account) return <AuthForm onBack={() => setAccount(false)} />;
  return <Page style={{ justifyContent: 'center', gap: 28 }}>
    <View style={s.between}><Brand /><ThemeSwitch compact /></View>
    <FeaturePanel style={{ gap: 20 }}>
      <Text style={s.label}>A LITTLE CURIOUS? SAME.</Text>
      <Text style={{ color: c.ink, fontFamily: serif, fontSize: 40, lineHeight: 46 }}>There’s always{ '\n' }more to the story.</Text>
      <View style={[s.row, { alignSelf: 'flex-end', backgroundColor: c.highlight, padding: 20, borderRadius: 24, borderBottomRightRadius: 5 }]}><Icon name="chatbubbles-outline" size={38} /><Text style={{ fontSize: 25, fontWeight: '800', color: c.ink }}>do tell.</Text></View>
    </FeaturePanel>
    <Text style={s.body}>Catch the conversation. Add some context. Follow the plot twists.</Text>
    <View style={{ gap: 14 }}>
      <View style={s.row}><Icon name="flame-outline" color={c.accent} /><Text style={[s.body, { flex: 1 }]}>Vote on the buzz. Popularity isn’t proof.</Text></View>
      <View style={s.row}><Icon name="shield-checkmark-outline" color={c.accent} /><Text style={[s.body, { flex: 1 }]}>Keep private information and personal attacks out.</Text></View>
    </View>
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: accepted }} onPress={() => setAccepted(!accepted)} style={[s.row, { alignItems: 'flex-start', paddingVertical: 4 }]}>
      <Icon name={accepted ? 'checkbox' : 'square-outline'} color={c.accent} size={25} /><Text style={[s.small, { flex: 1 }]}>I’m 18 or older and agree to keep it respectful. This is a local preview with fictional stories, not a live community.</Text>
    </Pressable>
    <Button label="Let me in" icon="arrow-forward" disabled={!accepted} onPress={() => dispatch({ type: 'onboard' })} />
    <Button label="Sign in or create an account" secondary onPress={() => setAccount(true)} />
    <Text style={[s.small, { textAlign: 'center' }]}>No account needed for this preview. Changes stay on this device.</Text>
  </Page>;
}
