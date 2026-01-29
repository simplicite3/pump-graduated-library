import type {
  DexScreenerPair,
  DexScreenerSearchResponse,
  DexScreenerBoost,
  GraduatedToken,
} from "./types";
import {
  DEXSCREENER_API_BASE,
  GRADUATED_DEX_IDS,
  GECKOTERMINAL_API_BASE,
  GECKO_PAGES_TO_FETCH,
  THIRTY_DAYS_MS,
  MAX_GRADUATED_MCAP,
  SEARCH_TERMS,
  buildDexScreenerUrl,
  buildPumpfunUrl,
} from "./constants";
import { delay } from "./utils";

// ============================================================
// GeckoTerminal API (Primary Source - more comprehensive data)
// ============================================================

interface GeckoPool {
  id: string;
  type: string;
  attributes: {
    base_token_price_usd: string | null;
    address: string;
    name: string;
    pool_created_at: string;
    fdv_usd: number | null;
    market_cap_usd: number | null;
    price_change_percentage: {
      h24?: string;
    };
    volume_usd: {
      h24?: string;
    };
    reserve_in_usd: string | null;
  };
  relationships: {
    base_token: { data: { id: string; type: string } };
    quote_token: { data: { id: string; type: string } };
    dex: { data: { id: string; type: string } };
  };
}

interface GeckoPoolResponse {
  data: GeckoPool[];
}

// Extract the Solana token address from GeckoTerminal's token ID format
// Format: "solana_<address>"
function extractTokenAddress(geckoTokenId: string): string {
  return geckoTokenId.replace("solana_", "");
}

// Check if a GeckoTerminal pool is a graduated Pump.fun token
function isGeckoGraduatedPool(pool: GeckoPool): boolean {
  const dexId = pool.relationships.dex.data.id;
  const isGraduatedDex = [
    "raydium",
    "raydium-clmm",
    "pumpswap",
    "pump-fun-amm",
  ].includes(dexId);
  if (!isGraduatedDex) return false;

  // Must have been created within the last 30 days
  const createdAt = new Date(pool.attributes.pool_created_at).getTime();
  if (Date.now() - createdAt > THIRTY_DAYS_MS) return false;

  // Must have market cap/FDV data and be $50K+ (minimum displayed tier)
  const marketCap =
    pool.attributes.market_cap_usd || pool.attributes.fdv_usd || 0;
  if (marketCap < 50_000 || marketCap > MAX_GRADUATED_MCAP) return false;

  // Must have some liquidity
  const reserve = parseFloat(pool.attributes.reserve_in_usd || "0");
  if (reserve < 500) return false;

  return true;
}

// Transform GeckoTerminal pool to our GraduatedToken format
function geckoPoolToToken(pool: GeckoPool): GraduatedToken {
  const baseTokenId = pool.relationships.base_token.data.id;
  const address = extractTokenAddress(baseTokenId);
  const nameParts = pool.attributes.name.split(" / ");
  const symbol = nameParts[0] || "???";
  const marketCap =
    pool.attributes.market_cap_usd || pool.attributes.fdv_usd || 0;
  const liquidity = parseFloat(pool.attributes.reserve_in_usd || "0");
  const priceUsd = parseFloat(pool.attributes.base_token_price_usd || "0");
  const priceChange24h = parseFloat(
    pool.attributes.price_change_percentage?.h24 || "0"
  );
  const volume24h = parseFloat(pool.attributes.volume_usd?.h24 || "0");
  const pairAddress = pool.attributes.address;

  return {
    address,
    symbol,
    name: symbol, // GeckoTerminal only gives us the symbol from pool name
    imageUrl: null, // GeckoTerminal doesn't include images in pool data
    marketCap,
    liquidity,
    holderCount: null,
    priceUsd,
    priceChange24h,
    volume24h,
    pairAddress,
    pairCreatedAt: new Date(pool.attributes.pool_created_at).getTime(),
    dexScreenerUrl: buildDexScreenerUrl(pairAddress),
    pumpfunUrl: buildPumpfunUrl(address),
  };
}

