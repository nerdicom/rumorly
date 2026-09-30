# Violet, light and dark

The user asked to replace tie-dye completely on September 30, 2026 (Denver). The current design uses solid surfaces, violet accents, generous spacing, and the existing editorial type hierarchy. The old textile, decorative component, and tie-dye preview are removed from the current source tree.

| Role | Light | Dark |
| --- | --- | --- |
| Page | `#F6F5FA` | `#111118` |
| Cards and fields | `#FFFFFF` | `#1C1B27` |
| Primary text | `#252135` | `#F4F0FF` |
| Supporting text | `#696377` | `#B2ABBF` |
| Violet accent | `#6842D6` | `#BCA2FF` |
| Feature panels | `#EEE8FC` | `#272033` |

Shared tokens cover cards, buttons, badges, avatars, voting states, input text/placeholders, tab navigation, loading surfaces, notices, and safe-area backgrounds. Button text has its own contrast token rather than reusing the card background color. Success and cool-down colors have separate dark variants.

## Appearance switch

A native light/dark switch appears in the feed header, onboarding and sign-in headers, and **You → Appearance**. It has the accessible name **Dark mode**, an on/off state, and a description of its effect. This is a free app setting.

On first launch the app starts with the device's current color scheme. After a user makes a choice, AsyncStorage saves only `light` or `dark` under `rumorly:appearance:v1`. It is independent of account and demo storage and survives sign-out and demo reset. Writes are serialized so rapid toggles cannot restore an older selection. A storage failure leaves the switch usable and shows an honest save/load notice.

The provider waits for the preference to load before the main UI is presented. Toggling updates the same component tree, preserving drafts and navigation. Native appearance, status-bar text, the web color scheme, and the root background follow the selected mode.

`userInterfaceStyle` is `automatic`; the Expo SDK 57-compatible `expo-system-ui` package supports native root backgrounds and Android appearance configuration. Config plugins supply light/dark launch backgrounds for future native builds. A launch screen follows the system before JavaScript restores the app preference. Native-build configuration still needs device verification; the immediate preview uses Expo Go.

## Current references

- Expo SDK 57: https://docs.expo.dev/versions/v57.0.0/
- Expo appearance configuration: https://docs.expo.dev/develop/user-interface/color-themes/
- Expo SystemUI: https://docs.expo.dev/versions/v57.0.0/sdk/system-ui/
- Expo status bar: https://docs.expo.dev/versions/v57.0.0/sdk/status-bar/
- React Native 0.86 appearance: https://reactnative.dev/docs/0.86/appearance
- React Native switch: https://reactnative.dev/docs/switch
