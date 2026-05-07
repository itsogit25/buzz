# Android native notes

After creating the React Native CLI app, check these files.

## Image permissions

For Android 13+, add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
```

For older Android versions, add:

```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
```

## Splash screen

Install dependencies first, then generate assets:

```bash
npx react-native-bootsplash generate ./src/assets/logo.png --platforms=android,ios --background=111827 --logo-width=120 --assets-output=assets/bootsplash
```

If needed, update `MainActivity.kt` according to the `react-native-bootsplash` README for bare React Native.
