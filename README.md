# SOLUM · Market Intelligence

A real-time 3D visualization of the stock, crypto, and ETF market — rendered as an atom, controlled by hand gestures.

![SOLUM preview](https://raw.githubusercontent.com/frozesentic/solum/master/preview.png)

---

## What it is

SOLUM maps the global market onto an atom-shaped 3D scene:

| Layer | What's there | Detail |
|---|---|---|
| **Nucleus** | Crypto | 12 assets clustered at the core — BTC and ETH dominate by size |
| **Inner rings** | Stocks | 3 tilted orbital rings, each carrying a sector theme |
| **Outer ring** | ETFs | 14 funds on a wide equatorial orbit |

Sphere **size** = market cap. Sphere **brightness** = daily % gain. Assets with moves > 2% get a glowing halo ring.

### Stock ring layout

| Ring | Theme | Assets |
|---|---|---|
| Ring 1 | Tech & Semiconductors | AAPL · MSFT · NVDA · GOOGL · META · AVGO · AMD · NFLX |
| Ring 2 | Finance, Commerce & Media | JPM · V · MA · BAC · WMT · AMZN · COST · CRM |
| Ring 3 | Healthcare, Energy & Industrials | LLY · UNH · JNJ · ORCL · XOM · CVX · TSLA · HD |

---

## Controls

### Mouse / trackpad

| Action | How |
|---|---|
| Orbit | Click and drag |
| Zoom | Scroll wheel |
| Select asset | Click sphere or label |
| Deselect | Click empty space · `Esc` |
| Toggle auto-rotate | `R` |

### Hand gestures (camera required)

Click **ENABLE HAND CONTROL** in the bottom-right corner to activate your webcam.

| Gesture | Action |
|---|---|
| ✋ Open palm (3+ fingers) | Orbit — move your hand to rotate the view |
| ✌️ Peace sign | Zoom — spread fingers wider to zoom out, close together to zoom in |
| 👆 Point (index only) | Select — point at an asset and hold steady for 0.7 s |

**Selection tip:** Once your finger is near an asset the progress ring locks to the asset's position, not your fingertip. You just need to keep pointing roughly at it — small hand tremors won't break the timer.

---

## Stack

- **[Three.js](https://threejs.org/) v0.164** — 3D scene, `MeshPhysicalMaterial` glass spheres, `UnrealBloomPass` glow, `CSS2DRenderer` floating labels
- **[MediaPipe Hands](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker)** — 21-landmark real-time hand tracking, runs in the browser via CDN
- **ES Modules + importmap** — zero build step, loads directly in any modern browser
- **Post-processing** — ACES filmic tone mapping, bloom (strength 0.55), vignette, scan-line overlay

---

## Project structure

```
solum/
├── index.html          # Shell: importmap, MediaPipe CDN, DOM scaffold
├── styles/
│   └── main.css        # All styling (glass panels, labels, camera UI)
└── src/
    ├── main.js         # Entry point — animation loop
    ├── data.js         # 50 assets with prices, caps, sectors
    ├── state.js        # Shared mutable state (camera, selection, groups)
    ├── scene.js        # Renderer, camera, bloom, lights, star field
    ├── atom.js         # Builds the nucleus + orbital rings
    ├── controls.js     # Mouse / touch drag and scroll zoom
    ├── selection.js    # Raycasting, detail panel, sparkline, connections
    ├── gestures.js     # MediaPipe integration, gesture classifier, dwell select
    └── ui.js           # Loading sequence, clock, filter tabs, stats
```

---

## Running locally

No build step required — just serve the files over HTTP (browsers block ES module imports from `file://`).

```bash
# Python
python -m http.server 8080

# Node
npx serve .

# VS Code
# Install the "Live Server" extension and click "Go Live"
```

Then open `http://localhost:8080`.

---

## Data

Prices and market caps are static snapshots (approximate mid-2025). This is a visualization demo — no live data feed is connected. To wire in real data, replace the `ASSETS` array in `src/data.js` with a fetch from any market API (Alpha Vantage, Polygon.io, CoinGecko, etc.).

---

## License

MIT
