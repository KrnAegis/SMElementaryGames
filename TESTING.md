# Verification

## Automated rules: 12 checks passed

Run `node tests/engine.test.cjs` (Node.js required only for development).

- Library schema and 15 Easy / 15 Medium / 10 Hard counts.
- Every difficulty with 10, 15, 20, 30, and all questions: valid count, no repeats.
- Gradually increasing mixed difficulty with easy puzzles retained for later turns.
- 100 / 70 / 40 scoring and double-point equivalents.
- No award before reveal; regular questions cannot score twice.
- Incorrect result, scoring undo, and final awards to each team once.
- Exactly five speed puzzles, a final challenge, and eligible regular double points.
- Disabled questions and empty / small question pools.
- Manual adjustments, score reset, repeated undo, and tied rankings.
- JSON round-trip persistence of progress and undo history.
- Rejection of malformed imports and duplicate IDs.
- Undo reverses scoring without erasing later hints, reveals, or elapsed time.

## Chromium browser workflow

The optional `tests/browser.test.cjs` runs against a local static HTTP server and checks the shipped, self-contained `index.html`:

- Home, instructions, three-team setup, and team renaming.
- Keyboard hint and reveal controls; answer absent before reveal.
- Two hints award 40; duplicate award blocked; undo allows a corrected recipient.
- Refresh and Continue preserve score and question index and pause countdown.
- Manual subtraction and undo.
- Timer expiry shows a warning without judging or awarding points.
- Incorrect, undo, Next, and Previous.
- Library search, built-in editing, enable/disable, and custom puzzle creation/deletion.
- JSON download and import, rejection of malformed import, and library reset.
- Final question awards to every correct team once, score undo, rankings, and replay.
- Settings controls and sound toggle.
- No horizontal overflow in gameplay at 1920×1080, 1366×768, 1024×768, 768×1024, and 390×844; home checked at tablet and phone sizes.
- Offline interaction after loading; no external script or stylesheet dependencies.
- No JavaScript page errors during the workflow.

Run with Playwright available and Chromium installed:

```sh
CHROMIUM_PATH=/path/to/chromium node tests/browser.test.cjs
```

Browser verification uses Chromium. Safari, Edge, actual touch hardware, and a physical projector were not available for direct testing. The implementation uses standard browser APIs with a fallback message when native fullscreen is unavailable. Reduced-motion CSS suppresses decorative animations and confetti.

The managed test browser blocks navigation to local `file://` URLs by policy, so that exact launch mode could not be exercised here. The same self-contained HTML passed static HTTP and offline-interaction checks. Its runtime has no fetches, imports, or asset requests; only a browser is needed to open the downloaded file on a normal laptop.

No deployment was performed: the requested deliverable is a manually uploadable static application.


## Game hub and Bible Trivia (October 2026 update)

`node tests/trivia.test.cjs`: 10 checks cover the 60-question schema and difficulty counts, 1–4 teams, chosen difficulty on every draw, exact 100/200/300 scores, reveal and duplicate-award protection, mandatory judging before advancing, all 60 questions without repetition, exhausted difficulty and length limits, incorrect / skip / score undo, undo after advancing, manual adjustments, ties, JSON restoration, and invalid-save rejection.

`node tests/trivia.browser.test.cjs`: actual teacher workflow covers both game cards, saved Emoji compatibility, 1–4 team setup, name preservation when changing team count, Easy → Hard → Medium selection, awards to different teams, locked scoring, undo, incorrect, skip, manual correction, refresh recovery, Previous / Latest navigation, canceled new/end game, game length, rankings, tied winners, replay, help dialog, offline interaction, and layout at projector, laptop, tablet, and phone widths. JavaScript page errors are collected and must be absent. The original Emoji browser suite is also rerun with the new hub.

The source build embeds all six JavaScript modules and the stylesheet into the same portable `index.html`; no external runtime dependencies were added.
