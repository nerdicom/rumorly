# Starter validation

The initial preview was checked in the development environment on September 30, 2026 (UTC).

Passed:

- TypeScript strict typecheck.
- Expo ESLint configuration, with no lint errors or warnings.
- Ten behavioral unit tests (`npm test`).
- Expo production JavaScript/asset exports for iOS, Android, and web.
- Headless Chromium interaction checks using the exported web version at 390 x 844: adult-preview acknowledgment, voting toggle/switch, following after page reload, story timeline, pending context, pending story submission, profile display, report-and-hide, block/unblock, search empty/matching results, and disabled purchases in the Plus preview.
- No browser runtime errors during those interactions.
- No page-level horizontal overflow at 320px width.
- Visual review of the onboarding, feed, and story-detail screenshots.

The screenshot in `previews/feed.png` is an actual browser rendering of the shared React Native UI with fictional content, not an image mockup.

Not performed:

- Signed native builds, iPhone/Android physical-device or emulator execution, native screen-reader checks, TestFlight, or Play Store submission.
- Hosted Supabase schema deployment, actual email delivery, and native account-flow testing. See the account-integration checks below. Billing remains disabled.
- Full external Expo Doctor network checks; SDK package versions were resolved using Expo’s bundled compatibility information, and dependency installation/typechecking/platform exports succeeded.

GitHub Actions is configured to rerun the core checks; these recorded results describe local verification, not an assertion that a hosted workflow has finished.

## Supabase account integration — September 30, 2026 UTC

Passed in this development environment:

- TypeScript strict typecheck and Expo lint, with no reported errors/warnings.
- 20 reported test results: the original 10 state/input tests, a PostgreSQL integration parent test, and its 9 database behavior tests. PGlite ran the exact migration against PostgreSQL with Supabase-style auth/roles. Checks cover anonymous access, profile ownership, pending privacy, forbidden self-publication, operator review/audit, equal unique votes, private voting histories, context approval, private follows/blocks/reports, report-policy recursion, and removed-story reactions.
- iOS, Android, and web production JavaScript/asset exports with the public Supabase configuration present.
- The existing guest/demo Chromium smoke flows and 320px overflow check still pass.
- A separate 390px Chromium flow using mocked Supabase HTTP responses passed signup acknowledgment, OTP errors and resend limits, session restoration, account votes/follows, pending story/context writes, name changes, report/hide, block/unblock, and sign-out isolation.
- Injected permission errors preserved unsent form input and did not display success. An absent database produced a visible setup error rather than fabricated feed data.
- No browser runtime errors in those flows. Account-code and feed screenshots were visually reviewed.
- Read-only hosted requests confirmed a valid project/publishable key and enabled email authentication. The story table was absent at verification.

The browser auth tests sent **no real email** and performed **no hosted writes**. Local SQL tests are not a substitute for checking the actual Supabase migration, grants, email template/delivery, and two real authenticated test accounts after deployment. The migration and email template were prepared but not deployed in this session; the installed plugin's SQL actions were not exposed to the running session.
