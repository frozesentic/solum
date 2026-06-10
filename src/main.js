import * as THREE from 'three';
import { renderer, labelRenderer, scene, camera, composer, stars } from './scene.js';
import { CAM, state, orbitGroups } from './state.js';
import { buildAtom, coreGlow } from './atom.js';
import { setupControls, updateCamera } from './controls.js';
import { setupClickHandler, updateConnectionPositions } from './selection.js';
import { runLoadingSequence, hideLoading, startClock, setupFilterTabs, updateMarketStats, setupDetailClose, setupCamBtn, setupKeyboard } from './ui.js';

// ── Bootstrap ────────────────────────────────────────────────────────────────
buildAtom();
setupControls();
setupClickHandler();
setupDetailClose();
setupCamBtn();
setupKeyboard();
setupFilterTabs();
updateMarketStats();
startClock();

runLoadingSequence(() => {
  hideLoading();
  animate();
});

// ── Auto-rotate speed ────────────────────────────────────────────────────────
const AUTO_SPEED = 0.0006;

// ── Main animation loop ──────────────────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);

  const t = performance.now() * 0.001;

  // Orbit groups rotate their assets
  orbitGroups.forEach(og => {
    og.assets.forEach(g => {
      g.userData.angle += g.userData.orbitSpeed * 0.008;
      g.position.x = Math.cos(g.userData.angle) * g.userData.orbitRadius;
      g.position.z = Math.sin(g.userData.angle) * g.userData.orbitRadius;
    });
  });

  // Auto-rotate scene
  if (state.autoRotate) {
    CAM.tTheta += AUTO_SPEED;
  }

  // Glow ring pulse on visible assets
  // coreGlow is re-exported lazily — use dynamic import after buildAtom
  if (coreGlow) {
    coreGlow.material.emissiveIntensity = 0.28 + Math.sin(t * 1.4) * 0.12;
  }

  // Gently pulse glow rings
  scene.traverse(obj => {
    if (obj.userData.isRing) {
      obj.rotation.y += 0.003;
      obj.rotation.x += 0.001;
    }
  });

  // Slowly rotate star field
  stars.rotation.y += 0.00008;

  updateCamera();
  updateConnectionPositions();

  composer.render();
  labelRenderer.render(scene, camera);
}
