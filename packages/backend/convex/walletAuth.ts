import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import nacl from "tweetnacl";
import bs58 from "bs58";

/**
 * Solana Ed25519 wallet verification as an internal action.
 */
export const verifyWallet = internalAction({
  args: {
    walletAddress: v.string(),
    signature: v.string(),
    message: v.string(),
  },
  handler: async (_ctx, args): Promise<{ valid: boolean; walletAddress: string }> => {
    try {
      const publicKeyBytes = bs58.decode(args.walletAddress);
      const signatureBytes = bs58.decode(args.signature);
      const messageBytes = new TextEncoder().encode(args.message);

      const isValid = nacl.sign.detached.verify(
        messageBytes,
        signatureBytes,
        publicKeyBytes
      );

      return { valid: isValid, walletAddress: args.walletAddress };
    } catch {
      return { valid: false, walletAddress: args.walletAddress };
    }
  },
});
