# MusclesBuzz mobile

React Native CLI app code.

## Create native project

```bash
npx @react-native-community/cli@latest init MusclesBuzz
cd MusclesBuzz
```

Copy this folder's files into the generated project root.

## Install

```bash
npm install
```

Create `.env`:

```env
API_BASE_URL=http://10.0.2.2:4000/api
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

## Run

```bash
npm start
npm run android
```
