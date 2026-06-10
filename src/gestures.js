import * as THREE from 'three';
import { camera } from './scene.js';
import { CAM, state } from './state.js';
import { selectAsset, raycastAt } from './selection.js';

// ── Full-screen cursor overlay ───────────────────────────────────────────────
const cursorCvs = document.createElement('canvas');
cursorCvs.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:45;';
cursorCvs.width  = window.innerWidth;
cursorCvs.height = window.innerHeight;
document.body.appendChild(cursorCvs);
const cursorCtx = cursorCvs.getContext('2d');
window.addEventListener('resize', () => {
  cursorCvs.width  = window.innerWidth;
  cursorCvs.height = window.innerHeight;
});

// ── Orbit inertia ────────────────────────────────────────────────────────────
let orbitVX = 0, orbitVY = 0;

// ── Gesture state machine ────────────────────────────────────────────────────
let activeGesture = 'none', pendingGesture = 'none', pendingFrames = 0;
const LOCK_FRAMES = 4;

// ── Smoothing buffers ────────────────────────────────────────────────────────
const palmBuf = [], vBuf = [];
let prevSmPalm = null;

// ── Frame-counter selection ───────────────────────────────────────────────────
// Count how many consecutive frames the same asset is hovered.
// A short "miss grace" prevents jitter from resetting the counter.
// No position tracking needed — hover = raycast hit, that's all.
let hoverTarget = null;
let hoverFrames = 0;
let missFrames  = 0;
const HOVER_CONFIRM = 38;  // frames to confirm (~0.63 s at 60 fps)
const MISS_GRACE    = 6;   // frames of missed raycast to tolerate

// ── Helpers ──────────────────────────────────────────────────────────────────
function getPalmCenter(lm) {
  const pts = [lm[0], lm[5], lm[9], lm[13], lm[17]];
  return {
    x: 1 - pts.reduce((s, p) => s + p.x, 0) / 5,
    y:     pts.reduce((s, p) => s + p.y, 0) / 5,
  };
}

function buf2D(buf, pt, max) {
  buf.push(pt);
  if (buf.length > max) buf.shift();
  return { x: buf.reduce((s, p) => s + p.x, 0) / buf.length,
           y: buf.reduce((s, p) => s + p.y, 0) / buf.length };
}

function buf1D(buf, v, max) {
  buf.push(v);
  if (buf.length > max) buf.shift();
  return buf.reduce((s, x) => s + x, 0) / buf.length;
}

// Project an asset group's world position to normalised screen [0..1]
function projectAsset(group) {
  const wp = new THREE.Vector3();
  group.getWorldPosition(wp);
  wp.project(camera);
  return { nx: (wp.x + 1) / 2, ny: (1 - wp.y) / 2 };
}

function clearHover() {
  if (state.hoveredGroup && state.hoveredGroup !== state.selected) {
    state.hoveredGroup.userData.sphere.material.emissiveIntensity =
      Math.abs(state.hoveredGroup.userData.asset.chg) * 0.25;
  }
  state.hoveredGroup = null;
}

function resetHoverState() {
  if (hoverTarget) clearHover();
  hoverTarget = null;
  hoverFrames = 0;
  missFrames  = 0;
}

// ── Gesture classifier ───────────────────────────────────────────────────────
// ✋ open palm (≥3 fingers extended) → orbit
// ✌️ peace sign (index + middle only) → zoom via spread
// 👆 index only → point / select
function classifyGesture(lm) {
  const indexMid  = lm[6],  indexTip = lm[8];
  const midMid    = lm[10], midTip   = lm[12];
  const ringMid   = lm[14], ringTip  = lm[16];
  const pinkyMid  = lm[18], pinkyTip = lm[20];
  const ext = [
    indexTip.y < indexMid.y  - 0.02,
    midTip.y   < midMid.y    - 0.02,
    ringTip.y  < ringMid.y   - 0.02,
    pinkyTip.y < pinkyMid.y  - 0.02,
  ];
  if ( ext[0] && !ext[1] && !ext[2] && !ext[3]) return 'point';
  if ( ext[0] &&  ext[1] && !ext[2] && !ext[3]) return 'zoom';
  if (ext.filter(Boolean).length >= 3)           return 'orbit';
  return 'none';
}

