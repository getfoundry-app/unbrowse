# 🔓 Reverse-Engineered: marinade.finance Internal API

**Status**: ✅ Verified  
**Domain**: `api.marinade.finance`  
**Auth**: None required  
**Type**: REST JSON

## Overview

Internal API for Marinade Finance, a liquid staking protocol on Solana. Provides real-time Total Locked Value (TLV) and staking metrics.

## Discovered Endpoints

### GET /tlv
Get total locked value and staking statistics

**Example Request**:
```bash
curl -s "https://api.marinade.finance/tlv"
```

**Response**:
```json
{
  "staked_sol": 2995716.339007911,
  "staked_usd": 251973736.59373552,
  "msol_directed_stake_sol": 599143.2678015822,
  "msol_directed_stake_msol": 31675.683067416467,
  "liquidity_sol": 7870.323876738,
  "liquidity_usd": 661983.5428348049,
  "total_sol": 8103238.581426931,
  "total_usd": 681574312.3892856,
  "self_staked_sol": 1214034.725192254,
  "self_staked_usd": 102114096.07711636,
  "standard_staked_sol": 1781681.613815657,
  "standard_staked_usd": 149859640.51661918,
  "total_virtual_staked_sol": 3065733.269387276,
  "total_virtual_staked_usd": 257862954.92284966,
  "marinade_native_stake_sol": 3177857.735777934,
  "marinade_native_stake_usd": 267293894.82598788,
  "marinade_select_stake_sol": 1921794.182764348,
  "marinade_select_stake_usd": 161644697.42672732
}
```

**Fields**:
- `staked_sol`: Total SOL staked in protocol
- `total_usd`: Total value in USD
- `liquidity_sol`: Available liquidity in SOL
- `marinade_native_stake_sol`: Native staking amount
- `marinade_select_stake_sol`: Select staking amount

## Notes

This is an undocumented internal endpoint used by the Marinade Finance frontend to display staking metrics.
