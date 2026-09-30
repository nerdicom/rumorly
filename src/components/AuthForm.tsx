import React, { useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { friendlyError } from '../lib/errors';
import { requireSupabase, supabase } from '../lib/supabase';
import { c, s } from '../theme';
import { Brand, Button, Icon, Notice, Page } from './ui';

export function AuthForm({ onBack }: { onBack: () => void }) {
  const [creating, setCreating] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [sentTo, setSentTo] = useState('');
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const working = useRef(false);
  const [message, setMessage] = useState('');
  const [resendAt, setResendAt] = useState(0);
  const send = async () => {
    if (working.current) return;
    const address = sentTo || email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) { setMessage('Enter a valid email address.'); return; }
    if (creating && (!accepted || !name.trim())) { setMessage('Add a display name and confirm you’re 18 or older.'); return; }
    if (Date.now() < resendAt) { setMessage('Please wait a minute before requesting another code.'); return; }
    working.current = true; setBusy(true); setMessage('');
    try {
      const { error } = await requireSupabase().auth.signInWithOtp({ email: address, options: {
        shouldCreateUser: creating,
        ...(creating ? { data: { display_name: name.trim(), adult_acknowledged: true } } : {}),
      } });
      if (error) throw error;
      setSentTo(address); setResendAt(Date.now() + 60000); setMessage('Check your inbox for your sign-in code.');
    } catch (error) { setMessage(friendlyError(error)); }
    finally { working.current = false; setBusy(false); }
  };
  const verify = async () => {
    if (working.current) return;
    if (!/^\d{6,8}$/.test(token.trim())) { setMessage('Enter the 6–8 digit code from your email.'); return; }
    working.current = true; setBusy(true); setMessage('');
    try {
      const { error } = await requireSupabase().auth.verifyOtp({ email: sentTo, token: token.trim(), type: 'email' });
      if (error) throw error;
      // AuthStore receives the session; account-scoped screens mount automatically.
    } catch (error) { setMessage(friendlyError(error)); }
    finally { working.current = false; setBusy(false); }
  };
  return <Page>
    <Brand /><Text style={s.label}>YOUR SEAT AT THE TABLE</Text>
    <Text style={s.h1}>{sentTo ? 'Check your inbox.' : creating ? 'A little curious?' : 'Welcome back.'}</Text>
    {!supabase ? <Notice>Accounts aren’t configured in this build. You can still explore the fictional demo.</Notice> : <>
      {sentTo ? <>
        <Text style={s.body}>Enter the code sent to {sentTo}.</Text>
        <TextInput accessibilityLabel="Email verification code" value={token} onChangeText={setToken} keyboardType="number-pad" autoComplete="one-time-code" maxLength={8} placeholder="Your code" placeholderTextColor={c.muted} style={[s.input, { fontSize: 26, letterSpacing: 5 }]} />
        <Button label={busy ? 'Checking…' : 'Verify & continue'} disabled={busy} onPress={verify} />
        <Button label="Send another code" secondary disabled={busy} onPress={send} />
        <Button label="Use a different email" secondary disabled={busy} onPress={() => { setSentTo(''); setToken(''); setMessage(''); }} />
      </> : <>
        <Text style={s.body}>We’ll email you a sign-in code. Your email stays private; your display name appears on your contributions.</Text>
        {creating && <TextInput accessibilityLabel="Account display name" value={name} onChangeText={setName} maxLength={30} placeholder="Public display name" placeholderTextColor={c.muted} style={s.input} />}
        <TextInput accessibilityLabel="Email address" value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" autoComplete="email" maxLength={254} placeholder="you@example.com" placeholderTextColor={c.muted} style={s.input} />
        {creating && <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: accepted }} onPress={() => setAccepted(!accepted)} style={s.row}><Icon name={accepted ? 'checkbox' : 'square-outline'} color={c.accent} size={26} /><Text style={[s.small, { flex: 1 }]}>I’m 18 or older. I agree to avoid private information, minors, and personal attacks, and to submit content for review.</Text></Pressable>}
        <Button label={busy ? 'Sending…' : 'Email me a code'} disabled={busy} onPress={send} />
        <Button label={creating ? 'Already have an account? Sign in' : 'New here? Create an account'} secondary disabled={busy} onPress={() => { setCreating(!creating); setMessage(''); }} />
      </>}
      {!!message && <Notice>{message}</Notice>}
    </>}
    <View style={{ marginTop: 8 }}><Button label="Back to the demo" secondary disabled={busy} onPress={onBack} /></View>
    <Text style={s.small}>Early account testing. Shared submissions stay pending until reviewed. Billing and notifications are not active.</Text>
  </Page>;
}
