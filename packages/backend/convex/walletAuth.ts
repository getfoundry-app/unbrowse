import nacl from "tweetnacl";
import bs58 from "bs58";

/**
 * Verify a Solana Ed25519 wallet signature.
 * Returns the wallet address (userId) if valid, null otherwise.
 */
export function verifyWalletSignature(
  walletAddress: string,
  signature: string,
  message: string
): string | null {
  try {
    const publicKeyBytes = bs58.decode(walletAddress);
    const signatureBytes = bs58.decode(signature);
    const messageBytes = new TextEncoder().encode(message);

    const isValid = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );

    return isValid ? walletAddress : null;
  } catch {
    return null;
  }
}
