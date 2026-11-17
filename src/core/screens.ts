/**
 * Minimal screen manager (CLAUDE.md / ui-screens agent).
 * Each screen mounts into the #ui overlay and must clean up everything in unmount().
 */
export interface Screen {
  mount(root: HTMLElement, params?: Record<string, unknown>): void;
  unmount(): void;
}

export class ScreenManager {
  private current: Screen | null = null;
  private readonly screens = new Map<string, Screen>();

  constructor(private readonly root: HTMLElement) {}

  register(id: string, screen: Screen): void {
    this.screens.set(id, screen);
  }

  show(id: string, params?: Record<string, unknown>): void {
    const next = this.screens.get(id);
    if (!next) throw new Error(`Unknown screen: ${id}`);
    this.current?.unmount();
    this.root.replaceChildren();
    this.current = next;
    next.mount(this.root, params);
  }
}
