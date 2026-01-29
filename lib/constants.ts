import type { MarketCapTier } from "./types";

// Market cap tier definitions (sorted high to low for display)
export const MARKET_CAP_TIERS: MarketCapTier[] = [
  {
    id: "tier1",
    label: "$1M+",
    minCap: 1_000_000,
    maxCap: Infinity,
    color: "#00ff88",
    bgClass: "bg-tier-1/20",
    textClass: "text-tier-1",
  },
  {
    id: "tier2",
    label: "$500K - $1M",
    minCap: 500_000,
    maxCap: 1_000_000,
    color: "#10b981",
    bgClass: "bg-tier-2/20",
    textClass: "text-tier-2",
  },
  {
    id: "tier3",
    label: "$100K - $500K",
    minCap: 100_000,
    maxCap: 500_000,
    color: "#fbbf24",
    bgClass: "bg-tier-3/20",
    textClass: "text-tier-3",
  },
  {
    id: "tier4",
    label: "$50K - $100K",
    minCap: 50_000,
    maxCap: 100_000,
    color: "#f97316",
    bgClass: "bg-tier-4/20",
    textClass: "text-tier-4",
  },
];

// DexScreener API base URL
export const DEXSCREENER_API_BASE = "https://api.dexscreener.com";

// Known DEX IDs where graduated Pump.fun tokens land
// Includes Raydium (classic), Raydium CLMM, and PumpSwap (Pump.fun's own AMM)
export const GRADUATED_DEX_IDS = [
  "raydium",
  "raydium-clmm",
  "pumpswap",
];

// GeckoTerminal API base URL
export const GECKOTERMINAL_API_BASE = "https://api.geckoterminal.com/api/v2";

// GeckoTerminal DEX slugs for graduated tokens
export const GECKO_GRADUATED_DEXES = [
  "raydium",
  "raydium-clmm",
  "pump-fun-amm",
  "pumpswap",
];

// Number of pages to fetch from GeckoTerminal (20 per page)
export const GECKO_PAGES_TO_FETCH = 10;

// 30 days in milliseconds
export const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// Max market cap to consider as "graduated" (filter out large established tokens)
export const MAX_GRADUATED_MCAP = 50_000_000;

// Search terms to find Pump.fun style tokens
export const SEARCH_TERMS = [
  "pump",
  "meme",
  "degen",
  "inu",
  "pepe",
  "cat",
  "dog",
  "frog",
  "wojak",
  "chad",
  "ai",
  "trump",
];

// Build DexScreener URL for a pair
export const buildDexScreenerUrl = (pairAddress: string) =>
  `https://dexscreener.com/solana/${pairAddress}`;

// Build Pump.fun URL for a token
export const buildPumpfunUrl = (tokenAddress: string) =>
  `https://pump.fun/${tokenAddress}`;
