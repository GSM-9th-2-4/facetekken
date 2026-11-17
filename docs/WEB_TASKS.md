# Claude app tasks (browser work)

Claude Code runs in the terminal and can't browse or see the screen. These prompts are for the **Claude app with Claude in Chrome**. Paste a prompt there, then paste the result back into Claude Code.

In Claude Code, `/web-task` prints the right prompt for the current step, filled in.

---

## Task A — Free assets (run during steps 3–8, non-blocking)

```
I'm building a personal, non-distributed browser 3D fighting game (Three.js, glTF).
Find free assets, preferring CC0 (Quaternius, Kenney, KayKit, Poly Pizza, 100 Avatars; for audio Kenney audio packs or CC0 sounds on Freesound):

1. Rigged humanoid fighter bodies in glTF/GLB — Quaternius "Universal Base Characters" first (Superhero proportions), plus 1–2 alternatives. The head face will be replaced by a photo texture.
2. Fighting animations that work on a humanoid rig: idle stance, walk fwd/back, crouch, guard, jab, straight, hook, uppercut, front kick, roundhouse, low kick, hit reactions (high/mid/low), knockdown, get up, victory pose. CC0 first (Quaternius animation packs, Rokoko free fight mocap). List Mixamo clips separately — they must not be committed to the repo.
3. Stage props: rooftop (aircon units, railings, water tanks, city skyline), school gym (bleachers, basketball hoops, wooden floor texture), dojo (tatami, wooden walls).
4. Sound effects: punch / kick impacts (light, heavy), guard block, counter hit, body fall, wall crash, glass/floor break, whoosh, UI select / confirm, round bell.
5. Fonts (OFL): Anton, Oswald, Chakra Petch, Inter, Dela Gothic One.

For each item give: name, direct page link, license, file format, size. Put CC0 first.
Then download the best pick for each category (ask me before each download) into Downloads/facetekken-assets/, one folder per category (models, animations, animations-licensed, stage, sfx, fonts).
Finish with a summary I can paste to my coding agent: the folder layout and what each file is.
```

After it finishes: in Claude Code, say `move Downloads/facetekken-assets into public/assets (fonts → public/fonts, animations-licensed → public/animations/licensed) and use them in step 9` (paste the summary too).

---

## Task B — Localhost QA (run after any step that changes something visible)

Start the game first: `npm run dev` (default http://localhost:5173).

```
Test my local fighting game at http://localhost:5173 in a new tab. You are a QA tester; don't change any code.

1. Read the browser console (errors and warnings) on load and after every action below.
2. Go through every screen that exists: Title → Menu → Settings → Face Lab → Character select → VS → Fight → Pause → Results → Practice. Take a screenshot of each and note anything broken, overlapping, cut off, unreadable, or not responding to clicks / keys. Compare against the mockups in docs/design/mockups.html if available.
3. In a fight (P1 keys: W A S D move, U I J K = buttons 1 2 3 4, O = Heat, L = Rage Art):
   - hold D 2 s (walk forward), tap D D (dash), tap A A (backdash), hold S (crouch), tap W (sidestep)
   - press U, then U I, then S+D together with U (df+1), then W+D with K (uf+4)
   - press F1 and read the debug overlay values; press F2 for hitboxes
   Report whether the fighters move, attack, react to hits, and whether health / Heat / timer change.
4. Load each stage directly: http://localhost:5173/?stage=<id> for every stage id the game lists, and note geometry problems (fighters falling through, walls missing, camera inside objects).

Output ONE message I can paste to my coding agent, formatted exactly like this:

/bug QA report
- [screen or stage] problem — steps to reproduce — console error (verbatim, first lines)
- ...
Working fine: <short list>
```

Paste its output straight into Claude Code (it already starts with `/bug`).

---

## Task C — Design pass (optional, any time)

```
Open docs/design/mockups.html from my FaceTekken repo (or the running game at http://localhost:5173).
Using docs/DESIGN.md as the design system, review each screen like a game UI designer: hierarchy, readability at a distance, Tekken-like intensity, how well the player's face is featured.
Give at most 5 concrete changes per screen as CSS-level instructions (sizes, colors from the token list, spacing, motion) I can paste to my coding agent.
```

---

## Task D — Spec export (done)

`SPEC.md` is already in the repo. If the spec changes elsewhere, export it again as Markdown and replace `SPEC.md`.
