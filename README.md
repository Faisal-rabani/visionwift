# ♿ AccessiWeb — React Accessibility Component

A fully-featured, production-ready React homepage with a built-in **Accessibility Sidebar**, **Text-to-Speech with word-by-word highlighting**, and **Voice Input** for form fields.

---

## 🎬 Demo Video

<video src="Ac.mp4" width="100%" controls autoplay muted loop>
  Your browser does not support the video tag.
</video>

> **Watch the full demo above** to see all accessibility features in action — including the word-by-word TTS highlight, voice input filling form fields, contrast modes, and the sidebar panel.

---

### 📌 If the video does not play above, click below to download and watch:

**[▶ Download & Watch Demo (Ac.mp4)](./Ac.mp4)**

---

> **For GitHub users:** After pushing to GitHub, replace the video section with:
> ```
> https://github.com/YOUR_USERNAME/YOUR_REPO/assets/YOUR_ASSET_ID/Ac.mp4
> ```
> GitHub auto-embeds `.mp4` links when pasted directly into the README.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Accessibility Sidebar](#accessibility-sidebar)
- [Text-to-Speech (Word Highlight)](#text-to-speech-word-highlight)
- [Voice Input](#voice-input)
- [Contact Form](#contact-form)
- [Color Contrast Modes](#color-contrast-modes)
- [Visual Aids](#visual-aids)
- [Browser Support](#browser-support)
- [Component Reference](#component-reference)
- [How It Works (Technical)](#how-it-works-technical)

---

## Overview

AccessiWeb is a React single-page application built around the principle that **accessibility is a right, not a feature**. Every element on the page is designed to be usable by people with visual, auditory, motor, or cognitive disabilities.

The app consists of:
- A **Hero Section** with rich content paragraphs
- A **Contact Form** with three fields (Name, Email, Description)
- A **fixed Accessibility Sidebar** on the right edge of the screen

---

## Features

| Feature | Description |
|---|---|
| 🔊 Text-to-Speech | Reads the entire page aloud using the Web Speech API |
| 🟡 Word Highlight | Each word is highlighted in yellow with a blue underline as it is spoken |
| 🎙️ Voice Input (Sidebar) | Choose a form field, click Start Listening, speak — field fills automatically |
| 🎙️ Voice Input (Inline) | Each form field has its own Speak button for direct voice input |
| 🔤 Text Size | 5 quick-pick sizes + A−/A+ buttons + slider (70%–200%) |
| 🎨 Color Contrast | Default, High Contrast (black/yellow), Dark Mode, Inverted |
| 📏 Line Spacing | Normal, Wide, Extra |
| 🖱️ Big Cursor | Enlarged custom cursor for motor accessibility |
| 🔡 Dyslexia Font | Switches to a wider-spaced serif font |
| 🔗 Highlight Links | Yellow background on all anchor elements |
| 🔲 Focus Outline | Bright orange outline on all focused elements |
| ✨ Highlight on Hover | Amber outline on any hovered element |
| ♻️ Reset All | One click restores every setting to default |
| ⌨️ Keyboard Navigation | Full keyboard support, skip-to-content link |
| 📱 Responsive | Works on mobile, tablet, and desktop |

---

## Project Structure

```
accessibility-react-app/
│
├── public/
│   └── index.html                  # HTML entry point
│
├── src/
│   ├── index.js                    # React root render
│   ├── index.css                   # Global reset styles
│   ├── App.js                      # Root component
│   │
│   ├── hooks/
│   │   └── useSpeechRecognition.js # Custom hook — Web Speech Recognition API
│   │
│   └── components/
│       ├── HomePage.js             # Page layout: nav, hero, form, footer
│       ├── HomePage.css
│       ├── HeroSection.js          # Hero with word-span TTS highlighting
│       ├── HeroSection.css
│       ├── ContactForm.js          # Form with inline voice input per field
│       ├── ContactForm.css
│       ├── AccessibilitySidebar.js # Full sidebar + TTS engine + voice input
│       └── AccessibilitySidebar.css
│
├── Ac.mp4                          # Demo video
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 16 or higher
- npm 8 or higher

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm start
```

The app opens at **http://localhost:3000**

### Build for Production

```bash
npm run build
```

Output goes to the `build/` folder, ready to deploy to any static host.

---

## Accessibility Sidebar

The sidebar is triggered by the **blue "Accessibility" button** fixed to the **right edge** of the screen at vertical center.

### Opening / Closing

- **Click** the blue button on the right edge
- **Press Escape** to close
- The sidebar slides in from the right with no dark overlay — the page content stays fully visible behind it

### Sidebar Sections

```
┌─────────────────────────────┐
│  ♿ Accessibility            │
├─────────────────────────────┤
│  🔊 Text to Speech          │
│  🎙️ Voice Input             │
│  🔤 Text Size               │
│  🎨 Color Contrast          │
│  📏 Line Spacing            │
│  👁️ Visual Aids             │
│  ♻️ Reset All Settings      │
└─────────────────────────────┘
```

---

## Text-to-Speech (Word Highlight)

### How to Use

1. Open the Accessibility Sidebar (right edge button)
2. Click **"Read Page"** in the Text to Speech section
3. The browser reads the hero paragraphs aloud
4. Each word is highlighted in **yellow** with a **blue underline** as it is spoken
5. Click **"Stop Reading"** to stop at any time

### How It Works

Every word in every paragraph is wrapped in its own `<span class="tts-word">` with a unique global index. The full text fed to `SpeechSynthesisUtterance` is built from the exact same word list, so character positions match perfectly.

```
Hero text:  "The internet is one of..."
Word map:   [{ word: "The", charStart: 0 }, { word: "internet", charStart: 4 }, ...]
```

When `onboundary` fires for each word:
1. `charIndex` from the event is binary-searched against the word map
2. The matching word index is dispatched via a `CustomEvent('a11y-word')`
3. `HeroSection` listens and sets `activeWordIndex`
4. The matching `<span>` gets `.tts-word--active` → yellow background + blue underline

```css
.tts-word--active {
  background: #fef08a;           /* bright yellow */
  border-bottom: 2.5px solid #1a56db;  /* blue underline */
}
```

---

## Voice Input

There are **two ways** to use voice input:

### Method 1 — Sidebar Voice Input (Global)

1. Open the Accessibility Sidebar
2. In the **Voice Input** section, select the target field from the dropdown:
   - Full Name
   - Email Address
   - Description
3. Click **"Start Listening"**
4. Speak your answer
5. The field fills automatically when you stop speaking
6. A green "Heard: ..." preview shows what was captured

### Method 2 — Inline Speak Button (Per Field)

Each form field has a **🎙 Speak** button on the right side of the input:

1. Click the **Speak** button next to any field
2. The input border turns red and pulses — you are now recording
3. Speak your answer
4. The field fills automatically
5. Click **Stop** to cancel early

### Browser Requirement

Voice input uses the **Web Speech API** (`SpeechRecognition`). This is supported in:
- ✅ Google Chrome (desktop + Android)
- ✅ Microsoft Edge
- ⚠️ Safari (partial support)
- ❌ Firefox (not supported)

---

## Contact Form

The form has three fields, all with validation and voice input:

| Field | Type | Validation |
|---|---|---|
| Full Name | text | Required |
| Email Address | email | Required, valid format |
| Description | textarea | Required |

On successful submission, a green success message appears with the submitted name and email. A "Send Another" button resets the form.

---

## Color Contrast Modes

| Mode | Background | Text | Use Case |
|---|---|---|---|
| Default | White `#ffffff` | Dark `#1a202c` | Standard reading |
| High Contrast | Black `#000000` | Yellow `#ffff00` | Low vision, bright environments |
| Dark Mode | Dark blue `#1e293b` | Light `#f1f5f9` | Night use, eye strain |
| Inverted | CSS `invert(1)` | — | Alternative visual processing |

These are applied as CSS classes on `<html>` with real color overrides (not just CSS filters), so they work reliably across all elements.

---

## Visual Aids

| Toggle | What It Does |
|---|---|
| Highlight on Hover | Amber outline + tint on any hovered element |
| Big Cursor | Replaces the cursor with a large 40×40px arrow |
| Dyslexia Font | Switches to Georgia serif with extra letter/word spacing |
| Highlight Links | Yellow background on all `<a>` elements |
| Focus Outline | Bright orange 3px outline on all focused elements |

---

## Browser Support

| Browser | TTS | Voice Input | All Other Features |
|---|---|---|---|
| Chrome 90+ | ✅ | ✅ | ✅ |
| Edge 90+ | ✅ | ✅ | ✅ |
| Firefox 90+ | ✅ | ❌ | ✅ |
| Safari 15+ | ✅ | ⚠️ Partial | ✅ |

> **Note:** Word-by-word boundary events (`onboundary`) work best in Chrome and Edge. Firefox fires `onboundary` less reliably, so word highlighting may be less precise in that browser.

---

## Component Reference

### `<AccessibilitySidebar heroRef formRef />`

The main accessibility panel. Receives refs to the hero and form sections so TTS can read them.

**Props:**
- `heroRef` — React ref pointing to the `<section>` element of the hero
- `formRef` — React ref pointing to the `<section>` element of the contact form

**Exports:**
- `stopSpeech()` — utility function to cancel any active speech

---

### `<HeroSection ref />`

The hero section. Renders all paragraph text as individual word `<span>` elements. Listens for `a11y-word` custom events to apply the active word highlight.

**Exports:**
- `PARAGRAPHS` — array of paragraph strings
- `HERO_FULL_TEXT` — all paragraphs joined as a single string (used by TTS)
- `HERO_WORD_MAP` — array of `{ word, charStart }` objects (used for boundary mapping)
- `buildWordMap(paragraphs)` — utility to build a word map from any paragraph array

---

### `<ContactForm ref />`

The contact form. Each field uses the `<VoiceField>` sub-component which wraps `useSpeechRecognition`. Also handles native `input` events so the sidebar's voice input (which fires native DOM events) correctly updates React state.

---

### `useSpeechRecognition({ onResult, onError })`

Custom hook wrapping the Web Speech API.

**Returns:**
- `listening` — boolean, true while recording
- `transcript` — current interim transcript string
- `startListening()` — begin recording
- `stopListening()` — stop recording
- `supported` — boolean, false if browser doesn't support the API

---

## How It Works (Technical)

### Word-by-Word TTS Architecture

```
AccessibilitySidebar
  │
  ├── Builds speakText from HERO_FULL_TEXT + form field values
  ├── Creates SpeechSynthesisUtterance
  ├── utterance.onboundary → charIndex → binary search HERO_WORD_MAP
  └── dispatchEvent('a11y-word', { wordIndex })
                │
                ▼
          HeroSection
            │
            ├── Listens for 'a11y-word' events
            ├── Sets activeWordIndex state
            └── Renders <span class="tts-word tts-word--active"> on matching word
```

### Voice Input Architecture

```
Sidebar Voice Input
  │
  ├── SpeechRecognition.onresult → finalText
  ├── Finds DOM element by [name="fieldName"]
  ├── Uses native HTMLInputElement setter to set value
  ├── Dispatches native 'input' + 'change' events
  └── React's synthetic onChange picks up the change
```

### Font Scaling

Font size is applied to `document.body.style.fontSize` as a percentage (e.g. `120%`). All component font sizes use `em` or inherit from body, so they scale correctly without breaking the sidebar's own UI.

---

## Accessibility Standards

This project targets **WCAG 2.1 Level AA** compliance:

- All interactive elements have `aria-label` or visible labels
- All images and SVGs have `aria-hidden="true"` or descriptive `alt` text
- Color contrast ratios meet 4.5:1 for normal text, 3:1 for large text
- Full keyboard navigation with visible focus indicators
- Skip-to-content link for keyboard users
- `role`, `aria-pressed`, `aria-expanded`, `aria-live` used throughout
- Form fields have associated `<label>` elements

> Full WCAG validation requires manual testing with assistive technologies such as NVDA, JAWS, or VoiceOver.

---

## License

MIT — free to use, modify, and distribute.
