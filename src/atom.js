import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { scene } from './scene.js';
import { ASSETS, assetRadius, fmtPrice } from './data.js';
import { allGroups, orbitGroups, state } from './state.js';
import { selectAsset } from './selection.js';

const stocks = ASSETS.filter(a => a.type === 'stock');
const crypto = ASSETS.filter(a => a.type === 'crypto');
const etfs   = ASSETS.filter(a => a.type === 'etf');

// Subtle category tints — keep values close to 1 so the look stays professional/monochrome
const TINTS = {
  crypto:  new THREE.Color(1.06, 0.88, 0.58), // warm amber
  ring0:   new THREE.Color(0.62, 0.80, 1.06), // steel blue  — Tech & Semis
  ring1:   new THREE.Color(0.62, 1.06, 0.80), // mint green  — Finance & Commerce
  ring2:   new THREE.Color(1.06, 0.72, 0.72), // soft rose   — Healthcare & Energy
  etf:     new THREE.Color(0.82, 0.70, 1.06), // lavender    — ETFs
};

// Ring accent colors (hex) for orbital torus lines and CSS labels
const RING_HEX = {
  ring0: 0x99BBFF,
  ring1: 0x88FFBB,
  ring2: 0xFF9999,
  etf:   0xBB99FF,
};

function getTint(asset) {
  if (asset.type === 'crypto') return TINTS.crypto;
  if (asset.type === 'etf')    return TINTS.etf;
  return TINTS[`ring${asset.ring}`] ?? new THREE.Color(1, 1, 1);
}

function makeAsset(asset) {
  const r    = assetRadius(asset.cap);
  const group = new THREE.Group();
  const tint  = getTint(asset);

  const b = THREE.MathUtils.clamp(0.55 + asset.chg / 15, 0.3, 0.9);
  // Blend: 82% neutral brightness + 18% category tint
  const col = new THREE.Color(
    THREE.MathUtils.clamp(b * (0.82 + tint.r * 0.18), 0, 1),
    THREE.MathUtils.clamp(b * (0.82 + tint.g * 0.18), 0, 1),
    THREE.MathUtils.clamp(b * (0.82 + tint.b * 0.18), 0, 1),
  );
  const emissiveCol = asset.chg > 0
    ? new THREE.Color(tint.r * 0.07, tint.g * 0.07, tint.b * 0.07)
    : new THREE.Color(0, 0, 0);

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(r, 48, 48),
    new THREE.MeshPhysicalMaterial({
      color:             col,
      emissive:          emissiveCol,
      emissiveIntensity: Math.abs(asset.chg) * 0.25,
      transparent: true, opacity: 0.18,
      roughness: 0.04,   metalness: 0.06,
      transmission: 0.88, thickness: r * 2.2,
      envMapIntensity: 2.5,
      clearcoat: 1, clearcoatRoughness: 0.04,
    })
  );
  group.add(sphere);

  // Wireframe shell
  const wireColor = asset.chg > 0
    ? new THREE.Color(tint.r * 0.8, tint.g * 0.8, tint.b * 0.8)
    : new THREE.Color(0.33, 0.33, 0.33);
  group.add(new THREE.Mesh(
    new THREE.SphereGeometry(r * 1.004, 16, 16),
    new THREE.MeshBasicMaterial({ color: wireColor, wireframe: true, transparent: true, opacity: 0.07 })
  ));

  // Glow ring for movers > 2%
  if (Math.abs(asset.chg) > 2) {
    const ringCol = asset.chg > 0
      ? new THREE.Color(tint.r, tint.g, tint.b)
      : new THREE.Color(0.55, 0.55, 0.55);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r * 1.5, 0.012, 6, 64),
      new THREE.MeshBasicMaterial({
        color: ringCol,
        transparent: true,
        opacity: Math.min(0.5, Math.abs(asset.chg) * 0.07),
      })
    );
    ring.rotation.x = Math.PI * (0.2 + Math.random() * 0.6);
    ring.userData.isRing = true;
    group.add(ring);
  }

  // CSS2D floating label
  const div = document.createElement('div');
  div.className = 'alabel';
  div.innerHTML = `
    <div class="sym">${asset.sym}</div>
    <div class="prc">$${fmtPrice(asset.price)}</div>
    <div class="chg ${asset.chg >= 0 ? 'up' : 'dn'}">${asset.chg >= 0 ? '+' : ''}${asset.chg.toFixed(2)}%</div>`;
  const lbl = new CSS2DObject(div);
  lbl.position.set(0, r + 0.45, 0);
  group.add(lbl);
  div.addEventListener('click', () => selectAsset(group));

  group.userData = { asset, sphere, lbl: div };
  sphere.userData.group = group;
  return group;
}

