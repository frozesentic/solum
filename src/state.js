import * as THREE from 'three';

// Camera spherical coordinates (current + target for smooth interpolation)
export const CAM = { theta: 0, phi: Math.PI * 0.38, r: 45, tTheta: 0, tPhi: Math.PI * 0.38, tR: 45 };

// Shared runtime flags
export const state = {
  autoRotate:   true,
  dragging:     false,
  selected:     null,
  hoveredGroup: null,
};

// All asset Three.js groups — populated by atom.js
export const allGroups  = [];
// Orbital pivot groups — populated by atom.js, animated by main.js
export const orbitGroups = [];
// Active connection line meshes — managed by selection.js, updated by main.js
export const connLines  = [];

// Shared raycaster and mouse vector used by selection and gestures
export const raycaster = new THREE.Raycaster();
export const mouse2d   = new THREE.Vector2();
