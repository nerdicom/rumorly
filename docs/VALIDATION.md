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
- Production auth/database/moderation/billing integration testing: those services are not connected.
- Full external Expo Doctor network checks; SDK package versions were resolved using Expo’s bundled compatibility information, and dependency installation/typechecking/platform exports succeeded.

GitHub Actions is configured to rerun the core checks; these recorded results describe local verification, not an assertion that a hosted workflow has finished.
