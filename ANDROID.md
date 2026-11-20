# Maikal Courses for Android

Android 8.0 or later. Install the signed APK from `downloads/maikal-courses-1.0.0.apk`. Android will ask you to allow installation from the browser or file manager you use.

The original bookshelf website remains available. The new game interface is also available at `/game/`; Android adds the launcher widget, native notifications, vibration, file backups, and PDF certificate export.

## Learning

Eight illustrated course worlds contain 10,681 small stages and 40,898 reading cards. Learning stages preserve all source text supplied to the existing course reader, in source order, including supplied appendices. Summary, definition, and interview trails are separate selectable stages. Full source readings retain definitions embedded in explanations; the dedicated definition trail contains the extracted keyword lists and companion glossary terms.

Each reading card contains at most 60 words. Short question checkpoints give feedback and explanations. Five hearts regenerate sequentially every 30 minutes, including while the app is closed. Reading and notes remain available with no hearts. Reviewing a completed stage can maintain a daily streak without duplicating course completion.

Source text and learning data are bundled offline. Original scanned illustrations are fetched on demand and require Internet access. Historical source editions and companion explanations remain identified in the reader. Source text extraction can retain printed line breaks and imperfect table formatting; original page images remain available for comparison.

## Local progress and reminders

No account is required. Progress, highlights, Markdown quick notes, settings, and certificates stay on the device. Export a backup from Settings before uninstalling or moving devices; Android cloud backup is disabled. Backups contain your notes and progress, so keep them somewhere private.

Reminders are opt-in. Choose three or four daily times in Settings and allow notifications. Reminders concern started, unfinished courses and stop for the day once the daily goal is met. Android may delay reminders to conserve battery; these use inexact alarms and do not request exact-alarm access.

## Streak widget

Choose **2 × 1 horizontal** or **1 × 2 vertical** in Settings or the launcher's widget picker. Each widget is a tiny pastel world with clouds, hills, a winding path, full-body Miko, one fire symbol, and a single streak number. There is no button or extra visible label; tap anywhere to open the app.

Miko plays with a ball after a lesson, sleeps against a night sky after studying at night, becomes worried after 6 PM and urgent after 10 PM when a streak has no completed session that day, and gets cartoon X eyes when a previous streak breaks. A new session revives Miko. These are illustrated state changes rather than continuous widget animation. Updates follow Android's widget scheduling and refresh when learning progress or the time zone changes.

Launchers control actual cell dimensions. If an earlier widget was added at a different size, remove that widget and add it again to receive the new default footprint.

## Certificates and branding

Completing every stage in a course unlocks its certificate. Enter a name and choose where to save the PDF. Certificates use the original Maikal Courses fox-and-book logo in `assets/branding/`. They record self-paced completion; they are not an accredited qualification.

## Build

Requirements: Node.js, JDK 17, Android SDK platform 36 and build tools, Python 3 for initial release-key generation. Point `JAVA_HOME` to JDK 17 and configure the SDK using `ANDROID_HOME` or an ignored `android/local.properties` file.

```sh
node scripts/build-game-data.cjs
node scripts/prepare-android.cjs
node scripts/export-source-audit.cjs
node scripts/test-game.cjs
npm test
python scripts/create-android-signing.py
cd android
./gradlew :app:assembleDebug :app:assembleRelease :app:lintDebug
```

On Windows use `gradlew.bat`. The first Gradle build needs Internet access to download its toolchain dependencies. Release output is `android/app/build/outputs/apk/release/app-release.apk`.

**Preserve `android/signing/` privately.** It contains the release signing key and passwords and is excluded from Git. Future APK updates must use the same key. Do not run key generation on a different computer and expect that new key to update an existing installation.

The app loads bundled content through a restricted HTTPS WebView origin. External HTTPS references open in the browser. Release WebView debugging is disabled. Device storage and notification permission are requested only through the relevant user action.
