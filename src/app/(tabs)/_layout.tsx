import { Tabs } from 'expo-router';
import React from 'react';
import { Icon, type IconName } from '../../components/ui';
import { useTheme } from '../../theme';

const icons: Record<string, IconName> = { index: 'flame-outline', discover: 'compass-outline', post: 'add-circle-outline', following: 'bookmark-outline', profile: 'person-outline' };
export default function TabLayout() {
  const { c } = useTheme();
  return <Tabs screenOptions={({ route }) => ({ headerShown: false, tabBarActiveTintColor: c.accent, tabBarInactiveTintColor: c.muted, sceneStyle: { backgroundColor: c.bg }, tabBarStyle: { backgroundColor: c.paper, borderTopColor: c.line }, tabBarLabelStyle: { fontSize: 10, fontWeight: '700' }, tabBarIcon: ({ color }) => <Icon name={icons[route.name]} color={color} size={23} /> })}>
    <Tabs.Screen name="index" options={{ title: 'The feed' }} />
    <Tabs.Screen name="discover" options={{ title: 'Discover' }} />
    <Tabs.Screen name="post" options={{ title: 'Spill' }} />
    <Tabs.Screen name="following" options={{ title: 'Following' }} />
    <Tabs.Screen name="profile" options={{ title: 'You' }} />
  </Tabs>;
}
