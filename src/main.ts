import './ui/styles.css';
import { startLoop } from './core/loop';
import { cloneMatch, createMatch, stepMatch } from './fight/match';
import { createPrimitiveFighter } from './render/character';
import { FightCamera, createScene } from './render/scene';
import { buildStage, getStage } from './stage/stage';
import { DebugOverlay } from './ui/debugOverlay';

const canvas = document.querySelector<HTMLCanvasElement>('#game');
const ui = document.querySelector<HTMLDivElement>('#ui');
if (!canvas || !ui) throw new Error('index.html must contain #game and #ui');

const params = new URLSearchParams(location.search);
const stageId = params.get('stage') ?? 'dojo';

const ctx = createScene(canvas);
const stage = buildStage(ctx.scene, getStage(stageId));

const p1View = createPrimitiveFighter(0x2f8cff);
const p2View = createPrimitiveFighter(0xff3b5c);
ctx.scene.add(p1View.root, p2View.root);

const fightCam = new FightCamera(ctx.camera);
const debug = new DebugOverlay(ui);

const hint = document.createElement('div');
hint.className = 'hint';
hint.textContent = 'Step 1 scaffold — F1: debug overlay';
ui.appendChild(hint);

let match = createMatch({ p1Character: 'kang', p2Character: 'seo', seed: 1 });
let prev = cloneMatch(match);
let timeS = 0;
fightCam.update(match.fighters[0].pos, match.fighters[1].pos, 0, true);

const stop = startLoop({
  step() {
    prev = cloneMatch(match);
    stepMatch(match);
  },
  render(alpha, dt) {
    timeS += dt;
    p1View.sync(prev.fighters[0], match.fighters[0], alpha, timeS);
    p2View.sync(prev.fighters[1], match.fighters[1], alpha, timeS);
    fightCam.update(match.fighters[0].pos, match.fighters[1].pos, dt);
    ctx.renderer.render(ctx.scene, ctx.camera);
    debug.update(match, dt);
  },
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    stop();
    debug.dispose();
    p1View.dispose();
    p2View.dispose();
    stage.dispose();
    ctx.dispose();
  });
}

// Exposed for console debugging only.
(window as unknown as { __facetekken: unknown }).__facetekken = {
  get match() {
    return match;
  },
  reset() {
    match = createMatch({ p1Character: 'kang', p2Character: 'seo', seed: 1 });
    prev = cloneMatch(match);
  },
};
