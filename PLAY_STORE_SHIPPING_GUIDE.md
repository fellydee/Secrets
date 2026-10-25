# Google Play Store Shipping Guide for SecretLogs

This document provides complete instructions to package, sign, and publish **SecretLogs** on the Google Play Store using **Trusted Web Activity (TWA)** / Android App Bundle (`.aab`).

---

## 1. Application Metadata & Identifiers

| Field | Value |
|---|---|
| **App Name** | SecretLogs - Diary & Notes |
| **Short Description** | Account-free private diary with biometric lock and secure exports. |
| **Package ID / App ID** | `com.secretlogs.diary` |
| **Version Name** | `1.0.0` |
| **Version Code** | `1` |
| **Target SDK** | `35` (Android 15) |
| **Minimum SDK** | `21` (Android 5.0 Lollipop) |
| **Category** | Lifestyle / Productivity |
| **Content Rating** | PEGI 3 / Everyone (All ages) |
| **Developer Contact** | `fellydeez@gmail.com` |

---

## 2. Store Assets Included

The repository has all Google Play Store graphic requirements ready in `/public`:

1. **App Icon (512x512 PNG, <= 1024 KB, 32-bit color)**
   - Location: `/public/pwa-512x512.png`
   - Purpose: Google Play Store product page and launcher icon.
2. **Android Maskable Icon (512x512 PNG with safe-zone margin)**
   - Location: `/public/pwa-maskable-512x512.png`
   - Purpose: Android adaptive icon system (circular, squircle, teardrop).
3. **Feature Graphic (1024x500 PNG, <= 15MB)**
   - Location: `/public/play-feature-graphic.png`
   - Purpose: Hero banner on the Play Store listing.
4. **Digital Asset Links**
   - Location: `/public/.well-known/assetlinks.json`
   - Purpose: Verifies domain ownership so the app runs full-screen without Chrome browser URL bars.

---

## 3. Fast Packaging via PWABuilder (Recommended · No Android Studio Required)

1. Open [PWABuilder.com](https://www.pwabuilder.com/).
2. Enter your deployed app URL (or custom domain).
3. Click **Start** to run the PWA validation check. All manifest, service worker, and icon tests will pass.
4. Click **Package for Stores** -> Select **Google Play (Android)**.
5. In the Android settings popup:
   - **Package ID**: `com.secretlogs.diary`
   - **App name**: `SecretLogs`
   - **Launcher name**: `SecretLogs`
   - **Display Mode**: `Standalone`
   - **Theme color**: `#E83375`
   - **Navigation bar color**: `#0E0E11`
6. Click **Generate Package**.
7. Download the `.zip` archive containing your production signed `.aab` file (`asset-bundle.aab`).

---

## 4. Alternative Packaging via Google Bubblewrap CLI

If you prefer building from your terminal:

```bash
# 1. Install Bubblewrap CLI
npm install -g @bubblewrap/cli

# 2. Initialize from manifest
bubblewrap init --manifest="https://<YOUR-APP-URL>/manifest.json"

# 3. Build production Android App Bundle
bubblewrap build
```

This generates `app-release-bundle.aab` in your current directory.

---

## 5. Digital Asset Links Configuration

When your app runs as a Trusted Web Activity (TWA), Android verifies `https://<YOUR-APP-URL>/.well-known/assetlinks.json` to prove domain ownership.

1. In the **Google Play Console**, go to **Release** > **Setup** > **App Integrity**.
2. Locate the **App signing key certificate** section.
3. Copy the **SHA-256 fingerprint** (e.g. `14:6D:E9:...`).
4. Paste this fingerprint into `/public/.well-known/assetlinks.json`:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.secretlogs.diary",
      "sha256_cert_fingerprints": [
        "YOUR_SHA256_FINGERPRINT_HERE"
      ]
    }
  }
]
```

5. Deploy your updated code. Your app will now launch without any browser address bar.

---

## 6. Google Play Console Data Safety Questionnaire Answers

Google Play requires completing the **Data Safety** form. Use these exact answers based on SecretLogs' architecture:

- **Does your app collect or share any user data?**  
  👉 **No** (All entries, audio, photos, and encryption keys are stored locally on the device in IndexedDB).
- **Location**:  
  👉 Only accessed on-device when explicitly triggered by the user to stamp a journal entry. Never collected or transmitted to remote servers.
- **Biometrics**:  
  👉 Managed strictly via Android BiometricPrompt hardware security module. Never accessed or collected.
- **Is user data encrypted in transit?**  
  👉 Yes (HTTPS / zero remote data).
- **Can users request data deletion?**  
  👉 Yes, users can tap "Erase all data" directly in Settings to permanently wipe all local storage.

---

## 7. Privacy Policy URL

Google Play requires a public Privacy Policy URL:
- Built-in Privacy Policy is viewable directly in SecretLogs under **Settings** > **Privacy Policy & Data Safety**.
- You can host the privacy policy text provided in `src/components/PrivacyPolicyModal.tsx` on GitHub Pages, Notion, or your custom domain, and paste the URL into your Play Console store listing.
