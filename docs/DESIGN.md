# FaceTekken — Design System

Visual rules for every screen. The `ui-screens` agent implements these as CSS variables in `src/ui/styles.css`.
Live mockups of each screen: open [`design/mockups.html`](design/mockups.html) in a browser.

Direction: **dark, metallic, high-contrast fighting-game UI** (Tekken 8 mood) with **over-the-top cut-ins** (JoJo-style poses and ゴゴゴ lettering). The uploaded face is the hero of every screen.

---

## 1. Color tokens

| Token | Hex | Use |
|---|---|---|
| `--bg-0` | `#07080c` | Page / letterbox |
| `--bg-1` | `#11131b` | Panels |
| `--bg-2` | `#1b1f2b` | Raised panels, inputs |
| `--steel` | `#8a93a6` | Borders, secondary text |
| `--text` | `#f2f4f8` | Primary text |
| `--health` | `#ffd23f` | Health bar |
| `--health-recover` | `#f5f5f5` | White (recoverable) health |
| `--damage-ghost` | `#ff6b35` | Trailing recent damage |
| `--rage` | `#ff2a3d` | Rage bar, Rage aura, Rage Art |
| `--heat` | `#b04bff` | Heat gauge, Heat aura |
| `--heat-glow` | `#ff4bd8` | Heat highlights |
| `--p1` | `#2f8cff` | Player 1 accents |
| `--p2` | `#ff3b5c` | Player 2 accents |
| `--counter` | `#ff3b30` | COUNTER text, high hit spark |
| `--punish` | `#ffb000` | PUNISH text |
| `--spark-mid` | `#ffe066` | Mid hit spark |
| `--spark-low` | `#4dd2ff` | Low hit spark |
| `--guard` | `#9fd8ff` | Guard spark |

Contrast rule: text on panels ≥ 4.5:1. Never put yellow text on white.

## 2. Typography

| Role | Font (Google Fonts, OFL) | Size | Notes |
|---|---|---|---|
| Display (KO, ROUND, VS) | **Anton** | 96–200 px | Caps, slight skew `-8deg`, heavy stroke |
| Headings / buttons | **Oswald** 600 | 20–40 px | Caps, letter-spacing 0.06em |
| Numbers (timer, combo, frames) | **Chakra Petch** 700 | 18–72 px | Tabular numbers |
| Body / labels | **Inter** 500 | 14–16 px | |
| Cut-in lettering | **Dela Gothic One** | 120 px+ | ゴゴゴ / ドドド style SFX |

Fonts are bundled locally (`public/fonts/`) so the game runs offline.

## 3. Shapes and motion

- Panels: angled corners (`clip-path` 12 px chamfer), 1 px `--steel` border at 40% opacity.
- Health bars: parallelograms (skew `-12deg`) mirroring toward the center timer.
- Buttons: chamfered, hover = shift 4 px right + accent left border.
- Motion: UI transitions 150–250 ms ease-out. Cut-ins slam in (80 ms) + hold + wipe out.
- Hitstop also freezes HUD shake for the same frames.

## 4. Screen specs

### 4.1 Fight HUD (1920×1080 reference, scale with viewport)
- Top bar height 140 px. Portrait 112×112 at each outer edge, thick player-colored frame, uploaded face fills it.
- Health bars 680×34 between portrait and timer; recoverable section white, Rage = red with flicker flame overlay.
- Heat gauge 520×10 under each bar; purple, glows magenta while active.
- Timer: 72 px Chakra Petch in a hexagon center plate. Round pips below (● won, ○ not yet).
- Combo counter: left side, `12 HITS` (Anton 64 px) + `68 DAMAGE` (Chakra Petch 28 px).
- Callouts: `COUNTER` (red), `PUNISH` (amber), `HEAT` (purple) slide in from the attacker's side, 600 ms.

### 4.2 Face Lab
- Left: drop zone (dashed chamfered panel) + "Upload photo" / "Use webcam" buttons.
- Center: detected photo with face boxes; selected face highlighted with player color.
- Right: rotating 3D head preview + tone toggle (natural / cartoon).
- Bottom: 8 save slots as circular face thumbnails; empty slot = "+".
- Errors as a red banner: "No face found", "Face the camera", "Pick one face".

### 4.3 Character select
- 2×2 roster grid center (big tiles, fighter silhouette + name).
- P1 panel left / P2 panel right: large fighter render with face applied, face slot row, color A/B.
- Cursor colors = player colors; READY stamp when locked.

### 4.4 VS screen
- Diagonal split (P1 blue left / P2 red right), both fighters posed, faces large, giant skewed "VS" in the middle, stage name bottom.

### 4.5 Results
- Winner cut-in: fighter pose, face close-up, "ゴゴゴ" lettering behind, `PERFECT` / `K.O.` stamp; buttons Rematch / Character select / Menu.

### 4.6 Practice overlay
- Right column (monospace): last move `startup / active / recovery / block / hit`, live advantage `+3` (green) / `-12` (red, with "PUNISHABLE").
- Left column: input history (latest on top, icons for directions and 1–4).
- Toggles bottom: hitboxes, dummy action, record / play.

## 5. Effects colors (3D)

| Effect | Color |
|---|---|
| High hit spark | `--counter` |
| Mid hit spark | `--spark-mid` |
| Low hit spark | `--spark-low` |
| Guard spark | `--guard` |
| Heat aura | `--heat` → `--heat-glow` gradient |
| Rage aura | `--rage` |
