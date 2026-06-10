import { ASSETS } from './data.js';
import { allGroups, state } from './state.js';
import { selectAsset, deselectAsset } from './selection.js';
import { initCamera } from './gestures.js';

// ── Loading screen ───────────────────────────────────────────────────────────
export function runLoadingSequence(onDone) {
  const msgs = ['INITIALIZING NEURAL MATRIX','FETCHING MARKET DATA','CALIBRATING ORBITAL MECHANICS','RENDERING ATOM STRUCTURE','READY'];
  let i = 0;
  const li = document.getElementById('loading-info');
  const bar = document.getElementById('loading-bar');
  function step() {
    if (i >= msgs.length) { onDone(); return; }
    if (li)  li.textContent = msgs[i];
    if (bar) bar.style.width = ((i + 1) / msgs.length * 100) + '%';
    i++;
    setTimeout(step, i === msgs.length ? 300 : 480);
  }
  step();
}

export function hideLoading() {
  const el = document.getElementById('loading');
  if (!el) return;
  el.style.opacity = '0';
  el.style.transition = 'opacity 0.6s';
  setTimeout(() => el.remove(), 700);
}

// ── Clock ────────────────────────────────────────────────────────────────────
export function startClock() {
  const el = document.getElementById('clock');
  if (!el) return;
  function tick() {
    el.textContent = new Date().toLocaleTimeString('en-US', { hour12: false });
  }
  tick();
  setInterval(tick, 1000);
}

// ── Filter tabs ──────────────────────────────────────────────────────────────
export function setupFilterTabs() {
  document.querySelectorAll('.ftab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.ftab').forEach(t => t.classList.remove('on'));
      tab.classList.add('on');
      const f = tab.dataset.filter;
      allGroups.forEach(g => {
        g.visible = f === 'all' || g.userData.asset.type === f;
        const lbl = g.userData.lbl;
        if (lbl) lbl.style.display = g.visible ? '' : 'none';
      });
    });
  });
}

// ── Market overview stats ────────────────────────────────────────────────────
export function updateMarketStats() {
  const gainers = ASSETS.filter(a => a.chg > 0).length;
  const losers  = ASSETS.filter(a => a.chg < 0).length;
  const totalCap = ASSETS.reduce((s, a) => s + a.cap, 0);
  const avgChg   = ASSETS.reduce((s, a) => s + a.chg, 0) / ASSETS.length;

  const el = document.getElementById('market-stats');
  if (!el) return;
  el.innerHTML = `
    <span class="up">▲ ${gainers} gaining</span>
    <span class="dn">▼ ${losers} losing</span>
    <span>Cap ${(totalCap / 1e12).toFixed(1)}T</span>
    <span class="${avgChg >= 0 ? 'up' : 'dn'}">${avgChg >= 0 ? '+' : ''}${avgChg.toFixed(2)}% avg</span>`;
}

// ── Detail panel close ───────────────────────────────────────────────────────
export function setupDetailClose() {
  const btn = document.getElementById('d-close');
  if (btn) btn.addEventListener('click', deselectAsset);
}

// ── Camera activation button ─────────────────────────────────────────────────
export function setupCamBtn() {
  const btn = document.getElementById('cam-btn');
  if (btn) btn.addEventListener('click', initCamera);
}

// ── Keyboard shortcuts ───────────────────────────────────────────────────────
export function setupKeyboard() {
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') deselectAsset();
    if (e.key === 'r' || e.key === 'R') { state.autoRotate = !state.autoRotate; }
  });
}
