import { Keypair } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

export function signAuthMessage(
  keypair: Keypair,
  message: string,
): { signature: string; publicKey: string } {
  const messageBytes = new TextEncoder().encode(message);
  const sig = nacl.sign.detached(messageBytes, keypair.secretKey);
  return {
    signature: bs58.encode(sig),
    publicKey: keypair.publicKey.toBase58(),
  };
}

export function verifyAuthMessage(
  publicKey: string,
  signature: string,
  message: string,
): boolean {
  try {
    const pubkeyBytes = bs58.decode(publicKey);
    const sigBytes = bs58.decode(signature);
    const messageBytes = new TextEncoder().encode(message);
    return nacl.sign.detached.verify(messageBytes, sigBytes, pubkeyBytes);
  } catch {
    return false;
  }
}

export function createAuthHeaders(
  keypair: Keypair,
): Record<string, string> {
  const timestamp = Date.now();
  const message = `unbrowse-auth:${timestamp}`;
  const { signature, publicKey } = signAuthMessage(keypair, message);
  return {
    'X-Wallet-Address': publicKey,
    'X-Wallet-Signature': signature,
    'X-Wallet-Message': message,
  };
}
