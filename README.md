# Rumorly

**Heard something? Pull up a seat.**

An Expo + React Native mobile app for following the conversation and the context behind it. This repository contains an interactive fictional demo and a Supabase account/community integration for early testing. It is not a launched public service.

<img src="docs/previews/feed.png" alt="Rumorly mobile feed preview" width="390" />

## What works

- Adult-preview acknowledgment and community guidelines.
- Feed with topic filters and hot/latest sorting; text search.
- Heat up / cool down: one changeable vote, never a truth score.
- Story details with a chronological update timeline.
- Follow/unfollow stories and a following feed.
- New story and context forms with validation and pending submissions.
- Email-code signup/sign-in, account-scoped data, session restoration, and sign-out.
- Supabase-backed votes, follows, profiles, reports, blocks, and an operator review queue after database setup.
- Report/hide stories, block/unblock authors, and free correction paths.
- Profile editing, local device persistence, and a complete demo-data reset.
- Rumorly Plus concept screen; no purchases or billing.
- Shared iOS, Android, and web components, plus CI checks.

All demo stories, programs, and accounts are fictional. Guest actions stay on the device. Signed-in actions use Supabase; stories/context stay pending until approved, and reports enter a private database queue. The database migration is deployed. Email delivery/templates must be configured before account testing; see [SUPABASE.md](docs/SUPABASE.md) for the verified setup status and exact steps. No billing or push service is active.

## Run on your phone

Use Node.js 24 LTS and npm. This project currently targets Expo SDK 57; use a compatible Expo Go app or an Expo development build.

```sh
git clone https://github.com/nerdicom/rumorly.git
cd rumorly
npm ci
cp .env.example .env
npm start
```

Open Expo Go and scan the terminal QR code. Keep your phone and computer on the same network. On iPhone, scan with the Camera app. Press `w` for the web preview, or run `npm run web` separately. The Expo documentation explains device setup: https://docs.expo.dev/get-started/set-up-your-environment/

For an Android emulator, use `npm run android`. For a locally installed iOS simulator on macOS, use `npm run ios`. A native simulator or physical device still needs to be tested before distribution.

## Quality checks

```sh
npm run typecheck
npm run lint
npm test
npm run export
```

`export` compiles JavaScript/assets for Android, iOS, and web. It does not produce signed App Store or Play Store binaries. Tests cover voting integrity, visibility controls, persistence and input validation, plus actual PostgreSQL grants, row-level security, and moderation permissions using PGlite. GitHub Actions repeats these checks.

See [VALIDATION.md](docs/VALIDATION.md) for the initial validation results and remaining native-device checks.

## Build a preview binary later

`app.json` points to the existing Expo project `@nerdicom/rumorly`, ID `ac6cf278-9e81-448b-987a-b4bf117d6dea`, copied from the owner's Expo project details. The dashboard shows the GitHub repository linked. `eas.json` includes internal-preview and production profiles with explicit platform build images for GitHub builds.

No signed native build has run yet. Verify the provisional app identifiers in `app.json`, sign in with `npx eas-cli@latest login`, and configure signing credentials for the intended platform. Expo's [GitHub build guide](https://docs.expo.dev/build/building-from-github/) requires a successful CLI build for each platform before subsequent GitHub builds. For example, `npx eas-cli@latest build --platform android --profile preview` creates an installable Android preview after signing setup. Configure the public Supabase variables in EAS before account testing; email sign-in remains gated until SMTP/templates and delivery are verified. Do not submit this demo to app stores as a finished service.

## Project map

```text
src/app/          Expo Router screens and navigation
src/components/   Shared visual components
src/data/         Clearly fictional preview stories
src/domain/       Types, vote rules, validation, persistence decoding
src/store/        Authentication, account store, and independent local demo
src/lib/          Supabase client, server data access, error handling
supabase/         Database migration, review queries, email template
tests/           Behavioral unit tests
docs/PRODUCT.md  Durable decisions and monetization hypotheses
docs/ROADMAP.md  Path from demo to private beta
```

## Product memory

Read [PRODUCT.md](docs/PRODUCT.md) before changing the app direction. Paid perks never affect vote weight or story truth status. The $4.99/month Plus price is a hypothesis, not an active offer.

This is original Rumorly application code. All rights reserved; public repository visibility does not grant an open-source license.
