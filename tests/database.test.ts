import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { PGlite } from '@electric-sql/pglite';

const alice = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const bob = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

test('Postgres privileges, row security, voting, and moderation', async t => {
  const db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth;
    create table auth.users(id uuid primary key, raw_user_meta_data jsonb default '{}'::jsonb);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema public,auth to anon,authenticated,service_role;
  `);
  await db.exec(await readFile(new URL('../supabase/migrations/202609300001_initial_community.sql', import.meta.url), 'utf8'));
  await db.query('insert into auth.users(id,raw_user_meta_data) values ($1,$2),($3,$4)', [alice, { display_name: 'Alice', role: 'admin' }, bob, { display_name: 'Bob' }]);
  async function asUser(user: string, sql: string, values: unknown[] = []) {
    await db.exec('set role authenticated');
    try {
      await db.query("select set_config('request.jwt.claim.sub',$1,false)", [user]);
      return await db.query(sql, values);
    } finally { await db.exec('reset role'); await db.exec("select set_config('request.jwt.claim.sub','',false)"); }
  }
  const denied = async (run: Promise<unknown>, code = '42501') => assert.rejects(run, (error: unknown) => (error as { code: string }).code === code);
  let storyId = '';
  let contextId = '';
  try {
    await t.test('profile trigger ignores user-supplied roles; only own name is editable', async () => {
      const own = await asUser(alice, 'select * from public.profiles where id=$1', [alice]);
      assert.equal((own.rows[0] as { display_name: string }).display_name, 'Alice');
      assert.equal('role' in (own.rows[0] as object), false);
      const result = await asUser(bob, "update public.profiles set display_name='Changed' where id=$1 returning id", [alice]);
      assert.equal(result.rows.length, 0);
      await denied(asUser(alice, 'update public.profiles set id=$1 where id=$2', [bob, alice]));
    });
    await t.test('anonymous clients have no table access', async () => {
      await db.exec('set role anon');
      try { await denied(db.query('select * from public.stories')); } finally { await db.exec('reset role'); }
    });
    await t.test('submissions default to pending and are visible only to their author', async () => {
      const result = await asUser(alice, 'insert into public.stories(author_id,title,body,topic) values ($1,$2,$3,$4) returning id,moderation_status', [alice, 'A fictional reunion theory', 'This invented entertainment example is used only for database testing.', 'Reality TV']);
      storyId = (result.rows[0] as { id: string }).id;
      assert.equal((result.rows[0] as { moderation_status: string }).moderation_status, 'pending');
      assert.equal((await asUser(bob, 'select id from public.stories')).rows.length, 0);
      await denied(asUser(bob, 'insert into public.stories(author_id,title,body,topic) values ($1,$2,$3,$4)', [alice, 'Forged story author', 'This should never be accepted as another account.', 'Music']));
      await denied(asUser(alice, "update public.stories set moderation_status='published' where id=$1", [storyId]));
      await denied(asUser(alice, "insert into public.stories(author_id,title,body,topic,moderation_status) values ($1,'A forged publish attempt','This should never be accepted by the database.','Music','published')", [alice]));
      await denied(asUser(bob, 'insert into public.votes(story_id,user_id,value) values($1,$2,1)', [storyId, bob]));
    });
    await t.test('only an operator can review; every review creates an audit record', async () => {
      await denied(asUser(alice, "select public.review_content('story',$1,'published','Self approval')", [storyId]));
      await db.query("select public.review_content('story',$1,'published','Fictional test reviewed')", [storyId]);
      assert.equal((await asUser(bob, 'select id from public.stories')).rows.length, 1);
      assert.equal((await db.query('select * from public.moderation_actions')).rows.length, 1);
      await denied(asUser(bob, 'select * from public.moderation_actions'));
    });
    await t.test('one equal vote per account, with private voting histories', async () => {
      await asUser(bob, 'insert into public.votes(story_id,user_id,value) values($1,$2,1)', [storyId,bob]);
      await denied(asUser(bob, 'insert into public.votes(story_id,user_id,value) values($1,$2,1)', [storyId,bob]), '23505');
      await denied(asUser(bob, 'update public.votes set value=20 where story_id=$1', [storyId]), '23514');
      await denied(asUser(bob, 'insert into public.votes(story_id,user_id,value) values($1,$2,1)', [storyId,alice]));
      assert.equal((await asUser(alice, 'select * from public.votes')).rows.length, 0);
      assert.equal(Number(((await asUser(alice, 'select * from public.story_scores($1::uuid[])', [[storyId]])).rows[0] as { score: number }).score), 1);
      await asUser(bob, 'update public.votes set value=-1 where story_id=$1', [storyId]);
      assert.equal(Number(((await asUser(bob, 'select * from public.story_scores($1::uuid[])', [[storyId]])).rows[0] as { score: number }).score), -1);
      assert.equal((await asUser(alice, 'delete from public.votes where story_id=$1 returning *', [storyId])).rows.length, 0);
      await asUser(bob, 'delete from public.votes where story_id=$1', [storyId]);
    });
    await t.test('context requires review before others see it', async () => {
      const result = await asUser(bob, 'insert into public.story_updates(story_id,author_id,body) values($1,$2,$3) returning id', [storyId,bob,'Some fictional missing context for this test.']);
      contextId = (result.rows[0] as { id: string }).id;
      assert.equal((await asUser(alice, 'select * from public.story_updates')).rows.length, 0);
      await db.query("select public.review_content('context',$1,'published','Context reviewed')", [contextId]);
      assert.equal((await asUser(alice, 'select * from public.story_updates')).rows.length, 1);
    });
    await t.test('follows and blocks belong only to their owner; blocking hides stories at the server', async () => {
      await asUser(bob, 'insert into public.follows(story_id,user_id) values($1,$2)', [storyId,bob]);
      assert.equal((await asUser(alice, 'select * from public.follows')).rows.length, 0);
      await asUser(bob, 'insert into public.blocks(user_id,blocked_id) values($1,$2)', [bob,alice]);
      assert.equal((await asUser(alice, 'select * from public.blocks')).rows.length, 0);
      assert.equal((await asUser(bob, 'select * from public.stories')).rows.length, 0);
      assert.equal((await asUser(bob, 'select * from public.story_scores($1::uuid[])', [[storyId]])).rows.length, 0);
      await asUser(bob, 'delete from public.blocks where blocked_id=$1', [alice]);
      assert.equal((await asUser(bob, 'select * from public.stories')).rows.length, 1);
    });
    await t.test('reports are private and cannot be resolved by the reporter', async () => {
      await asUser(bob, "insert into public.reports(story_id,user_id,reason,details) values($1,$2,'Other','Fictional review request')", [storyId,bob]);
      assert.equal((await asUser(alice, 'select * from public.reports')).rows.length, 0);
      assert.equal((await asUser(bob, 'select * from public.reports')).rows.length, 1);
      assert.equal((await asUser(bob, 'select * from public.stories')).rows.length, 0);
      await denied(asUser(bob, 'update public.reports set resolved_at=now()'));
      await denied(asUser(bob, 'insert into public.reports(story_id,user_id,reason) values($1,$2,$3)', [storyId,alice,'Other']));
    });
    await t.test('removed stories cannot receive new reactions or follows', async () => {
      await db.query("select public.review_content('story',$1,'removed','Test removal')", [storyId]);
      await denied(asUser(alice, 'insert into public.votes(story_id,user_id,value) values($1,$2,1)', [storyId,alice]));
      await denied(asUser(alice, 'insert into public.follows(story_id,user_id) values($1,$2)', [storyId,alice]));
      assert.equal((await asUser(alice, 'select * from public.story_scores($1::uuid[])', [[storyId]])).rows.length, 0);
    });
  } finally { await db.close(); }
});
