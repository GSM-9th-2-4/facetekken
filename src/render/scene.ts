import * as THREE from 'three';
import { CAMERA } from '../config/tuning';
import type { Vec2 } from '../fight/fighter';

export interface SceneContext {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  keyLight: THREE.DirectionalLight;
  dispose(): void;
}

export function createScene(canvas: HTMLCanvasElement): SceneContext {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(CAMERA.FOV, 1, 0.1, 200);

  scene.add(new THREE.HemisphereLight(0x9fb4ff, 0x1a1e2c, 0.7));

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
  keyLight.position.set(-3, 6, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  const sc = keyLight.shadow.camera;
  sc.left = -6;
  sc.right = 6;
  sc.top = 6;
  sc.bottom = -6;
  sc.near = 0.5;
  sc.far = 30;
  scene.add(keyLight, keyLight.target);

  const rim = new THREE.DirectionalLight(0xb04bff, 1.2);
  rim.position.set(4, 3, -6);
  scene.add(rim);

  const resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener('resize', resize);

  return {
    renderer,
    scene,
    camera,
    keyLight,
    dispose() {
      window.removeEventListener('resize', resize);
      renderer.dispose();
    },
  };
}

/**
 * Side camera (SPEC §13): looks at the fighters' midpoint, perpendicular to their axis,
 * pulls back as they separate. Exponential smoothing; `snap` jumps directly.
 */
export class FightCamera {
  private readonly pos = new THREE.Vector3();
  private readonly look = new THREE.Vector3();
  private initialized = false;

  constructor(private readonly camera: THREE.PerspectiveCamera) {}

  update(p1: Vec2, p2: Vec2, dt: number, snap = false): void {
    const mx = (p1.x + p2.x) / 2;
    const mz = (p1.z + p2.z) / 2;
    const dx = p2.x - p1.x;
    const dz = p2.z - p1.z;
    const sep = Math.hypot(dx, dz) || 1;
    // Perpendicular to the P1→P2 axis. Camera sits on +n (n = axis rotated +90° on the
    // ground plane) so that looking back along -n, P1 is on screen-left and P2 on screen-right.
    const nx = -dz / sep;
    const nz = dx / sep;
    const dist = THREE.MathUtils.clamp(
      CAMERA.MIN_DISTANCE + sep * CAMERA.DISTANCE_PER_SEPARATION - 1,
      CAMERA.MIN_DISTANCE,
      CAMERA.MAX_DISTANCE,
    );
    const targetPos = new THREE.Vector3(mx + nx * dist, CAMERA.HEIGHT, mz + nz * dist);
    const targetLook = new THREE.Vector3(mx, CAMERA.LOOK_HEIGHT, mz);

    if (snap || !this.initialized) {
      this.pos.copy(targetPos);
      this.look.copy(targetLook);
      this.initialized = true;
    } else {
      const k = 1 - Math.exp(-CAMERA.FOLLOW_SPEED * dt);
      this.pos.lerp(targetPos, k);
      this.look.lerp(targetLook, k);
    }
    this.camera.position.copy(this.pos);
    this.camera.lookAt(this.look);
  }
}
