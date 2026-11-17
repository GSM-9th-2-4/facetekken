# FaceTekken — Implementation Spec

> A 3D browser fighting game that reproduces Tekken 8's controls and battle systems.
> Core feature: **the user's uploaded photo becomes the fighter's face**.
> Personal / fun project. **Not distributed.** Keep the repo private.

This is the single source of truth for the Claude Code harness (`CLAUDE.md`, `.claude/agents/`).
Number tags:
- `[T8]` — value or rule taken from Tekken 8 (keep unless the human says otherwise)
- `[tune]` — our own starting value; free to tune, but update this file when you change it

---

## 0. Goals / Non-goals

### Goals
- Tekken-style **4 buttons (1·2·3·4) + 8 directions**, frame-accurate logic at 60 fps
- 3D axis movement (sidestep / sidewalk), high / mid / low hit levels, guard, counter hits, punishment
- Launchers → air combos (juggles), wall splats, wall / floor / balcony breaks
- **Heat system, Rage / Rage Art, recoverable health (white gauge), chip damage**
- Local 2P versus, versus CPU, practice mode (frame display, hitbox display)
- Photo upload → automatic face detection → mapped onto the fighter's head

### Non-goals
- Online play / rollback netcode
- Any **original Tekken assets** (characters, models, music, voices, logos). All fighters are original.
- Story mode, shop, accounts, backend
- Distribution / store release

---

## 1. Tech stack

| Area | Choice | Why |
|---|---|---|
| Runtime | Browser (Chrome first) | Photo upload and face detection stay on the client |
| Build | Vite + TypeScript (strict) | Fast HMR |
| 3D | three.js (GLTFLoader, AnimationMixer, SkinnedMesh) | |
| Face | `@mediapipe/tasks-vision` FaceLandmarker (IMAGE mode) | 468 landmarks + canonical face UVs |
| Input | KeyboardEvent + Gamepad API | Pads / arcade sticks |
| Storage | IndexedDB (fallback localStorage) via `src/core/storage.ts` | No server |
| Tests | Vitest (logic), Playwright smoke (optional) | |
| Package manager | npm | |

---

## 2. Architecture

### 2.1 Simulation vs rendering
- **Fixed-step 60 Hz simulation** (`FRAME = 1/60 s`). All game logic counts integer frames.
- Rendering runs on `requestAnimationFrame`; accumulate time, run 0–N sim steps, interpolate with the remainder.
- The simulation is **deterministic**: same input log → same result (replays, tests). Use the sim RNG only.
- Animations are driven by the sim: `action.time = moveFrame / 60`. Animations never decide hits.

### 2.2 Per-frame order
```
1. Input      raw P1/P2 input → directions normalized to the fighter (f = toward opponent, b = away)
2. Commands   input history → command match
3. State      state machine picks the move/transition allowed from the current state
4. Movement   walking, dashes, axis rotation, gravity, wall collision
5. Hit detect attack capsules vs hurt capsules
6. Resolve    guard / hit / counter / crush / throw-break, damage, stun
7. Gauges     health, recoverable health, Heat, Rage, timer
8. Events     hitstop, slow-mo, camera shake, effect queue
→ Render      interpolate, HUD
```

### 2.3 Folder layout
```
src/
  main.ts
  core/      loop.ts, rng.ts, replay.ts, screens.ts, storage.ts
  config/    tuning.ts
  input/     devices.ts, mapping.ts, buffer.ts, commandParser.ts
  fight/     fighter.ts, stateMachine.ts, moves.ts, hit.ts, throws.ts,
             juggle.ts, gauges.ts, round.ts, axis.ts, camera.ts
  stage/     stage.ts, walls.ts, breakables.ts
  render/    scene.ts, character.ts, effects.ts, hitboxDebug.ts
  face/      landmarker.ts, faceWarp.ts, faceMaterial.ts, faceStore.ts
  ui/        screens/*.ts, hud.ts, styles.css
  ai/        cpu.ts
  data/
    characters/<id>.json   # move list + frame data (kept out of code)
    stages/<id>.json
public/
  models/ animations/ sfx/ mediapipe/
tests/
```

---

## 3. Controls

