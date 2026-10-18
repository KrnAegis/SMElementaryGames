# 📖 Bible Emoji Challenge 🎉

A complete, cheerful Sunday school game for 2–4 teams and mixed ages K–6. No accounts, API keys, build tools, internet connection, or backend are needed to play.

## Play immediately

Open **index.html** in Chrome, Edge, Safari, or a mobile browser. Start a new game, name your teams, and choose your settings. The teacher controls the game; children give answers verbally. For a tablet or phone, hosting on GitHub Pages or Netlify is usually easier than opening a downloaded HTML attachment.

The root `index.html` is self-contained: all styles, JavaScript, and 40 puzzles are embedded. You can upload **just that one file** to a website, or copy it to a laptop and play offline. Keep the file in the same location and browser to retain its local saved data. Emoji appearance varies by operating system.

## Upload manually to GitHub

1. Unzip the download on your computer.
2. Open your repository on GitHub. Choose **Add file → Upload files**.
3. Upload `index.html` at the root of the repository. Optionally upload the other files and folders to retain the editable source and instructions. Upload the extracted files, not the ZIP itself.
4. Commit the upload.
5. To play on GitHub Pages: go to **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, select your branch and **/(root)**, then Save. Open the website link once GitHub finishes deploying.

A GitHub repository page does not run HTML directly; use GitHub Pages or Netlify to play the hosted game.

## Deploy to Netlify

Either drag the extracted folder containing `index.html` onto Netlify's manual deploy area, or import your GitHub repository. No build command is needed. Publish the repository root (`.`). The included `netlify.toml` sets this automatically. The game uses only static files and relative paths, so it also works under a GitHub Pages repository path.

For reliable offline play, download and open the single HTML file locally. A hosted page needs a connection for its initial load; this project does not register a service worker.

## Teacher guide

- Default: four teams, mixed difficulty, 20 questions, 30 seconds, one double-points question, and a final challenge. Sound and music start muted. Speed rounds are optional.
- Correct: **100 points**, **70 after hint 1**, **40 after hint 2**. Double points: **200 / 140 / 80**. Incorrect: **0**.
- Reveal does not award points. Choose the team, then press **Correct · Award Points**. Another team can earn a question even when it is not their turn.
- A regular question can be scored once. **Undo Score** reverses the latest score action, including adjustments and score resets. It restores question scoring to the state before that action, while keeping hints, reveals, and countdown progress. Up to 100 actions are retained.
- **± Score** adds or subtracts a whole number. Scores may go below zero when manually adjusted.
- **Reset Scores** resets totals but keeps already judged questions locked. Undo can reverse the reset.
- Timer expiry never judges the answer. Pause, reveal, or skip as you see fit. Opening a dialog suspends countdown; hiding the tab or returning Home pauses it. After refresh, Continue opens with the timer paused.
- Previous questions retain hints, reveal status, timer time, and scoring. Skipped puzzles can be revisited. No question appears twice in the question order.
- The selected count includes special rounds. If fewer enabled puzzles match your difficulty, all matching puzzles are used.
- Mixed games start with easy puzzles, gradually add medium and hard puzzles, and reserve easy puzzles for later turns where available. Shuffle randomizes within difficulty groups.
- Speed round: five consecutive puzzles before the final challenge, using at most 15 seconds per puzzle (15 seconds even if the regular timer is off). At least 6 available puzzles are needed. Without a final challenge, the speed round occupies the last five puzzles.
- Double points: one randomly selected **regular** question. If every question belongs to a speed/final round, there is no eligible double-points question.
- Final challenge: everyone discusses and shares a guess **before the reveal**. After revealing, choose each correct team and press Correct once for each. Hints affect all teams equally. Finish Judging locks the question; Next finishes the game. All teams tied for first are celebrated.
- Play Again keeps teams and game settings and draws a fresh game from the current library. New Game opens setup. Ending or replacing an active game asks for confirmation.
- Sound effects, background music, and ticking are generated locally using Web Audio. Enable them in Settings. The top Sound button mutes/unmutes everything. Background music plays only during gameplay while the tab is visible.

### Keyboard shortcuts

| Key | Action |
| --- | --- |
| R | Reveal answer |
| H | Next hint |
| Space | Pause / resume countdown |
| Right arrow | Next question after reveal |
| Left arrow | Previous question |
| S | Skip question |
| U | Undo latest score action |
| F | Toggle fullscreen |

Shortcuts are disabled in dialogs and when a form field or button has focus. All actions have touch controls. Native fullscreen availability varies by device; Safari on some mobile devices may require its own toolbar controls.

## Question library

Includes **15 Easy**, **15 Medium**, and **10 Hard** puzzles from both Testaments. Each has a unique ID, emojis, answer, acceptable alternatives, difficulty, two hints, Bible reference, explanation, and enabled flag. References identify passages rather than quoting a particular Bible translation. Teachers can adapt accepted answers and phrasing for their church.

Open Question Library to search, filter, preview, edit, enable/disable, or add puzzles. Only custom puzzles have a Delete button; built-in puzzles can be disabled. Reset to Defaults restores the original 40 and removes customizations after confirmation.

Export JSON regularly to back up changes. Import accepts an array of 1–500 complete puzzles, validates fields and unique IDs, and asks before replacing the library. Invalid imports leave the library unchanged. Library changes affect new games; active games keep snapshots of their questions.

## Saved data and privacy

Settings, library edits, game questions, team scores, countdown, and undo history use browser `localStorage`. Important actions save immediately; active countdown saves each second. Nothing is transmitted anywhere. Browser clearing, private browsing restrictions, moving the file, or changing the website origin can remove or separate saved data. A visible notice appears if saving is unavailable. If so, keep the tab open and export your library before closing it.

## Source and maintenance

- `index.html`: ready-to-play, self-contained distribution.
- `src/index.template.html`: editable page structure.
- `src/styles.css`: responsive theme, animation, reduced-motion support.
- `src/questions.js`: the organized default question library.
- `src/engine.js`: pure question selection, scoring, undo, ranking, and JSON validation rules.
- `src/app.js`: teacher interface, editor, storage, keyboard, timer, and local sound.
- `build.py`: embeds the source into `index.html`, using only Python's standard library.
- `tests/engine.test.cjs`: rules tests using Node's built-in test/assert modules.
- `tests/browser.test.cjs`: optional Playwright workflow test.
- `TESTING.md`: verification details.

After editing source, run `python3 build.py`. No build is needed for the provided HTML. You can preview the modular source by running `python3 -m http.server 8000` and visiting `/src/index.template.html`.

Run rules tests: `node tests/engine.test.cjs`. For browser checks, install Playwright in your development environment and provide Chromium using `CHROMIUM_PATH=/path/to/chromium node tests/browser.test.cjs`. These are development-only tools; game players need none of them.

## Accessibility and classroom layout

Responsive laptop/projector/tablet layouts, large emoji puzzles, labeled form controls, visible keyboard focus, semantic buttons, native modal dialogs, and reduced-motion support are included. Large score panels stay visible throughout gameplay. Answer content is not inserted into the game screen until the teacher reveals it. The teacher may scroll vertically on small displays, especially after revealing an explanation. Use fullscreen and browser zoom to fit your classroom.
