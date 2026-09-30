import { router } from 'expo-router';
import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Badge, Button, Icon, Notice, Page } from '../../components/ui';
import { useApp } from '../../store/AppStore';
import { c, s } from '../../theme';

export default function Profile() {
  const { state, dispatch } = useApp();
  const [name, setName] = useState(state.displayName);
  const [editing, setEditing] = useState(false);
  const [resetting, setResetting] = useState(false);
  return <Page>
    <Text style={s.label}>YOUR LITTLE CORNER</Text>
    <View style={[s.row, { gap: 16 }]}><View style={{ width: 72, height: 72, borderRadius: 25, backgroundColor: c.rose, alignItems: 'center', justifyContent: 'center' }}><Icon name="person-outline" color={c.accent} size={33} /></View><View style={{ flex: 1 }}><Text style={s.h2}>{state.displayName}</Text><Text style={s.small}>Curious by nature · Demo profile</Text></View></View>
    {editing ? <View style={{ gap: 10 }}><TextInput accessibilityLabel="Display name" maxLength={30} value={name} onChangeText={setName} style={s.input} /><Button label="Save name" small onPress={() => { dispatch({ type: 'name', name }); setEditing(false); }} /></View> : <Button label="Edit display name" small secondary onPress={() => { setName(state.displayName); setEditing(true); }} />}
    <View style={[s.card, s.between]}>{[[String(state.follows.length), 'Following'], [String(Object.keys(state.votes).length), 'Reactions'], [String(state.submissions.length), 'Submissions']].map(([count, label]) => <View key={label} style={{ alignItems: 'center', flex: 1, gap: 5 }}><Text style={s.h2}>{count}</Text><Text style={s.small}>{label}</Text></View>)}</View>
    <View style={[s.card, { backgroundColor: c.plum, borderColor: c.plum }]}><View style={s.between}><Text style={[s.label, { color: c.lime }]}>FOR THE EXTRA CURIOUS</Text><Icon name="sparkles-outline" color={c.lime} /></View><Text style={[s.h2, { color: c.paper }]}>Meet Rumorly Plus.</Text><Text style={[s.body, { color: '#DACBD6' }]}>More ways to follow the conversation. Every vote still counts the same.</Text><Button label="Explore the planned perks" secondary onPress={() => router.push('/plus')} /></View>
    <Text style={s.h3}>Your submissions</Text>
    {state.submissions.length ? state.submissions.map(item => <View key={item.id} style={s.card}><Badge status="Pending" /><Text style={s.h3}>{item.title}</Text><Text style={s.body}>{item.body}</Text><Text style={s.small}>{item.topic} · Saved locally, not published</Text></View>) : <Text style={s.body}>Nothing spilled yet. Your demo submissions will appear here.</Text>}
    {state.contexts.length > 0 && <><Text style={s.h3}>Your added context</Text>{state.contexts.map(item => <View key={item.id} style={s.card}><Badge status="Pending" /><Text style={s.body}>{item.body}</Text><Text style={s.small}>Saved locally, not reviewed or published</Text></View>)}</>}
    <Text style={s.h3}>Community controls</Text>
    <View style={s.card}><Text style={s.body}>{state.reports.length} story report{state.reports.length === 1 ? '' : 's'} saved on this device. Reported stories are hidden from your preview.</Text>
      <Text style={s.h3}>Blocked accounts</Text>{state.blocked.length ? state.blocked.map(author => <View key={author} style={s.between}><Text style={s.small}>@{author}</Text><Button label={`Unblock @${author}`} small secondary onPress={() => dispatch({ type: 'unblock', author })} /></View>) : <Text style={s.small}>No blocked accounts.</Text>}
      <Button label="Read community guidelines" small secondary onPress={() => router.push('/guidelines')} />
    </View>
    {resetting ? <><Notice>Reset all local votes, follows, submissions, reports, and your demo profile? This cannot be undone.</Notice><Button label="Yes, reset this device" onPress={() => dispatch({ type: 'reset' })} /><Button label="Keep my demo data" secondary onPress={() => setResetting(false)} /></> : <Button label="Reset demo data" secondary onPress={() => setResetting(true)} />}
    <Text style={[s.small, { textAlign: 'center' }]}>Rumorly 0.1.0 · Local preview{ '\n' }No account, billing, or server connection is active.</Text>
  </Page>;
}
