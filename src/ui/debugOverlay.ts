import type { MatchState } from '../fight/match';

/** F1 debug overlay (SPEC §2 / fight-engine agent). Reuses one <pre>; updates text only. */
export class DebugOverlay {
  private readonly el: HTMLPreElement;
  private visible = false;
  private fps = 0;
  private fpsAcc = 0;
  private fpsFrames = 0;
  private lastText = '';
  private readonly onKey = (e: KeyboardEvent) => {
    if (e.code === 'F1') {
      e.preventDefault();
      this.toggle();
    }
  };

  constructor(parent: HTMLElement) {
    this.el = document.createElement('pre');
    this.el.className = 'debug-overlay';
    this.el.hidden = true;
    parent.appendChild(this.el);
    window.addEventListener('keydown', this.onKey);
  }

  toggle(): void {
    this.visible = !this.visible;
    this.el.hidden = !this.visible;
  }

  update(s: MatchState, dt: number): void {
    this.fpsAcc += dt;
    this.fpsFrames++;
    if (this.fpsAcc >= 0.5) {
      this.fps = Math.round(this.fpsFrames / this.fpsAcc);
      this.fpsAcc = 0;
      this.fpsFrames = 0;
    }
    if (!this.visible) return;
    const f = (i: 0 | 1) => {
      const x = s.fighters[i];
      return (
        `P${i + 1} ${x.characterId.padEnd(5)} ${x.stance.padEnd(6)} move=${x.moveId ?? '-'} ` +
        `f=${x.stateFrame} hp=${x.health}/${x.maxHealth} pos=(${x.pos.x.toFixed(2)}, ${x.pos.z.toFixed(2)}) ` +
        `yaw=${((x.yaw * 180) / Math.PI).toFixed(0)}°`
      );
    };
    const text =
      `frame ${s.frame}   render ${this.fps} fps   round ${s.round}   time ${Math.ceil(s.timerFrames / 60)}\n` +
      `${f(0)}\n${f(1)}`;
    if (text !== this.lastText) {
      this.el.textContent = text;
      this.lastText = text;
    }
  }

  dispose(): void {
    window.removeEventListener('keydown', this.onKey);
    this.el.remove();
  }
}