// Floating ring label (CSS2D) — colored to match the category accent
function makeRingLabel(text, radius, pivot, hexColor) {
  const r = (hexColor >> 16 & 0xff).toString(16).padStart(2, '0');
  const g = (hexColor >>  8 & 0xff).toString(16).padStart(2, '0');
  const b = (hexColor       & 0xff).toString(16).padStart(2, '0');
  const div = document.createElement('div');
  div.style.cssText = `
    font-family: 'JetBrains Mono', monospace;
    font-size: 8px; letter-spacing: 0.18em; color: #${r}${g}${b};
    opacity: 0.55; pointer-events: none; white-space: nowrap; text-transform: uppercase;`;
  div.textContent = text;
  const lbl = new CSS2DObject(div);
  lbl.position.set(radius + 1.5, 0.4, 0);
  pivot.add(lbl);
}

export let coreGlow;

export function buildAtom() {
  // Nucleus core glow
  coreGlow = new THREE.Mesh(
    new THREE.SphereGeometry(3.5, 32, 32),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.35,
      transparent: true, opacity: 0.06, roughness: 0, transmission: 0.96,
    })
  );
  scene.add(coreGlow);

  scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(5.5, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.025 })
  ));
  scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(5.6, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.04 })
  ));

  // Crypto — Fibonacci sphere inside nucleus
  crypto.forEach((asset, i) => {
    const phi   = Math.acos(1 - 2 * (i + 0.5) / crypto.length);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const r     = 2.8 + Math.random() * 1.8;
    const g     = makeAsset(asset);
    g.position.set(r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
    g.userData.basePos  = g.position.clone();
    g.userData.orbitIdx = -1;
    scene.add(g);
    allGroups.push(g);
  });

  // Three tilted stock orbital rings — assets grouped by ring field in data
  const orbitDefs = [
    { radius: 13, tiltX:  Math.PI * 0.28, tiltZ:  Math.PI * 0.08,  speed: 0.045, ringId: 0, label: 'Tech & Semis',       hex: RING_HEX.ring0 },
    { radius: 15, tiltX: -Math.PI * 0.22, tiltZ:  Math.PI * 0.20,  speed: 0.035, ringId: 1, label: 'Finance & Commerce',  hex: RING_HEX.ring1 },
    { radius: 14, tiltX:  Math.PI * 0.12, tiltZ: -Math.PI * 0.28,  speed: 0.055, ringId: 2, label: 'Healthcare & Energy', hex: RING_HEX.ring2 },
  ];

  orbitDefs.forEach((def) => {
    const pivot = new THREE.Group();
    pivot.rotation.x = def.tiltX;
    pivot.rotation.z = def.tiltZ;
    scene.add(pivot);

    pivot.add(new THREE.Mesh(
      new THREE.TorusGeometry(def.radius, 0.018, 4, 128),
      new THREE.MeshBasicMaterial({ color: def.hex, transparent: true, opacity: 0.09 })
    ));

    makeRingLabel(def.label, def.radius, pivot, def.hex);

    const slice = stocks.filter(a => a.ring === def.ringId);
    const assetArr = [];
    slice.forEach((asset, i) => {
      const g = makeAsset(asset);
      pivot.add(g);
      g.userData.orbitRadius = def.radius;
      g.userData.angle       = (i / slice.length) * Math.PI * 2;
      g.userData.orbitSpeed  = def.speed;
      g.userData.orbitIdx    = def.ringId;
      assetArr.push(g);
      allGroups.push(g);
    });

    orbitGroups.push({ pivot, assets: assetArr });
  });

  // Outer ETF orbital ring
  const etfPivot = new THREE.Group();
  etfPivot.rotation.x = Math.PI * 0.08;
  etfPivot.rotation.z = Math.PI * 0.04;
  scene.add(etfPivot);

  etfPivot.add(new THREE.Mesh(
    new THREE.TorusGeometry(22, 0.02, 4, 128),
    new THREE.MeshBasicMaterial({ color: RING_HEX.etf, transparent: true, opacity: 0.09 })
  ));

  makeRingLabel('ETFs', 22, etfPivot, RING_HEX.etf);

  const etfArr = [];
  etfs.forEach((asset, i) => {
    const g = makeAsset(asset);
    etfPivot.add(g);
    g.userData.orbitRadius = 22;
    g.userData.angle       = (i / etfs.length) * Math.PI * 2;
    g.userData.orbitSpeed  = 0.022;
    g.userData.orbitIdx    = 3;
    etfArr.push(g);
    allGroups.push(g);
  });

  orbitGroups.push({ pivot: etfPivot, assets: etfArr });

  document.getElementById('asset-count').textContent = ASSETS.length + ' assets';
}