### 3.1 Buttons
| Button | Meaning | P1 keyboard | P2 keyboard | Pad (Xbox) |
|---|---|---|---|---|
| 1 | Left punch (LP) | U | Numpad 4 | X |
| 2 | Right punch (RP) | I | Numpad 5 | Y |
| 3 | Left kick (LK) | J | Numpad 1 | A |
| 4 | Right kick (RK) | K | Numpad 2 | B |
| Heat | Heat Burst / Heat Smash (shortcut for 2+3) | O | Numpad 6 | RB |
| Rage | Rage Art (shortcut for df+1+2) | L | Numpad 3 | RT |
| Directions | 8-way | W A S D | Arrow keys | Stick / D-pad |

- Remappable in Settings, saved via `storage.ts`.
- Directions are **fighter-relative**: toward the opponent = `f`, away = `b`. Commands are identical on either side.
- Default buttons follow the official layout: 1 LP, 2 RP, 3 LK, 4 RK, 1+3 / 2+4 throws `[T8]`.

### 3.2 Notation (used in move lists and code)
| Notation | Meaning |
|---|---|
| `f b u d` / `df db uf ub` | Tap direction |
| `F B U D` / `DF ...` | Hold direction |
| `n` | Neutral |
| `1+2` | Simultaneous press |
| `1,2` | Sequence (string) |
| `~` | Immediately after |
| `:` | Just frame |
| `SS` / `SSL` / `SSR` | Sidestep / left / right |
| `WS` | While standing (rising from crouch) |
| `FC` | Full crouch |
| `WR` | While running |
| `BT` | Back turned |
| `CH` | Counter hit |
| `H.` | During Heat |
| `R.` | During Rage |

### 3.3 Input buffer / command parser `[tune]`
- History ring buffer: last **60 frames**
- Simultaneous-press leniency: **2 frames**
- `f,f` / `b,b` / tap-`u`/`d` (sidestep) window: **10 frames**
- Buffering during recovery: accept the next move from **8 frames before** recovery ends
- String follow-up windows: per move, `cancelWindow` in the move data
- Match priority: longer command > shorter; state-specific moves (WS / FC / SS / WR) > generic

---

## 4. Movement

| Action | Input | Notes |
|---|---|---|
| Walk forward / back | F / B | `[tune]` 1.2 / 1.0 m/s |
| Forward dash | f,f | Short burst |
| Backdash | b,b | Repeatable |
| Run | f,f,F (hold) | After a distance becomes a run; contact → WR moves / tackle |
| Crouch | D / DB / DF | DB = crouch guard |
| Sidestep | tap u / tap d | Arc around the opponent (1P: SSL = u, SSR = d) |
| Sidewalk | hold u / d | Continue arcing after the sidestep |
| Jump | U / UF / UB | Neutral / forward / back |
| Crouch dash | f,n,d,df | Optional per character |

### 4.1 3D axis
- Each frame both fighters turn to face each other — **except while executing a move** (that is what makes sidesteps work).
- A sidestep rotates around the opponent at a fixed angular speed `[tune]`.
- Each move has `tracking`:
  - `linear` — avoided by sidesteps either way
  - `trackLeft` / `trackRight` — catches one sidestep direction
  - `homing` — catches both
- If, at the attack's first active frame, the angle offset exceeds the move's tracking allowance, it whiffs.

---

## 5. Attacks

### 5.1 Move data
Every move is data (`src/data/characters/*.json`, template: `_template.json`):

```jsonc
{
  "id": "df1",
  "input": "df+1",
  "hitLevel": ["m"],            // h, m, l, sm (special mid), t (throw)
  "damage": [13],
  "startup": 13,                // i13 = first active frame is 13
  "active": 2,
  "recovery": 22,
  "onBlock": -1,
  "onHit": 4,
  "onCounter": 4,
  "tracking": "linear",
  "hitbox": [{ "bone": "hand_L", "radius": 0.09, "length": 0.25 }],
  "properties": [],             // highCrush, lowCrush, powerCrush, homing, heatEngager, heatBurst, rageArt,
                                // wallSplat, wallBreak, floorBreak, balconyBreak, tailspin, chip, groundHit
  "crush": { "lowCrush": null, "highCrush": null },
  "reaction": { "hit": "stagger_mid", "counter": "stagger_mid", "airborne": "juggle_light" },
  "cancelWindow": null,
  "next": [],                   // follow-up move ids for strings
  "anim": "kang_df1"
}
```

