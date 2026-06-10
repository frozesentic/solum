export const ASSETS = [
  // Stocks — split across 3 orbital rings
  { sym:'AAPL', name:'Apple Inc.',        price:213.49, chg: 1.23, cap:3.28e12, type:'stock', sector:'Technology' },
  { sym:'MSFT', name:'Microsoft',         price:422.87, chg: 0.87, cap:3.14e12, type:'stock', sector:'Technology' },
  { sym:'NVDA', name:'NVIDIA',            price:875.21, chg: 3.45, cap:2.16e12, type:'stock', sector:'Technology' },
  { sym:'GOOGL',name:'Alphabet',          price:174.13, chg:-0.34, cap:2.18e12, type:'stock', sector:'Technology' },
  { sym:'AMZN', name:'Amazon',            price:187.91, chg: 1.12, cap:1.97e12, type:'stock', sector:'Technology' },
  { sym:'META', name:'Meta',              price:492.30, chg: 2.15, cap:1.25e12, type:'stock', sector:'Technology' },
  { sym:'TSLA', name:'Tesla',             price:176.89, chg:-1.87, cap:563e9,   type:'stock', sector:'Automotive' },
  { sym:'JPM',  name:'JPMorgan',          price:195.43, chg: 0.23, cap:567e9,   type:'stock', sector:'Finance'    },
  { sym:'JNJ',  name:'Johnson & Johnson', price:147.82, chg:-0.45, cap:355e9,   type:'stock', sector:'Healthcare' },
  { sym:'WMT',  name:'Walmart',           price:67.23,  chg: 0.67, cap:543e9,   type:'stock', sector:'Retail'     },
  { sym:'XOM',  name:'ExxonMobil',        price:112.34, chg:-0.89, cap:451e9,   type:'stock', sector:'Energy'     },
  { sym:'V',    name:'Visa Inc.',         price:272.56, chg: 0.56, cap:553e9,   type:'stock', sector:'Finance'    },
  { sym:'UNH',  name:'UnitedHealth',      price:523.45, chg: 1.34, cap:484e9,   type:'stock', sector:'Healthcare' },
  { sym:'MA',   name:'Mastercard',        price:455.78, chg: 0.78, cap:429e9,   type:'stock', sector:'Finance'    },
  { sym:'HD',   name:'Home Depot',        price:342.12, chg:-0.23, cap:343e9,   type:'stock', sector:'Retail'     },
  // Crypto — nucleus cluster
  { sym:'BTC',  name:'Bitcoin',           price:67234,  chg: 2.45, cap:1.32e12, type:'crypto', sector:'Crypto' },
  { sym:'ETH',  name:'Ethereum',          price:3456,   chg: 1.23, cap:415e9,   type:'crypto', sector:'Crypto' },
  { sym:'BNB',  name:'BNB',              price:589,    chg:-0.67, cap:85e9,    type:'crypto', sector:'Crypto' },
  { sym:'SOL',  name:'Solana',            price:178,    chg: 4.56, cap:82e9,    type:'crypto', sector:'Crypto' },
  { sym:'ADA',  name:'Cardano',           price:0.456,  chg:-1.23, cap:16e9,    type:'crypto', sector:'Crypto' },
  { sym:'XRP',  name:'XRP',              price:0.523,  chg: 0.89, cap:29e9,    type:'crypto', sector:'Crypto' },
  { sym:'AVAX', name:'Avalanche',         price:38.45,  chg: 2.34, cap:16e9,    type:'crypto', sector:'Crypto' },
  { sym:'DOGE', name:'Dogecoin',          price:0.178,  chg:-2.45, cap:25e9,    type:'crypto', sector:'Crypto' },
  // ETFs — outer orbital shell
  { sym:'SPY',  name:'S&P 500 ETF',       price:534.20, chg: 0.42, cap:521e9,   type:'etf', sector:'Blend'     },
  { sym:'QQQ',  name:'NASDAQ 100 ETF',    price:456.78, chg: 0.87, cap:267e9,   type:'etf', sector:'Growth'    },
  { sym:'IWM',  name:'Russell 2000',      price:198.34, chg:-0.34, cap:71e9,    type:'etf', sector:'Small Cap' },
  { sym:'GLD',  name:'Gold ETF',          price:221.45, chg: 0.23, cap:64e9,    type:'etf', sector:'Commodity' },
  { sym:'VTI',  name:'Total Market ETF',  price:252.34, chg: 0.45, cap:432e9,   type:'etf', sector:'Blend'     },
  { sym:'ARKK', name:'ARK Innovation',    price:48.23,  chg: 2.34, cap:8e9,     type:'etf', sector:'Growth'    },
  { sym:'XLF',  name:'Financials ETF',    price:41.23,  chg: 0.12, cap:43e9,    type:'etf', sector:'Finance'   },
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
