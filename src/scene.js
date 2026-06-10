import * as THREE from 'three';
import { CSS2DRenderer }  from 'three/addons/renderers/CSS2DRenderer.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }     from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass }from 'three/addons/postprocessing/UnrealBloomPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// ── Renderer ────────────────────────────────────────────────────────────────
export const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.85;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.domElement.style.cssText = 'position:fixed;inset:0;';
document.body.appendChild(renderer.domElement);

// ── CSS2D label renderer ────────────────────────────────────────────────────
export const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;';
document.body.appendChild(labelRenderer.domElement);

// ── Scene & camera ──────────────────────────────────────────────────────────
export const scene  = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 500);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment()).texture;

// ── Post-processing ─────────────────────────────────────────────────────────
export const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.55, 0.35, 0.78
));

// ── Lighting ────────────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const key = new THREE.DirectionalLight(0xffffff, 1.2);
key.position.set(12, 20, 10);
scene.add(key);
const rim = new THREE.DirectionalLight(0x8888ff, 0.4);
rim.position.set(-15, -8, -12);
scene.add(rim);

// ── Background stars ────────────────────────────────────────────────────────
const _starPos = new Float32Array(4000 * 3);
for (let i = 0; i < 4000; i++) {
  const r  = 60 + Math.random() * 120;
  const th = Math.random() * Math.PI * 2;
  const ph = Math.acos(2 * Math.random() - 1);
  _starPos[i*3]   = r * Math.sin(ph) * Math.cos(th);
  _starPos[i*3+1] = r * Math.cos(ph);
  _starPos[i*3+2] = r * Math.sin(ph) * Math.sin(th);
}
const _starGeo = new THREE.BufferGeometry();
_starGeo.setAttribute('position', new THREE.BufferAttribute(_starPos, 3));
export const stars = new THREE.Points(
  _starGeo,
  new THREE.PointsMaterial({ color: 0xffffff, size: 0.07, transparent: true, opacity: 0.3 })
);
scene.add(stars);

// ── Resize handler ──────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});