### 5.2 Hit levels and guard
| Level | Standing guard | Crouching guard | vs crouching opponent |
|---|---|---|---|
| High `h` | Blocked | — | **Whiffs** |
| Mid `m` | Blocked | **Hits** | Hits |
| Low `l` | **Hits** | Blocked | Hits |
| Special mid `sm` | Blocked | Blocked | Hits |
| Throw `t` | Break only | High throws whiff on crouchers | — |

- **No input or back = standing guard** (Tekken style). No guard while attacking or in recovery.
- DB / D = crouching guard.

### 5.3 Frame advantage and punishment
- 60 fps; 1 frame = 1/60 s `[T8]`.
- A move at **-10 or worse on block** can be punished by a 10-frame move `[T8]`. Show `PUNISH` on the HUD when a punish lands.
- Block / hit stun is derived from the data so that the attacker's advantage equals `onBlock` / `onHit` exactly:
  `defenderStun = (active − 1) + recovery + advantage` (frames remaining after the hit frame). Put this in **one function** with unit tests.
- **Counter hit (CH)**: getting hit during your own startup or recovery. Damage ×1.2 `[tune]`, uses `onCounter` and `reaction.counter`, HUD `COUNTER`.

### 5.4 Crushes / power crush
- `highCrush: [s, e]` — frames s–e ignore highs (crouching hurtbox).
- `lowCrush: [s, e]` — frames s–e ignore lows (airborne hurtbox).
- `powerCrush: [s, e]` — the move continues through highs / mids (damage is still taken). **Lows and throws beat it.** Very unsafe on block `[T8]`.

### 5.5 Hit detection
- Hurt capsules: head, torso, both arms, both legs — attached to bones. Crouching lowers the head capsule so highs whiff.
- Hit capsules: defined in the move's `hitbox`, attached to bones, live only during `active`.
- A move hits once (multi-hit moves list one entry per hit).
- Trades: if both hit on the same frame, both get hit.

---

## 6. Hit reactions and combos

### 6.1 Reactions
| Reaction | Description |
|---|---|
| stagger | Stun in place |
| crumple | Slow collapse (follow-up possible) |
| launch | Launched → airborne |
| juggle | Extra hits while airborne |
| tailspin | Spinning air state that extends combos — once per combo `[T8 concept]` |
| knockdown | Down on the floor |
| wallSplat | Stuck on the wall → wall combo |
| wallBreak / floorBreak / balconyBreak | Stage destruction → next area / lower floor |

### 6.2 Juggle rules `[tune]`
- Gravity rises per air hit: `gravity = base * (1 + 0.08 * airHitCount)`
- Combo damage scaling: hit 2 100%, hit 3 90%, hit 4 80% … minimum 30%
- Tailspin once per combo; afterwards it acts as a normal juggle reaction
- HUD shows hit count and combo damage

### 6.3 Knockdown / wake-up
- Options while down: stay down, stand (n), back roll (b), side roll (u / d), wake-up kicks (3 / 4)
- Tech roll: press 1 when hitting the ground, window 6 frames `[tune]`
- `groundHit` moves only hit downed opponents

### 6.4 Walls
- A `wallSplat` move, or a juggle that carries into the wall → wall splat state
- Damage scaling after a wall splat: 70% `[tune]`
- Breakable walls break on a strong hit during a wall splat. **Hard walls** need 2 breaks; a Heat Smash breaks them in 1 `[T8 concept]`
- Breaking plays a short camera cut → fight continues in the next area, opponent knocked down

---

## 7. Throws

| Input | Type | Break |
|---|---|---|
| 1+3 | Left throw | 1 |
| 2+4 | Right throw | 2 |
| Command throw (e.g. uf+1+2) | Command throw | 1+2 |
| From behind | Back throw | Unbreakable |

- Throw startup around i12 `[T8 concept]`; break window 20 frames from the grab `[tune]`
- Throws are high: crouching makes them whiff
- On break both fighters are pushed apart at neutral `[tune]`

---

## 8. Health and gauges

### 8.1 Health
- Max health **190** `[T8 current patch]` — 180 at launch → 200 in the Season 2 emergency patch → 190 in patch 3.02.01. Settings offers 180 / 190 / 200.
- Same health for every fighter.

