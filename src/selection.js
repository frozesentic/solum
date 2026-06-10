import * as THREE from 'three';
import { scene, camera, renderer } from './scene.js';
import { state, allGroups, connLines, raycaster, mouse2d } from './state.js';
import { fmtPrice, fmtCap } from './data.js';

// ── Select / deselect ────────────────────────────────────────────────────────
export function selectAsset(group) {
  if (state.selected) {
    state.selected.userData.sphere.material.emissiveIntensity =
      Math.abs(state.selected.userData.asset.chg) * 0.25;
  }
  state.selected = group;
  group.userData.sphere.material.emissiveIntensity = 0.9;
  buildConnections(group);

  const a = group.userData.asset;
  document.getElementById('d-sym').textContent   = a.sym;
  document.getElementById('d-name').textContent  = a.name;
  document.getElementById('d-price').textContent = '$' + fmtPrice(a.price);
  const dc = document.getElementById('d-chg');
  dc.textContent  = `${a.chg >= 0 ? '+' : ''}${a.chg.toFixed(2)}%`;
  dc.className    = `det-chg ${a.chg >= 0 ? 'up' : 'dn'}`;
  document.getElementById('d-cap').textContent    = fmtCap(a.cap);
  document.getElementById('d-type').textContent   = a.type.toUpperCase();
  document.getElementById('d-sector').textContent = a.sector;
  drawSparkline(a);
  document.getElementById('detail').classList.add('on');
}

export function deselectAsset() {
  if (state.selected) {
    state.selected.userData.sphere.material.emissiveIntensity =
      Math.abs(state.selected.userData.asset.chg) * 0.25;
  }
  state.selected = null;
  clearConnections();
  document.getElementById('detail').classList.remove('on');
}

// ── Mouse / click handler ────────────────────────────────────────────────────
export function setupClickHandler() {
  renderer.domElement.addEventListener('click', e => {
    mouse2d.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    raycaster.setFromCamera(mouse2d, camera);
    const hits = raycaster.intersectObjects(allGroups.filter(g => g.visible).map(g => g.userData.sphere));
    if (hits.length) selectAsset(hits[0].object.userData.group);
    else             deselectAsset();
  });
}

// ── Raycast from normalised screen coords (used by gestures) ─────────────────
export function raycastAt(nx, ny) {
  mouse2d.set(nx * 2 - 1, -(ny * 2 - 1));
  raycaster.setFromCamera(mouse2d, camera);
  const hits = raycaster.intersectObjects(allGroups.filter(g => g.visible).map(g => g.userData.sphere));
  return hits.length ? hits[0].object.userData.group : null;
}

// ── Connection lines ─────────────────────────────────────────────────────────
function clearConnections() {
  connLines.forEach(l => scene.remove(l));
  connLines.length = 0;
}

function buildConnections(group) {
  clearConnections();
  const type = group.userData.asset.type;
  allGroups
    .filter(g => g.userData.asset.type === type && g !== group && g.visible)
    .forEach(peer => {
      const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
      const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12 });
      const line = new THREE.Line(geo, mat);
      line.userData.from = group;
      line.userData.to   = peer;
      scene.add(line);
      connLines.push(line);
    });
}

export function updateConnectionPositions() {
  const a = new THREE.Vector3(), b = new THREE.Vector3();
  connLines.forEach(l => {
    l.userData.from.getWorldPosition(a);
    l.userData.to.getWorldPosition(b);
    const pos = l.geometry.attributes.position;
    pos.setXYZ(0, a.x, a.y, a.z);
    pos.setXYZ(1, b.x, b.y, b.z);
    pos.needsUpdate = true;
  });
}

// ── Sparkline chart ──────────────────────────────────────────────────────────
function drawSparkline(asset) {
  const canvas = document.getElementById('sparkline');
  const W = canvas.offsetWidth, H = 38;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);

  const N = 32, data = [];
  let v = asset.price * (1 - asset.chg / 100);
  for (let i = 0; i < N; i++) { v *= 1 + (Math.random() - 0.48) * 0.02; data.push(v); }
  data.push(asset.price);

  const lo = Math.min(...data), hi = Math.max(...data), rng = hi - lo || 1;
  const xOf = i => (i / (data.length - 1)) * W;
  const yOf = v => H - ((v - lo) / rng) * H * 0.82 - H * 0.05;

  const grd = ctx.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, asset.chg >= 0 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');

  ctx.beginPath();
  data.forEach((d, i) => i === 0 ? ctx.moveTo(xOf(i), yOf(d)) : ctx.lineTo(xOf(i), yOf(d)));
  ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
  ctx.fillStyle = grd; ctx.fill();

  ctx.beginPath();
  data.forEach((d, i) => i === 0 ? ctx.moveTo(xOf(i), yOf(d)) : ctx.lineTo(xOf(i), yOf(d)));
  ctx.strokeStyle = asset.chg >= 0 ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1.5; ctx.stroke();
}
