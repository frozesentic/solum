import * as THREE from 'three';
import { camera, renderer } from './scene.js';
import { CAM, state } from './state.js';

export function setupControls() {
  renderer.domElement.addEventListener('mousedown', e => {
    state.dragging  = true;
    state.autoRotate = false;
    state._lastMx = e.clientX;
    state._lastMy = e.clientY;
  });
  renderer.domElement.addEventListener('mouseup',   () => { state.dragging = false; });
  renderer.domElement.addEventListener('mousemove', e => {
    if (!state.dragging) return;
    CAM.tTheta -= (e.clientX - state._lastMx) * 0.008;
    CAM.tPhi    = THREE.MathUtils.clamp(CAM.tPhi + (e.clientY - state._lastMy) * 0.006, 0.15, Math.PI - 0.15);
    state._lastMx = e.clientX;
    state._lastMy = e.clientY;
  });
  renderer.domElement.addEventListener('wheel', e => {
    CAM.tR = THREE.MathUtils.clamp(CAM.tR + e.deltaY * 0.05, 14, 90);
  }, { passive: true });

  renderer.domElement.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) return;
    state.dragging  = true;
    state.autoRotate = false;
    state._lastMx = e.touches[0].clientX;
    state._lastMy = e.touches[0].clientY;
  }, { passive: true });
  renderer.domElement.addEventListener('touchend',   () => { state.dragging = false; });
  renderer.domElement.addEventListener('touchmove',  e => {
    if (e.touches.length !== 1 || !state.dragging) return;
    CAM.tTheta -= (e.touches[0].clientX - state._lastMx) * 0.008;
    CAM.tPhi    = THREE.MathUtils.clamp(CAM.tPhi + (e.touches[0].clientY - state._lastMy) * 0.006, 0.15, Math.PI - 0.15);
    state._lastMx = e.touches[0].clientX;
    state._lastMy = e.touches[0].clientY;
  }, { passive: true });
}

export function updateCamera() {
  const EXP = 0.06;
  CAM.theta += (CAM.tTheta - CAM.theta) * EXP;
  CAM.phi   += (CAM.tPhi   - CAM.phi)   * EXP;
  CAM.r     += (CAM.tR     - CAM.r)     * EXP;
  camera.position.set(
    CAM.r * Math.sin(CAM.phi) * Math.cos(CAM.theta),
    CAM.r * Math.cos(CAM.phi),
    CAM.r * Math.sin(CAM.phi) * Math.sin(CAM.theta)
  );
  camera.lookAt(0, 0, 0);
}
