/**
 * Cycle jour/nuit : ciel dégradé, soleil (avec ombres), lumière ambiante,
 * brouillard, étoiles. L'heure (0-24) est la seule entrée.
 *
 * Pour retoucher l'ambiance d'une heure : modifie KEYFRAMES ci-dessous.
 */
import * as THREE from 'three';
import { RENDER, CAMERA } from '../config/gameConfig';
import { lerp } from '../core/math';

interface Key {
  h: number;
  top: number;
  horizon: number;
  sun: number;
  sunI: number;
  hemiI: number;
}

const KEYFRAMES: Key[] = [
  { h: 0, top: 0x0b1530, horizon: 0x1c2a4d, sun: 0x8fa8ff, sunI: 0.35, hemiI: 0.45 },
  { h: 5, top: 0x13204a, horizon: 0x2c3b66, sun: 0x8fa8ff, sunI: 0.35, hemiI: 0.5 },
  { h: 6.3, top: 0x4a6aa8, horizon: 0xf3a77a, sun: 0xffb27a, sunI: 0.9, hemiI: 0.75 },
  { h: 8, top: 0x5aa0e6, horizon: 0xcfe6f5, sun: 0xfff1d6, sunI: 1.6, hemiI: 1.0 },
  { h: 13, top: 0x3d8fe0, horizon: 0xd8eef8, sun: 0xffffff, sunI: 1.9, hemiI: 1.1 },
  { h: 17.5, top: 0x4c92dc, horizon: 0xe6eef0, sun: 0xfff0d0, sunI: 1.7, hemiI: 1.0 },
  { h: 19.3, top: 0x6a7fc0, horizon: 0xffb072, sun: 0xffa060, sunI: 1.3, hemiI: 0.85 },
  { h: 20.6, top: 0x3a3f7a, horizon: 0xd9707a, sun: 0xff8060, sunI: 0.7, hemiI: 0.65 },
  { h: 22, top: 0x0f1a3a, horizon: 0x26355e, sun: 0x8fa8ff, sunI: 0.35, hemiI: 0.5 },
  { h: 24, top: 0x0b1530, horizon: 0x1c2a4d, sun: 0x8fa8ff, sunI: 0.35, hemiI: 0.45 },
];

const SKY_VERT = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
const SKY_FRAG = /* glsl */ `
uniform vec3 uTop; uniform vec3 uHorizon; uniform vec3 uSunDir; uniform vec3 uSunColor;
varying vec3 vDir;
void main() {
  float t = clamp(vDir.y * 1.6 + 0.05, 0.0, 1.0);
  vec3 col = mix(uHorizon, uTop, pow(t, 0.7));
  float s = max(dot(normalize(vDir), uSunDir), 0.0);
  col += uSunColor * (pow(s, 600.0) * 1.5 + pow(s, 12.0) * 0.18);
  gl_FragColor = vec4(col, 1.0);
}`;

export class DayNight {
  readonly sun = new THREE.DirectionalLight(0xffffff, 1.5);
  readonly hemi = new THREE.HemisphereLight(0xcfe8ff, 0x4f7a3a, 1);
  readonly sky: THREE.Mesh;
  readonly stars: THREE.Points;
  readonly group = new THREE.Group();
  /** 0 = nuit noire, 1 = plein jour (sert à l'eau, aux fenêtres éclairées…). */
  daylight = 1;
  readonly sunDir = new THREE.Vector3();
  private skyMat: THREE.ShaderMaterial;
  private fogColor = new THREE.Color();

