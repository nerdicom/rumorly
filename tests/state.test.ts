import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeState, heat, initialState, isVisible, publicSourceError, reducer, submissionError } from '../src/domain/state.ts';
import type { Story, Submission } from '../src/domain/types.ts';

const story: Story = { id: 'one', title: 'A fictional story', summary: '', topic: 'Music', status: 'Unverified', author: 'demo', initials: 'D', color: '#fff', age: '1m', heat: 20, timeline: [] };
test('one active vote: toggling and switching never stack influence', () => {
  const up = reducer(initialState, { type: 'vote', storyId: 'one', value: 1 });
  assert.equal(heat(story, up), 21);
  const down = reducer(up, { type: 'vote', storyId: 'one', value: -1 });
  assert.equal(heat(story, down), 19);
  const cleared = reducer(down, { type: 'vote', storyId: 'one', value: -1 });
  assert.equal(heat(story, cleared), 20);
  assert.deepEqual(cleared.votes, {});
  assert.equal(story.status, 'Unverified');
});
test('followers toggle without duplicates', () => {
  const followed = reducer(initialState, { type: 'follow', storyId: 'one' });
  assert.deepEqual(followed.follows, ['one']);
  assert.deepEqual(reducer(followed, { type: 'follow', storyId: 'one' }).follows, []);
});
test('blocking an author hides stories, and unblocking restores visibility', () => {
  const blocked = reducer(initialState, { type: 'block', author: 'demo' });
  assert.equal(isVisible(story, blocked), false);
  assert.equal(isVisible(story, reducer(blocked, { type: 'unblock', author: 'demo' })), true);
});
test('report hides story independently of blocks and vote totals', () => {
  const reported = reducer(initialState, { type: 'report', report: { id: 'r', storyId: 'one', reason: 'Other', details: '', createdAt: '2026-09-30' } });
  assert.equal(isVisible(story, reported), false);
  assert.equal(isVisible(story, reducer(reported, { type: 'unblock', author: 'demo' })), false);
});
test('new submissions cannot set their own approved status', () => {
  const untrusted = { id: 'new', title: 'Example', body: 'Example', topic: 'Music', source: '', createdAt: '', status: 'approved' } as unknown as Submission;
  assert.equal(reducer(initialState, { type: 'submit', submission: untrusted }).submissions[0].status, 'pending');
});
test('malformed, old, or excessive vote data resets safely', () => {
  for (const raw of ['{', 'null', '{"version":0}', JSON.stringify({ ...initialState, votes: { one: 100 } }), JSON.stringify({ ...initialState, reports: [null] }), JSON.stringify({ ...initialState, submissions: [{ id: 'broken' }] })]) {
    assert.deepEqual(decodeState(raw), initialState);
  }
});
test('device snapshot round-trips votes and follows', () => {
  const state = reducer(reducer(initialState, { type: 'follow', storyId: 'one' }), { type: 'vote', storyId: 'one', value: -1 });
  assert.deepEqual(decodeState(JSON.stringify(state)), state);
});
test('source fields reject executable schemes and embedded credentials', () => {
  assert.equal(publicSourceError('https://example.com/story'), null);
  for (const url of ['javascript:alert(1)', 'data:text/html,test', 'http://example.com', 'https://user:secret@example.com', 'not a link']) assert.ok(publicSourceError(url));
});
test('submissions require meaningful context and a valid optional link', () => {
  assert.ok(submissionError('Short', 'Too short', ''));
  assert.equal(submissionError('A fictional headline', 'This is a fictional entertainment story for testing.', ''), null);
});
test('reset removes all device activity and onboarding consent', () => {
  const state = reducer({ ...initialState, onboarded: true, follows: ['one'], blocked: ['demo'] }, { type: 'reset' });
  assert.deepEqual(state, initialState);
});
