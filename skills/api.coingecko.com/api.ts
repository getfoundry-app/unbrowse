/**
 * 🔓 Reverse-Engineered API Client for CoinGecko
 * Generated: 2026-02-09
 * Status: Verified
 */

const BASE_URL = 'https://api.coingecko.com/api/v3';

export interface PriceData {
  [currency: string]: number;
}

export interface PriceResponse {
  [coinId: string]: PriceData;
}

export interface CoinListItem {
  id: string;
  symbol: string;
  name: string;
  platforms: Record<string, string>;
}

export class CoinGeckoAPI {
  /**
   * Get current prices for coins by ID
   */
  async getPrice(
    coinIds: string[],
    vsCurrencies: string[] = ['usd']
  ): Promise<PriceResponse> {
    const url = new URL(`${BASE_URL}/simple/price`);
    url.searchParams.set('ids', coinIds.join(','));
    url.searchParams.set('vs_currencies', vsCurrencies.join(','));

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get token prices by contract address
   */
  async getTokenPrice(
    platform: string,
    contractAddresses: string[],
    vsCurrencies: string[] = ['usd']
  ): Promise<PriceResponse> {
    const url = new URL(`${BASE_URL}/simple/token_price/${platform}`);
    url.searchParams.set('contract_addresses', contractAddresses.join(','));
    url.searchParams.set('vs_currencies', vsCurrencies.join(','));

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get Solana SPL token price (convenience method)
   */
  async getSolanaTokenPrice(contractAddress: string): Promise<number | null> {
    const result = await this.getTokenPrice('solana', [contractAddress]);
    return result[contractAddress]?.usd || null;
  }

  /**
   * List all supported coins
   */
  async listCoins(includePlatform = false): Promise<CoinListItem[]> {
    const url = new URL(`${BASE_URL}/coins/list`);
    if (includePlatform) {
      url.searchParams.set('include_platform', 'true');
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get multiple coin prices (convenience method)
   */
  async getMultipleCoins(coins: {id: string; platform?: string; contract?: string}[]): Promise<PriceResponse> {
    const coinIds = coins.filter(c => !c.platform).map(c => c.id);
    
    if (coinIds.length > 0) {
      return this.getPrice(coinIds);
    }

    return {};
  }
}

export default new CoinGeckoAPI();
