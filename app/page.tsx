"use client";

import { useState, useEffect, useCallback } from "react";
import type { GraduatedToken, TokensApiResponse } from "@/lib/types";
import { MARKET_CAP_TIERS } from "@/lib/constants";
import { groupTokensByTier, formatRelativeTime } from "@/lib/utils";
import { TierRow } from "@/components/TierRow";
import { LoadingState } from "@/components/LoadingState";
import { RefreshButton } from "@/components/RefreshButton";

export default function HomePage() {
  const [tokens, setTokens] = useState<GraduatedToken[]>([]);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [limitations, setLimitations] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTokens = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tokens");
      if (!response.ok) throw new Error("Failed to fetch tokens");

      const data: TokensApiResponse = await response.json();
      setTokens(data.tokens);
      setLastUpdated(data.lastUpdated);
      setTotalCount(data.totalCount);
      setLimitations(data.limitations);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  const groupedTokens = groupTokensByTier(tokens);

  return (
    <main className="min-h-screen pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-bg/95 backdrop-blur-sm border-b border-border px-4 py-4">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Pump.fun Graduated Library
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Browse tokens that graduated from Pump.fun in the last 30 days
              </p>
            </div>

            <div className="flex items-center gap-4">
              {lastUpdated && (
                <span className="text-xs text-gray-500">
                  Updated {formatRelativeTime(lastUpdated)}
                </span>
              )}
              <RefreshButton onClick={fetchTokens} isLoading={isLoading} />
            </div>
          </div>

          {/* Stats Bar */}
          {!isLoading && (
            <div className="flex items-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Total Tokens:</span>
                <span className="text-white font-medium">{totalCount}</span>
              </div>
              {MARKET_CAP_TIERS.map((tier) => (
                <div key={tier.id} className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full`}
                    style={{ backgroundColor: tier.color }}
                  />
                  <span className="text-gray-500">{tier.label}:</span>
                  <span className="text-white font-medium">
                    {groupedTokens[tier.id]?.length || 0}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Disclaimer */}
      {limitations && !isLoading && (
        <div className="max-w-[1800px] mx-auto px-4 mt-4">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3 text-xs text-yellow-500/80">
            <strong>Note:</strong> {limitations}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto mt-6">
        {error ? (
          <div className="mx-4 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-8 text-center">
            <p className="text-red-400 font-medium mb-2">
              Error loading tokens
            </p>
            <p className="text-red-400/70 text-sm mb-4">{error}</p>
            <button
              onClick={fetchTokens}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : isLoading ? (
          <LoadingState />
        ) : (
          <>
            {MARKET_CAP_TIERS.map((tier) => (
              <TierRow
                key={tier.id}
                tier={tier}
                tokens={groupedTokens[tier.id] || []}
              />
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="max-w-[1800px] mx-auto px-4 mt-8 pt-6 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-gray-600">
          <p>Data sourced from DexScreener API. Tokens on Raydium created in the last 30 days.</p>
          <p>Market caps and prices update on page refresh.</p>
        </div>
      </footer>
    </main>
  );
}