// ── Cursor drawing ───────────────────────────────────────────────────────────
function drawCursor(px, py, gesture, dwellProgress, assetNx, assetNy) {
  cursorCtx.clearRect(0, 0, cursorCvs.width, cursorCvs.height);
  if (gesture === 'none') return;

  const sx = px * cursorCvs.width;
  const sy = py * cursorCvs.height;
  cursorCtx.save();

  if (gesture === 'point') {
    // Small crosshair at fingertip
    cursorCtx.globalAlpha = 0.7;
    cursorCtx.strokeStyle = '#fff';
    cursorCtx.lineWidth   = 1.2;
    const len = 10;
    cursorCtx.beginPath();
    cursorCtx.moveTo(sx - len, sy); cursorCtx.lineTo(sx + len, sy);
    cursorCtx.moveTo(sx, sy - len); cursorCtx.lineTo(sx, sy + len);
    cursorCtx.stroke();

    if (dwellProgress > 0 && assetNx !== undefined) {
      // Progress ring locked to asset screen position
      const ax = assetNx * cursorCvs.width;
      const ay = assetNy * cursorCvs.height;

      // Background ring
      cursorCtx.globalAlpha = 0.18;
      cursorCtx.beginPath();
      cursorCtx.arc(ax, ay, 28, 0, Math.PI * 2);
      cursorCtx.strokeStyle = '#fff'; cursorCtx.lineWidth = 1;
      cursorCtx.stroke();

      // Coloured fill arc
      cursorCtx.globalAlpha = 0.9;
      cursorCtx.beginPath();
      cursorCtx.arc(ax, ay, 28, -Math.PI / 2, -Math.PI / 2 + dwellProgress * Math.PI * 2);
      cursorCtx.strokeStyle = '#fff'; cursorCtx.lineWidth = 3;
      cursorCtx.stroke();

      // Tiny dot at asset centre when nearly done
      if (dwellProgress > 0.5) {
        cursorCtx.globalAlpha = dwellProgress * 0.6;
        cursorCtx.beginPath();
        cursorCtx.arc(ax, ay, 4, 0, Math.PI * 2);
        cursorCtx.fillStyle = '#fff'; cursorCtx.fill();
      }
    } else {
      // Idle hint ring at fingertip
      cursorCtx.globalAlpha = 0.2;
      cursorCtx.beginPath();
      cursorCtx.arc(sx, sy, 20, 0, Math.PI * 2);
      cursorCtx.strokeStyle = '#fff'; cursorCtx.lineWidth = 1;
      cursorCtx.stroke();
    }

  } else if (gesture === 'zoom') {
    cursorCtx.globalAlpha = 0.6;
    cursorCtx.beginPath();
    cursorCtx.arc(sx, sy, 22, 0, Math.PI * 2);
    cursorCtx.strokeStyle = '#fff'; cursorCtx.lineWidth = 1.2; cursorCtx.stroke();
    cursorCtx.beginPath();
    cursorCtx.arc(sx, sy, 4, 0, Math.PI * 2);
    cursorCtx.fillStyle = '#fff'; cursorCtx.fill();

  } else {
    cursorCtx.globalAlpha = 0.55;
    cursorCtx.beginPath();
    cursorCtx.arc(sx, sy, 17, 0, Math.PI * 2);
    cursorCtx.strokeStyle = '#fff'; cursorCtx.lineWidth = 1; cursorCtx.stroke();
    cursorCtx.beginPath();
    cursorCtx.arc(sx, sy, 3.5, 0, Math.PI * 2);
    cursorCtx.fillStyle = '#fff'; cursorCtx.fill();
  }

  cursorCtx.restore();
}