// Fetch trending pools from GeckoTerminal (most comprehensive free source)
async function fetchGeckoTrendingPools(): Promise<GraduatedToken[]> {
  const tokens: GraduatedToken[] = [];

  for (let page = 1; page <= GECKO_PAGES_TO_FETCH; page++) {
    try {
      const response = await fetch(
        `${GECKOTERMINAL_API_BASE}/networks/solana/trending_pools?page=${page}`,
        { headers: { Accept: "application/json" } }
      );
      if (!response.ok) break;

      const data: GeckoPoolResponse = await response.json();
      if (!data.data || data.data.length === 0) break;

      const graduated = data.data.filter(isGeckoGraduatedPool);
      tokens.push(...graduated.map(geckoPoolToToken));

      await delay(250); // GeckoTerminal rate limit: 30/min
    } catch (error) {
      console.error(`Error fetching GeckoTerminal page ${page}:`, error);
      break;
    }
  }

  console.log(`GeckoTerminal trending: ${tokens.length} graduated tokens`);
  return tokens;
}

// Fetch Raydium-specific pools from GeckoTerminal
async function fetchGeckoRaydiumPools(): Promise<GraduatedToken[]> {
  const tokens: GraduatedToken[] = [];
  const dexes = ["raydium", "raydium-clmm"];

  for (const dex of dexes) {
    for (let page = 1; page <= 5; page++) {
      try {
        const response = await fetch(
          `${GECKOTERMINAL_API_BASE}/networks/solana/dexes/${dex}/pools?page=${page}&sort=h24_volume_usd_desc`,
          { headers: { Accept: "application/json" } }
        );
        if (!response.ok) break;

        const data: GeckoPoolResponse = await response.json();
        if (!data.data || data.data.length === 0) break;

        const graduated = data.data.filter(isGeckoGraduatedPool);
        tokens.push(...graduated.map(geckoPoolToToken));

        await delay(250);
      } catch (error) {
        console.error(
          `Error fetching GeckoTerminal ${dex} page ${page}:`,
          error
        );
        break;
      }
    }
  }

  console.log(`GeckoTerminal Raydium pools: ${tokens.length} graduated tokens`);
  return tokens;
}

// Fetch new pools from GeckoTerminal (catches very recent graduations)
async function fetchGeckoNewPools(): Promise<GraduatedToken[]> {
  const tokens: GraduatedToken[] = [];

  for (let page = 1; page <= 10; page++) {
    try {
      const response = await fetch(
        `${GECKOTERMINAL_API_BASE}/networks/solana/new_pools?page=${page}`,
        { headers: { Accept: "application/json" } }
      );
      if (!response.ok) break;

      const data: GeckoPoolResponse = await response.json();
      if (!data.data || data.data.length === 0) break;

      // From new pools, only grab the ones that are on graduated DEXes (not pump.fun bonding curve)
      const graduated = data.data.filter(isGeckoGraduatedPool);
      tokens.push(...graduated.map(geckoPoolToToken));

      await delay(250);
    } catch (error) {
      console.error(`Error fetching GeckoTerminal new pools page ${page}:`, error);
      break;
    }
  }

  console.log(`GeckoTerminal new pools: ${tokens.length} graduated tokens`);
  return tokens;
}

// ============================================================
// DexScreener API (Secondary Source - better token metadata)
// ============================================================

// Fetch trending/boosted tokens from DexScreener
async function fetchDexScreenerBoosts(): Promise<DexScreenerPair[]> {
  try {
    const response = await fetch(
      `${DEXSCREENER_API_BASE}/token-boosts/top/v1`
    );
    if (!response.ok) return [];

    const boosts: DexScreenerBoost[] = await response.json();
    const solanaBoosts = boosts.filter((b) => b.chainId === "solana");
    const pairs: DexScreenerPair[] = [];

    const batchSize = 5;
    for (let i = 0; i < Math.min(solanaBoosts.length, 30); i += batchSize) {
      const batch = solanaBoosts.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (boost) => {
          try {
            const res = await fetch(
              `${DEXSCREENER_API_BASE}/latest/dex/tokens/${boost.tokenAddress}`
            );
            if (!res.ok) return [];
            const data = await res.json();
            return (data.pairs || []) as DexScreenerPair[];
          } catch {
            return [];
          }
        })
      );
      pairs.push(...batchResults.flat());
      if (i + batchSize < solanaBoosts.length) await delay(200);
    }

    return pairs;
  } catch (error) {
    console.error("Error fetching DexScreener boosts:", error);
    return [];
  }
}

