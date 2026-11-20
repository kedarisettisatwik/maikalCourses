# Maikal Courses for Android

Android 8.0 or later. Install the signed APK from `downloads/maikal-courses-1.2.0.apk`. Android will ask you to allow installation from the browser or file manager you use. Install it over the previous release to keep your local progress and notes.

The original bookshelf website remains available. The new game interface is also available at `/game/`; Android adds the launcher widget, native notifications, vibration, file backups, and PDF certificate export.

## Learning

Eight illustrated course worlds contain 10,685 stages and 40,890 reading cards. Every course now has one continuous path through its chapters, separated by section gates. The world no longer starts with a chapter picklist. Only nearby nodes and road segments are rendered, so long books do not require thousands of simultaneous buttons. Background particles match the world and respect reduced-motion preferences.

Original source text and supplied appendices remain intact. The first detailed local content batch replaces OOPS Unit 1 with 25 authored teaching levels, examples, concept diagrams, and scenario checks, and paraphrases the supplied OOPS keyword definitions. The exhaustive rewrite of every textbook point is **not complete**; see [the exact content status](CONTENT_REWRITE.md). Unreviewed material retains its complete source learning coverage rather than being replaced by short summaries.

Short cards contain at most 90 words, with most source cards retaining the earlier 60-word limit. Checkpoints follow a few information cards. Five hearts regenerate sequentially every 30 minutes, including while the app is closed. Reading and notes remain available with no hearts. Reviewing a completed stage can maintain a daily streak without duplicating course completion.

Source text and learning data are bundled offline. Worlds have original illustrated environments and a curved road whose coordinates match the lesson nodes. Stages use topic names, and each lesson starts with its learning goals. Page references are not used as learning-card headings. Completed stage IDs remain compatible with version 1.0; an unfinished lesson restarts at its new preview.

The book reader uses Mozilla PDF.js to show the original PDF layout, fonts, tables, diagrams, and illustrations. Swipe horizontally through snapping pages, and pinch with two fingers to zoom within a page. When enlarged, pan within the page; at its horizontal edge, a further swipe can turn the page. Page and zoom buttons remain available as alternatives. Pages support text selection, Copy, Add to quick notes, and Highlight. Zoom stays inside the reader, and highlights remain aligned because their rectangles use normalized page coordinates.

On Android, the first open downloads the selected original PDF to private app storage; subsequent opens work offline. A failed download leaves no incomplete book in the cache. Downloaded files are removed when the app is uninstalled. In the web preview, original PDFs load from the existing website. Text inside an image follows normal PDF behavior and cannot be selected unless the source supplies a text layer. Historical source editions remain unchanged in these original books.

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
npm ci
node scripts/build-world-art.cjs
node scripts/prepare-pdf-reader.cjs
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
