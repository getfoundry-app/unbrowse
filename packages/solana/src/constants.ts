import { PublicKey } from '@solana/web3.js';

export const USDC_MINT = {
  mainnet: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
  devnet: new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'),
};

export const TREASURY_WALLET = new PublicKey('11111111111111111111111111111112'); // placeholder

export const PAYMENT_SPLITS = {
  creator: 0.5,
  websiteOwner: 0.3,
  treasury: 0.2,
} as const;

export const USDC_DECIMALS = 6;
