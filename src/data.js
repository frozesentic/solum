// Prices and market caps approximate as of mid-2025.
// Stocks are grouped by sector ring label in the `ring` field:
//   ring 0 — Technology & Semiconductors
//   ring 1 — Finance, Commerce & Media
//   ring 2 — Healthcare, Energy & Industrials

export const ASSETS = [

  // ── TECHNOLOGY & SEMICONDUCTORS (ring 0) ─────────────────────────────────
  { sym:'AAPL',  name:'Apple Inc.',          price:  224.72, chg:  1.14, cap:3.40e12, type:'stock', sector:'Technology',     ring:0 },
  { sym:'MSFT',  name:'Microsoft',           price:  449.26, chg:  0.82, cap:3.34e12, type:'stock', sector:'Technology',     ring:0 },
  { sym:'NVDA',  name:'NVIDIA',              price:  131.38, chg:  4.21, cap:3.22e12, type:'stock', sector:'Semiconductors', ring:0 },
  { sym:'GOOGL', name:'Alphabet',            price:  186.44, chg: -0.31, cap:2.28e12, type:'stock', sector:'Technology',     ring:0 },
  { sym:'META',  name:'Meta Platforms',      price:  561.03, chg:  2.07, cap:1.42e12, type:'stock', sector:'Technology',     ring:0 },
  { sym:'AVGO',  name:'Broadcom',            price:  188.92, chg:  1.68, cap:0.88e12, type:'stock', sector:'Semiconductors', ring:0 },
  { sym:'AMD',   name:'Advanced Micro Dev.', price:  162.55, chg:  2.44, cap:0.26e12, type:'stock', sector:'Semiconductors', ring:0 },
  { sym:'NFLX',  name:'Netflix',             price:  712.88, chg:  1.37, cap:0.31e12, type:'stock', sector:'Technology',     ring:0 },

  // ── FINANCE, COMMERCE & MEDIA (ring 1) ───────────────────────────────────
  { sym:'JPM',   name:'JPMorgan Chase',      price:  228.14, chg:  0.34, cap:0.66e12, type:'stock', sector:'Finance',        ring:1 },
  { sym:'V',     name:'Visa Inc.',           price:  292.43, chg:  0.61, cap:0.61e12, type:'stock', sector:'Finance',        ring:1 },
  { sym:'MA',    name:'Mastercard',          price:  502.17, chg:  0.74, cap:0.47e12, type:'stock', sector:'Finance',        ring:1 },
  { sym:'BAC',   name:'Bank of America',     price:   43.78, chg:  0.18, cap:0.34e12, type:'stock', sector:'Finance',        ring:1 },
  { sym:'WMT',   name:'Walmart',             price:   82.19, chg:  0.55, cap:0.66e12, type:'stock', sector:'Retail',         ring:1 },
  { sym:'AMZN',  name:'Amazon',              price:  201.37, chg:  1.05, cap:2.14e12, type:'stock', sector:'Retail',         ring:1 },
  { sym:'COST',  name:'Costco Wholesale',    price:  912.34, chg:  0.91, cap:0.41e12, type:'stock', sector:'Retail',         ring:1 },
  { sym:'CRM',   name:'Salesforce',          price:  334.77, chg:  0.48, cap:0.32e12, type:'stock', sector:'Technology',     ring:1 },

  // ── HEALTHCARE, ENERGY & INDUSTRIALS (ring 2) ────────────────────────────
  { sym:'LLY',   name:'Eli Lilly',           price:  948.21, chg:  1.89, cap:0.91e12, type:'stock', sector:'Healthcare',     ring:2 },
  { sym:'UNH',   name:'UnitedHealth',        price:  578.44, chg: -0.67, cap:0.53e12, type:'stock', sector:'Healthcare',     ring:2 },
  { sym:'JNJ',   name:'Johnson & Johnson',   price:  158.37, chg: -0.44, cap:0.38e12, type:'stock', sector:'Healthcare',     ring:2 },
  { sym:'ORCL',  name:'Oracle',              price:  152.44, chg:  0.92, cap:0.42e12, type:'stock', sector:'Technology',     ring:2 },
  { sym:'XOM',   name:'ExxonMobil',          price:  117.62, chg: -0.78, cap:0.47e12, type:'stock', sector:'Energy',         ring:2 },
  { sym:'CVX',   name:'Chevron',             price:  156.88, chg: -0.55, cap:0.29e12, type:'stock', sector:'Energy',         ring:2 },
  { sym:'TSLA',  name:'Tesla',               price:  248.23, chg: -1.92, cap:0.79e12, type:'stock', sector:'Automotive',     ring:2 },
  { sym:'HD',    name:'Home Depot',          price:  376.41, chg:  0.23, cap:0.37e12, type:'stock', sector:'Retail',         ring:2 },

  // ── CRYPTO — nucleus cluster ──────────────────────────────────────────────
  { sym:'BTC',   name:'Bitcoin',             price:65420,    chg:  2.31, cap:1.29e12, type:'crypto', sector:'Store of Value'  },
  { sym:'ETH',   name:'Ethereum',            price: 3184,    chg:  1.44, cap:0.38e12, type:'crypto', sector:'Smart Contract'  },
  { sym:'BNB',   name:'BNB Chain',           price:  612,    chg: -0.54, cap:0.09e12, type:'crypto', sector:'Exchange'        },
  { sym:'SOL',   name:'Solana',              price:  164,    chg:  3.87, cap:0.078e12,type:'crypto', sector:'Smart Contract'  },
  { sym:'XRP',   name:'XRP',                price: 0.592,   chg:  1.12, cap:0.034e12,type:'crypto', sector:'Payments'        },
  { sym:'AVAX',  name:'Avalanche',           price:  36.74,  chg:  2.67, cap:0.015e12,type:'crypto', sector:'Smart Contract'  },
  { sym:'DOGE',  name:'Dogecoin',            price: 0.148,   chg: -2.14, cap:0.022e12,type:'crypto', sector:'Memecoin'        },
  { sym:'ADA',   name:'Cardano',             price: 0.443,   chg: -1.08, cap:0.016e12,type:'crypto', sector:'Smart Contract'  },
  { sym:'LINK',  name:'Chainlink',           price:  14.87,  chg:  1.55, cap:0.009e12,type:'crypto', sector:'Oracle'          },
  { sym:'DOT',   name:'Polkadot',            price:   7.91,  chg: -0.88, cap:0.011e12,type:'crypto', sector:'Infrastructure'  },
  { sym:'TRX',   name:'TRON',               price: 0.127,   chg:  0.34, cap:0.011e12,type:'crypto', sector:'Payments'        },
  { sym:'MATIC', name:'Polygon',             price: 0.684,   chg:  0.72, cap:0.007e12,type:'crypto', sector:'Infrastructure'  },

  // ── ETFs — outer orbital shell ────────────────────────────────────────────
  { sym:'SPY',   name:'SPDR S&P 500 ETF',    price:  541.82, chg:  0.41, cap:0.56e12, type:'etf', sector:'Large Blend'    },
  { sym:'VTI',   name:'Vanguard Total Mkt',  price:  268.14, chg:  0.44, cap:0.45e12, type:'etf', sector:'Large Blend'    },
  { sym:'QQQ',   name:'Invesco NASDAQ 100',  price:  477.55, chg:  0.83, cap:0.29e12, type:'etf', sector:'Large Growth'   },
  { sym:'VEA',   name:'Vanguard Intl Dev.',  price:   54.22, chg: -0.12, cap:0.11e12, type:'etf', sector:'International'  },
  { sym:'AGG',   name:'iShares Core Bond',   price:   97.84, chg:  0.08, cap:0.10e12, type:'etf', sector:'Fixed Income'   },
  { sym:'IWM',   name:'iShares Russell 2k',  price:  212.67, chg: -0.28, cap:0.075e12,type:'etf', sector:'Small Blend'    },
  { sym:'GLD',   name:'SPDR Gold Shares',    price:  229.43, chg:  0.19, cap:0.069e12,type:'etf', sector:'Commodity'      },
  { sym:'IBIT',  name:'iShares Bitcoin ETF', price:   45.72, chg:  2.18, cap:0.040e12,type:'etf', sector:'Crypto'         },
  { sym:'DIA',   name:'SPDR Dow Jones ETF',  price:  422.31, chg:  0.22, cap:0.033e12,type:'etf', sector:'Large Blend'    },
  { sym:'XLE',   name:'Energy Select SPDR',  price:   94.17, chg: -0.61, cap:0.038e12,type:'etf', sector:'Energy'         },
  { sym:'XLF',   name:'Financials SPDR',     price:   44.28, chg:  0.15, cap:0.044e12,type:'etf', sector:'Finance'        },
  { sym:'XLV',   name:'Health Care SPDR',    price:  149.63, chg: -0.34, cap:0.036e12,type:'etf', sector:'Healthcare'     },
  { sym:'ARKK',  name:'ARK Innovation ETF',  price:   44.81, chg:  2.56, cap:0.008e12,type:'etf', sector:'Thematic'       },
  { sym:'EEM',   name:'iShares Emerg. Mkts', price:   44.55, chg: -0.44, cap:0.025e12,type:'etf', sector:'International'  },
];

export function fmtPrice(p) {
  if (p >= 1000) return p.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (p >= 1)    return p.toFixed(2);
  return p.toFixed(4);
}

export function fmtCap(c) {
  if (c >= 1e12) return `$${(c / 1e12).toFixed(2)}T`;
  if (c >= 1e9)  return `$${(c / 1e9).toFixed(1)}B`;
  return `$${(c / 1e6).toFixed(0)}M`;
}

export function assetRadius(cap) {
  return Math.max(0.22, (Math.log10(cap) - 9) * 0.32);
}
