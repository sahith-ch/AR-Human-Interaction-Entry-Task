# AR Human Interaction (Entry Task)


![Demo](./screenshot.gif)

![License](https://img.shields.io/badge/license-MIT-green?style=flat-square) ![No dependencies](https://img.shields.io/badge/dependencies-none-blue?style=flat-square) ![Made with](https://img.shields.io/badge/made%20with-vanilla%20JS-yellow?style=flat-square) ![MediaPipe](https://img.shields.io/badge/MediaPipe-Hands-orange?style=flat-square)

Real-time hand gesture recognition in the browser — no backend, no install, no build step. Point your hand at the webcam and watch the chameleon change colour.

---

## Table of Contents

- [Overview](#overview)
- [Demo](#demo)
- [Gestures](#gestures)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Running Locally](#running-locally)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
  - [Landmark Detection](#landmark-detection)
  - [Gesture Classification](#gesture-classification)
  - [Theme Engine](#theme-engine)
- [Configuration](#configuration)
- [Known Limitations](#known-limitations)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

This is an entry task submission built to showcase how hand gestures detected via webcam 
can drive real-time visual changes in the browser — specifically changing the colour of a 
chameleon SVG and the gesture label text on screen.

Each recognised gesture maps to a distinct colour, and the entire UI — the SVG fill, glow, 
and title — updates instantly to reflect it. Built with HTML, CSS, and vanilla JavaScript 
using MediaPipe Hands. No backend, no install, no build step.

**Stack:** HTML · CSS · Vanilla JavaScript · MediaPipe Hands (WASM via CDN)
---

## Demo

> 📸 Add your screenshot or GIF here (`screenshot.gif` in repo root)

---

## Gestures

| Gesture | Emoji | Colour | Trigger Condition |
|---|---|---|---|
| Thumbs Up | 👍 | `#48bb78` Green | Thumb extended, all fingers curled |
| Fist | ✊ | `#e53e3e` Red | All fingers and thumb curled |
| Open Hand | 🖐 | `#38b2ac` Teal | All fingers and thumb extended |
| Peace | ✌️ | `#9f7aea` Purple | Index + middle extended, rest curled |
| Point | ☝️ | `#ed8936` Orange | Index extended, rest curled |
| None | — | `#4a5568` Grey | No hand in frame |

---

## Getting Started

### Prerequisites

- A modern browser — **Chrome or Edge recommended** (best WebAssembly performance)
- A working webcam
- An internet connection on first load (MediaPipe WASM model ~10 MB, cached after that)

> **Note:** The app must be served over HTTP — not opened as a `file://` URL — because browsers block webcam access and cross-origin WASM loading on the file protocol. Most modern browsers however may still allow it depending on your OS permissions.

### Running Locally

**Option 1 — VS Code Live Server** *(easiest)*

Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension, right-click `index.html` → **Open with Live Server**.

**Option 2 — Python**

```bash
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

Visit `http://localhost:8080`

**Option 3 — Node.js**

```bash
npx serve .
```

**Option 4 — Any static host**

Drop the three files (`index.html`, `style.css`, `script.js`) into any static hosting service — GitHub Pages, Netlify, Vercel — and it works out of the box.

Once the page loads:
1. Allow camera access when the browser prompts
2. Wait for MediaPipe to initialise (first load takes a few seconds — WASM model is downloading)
3. Hold your hand up in frame and try a gesture

---

## Project Structure

```
gesture-chameleon/
├── index.html      # App shell — layout, SVG chameleon, video/canvas panels
├── style.css       # Dark theme, CSS custom properties, animations
├── script.js       # MediaPipe setup, gesture classifier, theme engine
└── README.md
```

No build output. No `node_modules`. No bundler config. Three files, open and run.

---

## How It Works

### Landmark Detection

MediaPipe Hands processes each webcam frame and returns **21 3D landmarks** per detected hand, numbered as follows:

```
0  = Wrist
1–4  = Thumb  (CMC → MCP → IP → Tip)
5–8  = Index  (MCP → PIP → DIP → Tip)
9–12 = Middle (MCP → PIP → DIP → Tip)
13–16 = Ring  (MCP → PIP → DIP → Tip)
17–20 = Pinky (MCP → PIP → DIP → Tip)
```

Each landmark has normalised `x`, `y`, `z` coordinates (0–1 relative to the image).

### Gesture Classification

The classifier derives five boolean flags from landmark positions:

```js
const thumb  = lm[4].x  > lm[3].x   // thumb tip past its joint (lateral axis)
const index  = lm[8].y  < lm[6].y   // fingertip above PIP knuckle = extended
const middle = lm[12].y < lm[10].y
const ring   = lm[16].y < lm[14].y
const pinky  = lm[20].y < lm[18].y
```

These five booleans map to gestures via a simple rule table:

```
thumb  index  middle  ring   pinky  →  Gesture
──────────────────────────────────────────────
true   false  false   false  false  →  Thumbs Up
false  false  false   false  false  →  Fist
true   true   true    true   true   →  Open Hand
false  true   true    false  false  →  Peace
false  true   false   false  false  →  Point
(anything else)                     →  Unknown
```

### Theme Engine

When a gesture is detected, `applyTheme(gesture)` runs once per gesture change (guarded by a `currentGesture` check to avoid redundant updates):

1. Resolves the gesture colour from `GESTURE_COLORS`
2. Sets `--current` on `:root` — cascades to all CSS consumers (rings, title glow, confidence bar)
3. Iterates over every `<path>` in the chameleon SVG and sets `fill` directly
4. Injects a `<style>` tag to update the `drop-shadow` filter (CSS variables can't be used inside `filter` directly)
5. Updates the gesture label and emoji in the header
6. Randomises the confidence bar width between 70–98% for visual feedback

---

## Configuration

### Detection sensitivity

In `script.js`:

```js
hands.setOptions({
  maxNumHands: 1,              // set to 2 for two-hand support
  modelComplexity: 1,          // 0 = faster, 1 = more accurate
  minDetectionConfidence: 0.7, // lower if detection feels unresponsive
  minTrackingConfidence: 0.7
})
```

### Gesture colours

```js
const GESTURE_COLORS = {
  'Thumbs Up': '#48bb78',
  'Fist':      '#e53e3e',
  'Open Hand': '#38b2ac',
  'Peace':     '#9f7aea',
  'Point':     '#ed8936',
  'Unknown':   '#4a5568'
}
```

### Canvas resolution

```js
canvas.width  = 640
canvas.height = 480
```

### CSS theme tokens

```css
:root {
  --bg:     #0a0c10;   /* page background */
  --panel:  #111318;   /* card background */
  --accent: #7effd4;   /* static UI chrome */
  --text:   #e8eaf0;
  --sub:    rgba(232,234,240,0.4);
}
```

---

## Known Limitations

- **Lighting sensitivity** — detection degrades in low light or with high-contrast backgrounds behind the hand
- **Thumb detection** — the thumb uses the X axis which can misfire depending on hand orientation relative to camera. Works best with the hand facing the camera palm-out
- **One hand only** — `maxNumHands: 1` by default; two-hand gestures not currently classified
- **No temporal smoothing** — gesture label can flicker between states at borderline positions. Adding a debounce or majority-vote over N frames would stabilise it
- **First-load latency** — MediaPipe WASM (~10 MB) loads from CDN on first visit. Subsequent loads are served from browser cache

---

## Contributing

Pull requests are welcome. For significant changes, open an issue first to discuss what you'd like to change.

Some ideas for contribution:
- Add more gestures (OK sign, call me, rock on 🤘)
- Temporal smoothing / debounce for stable classification
- Two-hand gesture support
- Offline / PWA mode with locally bundled MediaPipe

---

## License

[MIT](./LICENSE)
