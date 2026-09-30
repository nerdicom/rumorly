import { router } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { Button, Empty, Page } from '../../components/ui';
import { StoryCard } from '../../components/StoryCard';
import { isVisible } from '../../domain/state';
import { useApp } from '../../store/AppStore';
import { s } from '../../theme';
export default function Following() {
  const { state, stories, mode } = useApp();
  const following = stories.filter(story => state.follows.includes(story.id) && isVisible(story, state));
  return <Page><Text style={s.label}>STAY FOR THE PLOT TWIST</Text><Text style={s.h1}>Your front{ '\n' }row seat.</Text><Text style={s.body}>The stories you’re keeping an eye on, all in one place.</Text>
    {following.length ? following.map(story => <StoryCard key={story.id} story={story} />) : <><Empty title="Something will catch your ear" body="Tap the bookmark on any story to follow its timeline here." icon="bookmark-outline" /><Button label="Find a story" secondary onPress={() => router.navigate('/')} /></>}
    <Text style={s.small}>{mode === 'demo' ? 'Follows are saved on this device. Sign in to save them to your account.' : 'Follows are saved to your account. Refresh the feed for updates. Push notifications are coming later.'}</Text>
  </Page>;
}