### 8.2 Recoverable health (white gauge)
- Chip damage (blocking Heat attacks and certain heavy moves) leaves a **white** section on the bar.
- White health is recovered **only by landing hits or getting your attacks blocked**; it never regenerates over time `[T8]`.
- Getting hit while white health remains removes it.

### 8.3 Rage
- Below 25% health a fighter automatically enters Rage `[T8]`: red aura, red health bar, small damage boost (+10% `[tune]`).
- **Rage Art**: `df+1+2` (or the Rage button), once per round.
  - i20, absorbs hits during startup (armor)
  - Damage grows as health drops: 55 → max 82 (values from original frame data examples; tunable)
  - On hit removes the opponent's white health; freezes the timer on activation and on hit
  - Very unsafe on block (about -15)
  - Cinematic camera

### 8.4 Heat system
- Once per round. Heat gauge sits under the health bar `[T8]`.
- **Entering Heat**
  - **Heat Burst**: `2+3` (Heat button). Usable mid-combo; advantage on hit or block `[T8]`. Armor `[tune]` (default: highs/mids until active). Heat lasts **10 s** `[T8]`
  - **Heat Engager**: character-specific moves that enter Heat on hit and auto-dash after the opponent. Heat lasts **15 s** `[T8]`
- **During Heat**
  - Damage +10% `[tune]`, some moves enhanced (`H.` moves per character)
  - Attacks cause **chip damage** even on block → opponent's white health
  - The timer pauses while you are in an attack animation and while the opponent is down `[T8]`
- **Heat-consuming moves**
  - **Heat Smash**: press `2+3` again during Heat → powerful attack, consumes all remaining Heat, triggers wall / floor effects
  - **Heat Dash**: land a Heat Engager during Heat → fast dash to extend combos / carry to the wall, consumes part of Heat
- Heat Engager / Heat Dash on hit also restore some white health.

### 8.5 Timer and rounds
- Round time 60 s `[tune]`, rounds to win 3 `[tune]` (settings 1–5).
- Time over → higher health % wins; equal → draw round.
- When two final blows cross, play **slow motion** (Tekken 8 presentation).
- KO → "K.O." · flawless → "PERFECT" · simultaneous → "DOUBLE K.O."

---

## 9. Face photo feature (core feature)

### 9.1 Flow
```
Face Lab screen
 └ attach a photo (file picker / drag-and-drop / webcam capture)
    └ FaceLandmarker (IMAGE mode) detects faces
       ├ 0 faces  → "No face found" → retry
       ├ 2+ faces → click a face box to choose
       └ 1 face   → continue
    └ yaw check (too far sideways → "Face the camera")
    └ 468 landmarks → warp into canonical face UV space (512×512 texture)
    └ sample skin tone → tint head / neck material
    └ feathered edge mask (alpha gradient)
    └ preview (rotating 3D head)
    └ save → IndexedDB (up to 8 slots, named)
Character select = character + face slot
```

### 9.2 Implementation
1. **Texture (`faceWarp.ts`)**
   - Use the MediaPipe canonical face model's UVs (468 `vt`) and triangle indices.
   - For every triangle, affine-warp the photo's landmark triangle (source) into the canonical UV triangle (target) on a 512×512 canvas (offscreen WebGL preferred; 2D canvas with clipping is acceptable).
   - Result: every photo produces a texture with the same UV layout.
2. **On the head (`faceMaterial.ts`)**
   - Attach the canonical face mesh (468 vertices) as a child of the fighter's `head` bone; fit with per-character `faceAnchor` (offset / scale / rotation) stored in the character JSON.
   - Material: `MeshStandardMaterial` + face texture + alpha mask; the base head is painted in the sampled skin tone.
   - Debug with `canonical_face_model_uv_visualization.png` to catch flipped UVs.
3. **Fallback (Lv1)**: if the mesh mapping fails, crop the face oval and project it with `DecalGeometry` onto the front of the head.

### 9.3 Requirements
- Photos are **never sent anywhere**. Everything runs in the browser.
- `face_landmarker.task` and the wasm files are served locally from `public/` (offline-capable), fetched by `npm run fetch-models`.
- Upload → preview in under 2 s.
- The HUD portrait next to the health bar uses the uploaded face thumbnail.
- (Optional) red flash on the face when hit; bruise overlay as damage accumulates.

---

