# References

Design and implementation references. Original Tekken material is **reference only** — never copy assets into the repo.
Visual design system and mockups: [`DESIGN.md`](DESIGN.md), [`design/mockups.html`](design/mockups.html).

---

## 1. Design brief (paste this when asking for design work)

> Design the UI for "FaceTekken", a 3D fighting game.
> Mood: dark, metallic, high-contrast like Tekken 8. Accents: Heat = purple / magenta neon, Rage = red flames, normal health = yellow, recoverable health = white.
> Type: heavy condensed sans-serif in caps; numbers feel monospaced.
> Key difference: the player's **real uploaded face photo** appears on the fighter and in the portrait → give portraits a large, strong frame so the face stands out.
> Presentation: over-the-top victory poses and cut-ins, JoJo-style dramatic poses and sound-effect lettering (ゴゴゴ).
>
> Screens: 1) Fight HUD 2) Face Lab 3) Character select 4) VS screen 5) Results 6) Practice overlay.

---

## 2. Battle system (Tekken 8)

| Topic | Link | What to take from it |
|---|---|---|
| Official controls / systems | https://en.bandainamcoent.eu/node/8490 | 1–4 buttons, 1+3 / 2+4 throws, Heat Burst / Smash, Rage Art |
| Official battle system details | https://en.bandainamcoent.eu/node/8637 | Recoverable gauge, chip damage, Rage Art effects |
| Frame data database | https://tekkendocs.com/t8/framedata | 60 fps; -10 on block = punishable by i10 |
| Per-character frame data example | https://tekkendocs.com/t8/jin | How Rage Art (i20, -15), throw breaks, floor-break properties are written → move JSON design |
| Heat system summary | https://gameleap.com/articles/tekken-8-heat-system-explained-everything-you-need-to-know | Burst 2+3 / 10 s, Engager 15 s |
| Heat preview (timer pauses) | https://gamespot.com/articles/tekken-8-hands-on-preview-shows-evolved-core-fighting-systems-that-bring-the-heat/1100-6512772/ | Timer pauses during attacks / opponent down, chip damage |
| Battle system overview | https://pcgamer.com/heres-a-detailed-look-at-tekken-8s-new-battle-system | White gauge only recovers by attacking |
| Health / Rage 25% | https://esports.gg/guides/tekken-8/health-in-tekken-8-explained | Same health for all, Rage below 25% |
| Health patch history | https://dotesports.com/tekken/guides/tekken-8-patch-3-02-01-notes | 180 → 200 → 190 |
| Notation | https://tekken.fandom.com/wiki/Move_Terminology | SS, WS, FC, `~`, `:` |
| Wall breaks / hard walls | https://breezewiki.discard.no/tekken/wiki/Wall_Break | Hard walls need 2 hits, Heat Smash breaks in 1 |
| Frame data primer | https://esports.gg/guides/tekken-8/tekken-8-frame-data-beginners-guide/ | Plus / minus frames |

---

## 3. Visual / presentation

| Topic | Link | What to take from it |
|---|---|---|
| JoJo references in Tekken 7 (Reddit) | https://www.reddit.com/r/Tekken/comments/6g25wq/when_tekken_7_has_jojo_references/ | Victory pose / dramatic presentation ideas |
| Tekken 8 review (presentation) | https://www.avclub.com/tekken-8-packs-a-punch-with-maximalist-storytelling-and-frenetic-fights | Camera zooms, sparks, slow-mo on decisive crossing blows |
| Tekken 8 HUD changes | https://gamerbraves.com/?p=155515 | How the Heat gauge is shown |
| Tekken 8 review (auras) | https://www.cgmagonline.com/review/tekken-8-xbox-series-x-review/ | Purple Heat aura, red flaming Rage health bar |

> Use official screenshots in those articles for visual reference only. Do not commit them.

---

## 4. Face mapping (Face Lab)

| Topic | Link | What to take from it |
|---|---|---|
| **MediaPipe + three.js textured face mesh tutorial** | https://tympanus.net/codrops/2026/09/06/building-a-real-time-3d-face-mask-with-mediapipe-threlte-and-three-js/ | Canonical face OBJ (468 vertices / UVs), UV debug texture — **main reference for SPEC §9** |
| FaceLandmarker web guide | https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker/web_js | `@mediapipe/tasks-vision`, IMAGE mode |
| MediaPipe Face Mesh docs | https://github.com/google-ai-edge/mediapipe/blob/master/docs/solutions/face_mesh.md | Canonical model, face transform matrix |
| drei Facemesh / FaceLandmarker | https://drei.docs.pmnd.rs/shapes/facemesh | Hosting model / wasm locally |

---

## 5. Assets

| Kind | Link | License / notes |
|---|---|---|
| Base fighters | https://quaternius.com/packs/universalbasecharacters.html | CC0, glTF, "Superhero" proportions |
| Free rigged characters overview | https://app.cinevva.com/guides/free-rigged-3d-character-models | KayKit / 100 Avatars (CC0, Mixamo-compatible) alternatives |
| Fighting animations | https://www.mixamo.com | Free, **no redistribution** → never commit |
| Free fight mocap | https://www.rokoko.com/es/resources/rokoko-mocap-13-free-fight-animations | 13 free clips |
| Mixamo → three.js playback | https://discourse.threejs.org/t/mixamo-fbx-animation/73390 | AnimationMixer pitfalls |

---

## 6. Open-source references

| Repo | What to take from it |
|---|---|
| https://github.com/straightcurve/fighting-game-prototype | three.js + TypeScript + Vite fighting game structure |
| https://github.com/SunGj921028/3DFightingGame | WebGL2 3D fighting game |
| https://github.com/GSM-9th-2-4/facekart | Our own harness origin; face pipeline approach |
