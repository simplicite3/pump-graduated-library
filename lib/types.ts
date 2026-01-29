// Token data after processing from DexScreener
export interface GraduatedToken {
  address: string;
  symbol: string;
  name: string;
  imageUrl: string | null;
  marketCap: number;
  liquidity: number;
  holderCount: number | null;
  priceUsd: number;
  priceChange24h: number;
  volume24h: number;
  pairAddress: string;
  pairCreatedAt: number;
  dexScreenerUrl: string;
  pumpfunUrl: string;
}

// Market cap tier definition
export interface MarketCapTier {
  id: string;
  label: string;
  minCap: number;
  maxCap: number;
  color: string;
  bgClass: string;
  textClass: string;
}

// API response shape
export interface TokensApiResponse {
  tokens: GraduatedToken[];
  lastUpdated: number;
  totalCount: number;
  limitations: string;
}

// DexScreener raw pair data
export interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  txns?: {
    h24?: { buys: number; sells: number };
  };
  volume?: {
    h24?: number;
  };
  priceChange?: {
    h24?: number;
  };
  liquidity?: {
    usd?: number;
    base?: number;
    quote?: number;
  };
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number;
  info?: {
    imageUrl?: string;
    header?: string;
    openGraph?: string;
    websites?: { label?: string; url: string }[];
    socials?: { type: string; url: string }[];
  };
}

// DexScreener search response
export interface DexScreenerSearchResponse {
  pairs: DexScreenerPair[];
}

// DexScreener boost response
export interface DexScreenerBoost {
  url: string;
  chainId: string;
  tokenAddress: string;
  icon?: string;
  header?: string;
  openGraph?: string;
  description?: string;
  links?: { type: string; label: string; url: string }[];
}
