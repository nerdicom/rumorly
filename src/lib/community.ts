import type { SupabaseClient } from '@supabase/supabase-js';
import { initialState, type Action } from '../domain/state';
import type { DemoState, ModerationStatus, Report, Story, Submission, Vote } from '../domain/types';

interface StoryRow {
  id: string; author_id: string; title: string; body: string; source: string;
  topic: Submission['topic']; moderation_status: ModerationStatus;
  editorial_status: Story['status']; created_at: string;
  author?: { display_name: string };
}
interface UpdateRow {
  id: string; story_id: string; body: string; source: string;
  moderation_status: ModerationStatus; created_at: string;
}
interface ReportRow { id: string; story_id: string; reason: Report['reason']; details: string; created_at: string }
export interface CommunitySnapshot { state: DemoState; stories: Story[]; blockedNames: Record<string, string> }

export function mapStory(row: StoryRow, updates: UpdateRow[], score: number, ownVote: Vote | undefined): Story {
  const author = row.author?.display_name ?? 'Curious human';
  return {
    id: row.id, authorId: row.author_id, author, title: row.title, summary: row.body, source: row.source,
    topic: row.topic, status: row.editorial_status, initials: author.slice(0, 2).toUpperCase(),
    color: '#EDDDE9', age: new Date(row.created_at).toLocaleDateString(),
    // Existing heat() adds the user's reaction. Remove it from the aggregate once.
    heat: score - (ownVote ?? 0),
    timeline: [{ title: 'The first whisper', body: row.body, source: row.source, time: new Date(row.created_at).toLocaleString(), kind: 'post' },
      ...updates.filter(item => item.story_id === row.id && item.moderation_status === 'published').map(item => ({
        title: 'Added context', body: item.body, source: item.source, time: new Date(item.created_at).toLocaleString(), kind: 'context' as const,
      }))],
  };
}

export async function loadCommunity(client: SupabaseClient, userId: string): Promise<CommunitySnapshot> {
  const results = await Promise.all([
    client.from('profiles').select('display_name').eq('id', userId).single(),
    client.from('stories').select('*,author:profiles!stories_author_id_fkey(display_name)').eq('moderation_status', 'published').order('created_at', { ascending: false }).limit(100),
    client.from('votes').select('story_id,value').eq('user_id', userId),
    client.from('follows').select('story_id').eq('user_id', userId),
    client.from('blocks').select('blocked_id,profile:profiles!blocks_blocked_id_fkey(display_name)').eq('user_id', userId),
    client.from('reports').select('id,story_id,reason,details,created_at').eq('user_id', userId),
    client.from('stories').select('*').eq('author_id', userId).order('created_at', { ascending: false }).limit(100),
    client.from('story_updates').select('*').eq('author_id', userId).order('created_at', { ascending: false }).limit(100),
  ]);
  for (const result of results) if (result.error) throw result.error;
  const [profile, feed, voteRows, followRows, blockRows, reports, submissions, contexts] = results;
  const rows = feed.data as unknown as StoryRow[];
  const ids = rows.map(row => row.id);
  const [scores, updates] = ids.length ? await Promise.all([
    client.rpc('story_scores', { story_ids: ids }),
    client.from('story_updates').select('*').in('story_id', ids).eq('moderation_status', 'published').order('created_at'),
  ]) : [{ data: [], error: null }, { data: [], error: null }];
  if (scores.error) throw scores.error;
  if (updates.error) throw updates.error;
  const votes = Object.fromEntries((voteRows.data as unknown as { story_id: string; value: Vote }[]).map(row => [row.story_id, row.value]));
  const totals = Object.fromEntries((scores.data as { story_id: string; score: number }[]).map(row => [row.story_id, Number(row.score)]));
  const blocks = blockRows.data as unknown as { blocked_id: string; profile: { display_name: string } }[];
  return {
    state: {
      ...initialState, onboarded: true, displayName: (profile.data as unknown as { display_name: string }).display_name,
      votes, follows: (followRows.data as unknown as { story_id: string }[]).map(row => row.story_id),
      blocked: blocks.map(row => row.blocked_id),
      reports: (reports.data as unknown as ReportRow[]).map(row => ({ id: row.id, storyId: row.story_id, reason: row.reason, details: row.details, createdAt: row.created_at })),
      submissions: (submissions.data as unknown as StoryRow[]).map(row => ({ id: row.id, title: row.title, body: row.body, source: row.source, topic: row.topic, status: row.moderation_status, createdAt: row.created_at })),
      contexts: (contexts.data as unknown as UpdateRow[]).map(row => ({ id: row.id, storyId: row.story_id, body: row.body, source: row.source, status: row.moderation_status, createdAt: row.created_at })),
    },
    stories: rows.map(row => mapStory(row, updates.data as UpdateRow[], totals[row.id] ?? 0, votes[row.id])),
    blockedNames: Object.fromEntries(blocks.map(row => [row.blocked_id, row.profile.display_name])),
  };
}

export async function saveAction(client: SupabaseClient, userId: string, state: DemoState, action: Action): Promise<void> {
  let result;
  switch (action.type) {
    case 'name':
      result = await client.from('profiles').update({ display_name: action.name.trim().slice(0, 30) || 'Curious human' }).eq('id', userId).select('id').single(); break;
    case 'vote': {
      const current = state.votes[action.storyId];
      if (current === action.value) result = await client.from('votes').delete().eq('user_id', userId).eq('story_id', action.storyId);
      else if (current) result = await client.from('votes').update({ value: action.value }).eq('user_id', userId).eq('story_id', action.storyId).select('value').single();
      else result = await client.from('votes').insert({ user_id: userId, story_id: action.storyId, value: action.value });
      break;
    }
    case 'follow':
      result = state.follows.includes(action.storyId)
        ? await client.from('follows').delete().eq('user_id', userId).eq('story_id', action.storyId)
        : await client.from('follows').insert({ user_id: userId, story_id: action.storyId }); break;
    case 'block': result = await client.from('blocks').insert({ user_id: userId, blocked_id: action.author }); break;
    case 'unblock': result = await client.from('blocks').delete().eq('user_id', userId).eq('blocked_id', action.author); break;
    case 'report': {
      const fields = { reason: action.report.reason, details: action.report.details.trim() };
      result = state.reports.some(row => row.storyId === action.report.storyId)
        ? await client.from('reports').update(fields).eq('user_id', userId).eq('story_id', action.report.storyId).select('id').single()
        : await client.from('reports').insert({ ...fields, user_id: userId, story_id: action.report.storyId }); break;
    }
    case 'submit': {
      const item = action.submission;
      result = await client.from('stories').insert({ author_id: userId, title: item.title.trim(), body: item.body.trim(), source: item.source.trim(), topic: item.topic }); break;
    }
    case 'context': {
      const item = action.context;
      result = await client.from('story_updates').insert({ author_id: userId, story_id: item.storyId, body: item.body.trim(), source: item.source.trim() }); break;
    }
    default: throw new Error('This local action is unavailable for an account.');
  }
  if (result.error) throw result.error;
}
