import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/** Weight mapping for feedback types */
const FEEDBACK_WEIGHTS: Record<string, number> = {
  works_great: 1,
  works_sometimes: 0,
  broken: -5,
  auth_expired: -2,
  spam_malicious: -20,
};

/** Calculate trust tier from reputation score */
function getTrustTier(score: number): string {
  if (score >= 100) return "expert";
  if (score >= 50) return "trusted";
  if (score >= 10) return "regular";
  if (score >= 0) return "new";
  return "untrusted";
}

export const initReputation = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("reporterReputation")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    if (existing) return existing._id;

    return await ctx.db.insert("reporterReputation", {
      userId: args.userId,
      totalReports: 0,
      verifiedReports: 0,
      falseReports: 0,
      reputationScore: 0,
      trustTier: "new",
    });
  },
});

export const submitFeedback = mutation({
  args: {
    userId: v.string(),
    abilityId: v.string(),
    feedbackType: v.string(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const weight = FEEDBACK_WEIGHTS[args.feedbackType] ?? 0;

    // Record feedback
    const feedbackId = await ctx.db.insert("userFeedback", {
      userId: args.userId,
      abilityId: args.abilityId,
      feedbackType: args.feedbackType,
      comment: args.comment,
      weight,
    });

    // Update ability health score
    const ability = await ctx.db
      .query("userAbilities")
      .withIndex("by_abilityId", (q) => q.eq("abilityId", args.abilityId))
      .first();

    if (ability) {
      const newHealth = Math.max(0, Math.min(1, ability.healthScore + weight * 0.01));
      await ctx.db.patch(ability._id, { healthScore: newHealth });
    }

    // Update reporter reputation
    let rep = await ctx.db
      .query("reporterReputation")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!rep) {
      const repId = await ctx.db.insert("reporterReputation", {
        userId: args.userId,
        totalReports: 1,
        verifiedReports: 0,
        falseReports: 0,
        reputationScore: 1,
        trustTier: "new",
        lastReportAt: Date.now(),
      });
      return { feedbackId, repId };
    }

    const newScore = rep.reputationScore + 1; // +1 for submitting feedback
    await ctx.db.patch(rep._id, {
      totalReports: rep.totalReports + 1,
      reputationScore: newScore,
      trustTier: getTrustTier(newScore),
      lastReportAt: Date.now(),
    });

    return { feedbackId };
  },
});

export const getReputation = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reporterReputation")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
  },
});
