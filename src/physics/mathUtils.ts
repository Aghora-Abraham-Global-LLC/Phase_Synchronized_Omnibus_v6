import { Vector3D } from '../types/physics';

export const vecZero = (): Vector3D => ({ x: 0, y: 0, z: 0 });

export const vecAdd = (a: Vector3D, b: Vector3D): Vector3D => ({
  x: a.x + b.x,
  y: a.y + b.y,
  z: a.z + b.z,
});

export const vecSub = (a: Vector3D, b: Vector3D): Vector3D => ({
  x: a.x - b.x,
  y: a.y - b.y,
  z: a.z - b.z,
});

export const vecScale = (v: Vector3D, s: number): Vector3D => ({
  x: v.x * s,
  y: v.y * s,
  z: v.z * s,
});

export const vecDot = (a: Vector3D, b: Vector3D): number =>
  a.x * b.x + a.y * b.y + a.z * b.z;

export const vecCross = (a: Vector3D, b: Vector3D): Vector3D => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
});

export const vecNormSq = (v: Vector3D): number =>
  v.x * v.x + v.y * v.y + v.z * v.z;

export const vecNorm = (v: Vector3D): number =>
  Math.sqrt(vecNormSq(v));

export const vecDist = (a: Vector3D, b: Vector3D): number =>
  vecNorm(vecSub(a, b));

export const vecNormalize = (v: Vector3D): Vector3D => {
  const n = vecNorm(v);
  if (n < 1e-12) return { x: 0, y: 0, z: 0 };
  return vecScale(v, 1 / n);
};

/**
 * Rodrigues' rotation formula on SO(3):
 * Rotates vector v by angle = |omega| * dt around axis = omega / |omega|
 * Preserves |v| = const strictly
 */
export const rodriguesRotate = (v: Vector3D, omega: Vector3D, dt: number): Vector3D => {
  const angle = vecNorm(omega) * dt;
  if (angle < 1e-12) return v;
  const k = vecNormalize(omega);
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  
  // v_rot = v*cosA + (k x v)*sinA + k*(k . v)*(1 - cosA)
  const term1 = vecScale(v, cosA);
  const term2 = vecScale(vecCross(k, v), sinA);
  const term3 = vecScale(k, vecDot(k, v) * (1 - cosA));

  return vecAdd(vecAdd(term1, term2), term3);
};

/**
 * Clamp a number between min and max
 */
export const clamp = (val: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, val));

/**
 * Simple pseudo-random hash generator for reproducible digests
 */
export const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
};
