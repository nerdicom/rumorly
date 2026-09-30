# Rumorly

**Heard something? Pull up a seat.**

An Expo + React Native mobile app for following the conversation and the context behind it. This repository contains the first interactive **local demo**, not a live public rumor service.

## What works

- Adult-preview acknowledgment and community guidelines.
- Feed with topic filters and hot/latest sorting; text search.
- Heat up / cool down: one changeable vote, never a truth score.
- Story details with a chronological update timeline.
- Follow/unfollow stories and a following feed.
- New story and context forms with validation and pending local submissions.
- Report/hide stories, block/unblock authors, and free correction paths.
- Profile editing, local device persistence, and a complete demo-data reset.
- Rumorly Plus concept screen; no purchases or billing.
- Shared iOS, Android, and web components, plus CI checks.

All seed stories, programs, and accounts are fictional. User-entered text is stored only on the device. Reports are **not sent to moderators**. There is no backend, authentication, real-time feed, push service, or subscription integration yet. No secrets or account credentials are required to run the demo.

## Run on your phone

Use Node.js 24 LTS and npm. This project currently targets Expo SDK 57; use a compatible Expo Go app or an Expo development build.

```sh
git clone https://github.com/nerdicom/rumorly.git
cd rumorly
npm ci
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

`export` compiles JavaScript/assets for Android, iOS, and web. It does not produce signed App Store or Play Store binaries. Unit tests cover voting integrity, visibility controls, submission status, persistence decoding, and input validation. GitHub Actions repeats these checks.

## Build a preview binary later

An `eas.json` with internal-preview and production profiles is included. After choosing an Expo account, verify the provisional app identifiers in `app.json`, run `npx eas-cli@latest login`, then `npx eas-cli@latest build:configure`. The Expo project ID and signing credentials must be established before builds. Do not submit this demo to app stores as a finished service.

## Project map

```text
src/app/          Expo Router screens and navigation
src/components/   Shared visual components
src/data/         Clearly fictional preview stories
src/domain/       Types, vote rules, validation, persistence decoding
src/store/        Local app state and AsyncStorage
tests/           Behavioral unit tests
docs/PRODUCT.md  Durable decisions and monetization hypotheses
docs/ROADMAP.md  Path from demo to private beta
```

## Product memory

Read [PRODUCT.md](docs/PRODUCT.md) before changing the app direction. Paid perks never affect vote weight or story truth status. The $4.99/month Plus price is a hypothesis, not an active offer.

This is original Rumorly application code. All rights reserved; public repository visibility does not grant an open-source license.
