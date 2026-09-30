import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Brand, Empty, Icon, IconButton, Page } from '../../components/ui';
import { StoryCard } from '../../components/StoryCard';
import { TopicChips } from '../../components/TopicChips';
import { stories } from '../../data/stories';
import { heat, isVisible } from '../../domain/state';
import type { Topic } from '../../domain/types';
import { useApp } from '../../store/AppStore';
import { c, s, serif } from '../../theme';

export default function Feed() {
  const { state } = useApp();
  const [topic, setTopic] = useState<Topic>('All');
  const [sort, setSort] = useState<'hot' | 'latest'>('hot');
  const visible = stories.filter(story => isVisible(story, state) && (topic === 'All' || story.topic === topic));
  if (sort === 'hot') visible.sort((a, b) => heat(b, state) - heat(a, state));
  return <Page>
    <View style={s.between}><Brand /><IconButton icon="search-outline" label="Search stories" onPress={() => router.push('/discover')} /></View>
    <View style={{ backgroundColor: c.plum, padding: 24, borderRadius: 25, gap: 12 }}>
      <View style={s.between}><Text style={[s.label, { color: c.lime }]}>THE CONVERSATION STARTS HERE</Text><Icon name="sparkles-outline" color={c.lime} size={21} /></View>
      <Text style={{ fontFamily: serif, fontSize: 34, lineHeight: 39, color: c.paper, letterSpacing: -0.8 }}>Heard something?{ '\n' }Pull up a seat.</Text>
      <Text style={{ color: '#DACBD6', fontSize: 13, lineHeight: 20 }}>A little buzz. A little context. The whole story.</Text>
      <Pressable accessibilityRole="button" onPress={() => router.push('/post')} style={[s.row, { alignSelf: 'flex-start', backgroundColor: c.lime, borderRadius: 20, paddingHorizontal: 16, minHeight: 44, marginTop: 3 }]}><Text style={{ fontSize: 12, fontWeight: '800', color: c.ink }}>Start a conversation</Text><Icon name="arrow-forward" size={16} /></Pressable>
    </View>
    <TopicChips selected={topic} onSelect={setTopic} />
    <View style={s.between}><Text style={s.h3}>{topic === 'All' ? 'What’s the word?' : topic}</Text><View style={s.row}>{(['hot', 'latest'] as const).map(value => <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: sort === value }} onPress={() => setSort(value)} style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 }}><Text style={{ fontSize: 12, fontWeight: '700', color: sort === value ? c.accent : c.muted }}>{value === 'hot' ? 'Hot' : 'Latest'}</Text></Pressable>)}</View></View>
    <Text style={[s.small, { marginTop: -18, fontSize: 10, letterSpacing: 0.7 }]}>PREVIEW · FICTIONAL STORIES · HEAT ≠ PROOF</Text>
    {visible.map(story => <StoryCard key={story.id} story={story} />)}
    {!visible.length && <Empty title="A quiet corner, for now" body="Try another topic, or manage blocked accounts in your profile." />}
    <Text style={[s.small, { textAlign: 'center' }]}>You’re all caught up. The plot can wait.</Text>
  </Page>;
}
