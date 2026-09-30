import React from 'react';
import { Text, View } from 'react-native';
import { Icon, type IconName, Notice, Page } from '../components/ui';
import { c, s } from '../theme';

export default function Plus() {
  const perks: [IconName, string, string][] = [
    ['notifications-outline', 'Your topics. Your alerts.', 'Choose the conversations you want to keep up with.'],
    ['albums-outline', 'A place for every plot twist', 'Organize saved stories into personal collections.'],
    ['color-palette-outline', 'Make your corner yours', 'Profile themes, app icons, and subscriber styles.'],
    ['sparkles-outline', 'A quieter reading experience', 'Ad-free browsing when advertising launches.'],
  ];
  return <Page back title="Rumorly Plus"><Text style={s.label}>FOR THE EXTRA CURIOUS</Text><Text style={s.h1}>A little more{ '\n' }in the know.</Text><View style={[s.card, { backgroundColor: c.plum, borderColor: c.plum }]}><View style={s.row}><Text style={[s.h1, { color: c.lime }]}>$4.99</Text><Text style={{ color: c.paper }}>/ month</Text></View><Text style={{ color: '#DACBD6', lineHeight: 21 }}>Proposed launch price. Perks and pricing are still being tested.</Text></View>
    {perks.map(([icon, title, body]) => <View key={title} style={[s.row, { alignItems: 'flex-start', gap: 16 }]}><View style={{ backgroundColor: c.rose, borderRadius: 14, padding: 13 }}><Icon name={icon} color={c.accent} /></View><View style={{ flex: 1, gap: 5 }}><Text style={s.h3}>{title}</Text><Text style={s.body}>{body}</Text></View></View>)}
    <Notice>Coming later. This is a preview of the membership concept. Purchases are disabled and no payment details are collected.</Notice>
    <Text style={s.body}>Every member gets the same voting power. Reporting, corrections, and basic participation stay free.</Text>
  </Page>;
}
