# Supabase integration

Project: `qkdznbbecplknjopgpax` at https://qkdznbbecplknjopgpax.supabase.co.

## Deployment status

The migration was applied successfully through the Supabase SQL editor on September 29, 2026 (America/Denver). The hosted database now has all eight application tables with RLS enabled; anonymous SELECT is denied on every table. Live REST requests to stories and reports returned the expected permission denial. Supabase Security Advisor was rerun: **zero errors, zero warnings**, and one informational note for the intentionally operator-only `moderation_actions` table (RLS enabled with no client policy).

**Resend SMTP and both email-code templates are configured as of September 30, 2026 (America/Denver).** `rumorly.app` is verified for sending. Supabase uses `Rumorly <no-reply@rumorly.app>`, `smtp.resend.com:465`, username `resend`, and a sending-only key restricted to `rumorly.app`. The key is stored only in Supabase's encrypted SMTP configuration, never in this repository or the mobile app. The saved settings were checked after reloading the dashboard.

Both **Magic link or OTP** and **Confirm sign up** now use subject `Your Rumorly sign-in code` and the exact body in `supabase/templates-email-code.html`, including `{{ .Token }}`. Supabase confirmed both template saves. The per-user send interval is 60 seconds; enabling custom SMTP sets the initial hourly email limit to 30.

**Actual email delivery and account sign-in still need a test.** No test message or app account was created during this configuration. `EXPO_PUBLIC_AUTH_EMAIL_CODES_READY` remains `false` until delivery is verified. Guest/demo mode remains usable. Configuration and template evidence are in `docs/previews/resend-smtp.jpg` and `docs/previews/email-code-template.jpg`.

The Supabase plugin is installed but its SQL actions were not exposed to the assistant; the authorized browser fallback was used. No app users, seed content, billing, or paid services were created.
The repository contains the mobile integration and the exact tested, applied migration. The Next.js `@supabase/ssr`, cookie middleware, and `NEXT_PUBLIC_` variables do not apply to this Expo app.

## Configure the app

```sh
cp .env.example .env
npm ci
npm start
```

The project URL and publishable key in `.env.example` are public client configuration. `.env` is ignored by Git. Never add a service-role key, secret key, database password, or management token to an `EXPO_PUBLIC_` variable or to this repository. Configure the public project variables and readiness flag in the intended EAS environment before a cloud build. Restart Expo after changing environment variables.

Without these variables, the local demo still runs and the account screen explains that accounts are unavailable. Guest/demo activity is not uploaded when signing in. Signed-in account data is held in memory; only the authentication session is persisted. Sign-out/account changes unmount the personal store and leave the independent fictional demo intact.

## Apply the database migration

**Already applied to this project; do not run it again.** For a fresh project, apply `supabase/migrations/202609300001_initial_community.sql` once through the connected Supabase migration tool, CLI, or SQL editor. This deployment used the SQL editor, so it did not create a Supabase CLI migration-history entry; reconcile migration history before using CLI migration deployment against this existing project. The migration is transactional and deliberately fails on conflicting existing table names; inspect existing objects rather than overwriting them. It creates:

- Auth-owned public display names, without email addresses or client-controlled roles.
- Stories and context that default to pending review.
- Unique, equal-weight votes and account follows.
- Private reports and blocks.
- Operator-only content review with an audit record.

Every table has row-level security enabled. Explicit column grants prevent changing moderation status, editorial status, ownership, review timestamps, or vote weight. Anonymous clients have no table access. Only approved content appears in the community feed; authors can inspect their own pending/rejected content in their profile.

The public `story_scores` RPC is an invoker wrapper over a narrowly scoped private aggregate. Privileged helpers and the profile-creation trigger live in the unexposed `rumorly_private` schema with pinned search paths and restricted execution. The aggregate and report lookup validate the authenticated caller. The public operator review function uses invoker permissions and is unavailable to mobile users.

No seed stories or test accounts are created in the hosted project. The fictional demo remains separate.

## Configure email codes

The app uses passwordless email codes for account creation and sign-in. No redirect/deep-link setup or password-reset flow is needed for this auth method.

First configure a transactional email provider in **Authentication → Emails → SMTP Settings**. New free projects cannot customize the default-provider templates. Then in **Authentication → Emails → Templates**, use `supabase/templates-email-code.html` for **Magic Link** and **Confirm signup**. The essential variable is `{{ .Token }}`. The app accepts 6–8 digits, handles expired/invalid codes, and enforces a local 60-second resend wait in addition to Supabase's server limits. Keep email confirmation enabled. After saving both templates and confirming delivery, set `EXPO_PUBLIC_AUTH_EMAIL_CODES_READY=true` in the app environment and rebuild/restart Expo.

This project's custom Resend SMTP is now configured, so the default mail service's project-team-only recipient restriction no longer applies. Confirm successful delivery to an explicitly authorized test address before inviting testers or enabling the readiness flag. No real sign-in emails were sent by the automated tests.

Free-tier template restriction: https://supabase.com/changelog/46599-changes-to-email-template-customisation-on-free-tier

Official references: https://supabase.com/docs/guides/auth/auth-email-passwordless and https://supabase.com/docs/guides/auth/auth-smtp

## First end-to-end check after setup

1. Open **Sign in or create an account**, choose **Create an account**, enter your own email and a display name, acknowledge the age/community terms, and request a code.
2. Enter the emailed code. The initial community feed should be empty, with no fictional demo posts mixed in.
3. Submit a fictional test story. Its profile status should be **Pending** and it must not appear in another account's feed.
4. Review that story using `supabase/moderation.sql` and the operator-only `review_content` function. Approving content is a deliberate human action, not a vote threshold.
5. Refresh the app. With a second account, test voting, following, context, reporting, blocking, and sign-out. No subscription affects voting.

The review queue is stored in the database; an operator uses the SQL editor initially. Email/Slack moderator alerts, a dedicated moderator dashboard, and staffing are not active. New content never auto-publishes.

## Validation and remaining work

`npm test` runs actual PostgreSQL behavior in PGlite, including grants, RLS, private data boundaries, duplicate/weighted votes, moderator-only publication, and blocked/reported/removed content. This tests database behavior locally. Hosted table security, anonymous-access denial, and the security advisor were also checked after deployment; real two-account auth testing awaits email delivery.

Browser tests with mocked Supabase responses cover signup acknowledgment, code errors/resend limits, session restoration, shared mutations, failed-save input retention, and sign-out isolation. Typecheck, lint, and all-platform JavaScript exports are also required.

This first integration loads the newest 100 reviewed stories and the latest 100 own submissions/context entries; pagination and full-history following/search are future work. Feed updates use Refresh rather than realtime subscriptions or push notifications. Before a public beta, finish deletion/export, real privacy/support contacts, age assurance, abuse throttling/CAPTCHA, staffed moderation and appeals, native-device testing, and operational monitoring. Billing remains disabled.
