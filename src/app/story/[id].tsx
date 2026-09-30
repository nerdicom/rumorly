import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Badge, Button, Empty, Icon, IconButton, Notice, Page } from '../../components/ui';
import { Voting } from '../../components/StoryCard';
import { stories } from '../../data/stories';
import { isVisible, publicSourceError } from '../../domain/state';
import { useApp } from '../../store/AppStore';
import { c, s } from '../../theme';

export default function StoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, dispatch } = useApp();
  const story = stories.find(item => item.id === id);
  const [body, setBody] = useState('');
  const [source, setSource] = useState('');
  const [message, setMessage] = useState('');
  const addContext = useCallback(() => {
    if (!story) return;
    if (body.trim().length < 20) { setMessage('Add at least 20 characters of useful context.'); return; }
    const error = publicSourceError(source);
    if (error) { setMessage(error); return; }
    dispatch({ type: 'context', context: { id: `context-${Date.now()}`, storyId: story.id, body: body.trim(), source: source.trim(), status: 'pending', createdAt: new Date().toISOString() } });
    setBody(''); setSource(''); setMessage('Context saved to your profile. This local preview does not send it for review or publish it.');
  }, [body, dispatch, source, story]);
  if (!story || !isVisible(story, state)) return <Page back title="Story"><Empty title="This story isn’t available" body="It may be hidden by your report or blocked-account settings." /></Page>;
  const followed = state.follows.includes(story.id);
  return <Page back title="Follow the story">
    <View style={s.between}><Text style={s.label}>{story.topic.toUpperCase()}</Text><IconButton icon="ellipsis-horizontal" label="Report story or block author" onPress={() => router.push({ pathname: '/report/[id]', params: { id: story.id } })} /></View>
    <Badge status={story.status} /><Text style={s.h1}>{story.title}</Text><Text style={s.body}>{story.summary}</Text><Text style={s.small}>@{story.author} · Fictional preview story</Text>
    <View style={s.between}><Voting story={story} /><Button small secondary label={followed ? 'Following' : 'Follow the tea'} icon={followed ? 'bookmark' : 'bookmark-outline'} onPress={() => dispatch({ type: 'follow', storyId: story.id })} /></View>
    <Text style={s.small}>Heat measures attention, not accuracy. “Updated” means new context was added; it does not verify every claim.</Text>
    <View style={[s.between, { marginTop: 8 }]}><Text style={s.h2}>How it unfolded</Text><Text style={s.small}>{story.timeline.length} chapters</Text></View>
    <View style={{ gap: 0 }}>{story.timeline.map((item, i) => <View key={item.title} style={{ flexDirection: 'row', gap: 15 }}>
      <View style={{ alignItems: 'center', width: 32 }}><View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: i === story.timeline.length - 1 ? c.lime : c.rose, justifyContent: 'center', alignItems: 'center' }}><Icon name={item.kind === 'update' ? 'sparkles-outline' : item.kind === 'context' ? 'documents-outline' : 'chatbubble-outline'} size={16} /></View>{i < story.timeline.length - 1 && <View style={{ width: 1, flex: 1, backgroundColor: c.line }} />}</View>
      <View style={{ flex: 1, paddingBottom: 30, gap: 7 }}><Text style={s.small}>{item.time}</Text><Text style={s.h3}>{item.title}</Text><Text style={s.body}>{item.body}</Text></View>
    </View>)}</View>
    <View style={s.card}><Text style={s.h2}>There’s more to it?</Text><Text style={s.body}>Add a correction, public source, or missing context. It stays pending until reviewed.</Text><TextInput accessibilityLabel="Add story context" placeholder="Here’s a little more context…" placeholderTextColor={c.muted} value={body} onChangeText={setBody} maxLength={1000} multiline style={[s.input, { minHeight: 110, textAlignVertical: 'top' }]} /><TextInput accessibilityLabel="Context source link" placeholder="Public https:// source (optional)" placeholderTextColor={c.muted} value={source} onChangeText={setSource} maxLength={2000} autoCapitalize="none" autoCorrect={false} keyboardType="url" style={s.input} /><Button label="Save demo context" secondary onPress={addContext} />{!!message && <Notice>{message}</Notice>}</View>
    <Button secondary label="Challenge or report this story" onPress={() => router.push({ pathname: '/report/[id]', params: { id: story.id } })} />
  </Page>;
}
