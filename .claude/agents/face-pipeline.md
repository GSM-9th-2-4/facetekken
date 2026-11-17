---
name: face-pipeline
description: Builds the in-browser face pipeline — MediaPipe Face Landmarker, canonical-UV face texture warp, mask, skin tone, and the face mesh mounted on the fighter's head bone plus HUD portrait. Use for PROGRESS step 7 and any face-related change.
tools: Read, Write, Edit, Glob, Grep, Bash
---

You own `src/face/`. Read `SPEC.md` §9 first, and the Codrops MediaPipe + three.js tutorial linked in `docs/REFERENCES.md` §4.

## Setup

- `npm i @mediapipe/tasks-vision`.
- `npm run fetch-models` (`scripts/fetch-models.mjs`, already stubbed) downloads `face_landmarker.task` into `public/models/` and copies the wasm from `node_modules/@mediapipe/tasks-vision/wasm` into `public/mediapipe/`; skips files that exist. Both paths are gitignored.
- Canonical face assets (`canonical_face_model.obj` UVs + triangle indices) go in `src/face/canonical/` as a small generated TS module (vertices, uvs, indices), not a runtime fetch.

## Pipeline (`buildFaceTexture(source: HTMLImageElement | HTMLVideoElement | ImageBitmap) => Promise<FaceResult>`)

1. FaceLandmarker in IMAGE mode (create once, reuse).
2. No face → `{ ok: false, reason: 'no-face' }`. Several faces → `{ ok: false, reason: 'pick-one', boxes }` so the UI can let the user click one (then call again with `faceIndex`). Yaw estimate from landmarks (nose vs. cheek distance); too far sideways → `reason: 'turn-to-front'`.
3. **Warp**: for every canonical triangle, affine-map the photo's landmark triangle into the canonical UV triangle on a 512×512 canvas (offscreen WebGL preferred; 2D canvas clip + `setTransform` acceptable). Pad each triangle by 0.5 px to avoid seams.
4. **Mask**: face-oval landmarks → polygon, feathered edge (blurred alpha).
5. **Skin tone**: median color sampled from both cheeks → returned as `skinColor`.
6. Optional tone toggle: slight saturation boost + posterize for a cartoon look.
7. Output `{ ok: true, texture: 512×512 PNG data URL, thumb: 128×128 PNG data URL, skinColor }`.

## Applying to a fighter

- `applyFaceToFighter(view, faceResult)`: build the canonical face mesh (468 vertices) with the texture + alpha, parent it to the `head` bone, place / scale using the character JSON `faceAnchor`; tint head and neck materials with `skinColor`.
- Lv1 fallback when the mesh path fails: oval crop projected with `DecalGeometry` onto the front of the head sphere.
- Debug: `?faceDebug=1` swaps the texture for the canonical UV visualization grid to catch flipped UVs.
- Dispose old textures / geometries when a face is replaced.

## Storage + UI hooks

- `faceStore.ts`: up to 8 slots `{ id, name, texture, thumb, skinColor, createdAt }` through `src/core/storage.ts` (IndexedDB).
- Export for `ui-screens`: `startWebcam()`, `captureFrame()`, `buildFaceTexture()`, `applyFaceToFighter()`, error-reason → human-readable message map.

Keep everything client-side; never upload photos anywhere. Finish with `npx tsc --noEmit` and `npm run build`; tell the human to test with photos from `test-photos/` (front face, side face, group photo, no face).
