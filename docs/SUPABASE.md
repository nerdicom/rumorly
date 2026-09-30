# Supabase integration

Project: `qkdznbbecplknjopgpax` at https://qkdznbbecplknjopgpax.supabase.co.

## Deployment status

The project and publishable key were verified using read-only requests on September 30, 2026 UTC. Email authentication and signup are enabled; email confirmation is required. At that check, the `public.stories` table did not exist. The Supabase plugin installation was confirmed, but this running assistant session did not expose its database tools. **The migration and email template have not been applied to the hosted project.** Do not mark them deployed without checking the actual project.

The repository contains the mobile integration and a tested migration. The Next.js `@supabase/ssr`, cookie middleware, and `NEXT_PUBLIC_` variables do not apply to this Expo app.

## Configure the app

```sh
cp .env.example .env
npm ci
npm start
```

The project URL and publishable key in `.env.example` are public client configuration. `.env` is ignored by Git. Never add a service-role key, secret key, database password, or management token to an `EXPO_PUBLIC_` variable or to this repository. Configure the same two public variables in the intended EAS environment before a cloud build. Restart Expo after changing environment variables.

Without these variables, the local demo still runs and the account screen explains that accounts are unavailable. Guest/demo activity is not uploaded when signing in. Signed-in account data is held in memory; only the authentication session is persisted. Sign-out/account changes unmount the personal store and leave the independent fictional demo intact.

## Apply the database migration

Apply `supabase/migrations/202609300001_initial_community.sql` once to this project through the connected Supabase migration tool, CLI, or its SQL editor. The migration is transactional and deliberately fails on conflicting existing table names; inspect existing objects rather than overwriting them. It creates:

- Auth-owned public display names, without email addresses or client-controlled roles.
- Stories and context that default to pending review.
- Unique, equal-weight votes and account follows.
- Private reports and blocks.
- Operator-only content review with an audit record.

Every table has row-level security enabled. Explicit column grants prevent changing moderation status, editorial status, ownership, review timestamps, or vote weight. Anonymous clients have no table access. Only approved content appears in the community feed; authors can inspect their own pending/rejected content in their profile.

The `story_scores` function exposes aggregate attention scores without revealing voting histories. `can_report_story` avoids a recursive policy dependency. Both functions pin `search_path` and validate the authenticated caller; the operator review function is unavailable to mobile users.

No seed stories or test accounts are created in the hosted project. The fictional demo remains separate.

## Configure email codes

The app uses passwordless email codes for account creation and sign-in. No redirect/deep-link setup or password-reset flow is needed for this auth method.

In Supabase **Authentication → Email Templates**, use `supabase/templates-email-code.html` for **Magic Link** and **Confirm signup**. The essential variable is `{{ .Token }}`. The app accepts 6–8 digits, handles expired/invalid codes, and enforces a local 60-second resend wait in addition to Supabase's server limits. Keep email confirmation enabled.

Supabase's default mail service restricts delivery to authorized team addresses and has low rate limits. Use a project-team email for initial testing or configure a production SMTP provider before inviting other testers. No real sign-in emails were sent by the automated tests.

Official references: https://supabase.com/docs/guides/auth/auth-email-passwordless and https://supabase.com/docs/guides/auth/auth-smtp

## First end-to-end check after setup

1. Open **Sign in or create an account**, choose **Create an account**, enter your own email and a display name, acknowledge the age/community terms, and request a code.
2. Enter the emailed code. The initial community feed should be empty, with no fictional demo posts mixed in.
3. Submit a fictional test story. Its profile status should be **Pending** and it must not appear in another account's feed.
4. Review that story using `supabase/moderation.sql` and the operator-only `review_content` function. Approving content is a deliberate human action, not a vote threshold.
5. Refresh the app. With a second account, test voting, following, context, reporting, blocking, and sign-out. No subscription affects voting.

The review queue is stored in the database; an operator uses the SQL editor initially. Email/Slack moderator alerts, a dedicated moderator dashboard, and staffing are not active. New content never auto-publishes.

## Validation and remaining work

`npm test` runs actual PostgreSQL behavior in PGlite, including grants, RLS, private data boundaries, duplicate/weighted votes, moderator-only publication, and blocked/reported/removed content. This tests the migration locally, not the hosted Supabase configuration.

Browser tests with mocked Supabase responses cover signup acknowledgment, code errors/resend limits, session restoration, shared mutations, failed-save input retention, and sign-out isolation. Typecheck, lint, and all-platform JavaScript exports are also required.

This first integration loads the newest 100 reviewed stories and the latest 100 own submissions/context entries; pagination and full-history following/search are future work. Feed updates use Refresh rather than realtime subscriptions or push notifications. Before a public beta, finish deletion/export, real privacy/support contacts, age assurance, abuse throttling/CAPTCHA, staffed moderation and appeals, native-device testing, and operational monitoring. Billing remains disabled.
