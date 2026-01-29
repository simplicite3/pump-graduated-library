import { NextResponse } from "next/server";
import { fetchAllGraduatedTokens } from "@/lib/dexscreener";
import type { TokensApiResponse } from "@/lib/types";

export const dynamic = "force-dynamic"; // No caching - always fresh data

export async function GET() {
  try {
    const tokens = await fetchAllGraduatedTokens();

    const response: TokensApiResponse = {
      tokens,
      lastUpdated: Date.now(),
      totalCount: tokens.length,
      limitations:
        "This data is aggregated from DexScreener API using heuristics to identify likely Pump.fun graduated tokens. The list may not be complete. Holder counts are not available from DexScreener.",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Token fetch error:", error);
    return NextResponse.json(
      {
        tokens: [],
        lastUpdated: Date.now(),
        totalCount: 0,
        limitations: "API error occurred while fetching data.",
        error: "Failed to fetch token data",
      },
      { status: 500 }
    );
  }
}
