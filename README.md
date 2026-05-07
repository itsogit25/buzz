# MusclesBuzz

Production-style starter for a React Native CLI fitness tracker using:

- Frontend: React Native CLI
- Backend: Node.js + Express
- Auth: Supabase Auth
- Database: Supabase PostgreSQL
- File storage: Supabase Storage
- Splash screen: react-native-bootsplash

## Structure

```txt
musclesbuzz/
├── mobile/      # React Native app code
├── backend/     # Express API
└── supabase/    # PostgreSQL schema
```

## 1. Create Supabase project

1. Create a Supabase project.
2. Open SQL Editor.
3. Run `supabase/schema.sql`.
4. Create a Storage bucket named `body-photos`.

For production, keep the Supabase service-role key only on the backend. Never put it inside the mobile app.

## 2. Backend setup

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Fill `.env`:

```env
PORT=4000
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_STORAGE_BUCKET=body-photos
```

Health check:

```bash
curl http://localhost:4000/health
```

For Android emulator, your mobile app should call your local backend using:

```txt
http://10.0.2.2:4000/api
```

## 3. Mobile setup

Create a React Native CLI project first:

```bash
npx @react-native-community/cli@latest init MusclesBuzz
cd MusclesBuzz
```

Copy all files from this repo's `mobile/` folder into your React Native project root.

Install dependencies:

```bash
npm install
```

Android permissions are included in the generated Android project only after you create it. Add the image permissions shown in `mobile/ANDROID_NATIVE_NOTES.md` if needed.

Create `.env` in the mobile project root:

```env
API_BASE_URL=http://10.0.2.2:4000/api
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Run Android:

```bash
npm start
npm run android
```

## 4. Splash screen

The app includes `react-native-bootsplash` usage. After installing dependencies, generate native splash assets:

```bash
npx react-native-bootsplash generate ./src/assets/logo.png --platforms=android,ios --background=111827 --logo-width=120 --assets-output=assets/bootsplash
```

Then follow `react-native-bootsplash` native Android setup notes if your generated project does not auto-link fully.

## 5. Main features included

- Signup / login using Supabase Auth
- Bearer-token API calls to Express backend
- Food list CRUD
- Daily food intake with automatic macro calculation
- Exercise list CRUD
- Workout logging with sets/reps/weight, running, and walking fields
- Daily status: macros, calories burned, net calories, body weight, photos
- Body photo upload to backend, stored in Supabase Storage
- Graph data endpoint and mobile graph screen
- Side drawer: profile, notes, settings, logout, delete account placeholder

