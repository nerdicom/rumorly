export const topics = ['All', 'Reality TV', 'Creators', 'Music', 'Internet'] as const;
export type Topic = (typeof topics)[number];
export type StoryStatus = 'Unverified' | 'Developing' | 'Updated';
export type Vote = -1 | 1;
export interface Story {
  id: string;
  title: string;
  summary: string;
  topic: Exclude<Topic, 'All'>;
  status: StoryStatus;
  author: string;
  authorId?: string;
  source?: string;
  initials: string;
  color: string;
  age: string;
  heat: number;
  timeline: { title: string; body: string; time: string; source?: string; kind: 'post' | 'context' | 'update' }[];
}
export type ModerationStatus = 'pending' | 'published' | 'rejected' | 'removed';
export interface Submission {
  id: string;
  title: string;
  body: string;
  source: string;
  topic: Exclude<Topic, 'All'>;
  createdAt: string;
  status: ModerationStatus;
}
export interface ContextSubmission {
  id: string;
  storyId: string;
  body: string;
  source: string;
  createdAt: string;
  status: ModerationStatus;
}
export const reportReasons = ['Harassment or bullying', 'Private information', 'Involves a minor', 'Misleading or missing context', 'Other'] as const;
export interface Report {
  id: string;
  storyId: string;
  reason: (typeof reportReasons)[number];
  details: string;
  createdAt: string;
}
export interface DemoState {
  version: 1;
  onboarded: boolean;
  displayName: string;
  votes: Record<string, Vote>;
  follows: string[];
  blocked: string[];
  reports: Report[];
  submissions: Submission[];
  contexts: ContextSubmission[];
}
