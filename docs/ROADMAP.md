# From local demo to private beta

## Milestone 1 — this repository

Interactive mobile UI, fictional data, local persistence, source-link validation, voting, following, pending submissions/context, reporting/blocking, product decisions, and automated build checks.

## Milestone 2 — accounts and backend

Supabase/Postgres has been selected. The repository now includes email-code authentication, public display names, shared participation, database access rules, and an operator review queue. Apply and verify the migration and email templates as recorded in SUPABASE.md. Finish deletion/export flows and a privacy policy with real operator contacts.

Proposed server model:

| Table | Essential behavior |
| --- | --- |
| profiles | Auth-owned ID; public display name; server-managed roles |
| stories | Author, category, headline, body, source, editorial state, moderation state |
| votes | Unique `(story_id, user_id)`; integer value constrained to -1 or +1 |
| story_updates | Reviewable source/context, author, timestamps, published state |
| follows | Unique `(story_id, user_id)` |
| reports | Private to reporter and authorized moderators |
| blocks | Private user-controlled block relationships |
| subscriptions | Trusted server/webhook writes only; no voting-weight field |
| moderation_actions | Auditable moderator decisions with appeals and reasons |

Enforce authorization, uniqueness, rate limits, spam/brigading controls, and moderation state on the server. Do not rely on the preview reducer or age checkbox as security. Publish only reviewed content; separate attention counts from source/evidence assessment. Corrections and responses must not be hidden by downvotes.

## Milestone 3 — moderated private beta

Pick one adult entertainment community. Set up review queues, real report delivery, staffed response targets, source review, subject challenges, blocking enforcement, and retention/deletion policies. Add monitoring, backups, abuse throttling, and audit logs. Establish contact channels and review privacy/legal obligations before accepting real allegations.

Test on physical iPhone and Android devices, including screen readers, large text, keyboard avoidance, offline persistence, low connectivity, and returning-user deep links. Validate signup, account deletion, authorization boundaries, vote uniqueness, moderator access, and correction visibility with integration tests.

## Milestone 4 — validate recurring value

Test whether story updates bring people back, whether they follow multiple stories, and whether Plus perks solve a recurring need. Run pricing research before enabling payments. Do not paywall basic participation, reports, or corrections. Use store-compliant billing and trusted entitlement verification when subscriptions are implemented. Creator channels remain a later hypothesis.

## Milestone 5 — distribution

Connect the intended Expo, Apple Developer, and Google Play accounts; confirm app identifiers and domain ownership; create signed builds; prepare real support/privacy links and store disclosures; recheck current store policies. No automatic publishing or paid cloud builds are performed by this starter.