## 10. Characters

### 10.1 Base model
- Quaternius **Universal Base Characters** (CC0, glTF, "Superhero" proportions) as the body.
- Until assets arrive: capsule primitives (head sphere, torso, limbs) with the same bone names.

### 10.2 Roster (MVP 2 → 4)
| ID | Concept | Style | Traits |
|---|---|---|---|
| `kang` | All-rounder | Karate / boxing | Solid basics, easy i10 / i12 punishes, i15 launcher |
| `seo` | Kick striker | Taekwondo | Long-range kicks, stance switch (left / right foot forward) |
| `bae` | Grappler | Wrestling | Command throws, chain throws, slow but strong |
| `yun` | Speed | Muay Thai / capoeira | Fast movement, low pressure, short range |

### 10.3 Minimum moves per character (MVP)
| Category | Required |
|---|---|
| Jab | `1` (i10, h), `1,2` (i10, h,h) |
| Mid check | `df+1` (i13, m) |
| Low | `d+4` and one more low |
| Punishers | at least one each at i10, i12, i14–15 |
| Launcher | `uf+4` or `df+2` (around i15, very unsafe on block) |
| While standing | `WS+2`, `WS+4` |
| Full crouch | `FC+1`, `FC+4` |
| Sidestep move | `SS+2` (homing) |
| While running | `WR+3` |
| Power crush | 1 |
| Throws | `1+3`, `2+4`, 1 command throw |
| Heat | Heat Burst (shared), 2 Heat Engagers, 1 Heat Smash |
| Rage Art | `R.df+1+2` |
| Strings | two 3–4 hit strings |
| Combo | one basic launcher combo that actually connects with the tuned frame data |

---

## 11. Animation

- Mixamo fighting animations (punches, kicks, guard, hit, down, wake-up) retargeted in Blender to the Quaternius rig → baked glTF.
- **Mixamo files may not be redistributed** → keep them in `public/animations/licensed/` (gitignored). The repo only has the retarget script and a file list.
- CC0 alternatives: Quaternius animation packs, Rokoko's 13 free fight mocap clips.
- Clip naming: `<charId>_<moveId>` (e.g. `kang_df1`); shared clips `common_*`.
- Scale `timeScale` so the clip fits the move's total frames. **Hit timing comes from the JSON.**
- Blending: 4-frame crossfade for movement / guard; attacks start instantly with no blend `[tune]`.

---

## 12. Stages

| ID | Concept | Features |
|---|---|---|
| `dojo` | Infinite stage | No walls, default practice |
| `rooftop` | Rooftop at night | Walls on all sides, one breakable wall → lower floor (balcony break) |
| `gym` | School gym (original) | One floor break, one hard wall |

- Stage data: floor size, wall segments (`breakable`, `hard`), floor-break area, spawn positions for the next area.

---

## 13. Camera and presentation `[tune]`

- Default: side camera looking at the midpoint, perpendicular to the fighters' axis. Distance zoom 3.5–7 m.
- Smoothly follows axis rotation from sidesteps.
- Hitstop: light 2 f, heavy 5 f, counter +3 f.
- Camera shake: heavy hits, wall splats, floor breaks.
- Rage Art / Heat Smash / wall break: dedicated camera cuts.
- Final crossing blows: 0.25× slow-mo for 0.8 s.
- Effects: hit sparks colored by level (high / mid / low), guard sparks, Heat aura (purple), Rage aura (red).

---

## 14. HUD

See `docs/DESIGN.md` and `docs/design/mockups.html` for the visual design.

```
┌──────────────────────────────────────────────────────────────────────┐
│ [face] P1 NAME   ██████████▒▒░░    60    ░░▒▒██████████  NAME P2 [face] │
│                  ▬▬▬ HEAT ▬▬▬     ● ● ○   ▬▬▬ HEAT ▬▬▬                  │
│                                                                        │
│  12 HITS                                            COUNTER            │
│  68 DAMAGE                                          PUNISH             │
└──────────────────────────────────────────────────────────────────────┘
```
- Health bar: yellow (normal) / white (recoverable) / red (Rage); recent damage leaves a short trailing ghost.
- Heat gauge under the bar, drains like a timer when active.
- Round wins (●), center timer.
- Portraits: **uploaded face thumbnails**.
- Practice overlay: input history, last move frames (startup / block / hit), live advantage number, hitbox toggle.

