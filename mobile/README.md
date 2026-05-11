# Morning Briefing — Mobile App

Samsung mobile dashboard built with **Expo + React Native**.

Connects to: Weather (Rajec, SK) · Spotify · Gmail · Google Calendar · Notion · News  
Fitness Coach: 10km training plan → **June 13, 2026**

---

## Quick Start

### 1. Install dependencies

```bash
cd mobile
npm install
```

### 2. Set your Vercel URL

Open `src/config.ts` and set `API_BASE` to your actual deployment:

```ts
export const API_BASE = 'https://morning-briefing.vercel.app'; // ← your URL
```

To find your URL: run `npx vercel ls` in the project root,
or check your [Vercel dashboard](https://vercel.com/dashboard).

### 3. Run on your Samsung

```bash
# Start dev server
npm start

# Then press 'a' to open Android, or scan QR in Expo Go app
npm run android
```

---

## Build APK (for Samsung sideload)

### Prerequisites

```bash
npm install -g eas-cli
eas login          # uses your Expo account
```

### Update app.json

Set your EAS project ID in `app.json`:
```json
"extra": {
  "eas": { "projectId": "YOUR_EAS_PROJECT_ID" }
}
```

Get project ID from: [expo.dev/accounts/YOUR_USERNAME/projects](https://expo.dev)

Or initialize with: `eas init --id YOUR_PROJECT_ID`

### Build APK

```bash
cd mobile

# Preview APK (sideload on Samsung)
npm run build:apk

# Production AAB (for Play Store)
npm run build:aab
```

The APK will be downloadable from [expo.dev](https://expo.dev) builds.  
Install on Samsung: Settings → Install unknown apps → allow your file manager.

---

## Project Structure

```
mobile/
├── App.tsx                    # Entry point
├── app.json                   # Expo config
├── eas.json                   # EAS Build profiles
├── src/
│   ├── config.ts              # API base URL + race constants
│   ├── theme.ts               # Colors, spacing, typography
│   ├── navigation/
│   │   └── AppNavigator.tsx   # Bottom tab navigation
│   ├── screens/
│   │   ├── HomeScreen.tsx     # Dashboard: weather, workout, calendar, gmail, spotify
│   │   ├── FitnessScreen.tsx  # Full training plan + progress tracking
│   │   ├── MediaScreen.tsx    # Spotify now playing + history
│   │   ├── TasksScreen.tsx    # Notion tasks + Google Calendar
│   │   └── NewsScreen.tsx     # World / AI / Tech news tabs
│   ├── components/
│   │   ├── GlassCard.tsx      # Reusable glassmorphism card
│   │   └── SectionHeader.tsx  # Labeled section header with accent dot
│   ├── hooks/
│   │   └── useApi.ts          # Generic fetch hook with refresh + polling
│   └── utils/
│       └── trainingPlan.ts    # Full 34-day training plan + helper fns
```

---

## API Backend

All data comes from the **existing Vercel functions** in `/api/`:

| Endpoint           | Data                          |
|--------------------|-------------------------------|
| `/api/weather`     | Rajec, SK · hourly + forecast |
| `/api/spotify`     | Now playing + recently played |
| `/api/gmail`       | Unread emails (last 24h)      |
| `/api/calendar`    | Today's Google Calendar events|
| `/api/notion`      | Tasks + Projects databases    |
| `/api/news`        | World / AI / Tech RSS feeds   |

No new API credentials needed — the mobile app reuses your existing Vercel environment variables.

---

## Training Plan: May 10 → June 13

| Week | Focus              | Long Run |
|------|--------------------|----------|
| 1    | Base building      | 5km      |
| 2    | Building           | 6km      |
| 3    | Quality (tempo + intervals) | 8km |
| 4    | Sharpening         | 7km taper|
| 5    | Taper + Race Day   | 🏁 10km  |

**Race day strategy:** Start 10–15s/km slower than goal pace, build from km 5, empty the tank in the final km.
