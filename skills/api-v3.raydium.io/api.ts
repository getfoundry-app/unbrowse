/**
 * 🔓 Reverse-Engineered API Client for Raydium V3
 * Generated: 2026-02-09
 * Status: Verified
 */

const BASE_URL = 'https://api-v3.raydium.io';

export interface MainInfo {
  volume24: number;
  tvl: number;
}

export interface Token {
  chainId: number;
  address: string;
  programId: string;
  logoURI: string;
  symbol: string;
  name: string;
  decimals: number;
  tags: string[];
  extensions: Record<string, any>;
}

export interface VolumeMetrics {
  volume: number;
  volumeQuote: number;
  volumeFee: number;
  apr: number;
  feeApr: number;
  priceMin: number;
  priceMax: number;
  rewardApr: number[];
}

export interface Pool {
  type: string;
  programId: string;
  id: string;
  mintA: Token;
  mintB: Token;
  price: number;
  mintAmountA: number;
  mintAmountB: number;
  feeRate: number;
  openTime: string;
  tvl: number;
  day: VolumeMetrics;
  week: Partial<VolumeMetrics>;
  month: Partial<VolumeMetrics>;
  pooltype: string[];
  farmUpcomingCount: number;
  farmOngoingCount: number;
  farmFinishedCount: number;
  burnPercent: number;
  rewardDefaultInfos?: any[];
  marketId?: string;
  lpMint?: Token;
  lpPrice?: number;
  lpAmount?: number;
}

export interface PoolListResponse {
  id: string;
  success: boolean;
  data: {
    count: number;
    data: Pool[];
    hasNextPage: boolean;
  };
}

export interface InfoResponse<T> {
  id: string;
  success: boolean;
  data: T;
}

export class RaydiumAPI {
  /**
   * Get main platform info (24h volume, TVL)
   */
  async getMainInfo(): Promise<InfoResponse<MainInfo>> {
    const response = await fetch(`${BASE_URL}/main/info`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * List pools with pagination and filters
   */
  async listPools(params: {
    poolType?: string;
    poolSortField?: string;
    sortType?: 'desc' | 'asc';
    pageSize?: number;
    page?: number;
  } = {}): Promise<PoolListResponse> {
    const {
      poolType = 'all',
      poolSortField = 'default',
      sortType = 'desc',
      pageSize = 20,
      page = 1
    } = params;

    const url = new URL(`${BASE_URL}/pools/info/list`);
    url.searchParams.set('poolType', poolType);
    url.searchParams.set('poolSortField', poolSortField);
    url.searchParams.set('sortType', sortType);
    url.searchParams.set('pageSize', pageSize.toString());
    url.searchParams.set('page', page.toString());

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get pool info by IDs
   */
  async getPoolsByIds(ids: string[]): Promise<InfoResponse<Pool[]>> {
    const url = new URL(`${BASE_URL}/pools/info/ids`);
    url.searchParams.set('ids', ids.join(','));

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }
}

export default new RaydiumAPI();
