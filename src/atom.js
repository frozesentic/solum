import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { scene } from './scene.js';
import { ASSETS, assetRadius, fmtPrice } from './data.js';
import { allGroups, orbitGroups, state } from './state.js';
import { selectAsset } from './selection.js';

const stocks = ASSETS.filter(a => a.type === 'stock');
const crypto = ASSETS.filter(a => a.type === 'crypto');
const etfs   = ASSETS.filter(a => a.type === 'etf');

function makeAsset(asset) {
  const r     = assetRadius(asset.cap);
  const group = new THREE.Group();

  const brightness = THREE.MathUtils.clamp(0.55 + asset.chg / 15, 0.3, 0.9);
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(r, 48, 48),
    new THREE.MeshPhysicalMaterial({
      color:             new THREE.Color(brightness, brightness, brightness),
      emissive:          asset.chg > 0 ? new THREE.Color(0.06, 0.06, 0.06) : new THREE.Color(0, 0, 0),
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
  group.add(new THREE.Mesh(
    new THREE.SphereGeometry(r * 1.004, 16, 16),
    new THREE.MeshBasicMaterial({ color: asset.chg > 0 ? 0xffffff : 0x555555, wireframe: true, transparent: true, opacity: 0.06 })
  ));

  // Glow ring for movers > 2%
  if (Math.abs(asset.chg) > 2) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r * 1.5, 0.012, 6, 64),
      new THREE.MeshBasicMaterial({
        color: asset.chg > 0 ? 0xffffff : 0x888888,
        transparent: true,
        opacity: Math.min(0.45, Math.abs(asset.chg) * 0.07),
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

// Floating ring label (CSS2D, placed at the 12-o'clock position of the torus)
function makeRingLabel(text, radius, pivot) {
  const div = document.createElement('div');
  div.style.cssText = `
    font-family: 'JetBrains Mono', monospace;
    font-size: 8px; letter-spacing: 0.18em; color: rgba(255,255,255,0.22);
    pointer-events: none; white-space: nowrap; text-transform: uppercase;`;
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
    { radius: 13, tiltX:  Math.PI * 0.28, tiltZ:  Math.PI * 0.08,  speed: 0.045, ringId: 0, label: 'Tech & Semis'          },
    { radius: 15, tiltX: -Math.PI * 0.22, tiltZ:  Math.PI * 0.20,  speed: 0.035, ringId: 1, label: 'Finance & Commerce'     },
    { radius: 14, tiltX:  Math.PI * 0.12, tiltZ: -Math.PI * 0.28,  speed: 0.055, ringId: 2, label: 'Healthcare & Energy'    },
  ];

  orbitDefs.forEach((def) => {
    const pivot = new THREE.Group();
    pivot.rotation.x = def.tiltX;
    pivot.rotation.z = def.tiltZ;
    scene.add(pivot);

    pivot.add(new THREE.Mesh(
      new THREE.TorusGeometry(def.radius, 0.018, 4, 128),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.055 })
    ));

    makeRingLabel(def.label, def.radius, pivot);

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
    new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.045 })
  ));

  makeRingLabel('ETFs', 22, etfPivot);

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
