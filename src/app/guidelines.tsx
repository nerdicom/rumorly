import React from 'react';
import { Text, View } from 'react-native';
import { Page } from '../components/ui';
import { s } from '../theme';
export default function Guidelines() {
  return <Page back title="Community guidelines"><Text style={s.h1}>Curious.{ '\n' }Not cruel.</Text>{[
    ['Keep it public', 'Discuss public entertainment stories. No private contact details, private messages, intimate material, or identifying private individuals.'],
    ['Adults only', 'The planned community is 18+. Do not post rumors about minors. The preview age checkbox is not production age assurance.'],
    ['Bring context', 'Separate speculation from facts. Link public sources when available and welcome corrections. A popular story is not a verified story.'],
    ['No personal attacks', 'No harassment, threats, hateful content, impersonation, or organized pile-ons.'],
    ['Give people a voice', 'Reporting and corrections stay free. Report content from the story menu or add context on the timeline.'],
    ['Know the preview', 'Stories and accounts are fictional. Your actions are stored locally on this device, not sent to a community or moderation team. Reset them from your profile.'],
  ].map(([title, body]) => <View key={title} style={{ gap: 8 }}><Text style={s.h3}>{title}</Text><Text style={s.body}>{body}</Text></View>)}</Page>;
}
