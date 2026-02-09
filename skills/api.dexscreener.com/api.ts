/**
 * 🔓 Reverse-Engineered API Client for DexScreener
 * Generated: 2026-02-09
 * Status: Verified
 */

const BASE_URL = 'https://api.dexscreener.com';

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
}

export interface PairInfo {
  url: string;
  imageUrl?: string;
  header?: string;
  openGraph?: string;
  websites?: Array<{ url: string; label: string }>;
  socials?: Array<{ url: string; type: string }>;
}

export interface TransactionCounts {
  buys: number;
  sells: number;
}

export interface Liquidity {
  usd: number;
  base: number;
  quote: number;
}

export interface Pair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  labels?: string[];
  baseToken: TokenInfo;
  quoteToken: TokenInfo;
  priceNative: string;
  priceUsd: string;
  txns: {
    m5: TransactionCounts;
    h1: TransactionCounts;
    h6: TransactionCounts;
    h24: TransactionCounts;
  };
  volume: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  priceChange: {
    m5?: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidity: Liquidity;
  fdv?: number;
  marketCap?: number;
  pairCreatedAt: number;
  info?: PairInfo;
}

export interface TokenPairsResponse {
  schemaVersion: string;
  pairs: Pair[];
}

export class DexScreenerAPI {
  /**
   * Get all DEX pairs for a token
   */
  async getTokenPairs(tokenAddress: string): Promise<TokenPairsResponse> {
    const response = await fetch(`${BASE_URL}/latest/dex/tokens/${tokenAddress}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get pairs for multiple tokens (comma-separated)
   */
  async getMultipleTokenPairs(tokenAddresses: string[]): Promise<TokenPairsResponse> {
    const addresses = tokenAddresses.join(',');
    const response = await fetch(`${BASE_URL}/latest/dex/tokens/${addresses}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get pair info by chain and pair address
   */
  async getPairByAddress(chainId: string, pairAddress: string): Promise<TokenPairsResponse> {
    const response = await fetch(`${BASE_URL}/latest/dex/pairs/${chainId}/${pairAddress}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Search pairs by token name or symbol
   */
  async searchPairs(query: string): Promise<TokenPairsResponse> {
    const response = await fetch(`${BASE_URL}/latest/dex/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }
}

export default new DexScreenerAPI();