function setGestureLabel(g) {
  const el  = document.getElementById('gesture-label');
  const map = { orbit: '✋  ORBITING', zoom: '✌️  ZOOMING', point: '👆  HOLD TO SELECT', none: '' };
  if (el) { el.textContent = map[g] ?? ''; el.classList.toggle('on', g !== 'none'); }
}

// ── Main hand-results callback ───────────────────────────────────────────────
export function onHandResults(results) {
  const hc  = document.getElementById('hand-canvas');
  const ctx = hc.getContext('2d');
  hc.width = hc.offsetWidth; hc.height = hc.offsetHeight;
  ctx.clearRect(0, 0, hc.width, hc.height);

  if (!results.multiHandLandmarks?.length) {
    orbitVX *= 0.88; orbitVY *= 0.88;
    if (Math.abs(orbitVX) > 0.0003 || Math.abs(orbitVY) > 0.0003) {
      CAM.tTheta += orbitVX;
      CAM.tPhi = THREE.MathUtils.clamp(CAM.tPhi + orbitVY, 0.15, Math.PI - 0.15);
    } else { orbitVX = orbitVY = 0; state.autoRotate = true; }
    activeGesture = pendingGesture = 'none'; pendingFrames = 0;
    prevSmPalm = null; palmBuf.length = vBuf.length = 0;
    resetHoverState();
    setGestureLabel('none'); drawCursor(0, 0, 'none', 0);
    return;
  }

  const lm = results.multiHandLandmarks[0];

  // Draw skeleton on mini camera preview
  if (window.drawConnectors && window.HAND_CONNECTIONS) {
    ctx.save(); ctx.scale(-1, 1); ctx.translate(-hc.width, 0);
    drawConnectors(ctx, lm, HAND_CONNECTIONS, { color: 'rgba(255,255,255,0.3)', lineWidth: 1 });
    drawLandmarks(ctx, lm, { color: 'rgba(255,255,255,0.85)', lineWidth: 0, radius: 2.5 });
    ctx.restore();
  }

  // Hysteresis — commit gesture only after LOCK_FRAMES consecutive frames
  const raw = classifyGesture(lm);
  if (raw === pendingGesture) { pendingFrames = Math.min(pendingFrames + 1, LOCK_FRAMES + 5); }
  else { pendingGesture = raw; pendingFrames = 1; }
  if (pendingFrames >= LOCK_FRAMES && activeGesture !== pendingGesture) {
    prevSmPalm = null; palmBuf.length = vBuf.length = 0;
    if (activeGesture === 'point') resetHoverState();
    activeGesture = pendingGesture;
  }

  const pc = getPalmCenter(lm);
  const sm = buf2D(palmBuf, pc, 7);
  setGestureLabel(activeGesture);

  // ── Orbit ────────────────────────────────────────────────────────
  if (activeGesture === 'orbit') {
    state.autoRotate = false;
    if (prevSmPalm) {
      let dx = sm.x - prevSmPalm.x, dy = sm.y - prevSmPalm.y;
      const DZ = 0.007;
      if (Math.abs(dx) < DZ) dx = 0;
      if (Math.abs(dy) < DZ) dy = 0;
      orbitVX = -dx * 4.5; orbitVY = dy * 3.5;
      CAM.tTheta += orbitVX;
      CAM.tPhi = THREE.MathUtils.clamp(CAM.tPhi + orbitVY, 0.15, Math.PI - 0.15);
    }
    prevSmPalm = { ...sm };
    drawCursor(sm.x, sm.y, 'orbit', 0);

  // ── Zoom ✌️ — finger spread maps directly to camera radius ────────
  } else if (activeGesture === 'zoom') {
    state.autoRotate = false; prevSmPalm = null;
    orbitVX *= 0.9; orbitVY *= 0.9;
    const spread   = Math.hypot(lm[8].x - lm[12].x, lm[8].y - lm[12].y);
    const smSpread = buf1D(vBuf, spread, 8);
    const targetR  = THREE.MathUtils.mapLinear(smSpread, 0.04, 0.20, 14, 72);
    CAM.tR += (THREE.MathUtils.clamp(targetR, 14, 72) - CAM.tR) * 0.12;
    const mx = 1 - (lm[8].x + lm[12].x) / 2;
    const my =     (lm[8].y + lm[12].y) / 2;
    drawCursor(mx, my, 'zoom', 0);

  // ── Point + frame-counter select ──────────────────────────────────
  } else if (activeGesture === 'point') {
    orbitVX *= 0.82; orbitVY *= 0.82;
    if (Math.abs(orbitVX) > 0.0005 || Math.abs(orbitVY) > 0.0005) {
      CAM.tTheta += orbitVX;
      CAM.tPhi = THREE.MathUtils.clamp(CAM.tPhi + orbitVY, 0.15, Math.PI - 0.15);
    } else { orbitVX = orbitVY = 0; state.autoRotate = false; }
    prevSmPalm = null;

    // Smooth fingertip
    const tip   = lm[8];
    const smTip = buf2D(vBuf, { x: 1 - tip.x, y: tip.y }, 8);

    // Raycast
    const hit = raycastAt(smTip.x, smTip.y);

    if (hit) {
      missFrames = 0;

      if (hit === hoverTarget) {
        // Same asset — advance counter
        hoverFrames++;
        if (hoverFrames >= HOVER_CONFIRM) {
          selectAsset(hoverTarget);
          resetHoverState();
        }
      } else {
        // New asset — reset counter onto new target
        resetHoverState();
        hoverTarget = hit;
        hoverFrames = 1;
        state.hoveredGroup = hit;
        hit.userData.sphere.material.emissiveIntensity = 0.55;
      }
    } else {
      // Missed frame — tolerate MISS_GRACE before giving up
      missFrames++;
      if (missFrames > MISS_GRACE) resetHoverState();
    }

    const progress = hoverTarget ? hoverFrames / HOVER_CONFIRM : 0;
    const proj     = hoverTarget ? projectAsset(hoverTarget) : null;
    drawCursor(smTip.x, smTip.y, 'point', progress, proj?.nx, proj?.ny);

  // ── Neutral / coasting ───────────────────────────────────────────
  } else {
    orbitVX *= 0.9; orbitVY *= 0.9;
    if (Math.abs(orbitVX) > 0.0003 || Math.abs(orbitVY) > 0.0003) {
      CAM.tTheta += orbitVX;
      CAM.tPhi = THREE.MathUtils.clamp(CAM.tPhi + orbitVY, 0.15, Math.PI - 0.15);
    } else { orbitVX = orbitVY = 0; state.autoRotate = true; }
    prevSmPalm = null; resetHoverState();
    drawCursor(sm.x, sm.y, 'none', 0);
  }
}

// ── Camera init ──────────────────────────────────────────────────────────────
export async function initCamera() {
  document.getElementById('cam-btn').style.display  = 'none';
  document.getElementById('cam-wrap').style.display = 'block';

  if (!window.Hands) { console.warn('MediaPipe Hands not loaded'); return; }

  const hands = new Hands({ locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` });
  hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.6, minTrackingConfidence: 0.5 });
  hands.onResults(onHandResults);

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
    const vid = document.getElementById('cam-feed');
    vid.srcObject = stream;
    await vid.play();
    const mpCam = new Camera(vid, {
      onFrame: async () => { await hands.send({ image: vid }); },
      width: 320, height: 240,
    });
    mpCam.start();
    document.getElementById('cam-status').textContent = 'HAND TRACKING ACTIVE';
  } catch {
    document.getElementById('cam-wrap').style.display = 'none';
    document.getElementById('cam-btn').style.display  = 'block';
    document.getElementById('cam-btn').textContent    = 'Camera Denied';
  }
}
