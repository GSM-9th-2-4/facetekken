import * as THREE from 'three';
import { DEBUG } from '../config/tuning';
import { lerpAngle } from '../fight/axis';
import type { FighterState } from '../fight/fighter';

/**
 * Joint names match the future skinned rig (character-builder agent), so hit capsules
 * and the face mount (`head`) keep working when the Quaternius model replaces primitives.
 */
export const JOINTS = [
  'hips',
  'chest',
  'head',
  'upperArm_L',
  'hand_L',
  'upperArm_R',
  'hand_R',
  'thigh_L',
  'foot_L',
  'thigh_R',
  'foot_R',
] as const;
export type JointName = (typeof JOINTS)[number];

export interface FighterView {
  root: THREE.Group;
  joints: Record<JointName, THREE.Object3D>;
  /** Interpolate between previous and current sim state and pose the view. */
  sync(prev: FighterState, curr: FighterState, alpha: number, timeS: number): void;
  dispose(): void;
}

const SKIN = 0xe0ac8a;

/** Primitive fighter: sphere head + capsule limbs. Facing = local +x. */
export function createPrimitiveFighter(color: THREE.ColorRepresentation): FighterView {
  const geoms: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];
  const mat = (c: THREE.ColorRepresentation, rough = 0.6) => {
    const m = new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: 0.1 });
    mats.push(m);
    return m;
  };
  const body = mat(color, 0.55);
  const dark = mat(new THREE.Color(color).multiplyScalar(0.45), 0.7);
  const skin = mat(SKIN, 0.8);

  const capsule = (r: number, len: number, m: THREE.Material) => {
    const g = new THREE.CapsuleGeometry(r, len, 6, 12);
    geoms.push(g);
    const mesh = new THREE.Mesh(g, m);
    mesh.castShadow = true;
    return mesh;
  };
  const joint = (name: JointName, parent: THREE.Object3D, x: number, y: number, z: number) => {
    const o = new THREE.Object3D();
    o.name = name;
    o.position.set(x, y, z);
    parent.add(o);
    return o;
  };

  const root = new THREE.Group();
  root.name = 'fighter';

  const hips = joint('hips', root, 0, 0.95, 0);
  const pelvis = capsule(0.14, 0.12, dark);
  pelvis.rotation.x = Math.PI / 2;
  hips.add(pelvis);

  const chest = joint('chest', hips, 0, 0.32, 0);
  const torso = capsule(0.18, 0.3, body);
  chest.add(torso);

  const head = joint('head', chest, 0, 0.42, 0);
  const headGeo = new THREE.SphereGeometry(0.13, 24, 18);
  geoms.push(headGeo);
  const headMesh = new THREE.Mesh(headGeo, skin);
  headMesh.castShadow = true;
  headMesh.name = 'headMesh';
  head.add(headMesh);
  // Nose marker so facing is readable until faces are mapped (removed in step 7).
  const noseGeo = new THREE.ConeGeometry(0.025, 0.06, 8);
  geoms.push(noseGeo);
  const nose = new THREE.Mesh(noseGeo, skin);
  nose.rotation.z = -Math.PI / 2;
  nose.position.set(0.13, 0, 0);
  head.add(nose);

  // Arms in a guard: forearms point toward the opponent (+x).
  const arm = (side: 1 | -1, upper: JointName, hand: JointName) => {
    const sh = joint(upper, chest, 0.02, 0.2, side * 0.24);
    const up = capsule(0.055, 0.2, body);
    up.position.set(0.04, -0.12, 0);
    up.rotation.z = 0.35;
    sh.add(up);
    const h = joint(hand, sh, 0.22, -0.1, side * -0.06);
    const fore = capsule(0.05, 0.16, skin);
    fore.rotation.z = Math.PI / 2 - 0.5;
    fore.position.set(-0.07, -0.02, 0);
    h.add(fore);
  };
  arm(1, 'upperArm_L', 'hand_L');
  arm(-1, 'upperArm_R', 'hand_R');

  // Legs in a fighting stance: left foot forward.
  const leg = (side: 1 | -1, thigh: JointName, foot: JointName, fwd: number) => {
    const t = joint(thigh, hips, 0, -0.05, side * 0.11);
    const legMesh = capsule(0.075, 0.7, dark);
    legMesh.position.set(fwd / 2, -0.42, 0);
    legMesh.rotation.z = Math.atan2(fwd, 0.85);
    t.add(legMesh);
    const f = joint(foot, t, fwd, -0.86, 0);
    const shoeGeo = new THREE.BoxGeometry(0.22, 0.07, 0.1);
    geoms.push(shoeGeo);
    const shoe = new THREE.Mesh(shoeGeo, dark);
    shoe.position.set(0.05, -0.02, 0);
    shoe.castShadow = true;
    f.add(shoe);
  };
  leg(1, 'thigh_L', 'foot_L', 0.12);
  leg(-1, 'thigh_R', 'foot_R', -0.12);

  const joints = Object.fromEntries(JOINTS.map((n) => [n, root.getObjectByName(n)!])) as Record<
    JointName,
    THREE.Object3D
  >;

  return {
    root,
    joints,
    sync(prev, curr, alpha, timeS) {
      const x = prev.pos.x + (curr.pos.x - prev.pos.x) * alpha;
      const z = prev.pos.z + (curr.pos.z - prev.pos.z) * alpha;
      root.position.set(x, 0, z);
      // Three.js yaw: rotate local +x onto the sim facing direction (sim z = world z).
      root.rotation.y = -lerpAngle(prev.yaw, curr.yaw, alpha);
      // Idle breathing (visual only, not sim state).
      const bob = Math.sin(timeS * 3 + curr.player * 1.3) * DEBUG.IDLE_BOB;
      hips.position.y = 0.95 + bob;
      hips.position.y -= curr.stance === 'crouch' ? 0.35 : 0;
    },
    dispose() {
      root.removeFromParent();
      geoms.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
    },
  };
}
