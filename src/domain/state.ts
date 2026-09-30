import type { ContextSubmission, DemoState, Report, Story, Submission, Vote } from './types.ts';
import { reportReasons, topics } from './types.ts';

export const initialState: DemoState = {
  version: 1, onboarded: false, displayName: 'Curious human', votes: {},
  follows: [], blocked: [], reports: [], submissions: [], contexts: [],
};
export type Action =
  | { type: 'onboard' }
  | { type: 'name'; name: string }
  | { type: 'vote'; storyId: string; value: Vote }
  | { type: 'follow'; storyId: string }
  | { type: 'block' | 'unblock'; author: string }
  | { type: 'report'; report: Report }
  | { type: 'submit'; submission: Submission }
  | { type: 'context'; context: ContextSubmission }
  | { type: 'restore'; state: DemoState }
  | { type: 'reset' };

export function reducer(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case 'onboard': return { ...state, onboarded: true };
    case 'name': return { ...state, displayName: action.name.trim().slice(0, 30) || 'Curious human' };
    case 'vote': {
      const votes = { ...state.votes };
      if (votes[action.storyId] === action.value) delete votes[action.storyId];
      else votes[action.storyId] = action.value;
      return { ...state, votes };
    }
    case 'follow': return { ...state, follows: state.follows.includes(action.storyId) ? state.follows.filter(id => id !== action.storyId) : [...state.follows, action.storyId] };
    case 'block': return { ...state, blocked: [...new Set([...state.blocked, action.author])] };
    case 'unblock': return { ...state, blocked: state.blocked.filter(author => author !== action.author) };
    case 'report': return { ...state, reports: [...state.reports.filter(r => r.storyId !== action.report.storyId), action.report] };
    case 'submit': return { ...state, submissions: [{ ...action.submission, status: 'pending' }, ...state.submissions] };
    case 'context': return { ...state, contexts: [{ ...action.context, status: 'pending' }, ...state.contexts] };
    case 'restore': return action.state;
    case 'reset': return { ...initialState };
  }
}
export function isVisible(story: Story, state: DemoState): boolean {
  return !state.blocked.includes(story.authorId ?? story.author) && !state.reports.some(report => report.storyId === story.id);
}
export function heat(story: Story, state: DemoState): number { return story.heat + (state.votes[story.id] ?? 0); }
export function publicSourceError(value: string): string | null {
  if (!value.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' || url.username || url.password || !url.hostname.includes('.')) return 'Use a complete public https:// link.';
    return null;
  } catch { return 'Use a complete public https:// link.'; }
}
export function submissionError(title: string, body: string, source: string): string | null {
  if (title.trim().length < 12 || title.trim().length > 120) return 'Use a headline between 12 and 120 characters.';
  if (body.trim().length < 30 || body.trim().length > 1000) return 'Add 30–1,000 characters of context.';
  return publicSourceError(source);
}

// Treat persisted device data as untrusted. A broken or old snapshot must not crash startup.
export function decodeState(raw: string | null): DemoState {
  if (!raw) return { ...initialState };
  try {
    const data = JSON.parse(raw);
    if (!data || data.version !== 1 || typeof data.onboarded !== 'boolean' || typeof data.displayName !== 'string') return { ...initialState };
    const strings = (v: unknown): v is string[] => Array.isArray(v) && v.every(x => typeof x === 'string');
    const text = (v: unknown): v is string => typeof v === 'string';
    if (!strings(data.follows) || !strings(data.blocked) || !data.votes || typeof data.votes !== 'object' || Array.isArray(data.votes)) return { ...initialState };
    if (!Object.values(data.votes).every(v => v === 1 || v === -1)) return { ...initialState };
    if (!Array.isArray(data.reports) || !data.reports.every((r: Report) => r && text(r.id) && text(r.storyId) && text(r.details) && text(r.createdAt) && reportReasons.includes(r.reason))) return { ...initialState };
    if (!Array.isArray(data.submissions) || !data.submissions.every((s: Submission) => s && text(s.id) && text(s.title) && text(s.body) && text(s.source) && text(s.createdAt) && s.status === 'pending' && s.topic !== ('All' as string) && topics.includes(s.topic))) return { ...initialState };
    if (!Array.isArray(data.contexts) || !data.contexts.every((c: ContextSubmission) => c && text(c.id) && text(c.storyId) && text(c.body) && text(c.source) && text(c.createdAt) && c.status === 'pending')) return { ...initialState };
    return { version: 1, onboarded: data.onboarded, displayName: data.displayName.slice(0, 30), votes: data.votes, follows: [...new Set<string>(data.follows)], blocked: [...new Set<string>(data.blocked)], reports: data.reports, submissions: data.submissions, contexts: data.contexts };
  } catch { return { ...initialState }; }
}
