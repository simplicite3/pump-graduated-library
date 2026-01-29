"use client";

import type { GraduatedToken } from "@/lib/types";
import { formatCurrency, formatPercent } from "@/lib/utils";

interface CoinCardProps {
  token: GraduatedToken;
}

export function CoinCard({ token }: CoinCardProps) {
  const priceChangeColor =
    token.priceChange24h >= 0 ? "text-green-400" : "text-red-400";

  return (
    <div className="flex-shrink-0 w-52 snap-start bg-card border border-border rounded-xl p-4 hover:border-accent/50 transition-all duration-200 card-glow">
      {/* Token Header */}
      <div className="flex items-start gap-3 mb-3">
        {/* Token Image */}
        <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden flex-shrink-0">
          {token.imageUrl ? (
            <img
              src={token.imageUrl}
              alt={token.symbol}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : null}
          <div
            className={`w-full h-full flex items-center justify-center text-lg font-bold text-gray-400 ${token.imageUrl ? "hidden" : ""}`}
          >
            {token.symbol.slice(0, 2).toUpperCase()}
          </div>
        </div>

        {/* Token Name & Symbol */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white truncate text-sm">
            {token.symbol}
          </h3>
          <p className="text-xs text-gray-500 truncate">{token.name}</p>
        </div>
      </div>

      {/* Market Cap (Main Stat) */}
      <div className="mb-3">
        <div className="text-xl font-bold text-white">
          {formatCurrency(token.marketCap)}
        </div>
        <div className={`text-xs ${priceChangeColor}`}>
          {formatPercent(token.priceChange24h)} (24h)
        </div>
      </div>

      {/* Stats Grid */}
      <div className="space-y-1.5 text-xs mb-4">
        <div className="flex justify-between">
          <span className="text-gray-500">Liquidity</span>
          <span className="text-gray-300">
            {formatCurrency(token.liquidity)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Volume 24h</span>
          <span className="text-gray-300">
            {formatCurrency(token.volume24h)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Holders</span>
          <span className={token.holderCount ? "text-gray-300" : "text-gray-600"}>
            {token.holderCount?.toLocaleString() ?? "N/A"}
          </span>
        </div>
      </div>

      {/* Links */}
      <div className="flex gap-2">
        <a
          href={token.dexScreenerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center py-1.5 px-2 text-xs font-medium bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-gray-300"
        >
          DexScreener
        </a>
        <a
          href={token.pumpfunUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center py-1.5 px-2 text-xs font-medium bg-accent/20 hover:bg-accent/30 rounded-lg transition-colors text-accent"
        >
          Pump.fun
        </a>
      </div>
    </div>
  );
}
