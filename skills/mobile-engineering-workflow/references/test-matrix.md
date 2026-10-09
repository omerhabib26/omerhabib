# Example test matrix

| Requirement | Test boundary | Command |
| --- | --- | --- |
| Duplicate prevention and API errors | Node HTTP integration | npm test |
| Offline reload, loading, and lost response | Chromium mobile viewport | npm run test:ui |
| Currency amount parsing | Android JVM | gradle testDebugUnitTest |
| Compose input, loading, retry, success | Android emulator | gradle connectedDebugAndroidTest |

Run npm commands in the project root and Gradle commands in android/. Android UI tests inject state; they do not test an actual backend connection. Record this limitation.
