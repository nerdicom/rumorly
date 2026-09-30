import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Button, Empty, Icon, Notice, Page } from '../../components/ui';
import { stories } from '../../data/stories';
import { reportReasons, type Report } from '../../domain/types';
import { useApp } from '../../store/AppStore';
import { c, s } from '../../theme';

export default function ReportStory() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { dispatch } = useApp();
  const story = stories.find(item => item.id === id);
  const [reason, setReason] = useState<Report['reason']>('Misleading or missing context');
  const [details, setDetails] = useState('');
  const [done, setDone] = useState(false);
  const [blocked, setBlocked] = useState(false);
  if (!story) return <Page back title="Story controls"><Empty title="Story not found" body="Return to the feed to choose a story." /></Page>;
  if (done) return <Page back title="Story controls"><Icon name="shield-checkmark-outline" size={50} color={c.green} /><Text style={s.h1}>{blocked ? 'Account blocked.' : 'Story hidden.'}</Text><Notice>{blocked ? 'This author is hidden across your preview. You can unblock them in your profile.' : 'Your report is saved on this device and the story is hidden from your feed. No report was sent to a moderator in this demo.'}</Notice><Button label="Back to the feed" onPress={() => router.replace('/')} /></Page>;
  return <Page back title="Story controls"><Text style={s.label}>KEEP THE CONVERSATION HUMAN</Text><Text style={s.h1}>Something{ '\n' }isn’t right?</Text><Text style={s.body}>You can challenge or report a story for free. No subscription or votes required.</Text><Text style={s.h3}>{story.title}</Text>
    <View style={s.card}>{reportReasons.map(item => <Pressable key={item} accessibilityRole="radio" accessibilityState={{ checked: item === reason }} onPress={() => setReason(item)} style={[s.row, { minHeight: 48 }]}><Icon name={item === reason ? 'radio-button-on' : 'radio-button-off'} color={c.accent} /><Text style={[s.body, { color: c.ink, flex: 1 }]}>{item}</Text></Pressable>)}</View>
    <TextInput accessibilityLabel="Report details" value={details} onChangeText={setDetails} maxLength={1000} multiline placeholder="Anything else we should know? (optional)" placeholderTextColor={c.muted} style={[s.input, { minHeight: 120, textAlignVertical: 'top' }]} />
    <Button label="Save demo report & hide story" onPress={() => { dispatch({ type: 'report', report: { id: `report-${Date.now()}`, storyId: story.id, reason, details: details.trim(), createdAt: new Date().toISOString() } }); setDone(true); }} />
    <Button secondary label={`Block @${story.author}`} onPress={() => { dispatch({ type: 'block', author: story.author }); setBlocked(true); setDone(true); }} />
    <Text style={s.small}>This preview saves these actions locally. Production reporting and human review are not connected yet.</Text>
  </Page>;
}
