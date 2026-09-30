# Rumorly — product decisions

Recorded September 29, 2026. This file is the durable project memory for future work.

## Direction

Rumorly is a mobile social app for sharing and discussing entertainment rumors, adding context, and following how stories develop. The working name is **Rumorly**; the proposed domain is **rumorly.app**. Domain registration and trademark clearance have not been verified.

The core loop is: discover a story, react, contribute context, follow it, and return for a meaningful update. The differentiator is the evolving story timeline, from initial speculation to response and outcome.

## Agreed starting principles

- Heat it up / Cool it down measures interest. One account gets one changeable vote per story.
- Popularity never establishes truth. Keep attention scores separate from editorial status and supporting sources.
- Follow the tea tracks story developments. Real push notifications come after the backend.
- Earned recognition should reward helpful, supported contributions. Subscriber status must never imply credibility.
- Paid subscriptions do not multiply votes, buy rumor promotion, bury corrections, or purchase removal.
- Initial audience: adults discussing public entertainment stories, reality TV, and adult creators. Avoid an unrestricted directory of accusations about private individuals or minors.
- Reporting, blocking, human moderation, and a free way to challenge or correct a post are core requirements for a public launch.

## Monetization hypotheses — not validated

Free: reading, posting, commenting, voting, and following stories.

Rumorly Plus: test approximately $4.99/month for advanced topic alerts/search, saved collections, profile customization, and an ad-free experience when ads exist.

Later: moderated creator channels offering commentary, recaps, and discussions, with a platform revenue share. No payments or real subscriptions are enabled in the starter.

## First development milestone

An Expo / React Native app for iOS and Android, with a web preview of the same components. Local device persistence and clearly fictional seed stories let us test the experience before connecting accounts, a database, moderation services, or billing.

Screens: feed, discover/search, submit a story, following, profile, story timeline, report/context forms, and a Plus preview. New stories and context remain pending in the demo and do not auto-publish. No public user content is transmitted.

## Open decisions

Initial entertainment community; moderator dashboard and auth email delivery; moderator staffing and response targets; legal/support contacts; subscription value validation; store accounts and launch geography.

## Visual identity — September 30, 2026 (Denver)

The user replaced the earlier tie-dye direction completely with a clean color scheme and a persistent light/dark switch. Use soft white and violet for light mode, charcoal and lavender for dark mode, and solid surfaces throughout. Appearance is a free device preference available before and after sign-in; it survives account changes and demo reset. Do not reintroduce rainbow textures. See DESIGN.md for tokens and behavior.

## Source policies checked at project inception

- Apple App Review Guidelines, sections 1.1 and 1.2: https://developer.apple.com/app-store/review/guidelines/
- Google Play user-generated content policy: https://support.google.com/googleplay/android-developer/answer/9876937
- Reddit Premium feature reference: https://support.reddithelp.com/hc/en-us/articles/360043034412-What-is-a-Reddit-Premium-subscription

Recheck policies before store submission. A local prototype does not demonstrate production moderation or app-store approval.

## Account integration — September 29, 2026 (Denver)

Selected Supabase for authentication and Postgres, project `qkdznbbecplknjopgpax`. The Expo app uses passwordless email codes and `EXPO_PUBLIC_` configuration. The migration enforces equal votes and keeps posts/context pending until an operator review. Guest/demo data stays separate from signed-in accounts. No paid influence, payments, or automatic publication were added. See `SUPABASE.md` for deployment status; preparation is not evidence that the hosted database has been migrated.

The database was deployed and checked on September 29, 2026 (Denver). Supabase requires custom SMTP before code templates can be edited on this new free project. Email sign-in remains gated until a provider and templates are configured; the demo continues to work.
