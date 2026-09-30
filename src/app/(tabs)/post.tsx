import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Button, Icon, Notice, Page } from '../../components/ui';
import { TopicChips } from '../../components/TopicChips';
import { submissionError } from '../../domain/state';
import type { Topic } from '../../domain/types';
import { useApp } from '../../store/AppStore';
import { useTheme } from '../../theme';

export default function Post() {
  const { c, s } = useTheme();
  const { dispatch, mode, busy } = useApp();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [source, setSource] = useState('');
  const [topic, setTopic] = useState<Exclude<Topic, 'All'>>('Reality TV');
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const submit = async () => {
    const problem = submissionError(title, body, source);
    if (problem) { setError(problem); return; }
    if (!accepted) { setError('Please acknowledge the posting guidelines.'); return; }
    const success = await dispatch({ type: 'submit', submission: { id: `draft-${Date.now()}`, title: title.trim(), body: body.trim(), source: source.trim(), topic, status: 'pending', createdAt: new Date().toISOString() } });
    if (!success) return;
    setSaved(true); setTitle(''); setBody(''); setSource(''); setAccepted(false); setError('');
  };
  if (saved) return <Page style={{ justifyContent: 'center' }}><Icon name="checkmark-circle-outline" color={c.green} size={54} /><Text style={s.h1}>A good story{ '\n' }starts with context.</Text><Notice>{mode === 'live' ? 'Submitted to the review queue. Your story stays private until approved; you can track its status in your profile.' : 'Saved to your local submissions. Nothing was published or sent to a moderator.'}</Notice><Button label="View my submissions" onPress={() => { setSaved(false); router.navigate('/profile'); }} /><Button secondary label="Write another" onPress={() => setSaved(false)} /></Page>;
  return <Page>
    <Text style={s.label}>PULL UP A CHAIR</Text><Text style={s.h1}>What’s the word?</Text><Text style={s.body}>Share the conversation and the context behind it.</Text>
    <Notice>{mode === 'live' ? 'Early testing: use fictional examples for now. Every submission is reviewed before it can appear in the community.' : 'Local demo only. Use fictional examples. Don’t add real accusations, private messages, or personal details.'}</Notice>
    <Text style={s.h3}>Pick a corner</Text><TopicChips selected={topic} includeAll={false} onSelect={value => { if (value !== 'All') setTopic(value); }} />
    <View style={{ gap: 8 }}><View style={s.between}><Text style={s.h3}>The headline</Text><Text style={s.small}>{title.length}/120</Text></View><TextInput accessibilityLabel="Story headline" value={title} onChangeText={setTitle} maxLength={120} placeholder="I heard something interesting…" placeholderTextColor={c.muted} style={s.input} /></View>
    <View style={{ gap: 8 }}><Text style={s.h3}>Give us the context</Text><TextInput accessibilityLabel="Story context" value={body} onChangeText={setBody} maxLength={1000} multiline placeholder="What was shared? What’s still speculation?" placeholderTextColor={c.muted} style={[s.input, { minHeight: 150, textAlignVertical: 'top' }]} /><Text style={s.small}>{body.length}/1,000 · Speculation should be labeled clearly.</Text></View>
    <View style={{ gap: 8 }}><Text style={s.h3}>Public source link</Text><TextInput accessibilityLabel="Public source link" value={source} onChangeText={setSource} maxLength={2000} autoCapitalize="none" autoCorrect={false} keyboardType="url" placeholder="https://… (optional)" placeholderTextColor={c.muted} style={s.input} /></View>
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: accepted }} onPress={() => setAccepted(!accepted)} style={s.row}><Icon name={accepted ? 'checkbox' : 'square-outline'} color={c.accent} size={26} /><Text style={[s.small, { flex: 1 }]}>No minors, private information, or personal attacks. {mode === 'live' ? 'I understand this submission needs approval before publishing.' : 'I understand this submission stays in the demo.'}</Text></Pressable>
    {!!error && <Notice>{error}</Notice>}<Button disabled={busy} label={mode === 'live' ? 'Submit for review' : 'Save demo submission'} icon="arrow-forward" onPress={submit} />
  </Page>;
}
