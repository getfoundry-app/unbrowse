import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/** Health impact per feedback type */
const FEEDBACK_IMPACT: Record<string, number> = {
  works_great: 0.05,
  works_ok: 0.02,
  intermittent: -0.05,
  slow: -0.03,
  broken: -0.15,
  security_issue: -0.25,
};

/** Feedback weight based on reporter trust tier */
const TIER_WEIGHT: Record<string, number> = {
  untrusted: 0.1,
  new: 0.5,
  regular: 1.0,
  trusted: 1.5,
  expert: 2.0,
};

function getTrustTier(score: number): string {
  if (score < 0.2) return "untrusted";
  if (score < 0.4) return "new";
  if (score < 0.7) return "regular";
  if (score < 0.9) return "trusted";
  return "expert";
}

export const submitFeedback = mutation({
  args: {
    userId: v.string(),
    abilityId: v.string(),
    feedbackType: v.string(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get reporter reputation for weight
    const rep = await ctx.db
      .query("reporterReputation")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    const tier = rep ? rep.trustTier : "new";
    const weight = TIER_WEIGHT[tier] ?? 1.0;

    // Record feedback
    const feedbackId = await ctx.db.insert("userFeedback", {
      userId: args.userId,
      abilityId: args.abilityId,
      feedbackType: args.feedbackType,
      comment: args.comment,
      weight,
    });

    // Apply health impact to the ability
    const impact = FEEDBACK_IMPACT[args.feedbackType] ?? 0;
    const ability = await ctx.db
      .query("userAbilities")
      .withIndex("by_abilityId", (q) => q.eq("abilityId", args.abilityId))
      .first();

    if (ability) {
      const newHealth = Math.max(0, Math.min(1, ability.healthScore + impact * weight));
      await ctx.db.patch(ability._id, { healthScore: newHealth });
    }

    return { feedbackId, weight, impact: impact * weight };
  },
});

export const updateReputation = mutation({
  args: {
    userId: v.string(),
    reportVerified: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("reporterReputation")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!existing) {
      // Create new reputation entry
      const totalReports = 1;
      const verifiedReports = args.reportVerified ? 1 : 0;
      const falseReports = args.reportVerified ? 0 : 1;
      const reputationScore = args.reportVerified ? 0.5 : 0.3;

      return await ctx.db.insert("reporterReputation", {
        userId: args.userId,
        totalReports,
        verifiedReports,
        falseReports,
        reputationScore,
        trustTier: getTrustTier(reputationScore),
        lastReportAt: Date.now(),
      });
    }

    const totalReports = existing.totalReports + 1;
    const verifiedReports = existing.verifiedReports + (args.reportVerified ? 1 : 0);
    const falseReports = existing.falseReports + (args.reportVerified ? 0 : 1);

    // Score: weighted ratio of verified reports
    const reputationScore = Math.min(
      1,
      Math.max(0, verifiedReports / totalReports + (args.reportVerified ? 0.02 : -0.05))
    );

    await ctx.db.patch(existing._id, {
      totalReports,
      verifiedReports,
      falseReports,
      reputationScore,
      trustTier: getTrustTier(reputationScore),
      lastReportAt: Date.now(),
    });

    return existing._id;
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
