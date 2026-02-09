/**
 * 🔓 Reverse-Engineered API Client for marinade.finance
 * Generated: 2026-02-09
 * Status: Verified
 */

const BASE_URL = 'https://api.marinade.finance';

export interface TLVResponse {
  staked_sol: number;
  staked_usd: number;
  msol_directed_stake_sol: number;
  msol_directed_stake_msol: number;
  liquidity_sol: number;
  liquidity_usd: number;
  total_sol: number;
  total_usd: number;
  self_staked_sol: number;
  self_staked_usd: number;
  standard_staked_sol: number;
  standard_staked_usd: number;
  total_virtual_staked_sol: number;
  total_virtual_staked_usd: number;
  marinade_native_stake_sol: number;
  marinade_native_stake_usd: number;
  marinade_select_stake_sol: number;
  marinade_select_stake_usd: number;
}

export class MarinadeAPI {
  /**
   * Get total locked value and staking statistics
   */
  async getTLV(): Promise<TLVResponse> {
    const response = await fetch(`${BASE_URL}/tlv`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }
}

export default new MarinadeAPI();
