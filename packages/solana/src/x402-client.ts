import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import { USDC_MINT, USDC_DECIMALS, PAYMENT_SPLITS } from './constants';

interface Recipients {
  creator: string;
  websiteOwner?: string;
  treasury: string;
}

interface PaymentVerification {
  verified: boolean;
  amount: number;
  recipients: string[];
}

export class X402Client {
  private connection: Connection;
  private payer: Keypair;
  private usdcMint: PublicKey;

  constructor(rpcUrl: string, payerKeypair: Keypair, network: 'mainnet' | 'devnet' = 'devnet') {
    this.connection = new Connection(rpcUrl, 'confirmed');
    this.payer = payerKeypair;
    this.usdcMint = USDC_MINT[network];
  }

  async payForSkill(
    skillId: string,
    amount: number,
    recipients: Recipients,
  ): Promise<string> {
    const rawAmount = Math.round(amount * 10 ** USDC_DECIMALS);

    const hasWebsiteOwner = !!recipients.websiteOwner;
    const creatorShare = hasWebsiteOwner
      ? Math.round(rawAmount * PAYMENT_SPLITS.creator)
      : Math.round(rawAmount * (PAYMENT_SPLITS.creator + PAYMENT_SPLITS.websiteOwner));
    const websiteOwnerShare = hasWebsiteOwner
      ? Math.round(rawAmount * PAYMENT_SPLITS.websiteOwner)
      : 0;
    const treasuryShare = rawAmount - creatorShare - websiteOwnerShare;

    const payerAta = await getAssociatedTokenAddress(this.usdcMint, this.payer.publicKey);

    const transfers: { dest: string; amount: number }[] = [
      { dest: recipients.creator, amount: creatorShare },
      { dest: recipients.treasury, amount: treasuryShare },
    ];
    if (hasWebsiteOwner) {
      transfers.push({ dest: recipients.websiteOwner!, amount: websiteOwnerShare });
    }

    const tx = new Transaction();

    for (const t of transfers) {
      const destPubkey = new PublicKey(t.dest);
      const destAta = await getOrCreateAssociatedTokenAccount(
        this.connection,
        this.payer,
        this.usdcMint,
        destPubkey,
      );
      tx.add(
        createTransferInstruction(payerAta, destAta.address, this.payer.publicKey, t.amount),
      );
    }

    // Add skillId as memo-like data in transaction
    tx.feePayer = this.payer.publicKey;

    const signature = await sendAndConfirmTransaction(this.connection, tx, [this.payer]);
    return signature;
  }

  async verifyPayment(txSignature: string): Promise<PaymentVerification> {
    try {
      const tx = await this.connection.getTransaction(txSignature, {
        maxSupportedTransactionVersion: 0,
      });

      if (!tx || !tx.meta) {
        return { verified: false, amount: 0, recipients: [] };
      }

      // Sum up post-token balance changes to compute total transferred
      const preBalances = tx.meta.preTokenBalances ?? [];
      const postBalances = tx.meta.postTokenBalances ?? [];

      let totalTransferred = 0;
      const recipientSet = new Set<string>();

      for (const post of postBalances) {
        const pre = preBalances.find(
          (p) => p.accountIndex === post.accountIndex,
        );
        const preAmount = pre ? Number(pre.uiTokenAmount.amount) : 0;
        const postAmount = Number(post.uiTokenAmount.amount);
        const diff = postAmount - preAmount;
        if (diff > 0 && post.owner) {
          totalTransferred += diff;
          recipientSet.add(post.owner);
        }
      }

      return {
        verified: totalTransferred > 0 && tx.meta.err === null,
        amount: totalTransferred / 10 ** USDC_DECIMALS,
        recipients: Array.from(recipientSet),
      };
    } catch {
      return { verified: false, amount: 0, recipients: [] };
    }
  }
}