---

## 15. Screens

1. **Title** → 2. **Main menu** (Versus, Versus CPU, Practice, Face Lab, Settings)
3. **Face Lab** — §9 flow, slot management (rename / delete)
4. **Character select** — character grid + face slot + color (2), both players at once
5. **VS screen** — both fighters posed with their faces applied
6. **Fight** → 7. **Results** (winner pose + rematch / character select)
8. **Practice** — dummy behavior (stand / crouch / guard / jump / record & playback), frame display, hitboxes, infinite health
9. **Settings** — key binding, health (180 / 190 / 200), rounds, round time, volume, graphics quality

---

## 16. CPU AI

- State-based: distance (close / mid / far) × situation (plus / minus, opponent down, near wall) → weighted action table.
- Feeds **virtual inputs** through the same input path as a player — no cheating.
- Reaction delay: easy 20 f / normal 12 f / hard 6 f `[tune]`.
- Hard: punishes moves at ≤ -10 on block, crouch-guards lows with some probability.
- Uses the sim RNG (determinism).

---

## 17. Sound

- Hit sounds per level, guard, counter, wall splat, break, slow-mo.
- CC0 sounds only (e.g. Kenney Impact Sounds). No original music or voices.
- Announcer ("Round 1", "Fight", "K.O.") recorded by us or TTS.

---

## 18. Tests and verification

### 18.1 Unit tests (Vitest) — required
- Command parser: `f,f`, `df+1`, `1+2` leniency, `WS` / `FC` / `SS` states, priority
- Frame advantage: `onBlock` / `onHit` → stun → actual advantage matches
- Every combination in the guard table (§5.2)
- Crush and power crush windows
- Juggle gravity and damage scaling
- Gauges: white health creation / recovery / removal, Rage entry (< 25%), Heat timer pauses
- Determinism: replay the same input log twice → identical final state hash

### 18.2 Manual checks (practice mode)
- After blocking `kang`'s `df+1` (-1), the opponent's i10 jab must **not** punish
- After blocking a launcher, an i15 punisher must connect
- Highs whiff on a crouching opponent
- The basic combo connects to the end
- An uploaded face shows correctly on the fighter (no flip / offset)

### 18.3 Performance
- 60 fps in a fight (2 fighters + stage + effects); one sim step under 2 ms.

---

## 19. Milestones

Tracked step by step in `PROGRESS.md`.

| Step | Content | Done when |
|---|---|---|
| M0 | Setup, harness, loop, empty stage | 60 Hz loop + debug overlay |
| M1 | Fighters, movement (walk / dash / backdash / crouch / sidestep), camera | Two fighters face and move around each other |
| M2 | Input buffer & parser, move JSON loader, hit detection, guard | Jab / mid / low guard rules correct, unit tests pass |
| M3 | Hit reactions, launch & juggle, knockdown & wake-up, throws & breaks | Basic combo connects |
| M4 | Health, white health, Rage, Rage Art, full Heat, rounds / timer, HUD | A full match can be played |
| M5 | **Face Lab**: upload → detect → warp → head → save | Fight with your own face |
| M6 | Walls, splats, wall / floor breaks, 2 stages, presentation | Wall break on the rooftop stage |
| M7 | 2 more characters, CPU AI, full practice mode, sound | 4 characters vs CPU |

---

## 20. Definition of done

- [ ] 4 buttons + 8 directions, 2 players on one keyboard + gamepads
- [ ] High / mid / low / throw rules, standing / crouching guard, counter hits, PUNISH display
- [ ] Sidesteps avoid linear moves; homing moves cannot be sidestepped
- [ ] Launcher combos, tailspin, wall splat, wall break, floor break
- [ ] Heat (Burst / Engager / Smash / Dash, chip damage), Rage Art, white health
- [ ] Health 190 default, rounds / time over / KO / double KO
- [ ] Photo upload → face on the fighter and portrait, saved in IndexedDB, nothing uploaded
- [ ] Practice mode frame and hitbox display
- [ ] All unit tests pass; 60 fps in a fight

---

## 21. References

Design brief, system sources, assets and repos: [`docs/REFERENCES.md`](docs/REFERENCES.md).
Visual design system: [`docs/DESIGN.md`](docs/DESIGN.md).
