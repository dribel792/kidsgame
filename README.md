# 🌟 Learning Time — Kids iPad Game

An educational game built for a 4-year-old with autism and fine motor challenges.
Big tap targets, instant audio feedback, simple layouts.

## Games

| Game       | What it teaches                          | How it works                                     |
|------------|------------------------------------------|--------------------------------------------------|
| 🔤 Letters | Letter recognition + vocabulary          | See a letter → tap the picture that starts with it |
| 🃏 Memory  | Memory + animal names                    | Flip cards, find matching pairs                  |
| 🔢 Counting | Numbers 1–5 + counting                  | See emoji objects → tap the right number         |

## iPad Design Principles
- **Large tap targets** (min 90×90px, no precision dragging needed)
- **Audio on every interaction** (hear the letter, word, number spoken aloud)
- **Instant positive feedback** (green glow + celebration speech)
- **Gentle wrong-answer feedback** (shake animation, encouraging speech — no scary sounds)
- **Predictable structure** (same layout every session, same back button location)
- **Short sessions** (8 rounds max per game, then celebration screen)

---

## Setup & Run on iPad

### Prerequisites
- Node.js 18+ installed on your computer
- **Expo Go** app installed on the iPad (free, App Store)
- Both devices on the **same WiFi network**

### Step 1 — Install deps (already done if you're in this folder)
```bash
cd kidsgame
npm install
```

### Step 2 — Start the dev server
```bash
npx expo start
```

A QR code will appear in your terminal.

### Step 3 — Open on iPad
1. Open the **Camera** app on the iPad
2. Point it at the QR code in the terminal
3. Tap the "Open in Expo Go" banner
4. The app loads instantly — no App Store submission needed!

---

## Deploy as a Real App (optional, no App Store)

If you want it installed as a real app icon (not through Expo Go):

### Option A — TestFlight (Mac + Xcode required)
```bash
npx expo build:ios
# or for local build:
npx expo run:ios --device
```
Then deploy via TestFlight (free Apple Developer account works for personal use).

### Option B — EAS Build (cloud, no Mac needed)
```bash
npm install -g eas-cli
eas build --platform ios --profile preview
```
This builds in the cloud and gives you a TestFlight link.

---

## Customization

### Add more letters
Edit `screens/LettersScreen.js` → add entries to the `QUESTIONS` array:
```js
{ letter: 'K', correct: { emoji: '🪁', word: 'Kite' }, wrongs: [...] }
```

### Add more memory pairs
Edit `screens/MemoryScreen.js` → add to the `PAIRS` array:
```js
{ id: 'lion', emoji: '🦁', label: 'Lion' }
```

### Change counting range
Edit `screens/CountingScreen.js` → change `Math.random() * 5` to a different max.
For example `* 3` limits to 1–3 for easier sessions.

---

## Roadmap (next features)
- [ ] Writing / tracing letters (touch-drag paths)
- [ ] Sight words ("cat", "dog", "the")
- [ ] Simple addition (1 + 2 = ?)
- [ ] Progress tracking per child
- [ ] Parent dashboard (sessions, accuracy per game)
- [ ] Customizable difficulty per game
