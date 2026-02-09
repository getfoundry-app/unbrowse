import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { tag: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("marketplaceSkills").collect();
    if (args.tag) {
      return all.filter((s) => s.tags.includes(args.tag!));
    }
    return all;
  },
});

export const get = query({
  args: { skillId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("marketplaceSkills")
      .withIndex("by_skillId", (q) => q.eq("skillId", args.skillId))
      .first();
  },
});

export const publish = mutation({
  args: {
    skillId: v.string(),
    creatorId: v.string(),
    creatorWallet: v.optional(v.string()),
    name: v.string(),
    domain: v.optional(v.string()),
    description: v.string(),
    priceUsdc: v.float64(),
    skillMd: v.string(),
    apiTemplate: v.optional(v.string()),
    endpointCount: v.float64(),
    qualityTier: v.string(),
    version: v.string(),
    versionHash: v.optional(v.string()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("marketplaceSkills", {
      ...args,
      healthScore: 1.0,
      totalDownloads: 0,
      totalExecutions: 0,
      successRate: 1.0,
    });
  },
});

export const recordDownload = mutation({
  args: { skillId: v.string() },
  handler: async (ctx, args) => {
    const skill = await ctx.db
      .query("marketplaceSkills")
      .withIndex("by_skillId", (q) => q.eq("skillId", args.skillId))
      .first();
    if (skill) {
      await ctx.db.patch(skill._id, {
        totalDownloads: skill.totalDownloads + 1,
      });
    }
  },
});
