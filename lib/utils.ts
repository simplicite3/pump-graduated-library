import type { GraduatedToken, MarketCapTier } from "./types";
import { MARKET_CAP_TIERS } from "./constants";

// Format currency with appropriate suffix (K, M, B)
export function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toFixed(2)}`;
}

// Format percentage with sign
export function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

// Format large numbers with commas
export function formatNumber(value: number): string {
  return value.toLocaleString();
}

// Get the appropriate tier for a market cap value
export function getTierForMarketCap(marketCap: number): MarketCapTier | null {
  return (
    MARKET_CAP_TIERS.find(
      (tier) => marketCap >= tier.minCap && marketCap < tier.maxCap
    ) || null
  );
}

// Group tokens by their market cap tier
export function groupTokensByTier(
  tokens: GraduatedToken[]
): Record<string, GraduatedToken[]> {
  const grouped: Record<string, GraduatedToken[]> = {};

  // Initialize all tiers with empty arrays
  for (const tier of MARKET_CAP_TIERS) {
    grouped[tier.id] = [];
  }

  // Sort tokens into tiers
  for (const token of tokens) {
    const tier = getTierForMarketCap(token.marketCap);
    if (tier) {
      grouped[tier.id].push(token);
    }
  }

  // Sort each tier by market cap (highest first)
  for (const tierId of Object.keys(grouped)) {
    grouped[tierId].sort((a, b) => b.marketCap - a.marketCap);
  }

  return grouped;
}

// Format timestamp to relative time
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// Delay helper for rate limiting
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Truncate text with ellipsis
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}
