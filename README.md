# Auto-Skipper

## Deutsch

Eine Browser-Erweiterung (Manifest V3, reines JavaScript, kein Build-Prozess), die auf Streaming-Plattformen automatisch auf "Intro überspringen", "Recap überspringen", "Outro überspringen" oder "Werbung überspringen" klickt.

### Funktionsweise

- **content.js** wird auf den unterstützten Seiten eingebunden, erkennt Skip-Buttons per seitenspezifischen Selektoren sowie einer sprachübergreifenden Text-Erkennung (Fallback) und klickt sie automatisch an. Ein `MutationObserver` sowie ein Scan-Intervall sorgen dafür, dass auch dynamisch nachgeladene Player-UIs erfasst werden; eine Klick-Cooldown verhindert Doppelklicks.
- **popup.html / popup.js** stellen die Popup-Oberfläche bereit: ein globaler Ein/Aus-Schalter sowie ein Schalter pro Seite, um Auto-Skip einzeln aktivieren oder deaktivieren zu können. Einstellungen werden in `chrome.storage.local` gespeichert und wirken sofort, ohne Neuladen der Seite.
- **manifest.json** legt fest, auf welchen Seiten die Erweiterung aktiv ist.

### Unterstützte Plattformen

Die bekanntesten Webseiten werden unterstützt.

### Installation (Entwicklungsmodus)

1. `chrome://extensions` öffnen.
2. Entwicklermodus aktivieren.
3. "Entpackte Erweiterung laden" wählen und diesen Ordner auswählen.

---

## English

A browser extension (Manifest V3, vanilla JavaScript, no build process) that automatically clicks "skip intro", "skip recap", "skip outro", or "skip ad" buttons on streaming platforms.

### How it works

- **content.js** is injected into the supported pages. It detects skip buttons using site-specific selectors, falling back to a multi-language text pattern match, and clicks them automatically. A `MutationObserver` and a scan interval ensure dynamically re-rendered player UIs are also caught; a click cooldown prevents double-clicks.
- **popup.html / popup.js** provide the popup UI: a global on/off toggle plus a per-site toggle to enable or disable auto-skip individually. Settings are stored in `chrome.storage.local` and take effect immediately, without reloading the page.
- **manifest.json** defines which sites the extension is active on.

### Supported platforms

The mostly know websites are supported

### Installation (development mode)

1. Open `chrome://extensions`.
2. Enable developer mode.
3. Choose "Load unpacked" and select this folder.
