import { FRAME_MS, SIM } from '../config/tuning';

/**
 * Fixed-step accumulator (SPEC §2.1). Pure logic so it can be unit tested;
 * `startLoop` wires it to requestAnimationFrame.
 */
export class FixedStepClock {
  private accumulator = 0;
  /** Multiplier for slow-mo (0.25) / pause (0). Hitstop is handled in the sim, not here. */
  timeScale = 1;

  constructor(
    private readonly stepMs: number = FRAME_MS,
    private readonly maxSteps: number = SIM.MAX_STEPS_PER_FRAME,
  ) {}

  /** Feed real elapsed ms. Returns how many sim steps to run and the interpolation alpha (0..1). */
  advance(elapsedMs: number): { steps: number; alpha: number } {
    if (!Number.isFinite(elapsedMs) || elapsedMs < 0) elapsedMs = 0;
    this.accumulator += elapsedMs * this.timeScale;
    // Epsilon: summing many 1/144 s frames lands at 59.9999… steps; don't lose a sim frame to FP error.
    let steps = Math.floor(this.accumulator / this.stepMs + 1e-6);
    if (steps > this.maxSteps) {
      // Drop the backlog instead of trying to catch up forever.
      steps = this.maxSteps;
      this.accumulator = 0;
    } else {
      this.accumulator = Math.max(0, this.accumulator - steps * this.stepMs);
    }
    return { steps, alpha: this.accumulator / this.stepMs };
  }

  reset(): void {
    this.accumulator = 0;
  }
}

export interface LoopHandlers {
  /** One fixed 60 Hz simulation step. */
  step(): void;
  /** Render with interpolation alpha between the previous and current sim state. */
  render(alpha: number, dtSeconds: number): void;
}

/** Starts the rAF loop. Returns a stop function. */
export function startLoop(handlers: LoopHandlers, clock = new FixedStepClock()): () => void {
  let last = performance.now();
  let raf = 0;
  let running = true;

  const tick = (now: number) => {
    if (!running) return;
    const elapsed = Math.min(now - last, 250);
    last = now;
    const { steps, alpha } = clock.advance(elapsed);
    for (let i = 0; i < steps; i++) handlers.step();
    handlers.render(alpha, elapsed / 1000);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  const onVisibility = () => {
    // Avoid a huge jump after the tab was hidden.
    last = performance.now();
    clock.reset();
  };
  document.addEventListener('visibilitychange', onVisibility);

  return () => {
    running = false;
    cancelAnimationFrame(raf);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
