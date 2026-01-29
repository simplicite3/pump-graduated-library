"use client";

import { MARKET_CAP_TIERS } from "@/lib/constants";

export function LoadingState() {
  return (
    <div className="animate-pulse">
      {MARKET_CAP_TIERS.map((tier) => (
        <section key={tier.id} className="mb-6">
          {/* Tier Header Skeleton */}
          <div className="flex items-center gap-3 mb-3 px-4">
            <div
              className={`h-7 w-28 rounded-full ${tier.bgClass} opacity-50`}
            />
            <div className="h-4 w-16 bg-gray-800 rounded" />
          </div>

          {/* Cards Skeleton Row */}
          <div className="flex gap-4 overflow-hidden px-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-52 h-48 bg-card border border-border rounded-xl p-4"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gray-800" />
                  <div className="flex-1">
                    <div className="h-4 w-16 bg-gray-800 rounded mb-1" />
                    <div className="h-3 w-24 bg-gray-800/50 rounded" />
                  </div>
                </div>
                <div className="h-6 w-24 bg-gray-800 rounded mb-2" />
                <div className="h-3 w-16 bg-gray-800/50 rounded mb-3" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-gray-800/30 rounded" />
                  <div className="h-3 w-full bg-gray-800/30 rounded" />
                  <div className="h-3 w-full bg-gray-800/30 rounded" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
