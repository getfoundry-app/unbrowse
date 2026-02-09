import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/** Calculate payment splits: creator 50%, website owner 30%, treasury 20% */
export function calculateSplits(amountUsdc: number): {
  creatorShare: number;
  websiteOwnerShare: number;
  treasuryShare: number;
} {
  return {
    creatorShare: Math.round(amountUsdc * 0.5 * 1e6) / 1e6,
    websiteOwnerShare: Math.round(amountUsdc * 0.3 * 1e6) / 1e6,
    treasuryShare: Math.round(amountUsdc * 0.2 * 1e6) / 1e6,
  };
}

export const recordPayment = mutation({
  args: {
    txSignature: v.string(),
    payerWallet: v.string(),
    skillId: v.string(),
    amountUsdc: v.float64(),
    paymentType: v.string(),
  },
  handler: async (ctx, args) => {
    const splits = calculateSplits(args.amountUsdc);
    return await ctx.db.insert("payments", {
      txSignature: args.txSignature,
      payerWallet: args.payerWallet,
      skillId: args.skillId,
      amountUsdc: args.amountUsdc,
      paymentType: args.paymentType,
      creatorShare: splits.creatorShare,
      websiteOwnerShare: splits.websiteOwnerShare,
      treasuryShare: splits.treasuryShare,
      indexerShare: 0,
    });
  },
});

export const verifyPayment = mutation({
  args: {
    txSignature: v.string(),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("payments")
      .filter((q) => q.eq(q.field("txSignature"), args.txSignature))
      .first();

    if (!payment) {
      return { verified: false, error: "Payment not found" };
    }

    // Mark as verified with current timestamp
    // In production, you'd call Solana RPC to confirm the transaction
    await ctx.db.patch(payment._id, {
      verifiedAt: Date.now(),
    });

    return { verified: true, paymentId: payment._id };
  },
});

export const getPaymentHistory = query({
  args: { payerWallet: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_payerWallet", (q) =>
        q.eq("payerWallet", args.payerWallet)
      )
      .order("desc")
      .collect();
  },
});
