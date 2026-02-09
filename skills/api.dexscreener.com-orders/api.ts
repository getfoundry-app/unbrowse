/**
 * 🔓 Reverse-Engineered API Client for DexScreener Orders
 * Generated: 2026-02-09
 * Status: Verified
 */

const BASE_URL = 'https://api.dexscreener.com';

export interface Order {
  chainId: string;
  tokenAddress: string;
  type: 'tokenAd' | 'tokenProfile' | 'communityTakeover';
  status: 'on-hold' | 'approved' | 'cancelled';
  paymentTimestamp: number;
}

export interface Boost {
  chainId: string;
  tokenAddress: string;
  id: string;
  amount: number;
  paymentTimestamp: number;
}

export interface OrdersResponse {
  orders: Order[];
  boosts: Boost[];
}

export interface Link {
  label?: string;
  type?: string;
  url: string;
}

export interface TokenProfile {
  url: string;
  chainId: string;
  tokenAddress: string;
  icon: string;
  header?: string;
  openGraph: string;
  description?: string;
  links: Link[];
  cto: boolean;
}

export class DexScreenerOrdersAPI {
  /**
   * Get promotional orders for a token
   */
  async getTokenOrders(chain: string, tokenAddress: string): Promise<OrdersResponse> {
    const response = await fetch(`${BASE_URL}/orders/v1/${chain}/${tokenAddress}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get latest token profiles with promotional content
   */
  async getLatestTokenProfiles(): Promise<TokenProfile[]> {
    const response = await fetch(`${BASE_URL}/token-profiles/latest/v1`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get trending promoted tokens (convenience method)
   */
  async getTrendingPromotedTokens(limit = 10): Promise<TokenProfile[]> {
    const profiles = await this.getLatestTokenProfiles();
    return profiles.slice(0, limit);
  }

  /**
   * Get Solana token orders (convenience method)
   */
  async getSolanaTokenOrders(tokenAddress: string): Promise<OrdersResponse> {
    return this.getTokenOrders('solana', tokenAddress);
  }
}

export default new DexScreenerOrdersAPI();
