import type { Story } from '../domain/types';

// All people, programs and events below are invented for this local preview.
export const stories: Story[] = [
  {
    id: 'the-reunion', topic: 'Reality TV', status: 'Developing',
    title: 'The reunion seating chart just changed. Again.',
    summary: 'Fans of the fictional show Palm House spotted an empty chair in the teaser. A surprise guest, or just some very good editing?',
    author: 'afterthecredits', initials: 'AC', color: '#EDDDE9', age: '18m', heat: 284,
    timeline: [
      { title: 'The first whisper', body: 'An empty seat appeared in the fictional reunion teaser. The cast list has not changed.', time: '2 hours ago', kind: 'post' },
      { title: 'A little more context', body: 'A wider frame shows another chair outside the crop. The guest theory is still speculation.', time: '42 minutes ago', kind: 'context' },
      { title: 'The plot thickens', body: 'In this invented story, the producer teased a bonus segment without naming a guest.', time: '18 minutes ago', kind: 'update' },
    ],
  },
  {
    id: 'midnight-track', topic: 'Music', status: 'Unverified',
    title: 'A midnight drop hiding in plain sight?',
    summary: 'Fictional duo Sunday Static changed their bio to a single moon. The internet has a theory. Obviously.',
    author: 'liner.notes', initials: 'LN', color: '#DBE7DA', age: '46m', heat: 197,
    timeline: [
      { title: 'The first whisper', body: 'A moon appeared in the invented duo’s profile. No release date or track has been announced.', time: '46 minutes ago', kind: 'post' },
    ],
  },
  {
    id: 'studio-switch', topic: 'Creators', status: 'Updated',
    title: 'That mysterious new studio? We have an update.',
    summary: 'The Two Takes crew finally explained their cryptic behind-the-scenes photo. And the comments almost had it.',
    author: 'plot.twist', initials: 'PT', color: '#E8E0F2', age: '1h', heat: 126,
    timeline: [
      { title: 'The first whisper', body: 'The fictional Two Takes hosts posted a photo in an unfamiliar studio. Fans guessed a new show.', time: 'Yesterday', kind: 'post' },
      { title: 'The response', body: 'In this demo story, the hosts explained that they were recording a one-off guest episode.', time: '1 hour ago', kind: 'update' },
    ],
  },
  {
    id: 'festival-poster', topic: 'Internet', status: 'Unverified',
    title: 'One blurred name. A hundred festival theories.',
    summary: 'A made-up festival poster has a very suspicious blank space. Who would your dream surprise headliner be?',
    author: 'open.tabs', initials: 'OT', color: '#F5DFCF', age: '2h', heat: 89,
    timeline: [
      { title: 'The first whisper', body: 'This fictional poster was designed with a blank headliner slot. There is no real event or artist announcement.', time: '2 hours ago', kind: 'post' },
    ],
  },
];
