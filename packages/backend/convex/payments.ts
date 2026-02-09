import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/** Calculate payment splits: creator 50%, website owner 30%, treasury 20% */
export function calculateSplits(amountUsdc: number) {
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

export const getPaymentHistory = query({
  args: {
    walletAddress: v.string(),
    limit: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("payments")
      .withIndex("by_payerWallet", (q) => q.eq("payerWallet", args.walletAddress))
      .order("desc")
      .collect();
    if (args.limit) {
      return results.slice(0, args.limit);
    }
    return results;
  },
});

export const getPaymentsBySkill = query({
  args: { skillId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_skillId", (q) => q.eq("skillId", args.skillId))
      .order("desc")
      .collect();
  },
});
