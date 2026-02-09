/**
 * 🔓 Reverse-Engineered API Client for Orca Whirlpool
 * Generated: 2026-02-09
 * Status: Verified
 */

const BASE_URL = 'https://api.mainnet.orca.so';

export interface Token {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  coingeckoId?: string;
  whitelisted: boolean;
  poolToken: boolean;
  token2022: boolean;
}

export interface VolumeMetrics {
  day: number;
  week: number;
  month: number;
}

export interface Whirlpool {
  address: string;
  tokenA: Token;
  tokenB: Token;
  whitelisted: boolean;
  token2022: boolean;
  tickSpacing: number;
  price: number;
  lpFeeRate: number;
  protocolFeeRate: number;
  whirlpoolsConfig: string;
  modifiedTimeMs: number;
  tvl: number;
  volume: VolumeMetrics;
  volumeDenominatedA: VolumeMetrics;
  volumeDenominatedB: VolumeMetrics;
  feeApr: VolumeMetrics;
  reward0Apr: VolumeMetrics;
  reward1Apr: VolumeMetrics;
  reward2Apr: VolumeMetrics;
  totalApr: VolumeMetrics;
}

export class OrcaWhirlpoolAPI {
  /**
   * List all whirlpool pools
   */
  async listWhirlpools(): Promise<Whirlpool[]> {
    const response = await fetch(`${BASE_URL}/v1/whirlpool/list`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Find pools by token mint address
   */
  async findPoolsByToken(mintAddress: string): Promise<Whirlpool[]> {
    const pools = await this.listWhirlpools();
    return pools.filter(
      pool => pool.tokenA.mint === mintAddress || pool.tokenB.mint === mintAddress
    );
  }

  /**
   * Get top pools by TVL
   */
  async getTopPoolsByTVL(limit = 10): Promise<Whirlpool[]> {
    const pools = await this.listWhirlpools();
    return pools
      .sort((a, b) => b.tvl - a.tvl)
      .slice(0, limit);
  }
}

export default new OrcaWhirlpoolAPI();
