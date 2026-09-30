import React from 'react';
import { Pressable, ScrollView, Text } from 'react-native';
import { topics, type Topic } from '../domain/types';
import { useTheme } from '../theme';
export function TopicChips({ selected, onSelect, includeAll = true }: { selected: Topic; onSelect: (topic: Topic) => void; includeAll?: boolean }) {
  const { c } = useTheme();
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
    {topics.filter(t => includeAll || t !== 'All').map(topic => <Pressable key={topic} accessibilityRole="button" accessibilityState={{ selected: topic === selected }} onPress={() => onSelect(topic)} style={{ paddingHorizontal: 17, minHeight: 44, justifyContent: 'center', backgroundColor: selected === topic ? c.ink : c.paper, borderColor: c.line, borderWidth: 1, borderRadius: 24 }}><Text style={{ color: topic === selected ? c.paper : c.muted, fontSize: 12, fontWeight: '700' }}>{topic}</Text></Pressable>)}
  </ScrollView>;
}
