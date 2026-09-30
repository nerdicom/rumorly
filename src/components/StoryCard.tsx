import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Story } from '../domain/types';
import { heat } from '../domain/state';
import { useApp } from '../store/AppStore';
import { c, s } from '../theme';
import { Badge, Icon, IconButton } from './ui';
import { TieDyeBackdrop } from './TieDye';

export function Voting({ story }: { story: Story }) {
  const { state, dispatch, busy } = useApp();
  return <View style={styles.voting}>
    <Pressable disabled={busy} accessibilityRole="button" accessibilityLabel={`Heat up: ${story.title}`} accessibilityState={{ selected: state.votes[story.id] === 1 }} onPress={() => dispatch({ type: 'vote', storyId: story.id, value: 1 })} style={[styles.voteButton, state.votes[story.id] === 1 && { backgroundColor: c.rose }]}><Icon name="flame-outline" color={c.accent} size={18} /><Text style={{ fontWeight: '800', fontSize: 13, color: c.accent }}>{heat(story, state)}</Text></Pressable>
    <View style={{ width: 1, height: 18, backgroundColor: c.line }} />
    <Pressable disabled={busy} accessibilityRole="button" accessibilityLabel={`Cool down: ${story.title}`} accessibilityState={{ selected: state.votes[story.id] === -1 }} onPress={() => dispatch({ type: 'vote', storyId: story.id, value: -1 })} style={[styles.voteButton, state.votes[story.id] === -1 && { backgroundColor: '#DFEAF2' }]}><Icon name="snow-outline" size={18} color={state.votes[story.id] === -1 ? c.blue : c.muted} /></Pressable>
  </View>;
}
export function StoryCard({ story }: { story: Story }) {
  const { state, dispatch, busy } = useApp();
  const following = state.follows.includes(story.id);
  return <View style={s.card}>
    <View style={{ height: 5, borderRadius: 3, overflow: 'hidden', marginTop: -6 }}><TieDyeBackdrop /></View>
    <View style={s.between}><View style={s.row}><View style={[styles.avatar, { backgroundColor: story.color }]}><Text style={{ fontWeight: '800', fontSize: 11, color: c.ink }}>{story.initials}</Text></View><View><Text style={{ fontWeight: '600', fontSize: 12, color: c.ink }}>@{story.author}</Text><Text style={s.small}>{story.topic} · {story.age}</Text></View></View><IconButton icon="ellipsis-horizontal" label={`Story options: ${story.title}`} onPress={() => router.push({ pathname: '/report/[id]', params: { id: story.id } })} /></View>
    <Pressable accessibilityRole="button" accessibilityLabel={`Open story: ${story.title}`} onPress={() => router.push({ pathname: '/story/[id]', params: { id: story.id } })} style={{ gap: 10 }}>
      <Badge status={story.status} /><Text style={s.h2}>{story.title}</Text><Text style={s.body}>{story.summary}</Text>
    </Pressable>
    <View style={[s.between, { paddingTop: 4 }]}><Voting story={story} /><View style={[s.row, { gap: 2 }]}><View style={[s.row, { gap: 5 }]}><Icon name="git-branch-outline" size={16} color={c.muted} /><Text style={s.small}>{story.timeline.length}</Text></View><IconButton disabled={busy} icon={following ? 'bookmark' : 'bookmark-outline'} active={following} label={`${following ? 'Unfollow' : 'Follow'} story: ${story.title}`} onPress={() => dispatch({ type: 'follow', storyId: story.id })} /></View></View>
  </View>;
}
const styles = StyleSheet.create({
  avatar: { width: 35, height: 35, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  voting: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.bg, borderRadius: 12, overflow: 'hidden' },
  voteButton: { flexDirection: 'row', gap: 6, minHeight: 44, minWidth: 44, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
});