// Search DexScreener with keywords
async function fetchDexScreenerSearches(): Promise<DexScreenerPair[]> {
  const allPairs: DexScreenerPair[] = [];

  for (const term of SEARCH_TERMS) {
    try {
      const response = await fetch(
        `${DEXSCREENER_API_BASE}/latest/dex/search?q=${encodeURIComponent(term)}`
      );
      if (response.ok) {
        const data: DexScreenerSearchResponse = await response.json();
        allPairs.push(...(data.pairs || []));
      }
    } catch {
      // Ignore individual search failures
    }
    await delay(150);
  }

  return allPairs;
}

// Check if a DexScreener pair is a graduated Pump.fun token
function isDexScreenerGraduated(pair: DexScreenerPair): boolean {
  if (pair.chainId !== "solana") return false;
  if (!GRADUATED_DEX_IDS.includes(pair.dexId)) return false;

  const pairAge = pair.pairCreatedAt
    ? Date.now() - pair.pairCreatedAt
    : Infinity;
  if (pairAge > THIRTY_DAYS_MS) return false;

  const marketCap = pair.marketCap || pair.fdv || 0;
  if (marketCap < 50_000 || marketCap > MAX_GRADUATED_MCAP) return false;

  const liquidity = pair.liquidity?.usd || 0;
  if (liquidity < 500) return false;

  return true;
}

// Transform DexScreener pair to GraduatedToken
function dexScreenerPairToToken(pair: DexScreenerPair): GraduatedToken {
  return {
    address: pair.baseToken.address,
    symbol: pair.baseToken.symbol,
    name: pair.baseToken.name,
    imageUrl: pair.info?.imageUrl || null,
    marketCap: pair.marketCap || pair.fdv || 0,
    liquidity: pair.liquidity?.usd || 0,
    holderCount: null,
    priceUsd: parseFloat(pair.priceUsd) || 0,
    priceChange24h: pair.priceChange?.h24 || 0,
    volume24h: pair.volume?.h24 || 0,
    pairAddress: pair.pairAddress,
    pairCreatedAt: pair.pairCreatedAt || Date.now(),
    dexScreenerUrl: buildDexScreenerUrl(pair.pairAddress),
    pumpfunUrl: buildPumpfunUrl(pair.baseToken.address),
  };
}

// ============================================================
// Enrichment: Fetch DexScreener metadata for GeckoTerminal tokens
// ============================================================

// Enrich tokens found via GeckoTerminal with DexScreener metadata (images, names)
async function enrichWithDexScreener(
  tokens: GraduatedToken[]
): Promise<GraduatedToken[]> {
  // Only enrich tokens missing images (batch to avoid rate limits)
  const needsEnrichment = tokens.filter((t) => !t.imageUrl);
  if (needsEnrichment.length === 0) return tokens;

  // DexScreener allows comma-separated addresses (up to 30)
  const enriched = new Map<string, { imageUrl?: string; name?: string }>();
  const batchSize = 30;

  for (let i = 0; i < Math.min(needsEnrichment.length, 150); i += batchSize) {
    const batch = needsEnrichment.slice(i, i + batchSize);
    const addresses = batch.map((t) => t.address).join(",");

    try {
      const response = await fetch(
        `${DEXSCREENER_API_BASE}/latest/dex/tokens/${addresses}`
      );
      if (response.ok) {
        const data = await response.json();
        const pairs: DexScreenerPair[] = data.pairs || [];
        for (const pair of pairs) {
          if (pair.info?.imageUrl) {
            enriched.set(pair.baseToken.address, {
              imageUrl: pair.info.imageUrl,
              name: pair.baseToken.name,
            });
          }
        }
      }
    } catch {
      // Ignore enrichment failures
    }
    await delay(200);
  }

  // Merge enrichment data
  return tokens.map((token) => {
    const extra = enriched.get(token.address);
    if (extra) {
      return {
        ...token,
        imageUrl: extra.imageUrl || token.imageUrl,
        name: extra.name || token.name,
      };
    }
    return token;
  });
}

