import { router } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { Button, Empty, Page } from '../../components/ui';
import { StoryCard } from '../../components/StoryCard';
import { stories } from '../../data/stories';
import { isVisible } from '../../domain/state';
import { useApp } from '../../store/AppStore';
import { s } from '../../theme';
export default function Following() {
  const { state } = useApp();
  const following = stories.filter(story => state.follows.includes(story.id) && isVisible(story, state));
  return <Page><Text style={s.label}>STAY FOR THE PLOT TWIST</Text><Text style={s.h1}>Your front{ '\n' }row seat.</Text><Text style={s.body}>The stories you’re keeping an eye on, all in one place.</Text>
    {following.length ? following.map(story => <StoryCard key={story.id} story={story} />) : <><Empty title="Something will catch your ear" body="Tap the bookmark on any story to follow its timeline here." icon="bookmark-outline" /><Button label="Find a story" secondary onPress={() => router.navigate('/')} /></>}
    <Text style={s.small}>Follows are saved on this device. Live updates and push notifications are coming after the preview.</Text>
  </Page>;
}
