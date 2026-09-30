-- Operator queries for the Supabase SQL editor; never ship a service-role key to the app.
-- These SELECT statements only inspect the review queue.
select id, author_id, title, body, source, topic, created_at
from public.stories where moderation_status = 'pending' order by created_at;

select id, story_id, author_id, body, source, created_at
from public.story_updates where moderation_status = 'pending' order by created_at;

select r.id, r.story_id, r.reason, r.details, r.created_at, s.title
from public.reports r join public.stories s on s.id = r.story_id
where r.resolved_at is null order by r.created_at;

-- After a human reviews the content, run one call with its actual UUID and a reason.
-- select public.review_content('story', '<story UUID>', 'published', 'Reason for approval');
-- select public.review_content('story', '<story UUID>', 'rejected', 'Reason for rejection');
-- select public.review_content('story', '<story UUID>', 'removed', 'Reason for removal');
-- select public.review_content('context', '<context UUID>', 'published', 'Source and context reviewed');
-- After resolving a report, record its resolution:
-- update public.reports set resolved_at = now() where id = '<report UUID>';
