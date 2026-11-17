import * as THREE from 'three';

export interface StageData {
  id: string;
  name: string;
  theme: { ground: string; sky: string; fog: string; light: string };
  infinite: boolean;
  areas: {
    id: string;
    floor: { width: number; depth: number };
    walls: { from: [number, number]; to: [number, number]; type: 'normal' | 'breakable' | 'hard'; nextArea?: string }[];
    floorBreak: unknown;
    spawn: { p1: [number, number]; p2: [number, number] };
  }[];
  scenery: { kind: string; count: number }[];
}

export interface StageView {
  data: StageData;
  root: THREE.Group;
  dispose(): void;
}

const stageModules = import.meta.glob<StageData>('../data/stages/*.json', { eager: true, import: 'default' });

export function listStages(): StageData[] {
  return Object.values(stageModules);
}

export function getStage(id: string): StageData {
  const s = listStages().find((x) => x.id === id);
  if (!s) throw new Error(`Unknown stage "${id}". Available: ${listStages().map((x) => x.id).join(', ')}`);
  return s;
}

/** Step 1: floor + grid + sky color. Walls / breaks arrive in step 8 (stage-builder). */
export function buildStage(scene: THREE.Scene, data: StageData): StageView {
  const root = new THREE.Group();
  root.name = `stage:${data.id}`;
  const disposables: { dispose(): void }[] = [];

  scene.background = new THREE.Color(data.theme.sky);
  scene.fog = new THREE.Fog(data.theme.fog, 12, 45);

  const area = data.areas[0];
  if (!area) throw new Error(`Stage "${data.id}" has no areas`);
  const floorGeo = new THREE.PlaneGeometry(area.floor.width, area.floor.depth);
  const floorMat = new THREE.MeshStandardMaterial({ color: data.theme.ground, roughness: 0.85, metalness: 0.05 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  root.add(floor);
  disposables.push(floorGeo, floorMat);

  const grid = new THREE.GridHelper(Math.max(area.floor.width, area.floor.depth), 40, 0x8a93a6, 0x3a4058);
  const gridMat = grid.material as THREE.Material;
  gridMat.transparent = true;
  gridMat.opacity = 0.25;
  grid.position.y = 0.002;
  root.add(grid);
  disposables.push(grid.geometry, gridMat);

  scene.add(root);
  return {
    data,
    root,
    dispose() {
      root.removeFromParent();
      disposables.forEach((d) => d.dispose());
    },
  };
}
