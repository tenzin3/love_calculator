# love, maybe. ♡

A romantic, animated love calculator inspired by the classic pen-and-paper name game.

**Website:** https://tenzin3.github.io/love_calculator/

## Web experience

- Blush colors, editorial typography, floating hearts, and a hand-drawn flourish.
- Animated heart-shaped score reveal with a celebratory heart burst.
- Mobile layouts, keyboard access, screen-reader announcements, and reduced-motion support.
- Copyable love notes. Names are processed locally and are never saved or submitted.
- No framework, build step, or backend. Google Fonts is optional; system fonts are the fallback.

## Run locally

```sh
python3 -m http.server 4173 --directory docs
```

Open http://localhost:4173. Serve files over HTTP rather than opening the HTML directly because the calculator uses JavaScript modules.

## GitHub Pages

The website lives in `docs/`. In repository **Settings → Pages**, select **Deploy from a branch**, then **main** and **/docs**. Changes pushed to this folder publish automatically.

## How the game works

The calculator counts unique characters in the two names with “love” between them, then repeatedly adds the outermost counts together. The final one or two numbers produce the score using the original game's rules. The web version ignores whitespace and case, normalizes Unicode, and splits large counts into individual digits so repeated names always produce a score between 0 and 99.

This is a game, not a measure or prediction of a relationship. Name order can affect the score.

## Original Python version

```sh
python3 main.py
```

Enter one name per line. The original command-line calculator is preserved.

## Calculation checks

```sh
node --test tests/calculator.test.mjs
```
