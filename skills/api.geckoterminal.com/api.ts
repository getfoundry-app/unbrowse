/**
 * 🔓 Reverse-Engineered API Client for GeckoTerminal
 * Generated: 2026-02-09
 * Status: Verified
 */

const BASE_URL = 'https://api.geckoterminal.com/api/v2';

export interface VolumeData {
  h24: string;
}

export interface TokenAttributes {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  image_url: string;
  coingecko_coin_id: string;
  total_supply: string;
  normalized_total_supply: string;
  price_usd: string;
  fdv_usd: string;
  total_reserve_in_usd: string;
  volume_usd: VolumeData;
  market_cap_usd: string;
}

export interface PoolReference {
  id: string;
  type: string;
}

export interface TokenData {
  id: string;
  type: string;
  attributes: TokenAttributes;
  relationships: {
    top_pools: {
      data: PoolReference[];
    };
  };
}

export interface TokenResponse {
  data: TokenData;
}

export class GeckoTerminalAPI {
  /**
   * Get token info by network and address
   */
  async getToken(network: string, address: string): Promise<TokenResponse> {
    const response = await fetch(`${BASE_URL}/networks/${network}/tokens/${address}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get Solana token info (convenience method)
   */
  async getSolanaToken(address: string): Promise<TokenResponse> {
    return this.getToken('solana', address);
  }

  /**
   * Get multiple tokens
   */
  async getTokens(network: string, addresses: string[]): Promise<any> {
    const addressList = addresses.join(',');
    const response = await fetch(`${BASE_URL}/networks/${network}/tokens/multi/${addressList}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get pool info
   */
  async getPool(network: string, poolAddress: string): Promise<any> {
    const response = await fetch(`${BASE_URL}/networks/${network}/pools/${poolAddress}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Search pools
   */
  async searchPools(query: string, network?: string): Promise<any> {
    const url = new URL(`${BASE_URL}/search/pools`);
    url.searchParams.set('query', query);
    if (network) {
      url.searchParams.set('network', network);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }
}

export default new GeckoTerminalAPI();