  constructor(private scene: THREE.Scene) {
    this.skyMat = new THREE.ShaderMaterial({
      vertexShader: SKY_VERT,
      fragmentShader: SKY_FRAG,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        uTop: { value: new THREE.Color() },
        uHorizon: { value: new THREE.Color() },
        uSunDir: { value: new THREE.Vector3(0, 1, 0) },
        uSunColor: { value: new THREE.Color() },
      },
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(CAMERA.FAR * 0.9, 24, 12), this.skyMat);
    this.sky.renderOrder = -1;
    this.sky.frustumCulled = false;

    const starPos = new Float32Array(600 * 3);
    for (let i = 0; i < 600; i++) {
      const v = new THREE.Vector3(Math.random() - 0.5, Math.random() * 0.9 + 0.1, Math.random() - 0.5).normalize().multiplyScalar(CAMERA.FAR * 0.85);
      starPos.set([v.x, v.y, v.z], i * 3);
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    this.stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false, transparent: true, fog: false }));
    this.stars.frustumCulled = false;

    this.sun.castShadow = RENDER.SHADOWS;
    this.sun.shadow.mapSize.set(RENDER.SHADOW_MAP_SIZE, RENDER.SHADOW_MAP_SIZE);
    const r = RENDER.SHADOW_RANGE;
    Object.assign(this.sun.shadow.camera, { left: -r, right: r, top: r, bottom: -r, near: 1, far: 400 });
    this.sun.shadow.bias = -0.0008;
    this.sun.shadow.normalBias = 0.04;

    this.group.add(this.sky, this.stars, this.sun, this.sun.target, this.hemi);
    scene.add(this.group);
    scene.fog = new THREE.Fog(0xcfe6f5, RENDER.FOG_NEAR, RENDER.FOG_FAR);
  }

  /** @param hour 0-24  @param focus position du joueur (centre des ombres) */
  update(hour: number, focus: THREE.Vector3, camera: THREE.Camera) {
    const k = sample(hour);
    // Soleil : se lève à l'est (+X) vers 6h, culmine au sud vers 13h, se couche à l'ouest vers 21h
    const t = (hour - 6) / 15; // 0 → 1 pendant la journée
    const elev = Math.sin(Math.PI * Math.min(Math.max(t, 0), 1)) * 1.05;
    const az = Math.PI * t; // +X (est) → +Z (sud) → -X (ouest)
    const isDay = t > 0 && t < 1;
    if (isDay) this.sunDir.set(Math.cos(az) * Math.cos(elev), Math.max(0.12, Math.sin(elev)), Math.sin(az) * Math.cos(elev)).normalize();
    else this.sunDir.set(-0.3, 0.8, -0.4).normalize(); // "lune"

    this.daylight = isDay ? Math.min(1, Math.sin(Math.PI * t) * 3) : 0;

    this.sun.color.set(k.sun);
    this.sun.intensity = k.sunI;
    this.hemi.intensity = k.hemiI;
    this.hemi.color.set(k.top).lerp(WHITE, 0.5);
    this.sun.position.copy(focus).addScaledVector(this.sunDir, 150);
    this.sun.target.position.copy(focus);
    this.sun.target.updateMatrixWorld();

    this.skyMat.uniforms.uTop.value.set(k.top);
    this.skyMat.uniforms.uHorizon.value.set(k.horizon);
    this.skyMat.uniforms.uSunDir.value.copy(this.sunDir);
    this.skyMat.uniforms.uSunColor.value.set(isDay ? k.sun : 0x000000);
    this.sky.position.copy(camera.position);
    this.stars.position.copy(camera.position);
    (this.stars.material as THREE.PointsMaterial).opacity = 1 - Math.min(1, this.daylight * 2);

    this.fogColor.set(k.horizon);
    (this.scene.fog as THREE.Fog).color.copy(this.fogColor);
  }
}

const WHITE = new THREE.Color(0xffffff);
const cA = new THREE.Color();
const cB = new THREE.Color();
const out: Key = { h: 0, top: 0, horizon: 0, sun: 0, sunI: 0, hemiI: 0 };
/** Interpole les KEYFRAMES pour une heure donnée (réutilise un objet : pas d'allocation). */
function sample(hour: number): Key {
  const h = ((hour % 24) + 24) % 24;
  let i = 0;
  while (i < KEYFRAMES.length - 2 && KEYFRAMES[i + 1].h <= h) i++;
  const a = KEYFRAMES[i];
  const b = KEYFRAMES[i + 1];
  const t = (h - a.h) / (b.h - a.h || 1);
  const mix = (x: number, y: number) => cA.set(x).lerp(cB.set(y), t).getHex();
  out.h = h;
  out.top = mix(a.top, b.top);
  out.horizon = mix(a.horizon, b.horizon);
  out.sun = mix(a.sun, b.sun);
  out.sunI = lerp(a.sunI, b.sunI, t);
  out.hemiI = lerp(a.hemiI, b.hemiI, t);
  return out;
}
