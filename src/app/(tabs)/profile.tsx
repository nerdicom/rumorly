import { router } from 'expo-router';
import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Badge, Button, Icon, Notice, Page } from '../../components/ui';
import { ThemeSwitch } from '../../components/ThemeSwitch';
import { FeaturePanel } from '../../components/FeaturePanel';
import { useApp } from '../../store/AppStore';
import { useAuth } from '../../store/AuthStore';
import { useTheme } from '../../theme';

export default function Profile() {
  const { c, s } = useTheme();
  const { state, dispatch, mode, busy, refresh, blockedNames } = useApp();
  const { user, signOut } = useAuth();
  const [name, setName] = useState(state.displayName);
  const [editing, setEditing] = useState(false);
  const [resetting, setResetting] = useState(false);
  return <Page>
    <Text style={s.label}>YOUR LITTLE CORNER</Text>
    <View style={[s.row, { gap: 16 }]}><View style={{ width: 72, height: 72, borderRadius: 25, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }}><Icon name="person-outline" color={c.accent} size={33} /></View><View style={{ flex: 1 }}><Text style={s.h2}>{state.displayName}</Text><Text style={s.small}>{mode === 'demo' ? 'Curious by nature · Demo profile' : 'Your community account'}</Text></View></View>
    {editing ? <View style={{ gap: 10 }}><TextInput accessibilityLabel="Display name" maxLength={30} value={name} onChangeText={setName} style={s.input} /><Button label="Save name" small disabled={busy} onPress={async () => { if (await dispatch({ type: 'name', name })) setEditing(false); }} /></View> : <Button label="Edit display name" small secondary onPress={() => { setName(state.displayName); setEditing(true); }} />}
    {mode === 'demo' ? <Button label="Sign in or create an account" onPress={() => router.push('/auth')} /> : <><Text style={s.small}>{user?.email}</Text><Button label="Refresh account" secondary disabled={busy} onPress={refresh} /></>}
    <View style={s.card}><Text style={s.label}>APPEARANCE</Text><ThemeSwitch /></View>
    <View style={[s.card, s.between]}>{[[String(state.follows.length), 'Following'], [String(Object.keys(state.votes).length), 'Reactions'], [String(state.submissions.length), 'Submissions']].map(([count, label]) => <View key={label} style={{ alignItems: 'center', flex: 1, gap: 5 }}><Text style={s.h2}>{count}</Text><Text style={s.small}>{label}</Text></View>)}</View>
    <FeaturePanel><View style={s.between}><Text style={s.label}>FOR THE EXTRA CURIOUS</Text><Icon name="sparkles-outline" color={c.accent} /></View><Text style={s.h2}>Meet Rumorly Plus.</Text><Text style={s.body}>More ways to follow the conversation. Every vote still counts the same.</Text><Button label="Explore the planned perks" secondary onPress={() => router.push('/plus')} /></FeaturePanel>
    <Text style={s.h3}>Your submissions</Text>
    {state.submissions.length ? state.submissions.map(item => <View key={item.id} style={s.card}><Badge status={item.status} /><Text style={s.h3}>{item.title}</Text><Text style={s.body}>{item.body}</Text><Text style={s.small}>{item.topic} · {mode === 'demo' ? 'Saved locally, not published' : item.status === 'pending' ? 'Awaiting review' : 'Review complete'}</Text></View>) : <Text style={s.body}>{mode === 'demo' ? 'Nothing spilled yet. Your demo submissions will appear here.' : 'Your submissions and their review status will appear here.'}</Text>}
    {state.contexts.length > 0 && <><Text style={s.h3}>Your added context</Text>{state.contexts.map(item => <View key={item.id} style={s.card}><Badge status={item.status} /><Text style={s.body}>{item.body}</Text><Text style={s.small}>{mode === 'demo' ? 'Saved locally, not reviewed or published' : item.status === 'pending' ? 'Awaiting review' : 'Review complete'}</Text></View>)}</>}
    <Text style={s.h3}>Community controls</Text>
    <View style={s.card}><Text style={s.body}>{state.reports.length} story report{state.reports.length === 1 ? '' : 's'} {mode === 'demo' ? 'saved on this device.' : 'submitted to the review queue.'} Reported stories are hidden from your feed.</Text>
      <Text style={s.h3}>Blocked accounts</Text>{state.blocked.length ? state.blocked.map(author => <View key={author} style={s.between}><Text style={s.small}>@{blockedNames[author] ?? author}</Text><Button label={`Unblock @${blockedNames[author] ?? author}`} small secondary disabled={busy} onPress={() => dispatch({ type: 'unblock', author })} /></View>) : <Text style={s.small}>No blocked accounts.</Text>}
      <Button label="Read community guidelines" small secondary onPress={() => router.push('/guidelines')} />
    </View>
    {mode === 'live' ? <Button label="Sign out" secondary disabled={busy} onPress={signOut} /> : resetting ? <><Notice>Reset all local votes, follows, submissions, reports, and your demo profile? This cannot be undone.</Notice><Button label="Yes, reset this device" onPress={() => dispatch({ type: 'reset' })} /><Button label="Keep my demo data" secondary onPress={() => setResetting(false)} /></> : <Button label="Reset demo data" secondary onPress={() => setResetting(true)} />}
    <Text style={[s.small, { textAlign: 'center' }]}>{mode === 'demo' ? 'Rumorly · Local fictional preview' : 'Rumorly · Community testing'}{ '\n' }No billing is active.</Text>
  </Page>;
}
