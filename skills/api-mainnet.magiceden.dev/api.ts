/**
 * 🔓 Reverse-Engineered API Client for Magic Eden
 * Generated: 2026-02-09
 * Status: Verified (partial)
 */

const BASE_URL = 'https://api-mainnet.magiceden.dev';

export interface Collection {
  symbol: string;
  name: string;
  description: string;
  image: string;
  twitter: string;
  discord: string;
  website: string;
  categories: string[];
  isBadged: boolean;
  hasCNFTs: boolean;
  isOcp: boolean;
  splTokens: any[];
}

export class MagicEdenAPI {
  /**
   * List NFT collections (paginated)
   * Note: offset and limit must be multiples of 20
   */
  async listCollections(params: {
    offset?: number;
    limit?: number;
  } = {}): Promise<Collection[]> {
    const { offset = 0, limit = 20 } = params;

    // Ensure multiples of 20
    if (offset % 20 !== 0 || limit % 20 !== 0) {
      throw new Error('offset and limit must be multiples of 20');
    }

    const url = new URL(`${BASE_URL}/v2/collections`);
    url.searchParams.set('offset', offset.toString());
    url.searchParams.set('limit', limit.toString());

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get collection by symbol
   */
  async getCollection(symbol: string): Promise<any> {
    const response = await fetch(`${BASE_URL}/v2/collections/${symbol}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get collection stats
   */
  async getCollectionStats(symbol: string): Promise<any> {
    const response = await fetch(`${BASE_URL}/v2/collections/${symbol}/stats`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }
}

export default new MagicEdenAPI();
