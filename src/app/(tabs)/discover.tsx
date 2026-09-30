import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Empty, Icon, Page } from '../../components/ui';
import { StoryCard } from '../../components/StoryCard';
import { TopicChips } from '../../components/TopicChips';
import { isVisible } from '../../domain/state';
import type { Topic } from '../../domain/types';
import { useApp } from '../../store/AppStore';
import { c, s } from '../../theme';

export default function Discover() {
  const { state, stories, mode } = useApp();
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState<Topic>('All');
  const results = stories.filter(story => isVisible(story, state) && (topic === 'All' || story.topic === topic) && `${story.title} ${story.summary} ${story.author}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <Page>
    <Text style={s.label}>DOWN THE RABBIT HOLE</Text><Text style={s.h1}>Find your kind{ '\n' }of conversation.</Text>
    <View style={[s.row, s.input]}><Icon name="search-outline" color={c.muted} /><TextInput accessibilityLabel="Search stories" placeholder="Stories, topics, creators…" placeholderTextColor={c.muted} value={query} onChangeText={setQuery} autoCapitalize="none" returnKeyType="search" style={{ flex: 1, color: c.ink, fontSize: 15, minHeight: 24 }} /><Text style={s.small}>{results.length}</Text></View>
    <TopicChips selected={topic} onSelect={setTopic} />
    <Text style={s.h3}>{query ? 'Here’s what we found' : 'Worth a closer look'}</Text>
    {results.map(story => <StoryCard key={story.id} story={story} />)}
    {!results.length && <Empty title="No whispers here" body={mode === 'demo' ? 'Try a different word or topic. This preview contains four fictional stories.' : 'Try another word or topic. Only reviewed stories appear here.'} icon="search-outline" />}
  </Page>;
}
