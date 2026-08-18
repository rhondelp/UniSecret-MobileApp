# 📱 UniSecret Mobile App

**Universities' Freedom Confession Board — Mobile Client**

The mobile client for UniSecret, built with **Expo** and **React Native**. Students authenticate with their university email and browse/submit anonymous confessions scoped to their university.

![Expo](https://img.shields.io/badge/Expo-~54.0-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Expo Router](https://img.shields.io/badge/Routing-Expo%20Router-000020?logo=expo&logoColor=white)
![Status](https://img.shields.io/badge/status-in--development-yellow)

> **Companion repo:** [UniSecret-API](https://github.com/rhondelp/UniSecret-API) — the ASP.NET Core / PostgreSQL backend this app talks to.

---

## 📖 Overview

UniSecret lets students post and browse anonymous confessions scoped to their university, comment on threads, like posts, and save favorites. This repo is the Expo/React Native client — auth screens, the confession feed, and navigation shell that talk to the UniSecret API.

## 🧱 Tech Stack & Key Packages

**Core**

| Package | Version | Purpose |
| --- | --- | --- |
| `expo` | ~54.0.35 | Managed React Native tooling/runtime |
| `expo-router` | ~6.0.24 | File-based routing (drives the `app/` directory) |
| `react` | 19.1.0 | UI library |
| `react-dom` | 19.1.0 | Web rendering target for Expo web |
| `react-native` | 0.81.5 | Native runtime |
| `react-native-web` | ~0.21.0 | Web support for Expo |

**Navigation**

| Package | Version |
| --- | --- |
| `@react-navigation/native` | ^7.3.16 |
| `@react-navigation/native-stack` | ^7.18.8 |
| `@react-navigation/bottom-tabs` | ^7.18.16 |
| `@react-navigation/elements` | ^2.6.3 |

**Storage & Auth**

| Package | Version | Purpose |
| --- | --- | --- |
| `@react-native-async-storage/async-storage` | 2.2.0 | Stores the JWT after login |
| `expo-secure-store` | ~15.0.8 | Installed for secure credential storage, not yet used in the API client |

**UI / Platform**

| Package | Version |
| --- | --- |
| `@expo/vector-icons` | ^15.0.3 |
| `expo-constants` | ~18.0.13 |
| `expo-font` | ~14.0.12 |
| `expo-haptics` | ~15.0.8 |
| `expo-image` | ~3.0.11 |
| `expo-linking` | ~8.0.12 |
| `expo-splash-screen` | ~31.0.13 |
| `expo-status-bar` | ~3.0.9 |
| `expo-symbols` | ~1.0.8 |
| `expo-system-ui` | ~6.0.9 |
| `expo-web-browser` | ~15.0.11 |
| `react-native-gesture-handler` | ~2.28.0 |
| `react-native-reanimated` | ~4.1.1 |
| `react-native-worklets` | 0.5.1 |
| `react-native-safe-area-context` | ~5.6.0 |
| `react-native-screens` | ~4.16.0 |

**Dev dependencies**

| Package | Version |
| --- | --- |
| `typescript` | ~5.9.2 |
| `eslint` | ^9.25.0 |
| `eslint-config-expo` | ~10.0.0 |
| `@types/react` | ~19.1.0 |

> **Experiments enabled** (`app.json`): `typedRoutes` and `reactCompiler` are both turned on.

## 📁 Project Structure

```
UniSecret-MobileApp/
├── app/                        # expo-router file-based routes
│   ├── (auth)/
│   │   ├── login.tsx           # Login screen (implemented)
│   │   ├── register.tsx        # Registration screen (implemented)
│   │   └── _layout.tsx
│   ├── (tabs)/
│   │   ├── index.tsx           # Welcome/home screen — pings the API on load
│   │   ├── explore.tsx         # Implemented
│   │   ├── create.tsx          # Stub (empty)
│   │   ├── notifications.tsx   # Stub (empty)
│   │   ├── profile.tsx         # Stub (empty)
│   │   ├── search.tsx          # Stub (empty)
│   │   └── _layout.tsx
│   ├── _layout.tsx
│   └── modal.tsx
├── src/api/
│   ├── api.ts                  # Shared fetch wrapper (adds JWT header, logs requests)
│   ├── authApi.ts              # login/register calls
│   └── confessionApi.ts        # Stub (empty)
├── context/
│   └── AuthContext.tsx         # Stub (empty) — no global auth state yet
├── components/                 # Themed UI primitives (ThemedText, ThemedView, HapticTab, etc.)
├── constants/theme.ts
├── hooks/                      # use-color-scheme, use-theme-color
├── assets/images/
├── app.json
└── package.json
```

## 🔌 How It Talks to the API

`src/api/api.ts` exports a single `apiRequest()` helper used by every API call:

- Reads a JWT from `AsyncStorage` (key: `"token"`) and attaches it as `Authorization: Bearer <token>` when present.
- Hits a **hardcoded base URL**:

  ```ts
  const API_URL = "http://192.168.8.112:5277/api/v1";
  ```

  This points at a specific developer machine's local IP and the ASP.NET dev server's HTTP port. **You will need to change this** to your own machine's LAN IP (or a tunneled/deployed URL) for the app to reach the API from a physical device or the API repo's own dev server. It should eventually move into an environment variable (e.g. via `expo-constants` / `.env` + `app.config.ts`) instead of being hardcoded.
- Logs every request/response to the console, including errors — useful for now, but should be stripped or gated behind `__DEV__` before a release build.

`src/api/authApi.ts` wraps `POST /Auth/login` and `POST /Auth/register`.

`src/api/confessionApi.ts` exists as a **placeholder file** — no confession-related API calls (list/create) are implemented on the client yet, even though the backend already exposes `GET`/`POST /api/v1/confessions`.

## 🚀 Getting Started

### Prerequisites

- Node.js LTS
- npm (repo ships a `package-lock.json`)
- Expo Go app (for quick device testing) or an Android/iOS simulator
- The [UniSecret-API](https://github.com/rhondelp/UniSecret-API) running locally or remotely, reachable from your device/simulator

### Setup

```bash
git clone https://github.com/rhondelp/UniSecret-MobileApp.git
cd UniSecret-MobileApp

npm install

# Update the API base URL for your environment
# → edit src/api/api.ts, API_URL constant

npx expo start
```

From the Expo CLI output you can launch into a development build, Android emulator, iOS simulator, or Expo Go.

### Available Scripts

| Script | Command | Description |
| --- | --- | --- |
| `npm run android` | `expo start --android` | Launch on Android emulator/device |
| `npm run ios` | `expo start --ios` | Launch on iOS simulator/device |
| `npm run web` | `expo start --web` | Launch in the browser |
| `npm run lint` | `expo lint` | Run ESLint |
| `npm run reset-project` | — | Moves starter code to `app-example/` and gives a blank `app/` |

### Repo-Specific Agent Notes

The repo includes an `AGENTS.md` (aliased by `CLAUDE.md`) flagging that **Expo has changed recently** and instructing contributors/AI agents to check the versioned docs at [docs.expo.dev/versions/v54.0.0](https://docs.expo.dev/versions/v54.0.0/) before writing code — worth knowing since the app targets a fairly new Expo SDK (54) where APIs may differ from older tutorials/training data.

## 🖥️ Current Screen Status

| Screen | Status |
| --- | --- |
| `(auth)/login.tsx` | ✅ Implemented — calls `loginUser`, stores JWT in `AsyncStorage` |
| `(auth)/register.tsx` | ✅ Implemented |
| `(tabs)/index.tsx` | ✅ Implemented — welcome screen that pings `GET /Universities` to show API connectivity status |
| `(tabs)/explore.tsx` | ✅ Implemented |
| `(tabs)/create.tsx` | ⬜ Empty stub |
| `(tabs)/notifications.tsx` | ⬜ Empty stub |
| `(tabs)/profile.tsx` | ⬜ Empty stub |
| `(tabs)/search.tsx` | ⬜ Empty stub |
| `context/AuthContext.tsx` | ⬜ Empty stub — auth state is currently read directly from `AsyncStorage` per-screen rather than via context |

## 🛣️ Roadmap

- [ ] **Global auth context** — fill in `context/AuthContext.tsx` so login state, current user, and token aren't re-read from `AsyncStorage` ad hoc in every screen
- [ ] **Confession feed & composer** — implement `src/api/confessionApi.ts` (`GET`/`POST /confessions`) and wire it into a feed screen, plus build out `(tabs)/create.tsx`
- [ ] **Search** — implement `(tabs)/search.tsx` once the API exposes search/filter endpoints
- [ ] **Notifications** — implement `(tabs)/notifications.tsx` against the backend's `Notification` entity
- [ ] **Profile** — implement `(tabs)/profile.tsx` (view/edit profile, saved posts, logout)
- [ ] **Comments & likes UI** — add threaded comment views and like buttons now that the backend supports them
- [ ] **Configurable API base URL** — replace the hardcoded LAN IP in `src/api/api.ts` with an environment-driven config (`app.config.ts` + `.env`, or `expo-constants`)
- [ ] **Use `expo-secure-store` for the JWT** — already a dependency, but the token currently lives in `AsyncStorage`, which is unencrypted at rest
- [ ] **Strip/gate debug logging** — `api.ts` logs every request/response (including error bodies); wrap in `if (__DEV__)` or remove before shipping
- [ ] **Push notifications** — natural pairing with the backend's `Notification` entity once exposed
- [ ] **Automated tests** — no test setup currently exists

## 🔗 Related Repository

- [UniSecret-API](https://github.com/rhondelp/UniSecret-API) — ASP.NET Core / PostgreSQL backend this app talks to

## 📄 License

No license file is currently included in this repository.