"use client";

import { useRef } from "react";
import type { GraduatedToken, MarketCapTier } from "@/lib/types";
import { CoinCard } from "./CoinCard";

interface TierRowProps {
  tier: MarketCapTier;
  tokens: GraduatedToken[];
}

export function TierRow({ tier, tokens }: TierRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 400;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="mb-6">
      {/* Tier Header */}
      <div className="flex items-center justify-between mb-3 px-4">
        <div className="flex items-center gap-3">
          <span
            className={`text-sm font-bold uppercase tracking-wider px-3 py-1 rounded-full ${tier.bgClass} ${tier.textClass}`}
          >
            {tier.label}
          </span>
          <span className="text-sm text-gray-500">
            {tokens.length} token{tokens.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Scroll Buttons */}
        {tokens.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
              aria-label="Scroll left"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
              aria-label="Scroll right"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Token Cards Row */}
      {tokens.length === 0 ? (
        <div className="text-gray-600 text-sm py-8 text-center border border-dashed border-gray-800 rounded-xl mx-4">
          No tokens in this range
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-3 px-4 tier-row scrollbar-thin snap-x"
        >
          {tokens.map((token) => (
            <CoinCard key={token.address} token={token} />
          ))}
        </div>
      )}
    </section>
  );
}
