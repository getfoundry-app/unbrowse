import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const logExecution = mutation({
  args: {
    userId: v.string(),
    abilityId: v.string(),
    success: v.boolean(),
    statusCode: v.optional(v.float64()),
    latencyMs: v.optional(v.float64()),
    responseHash: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("executionLogs", args);
  },
});

export const getHistory = query({
  args: { abilityId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("executionLogs")
      .withIndex("by_abilityId", (q) => q.eq("abilityId", args.abilityId))
      .order("desc")
      .collect();
  },
});

export const updateHealthScore = mutation({
  args: { abilityId: v.string() },
  handler: async (ctx, args) => {
    // Get the ability
    const ability = await ctx.db
      .query("userAbilities")
      .withIndex("by_abilityId", (q) => q.eq("abilityId", args.abilityId))
      .first();
    if (!ability) return;

    // Get recent executions
    const logs = await ctx.db
      .query("executionLogs")
      .withIndex("by_abilityId", (q) => q.eq("abilityId", args.abilityId))
      .collect();

    const total = logs.length;
    const successful = logs.filter((l) => l.success).length;
    const healthScore = total > 0 ? successful / total : 1.0;

    await ctx.db.patch(ability._id, {
      healthScore,
      totalExecutions: total,
      successfulExecutions: successful,
      lastExecutedAt: Date.now(),
    });
  },
});