// ============================================================
// Main Function
// ============================================================

// Deduplicate tokens by address, keeping the one with best data
function deduplicateTokens(tokens: GraduatedToken[]): GraduatedToken[] {
  const tokenMap = new Map<string, GraduatedToken>();

  for (const token of tokens) {
    const existing = tokenMap.get(token.address);
    if (!existing) {
      tokenMap.set(token.address, token);
    } else {
      // Merge: prefer the one with more data (image, higher liquidity)
      tokenMap.set(token.address, {
        ...existing,
        imageUrl: existing.imageUrl || token.imageUrl,
        name:
          existing.name !== existing.symbol ? existing.name : token.name,
        marketCap: Math.max(existing.marketCap, token.marketCap),
        liquidity: Math.max(existing.liquidity, token.liquidity),
        volume24h: Math.max(existing.volume24h, token.volume24h),
      });
    }
  }

  return Array.from(tokenMap.values());
}

// ============================================================
// Cache (avoid rate limits on repeated requests)
// ============================================================

let cachedTokens: GraduatedToken[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Main entry: fetch all graduated tokens from all sources
export async function fetchAllGraduatedTokens(): Promise<GraduatedToken[]> {
  // Return cached data if fresh enough
  if (cachedTokens && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    console.log(`Returning ${cachedTokens.length} cached tokens`);
    return cachedTokens;
  }

  console.log("Fetching graduated tokens from multiple sources...");
  const startTime = Date.now();

  // Phase 1: Fetch GeckoTerminal SEQUENTIALLY (shared rate limit of 30/min)
  // and DexScreener in parallel (separate rate limit)
  const [geckoTokens, dexPairs] = await Promise.all([
    fetchGeckoSequential(),
    fetchDexScreenerAll(),
  ]);

  // Process DexScreener results
  const dexGraduated = dexPairs
    .filter(isDexScreenerGraduated)
    .map(dexScreenerPairToToken);

  console.log(`DexScreener: ${dexGraduated.length} graduated tokens`);

  // Phase 2: Combine all tokens
  const allTokens = [...geckoTokens, ...dexGraduated];

  // Phase 3: Deduplicate
  const uniqueTokens = deduplicateTokens(allTokens);
  console.log(`Total unique tokens: ${uniqueTokens.length}`);

  // Phase 4: Enrich with DexScreener metadata (images/names)
  const enrichedTokens = await enrichWithDexScreener(uniqueTokens);

  // Phase 5: Sort by market cap descending
  enrichedTokens.sort((a, b) => b.marketCap - a.marketCap);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(
    `Fetched ${enrichedTokens.length} graduated tokens in ${elapsed}s`
  );

  // Cache results
  cachedTokens = enrichedTokens;
  cacheTimestamp = Date.now();

  return enrichedTokens;
}

// Run all GeckoTerminal fetches sequentially to avoid rate limiting
async function fetchGeckoSequential(): Promise<GraduatedToken[]> {
  const allTokens: GraduatedToken[] = [];

  // Trending pools first (highest value data)
  const trending = await fetchGeckoTrendingPools();
  allTokens.push(...trending);

  // Then Raydium-specific pools
  const raydium = await fetchGeckoRaydiumPools();
  allTokens.push(...raydium);

  // Then new pools
  const newPools = await fetchGeckoNewPools();
  allTokens.push(...newPools);

  console.log(`GeckoTerminal total: ${allTokens.length} tokens`);
  return allTokens;
}

// Run all DexScreener fetches in parallel (separate rate limit)
async function fetchDexScreenerAll(): Promise<DexScreenerPair[]> {
  const [boosts, searches] = await Promise.all([
    fetchDexScreenerBoosts(),
    fetchDexScreenerSearches(),
  ]);
  return [...boosts, ...searches];
}
