import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userAbilities")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const get = query({
  args: { abilityId: v.string() },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("userAbilities")
      .withIndex("by_abilityId", (q) => q.eq("abilityId", args.abilityId))
      .first();
    return results;
  },
});

export const search = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("userAbilities").collect();
    const term = args.searchTerm.toLowerCase();
    return all.filter(
      (a) =>
        a.abilityName.toLowerCase().includes(term) ||
        a.description.toLowerCase().includes(term)
    );
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    abilityId: v.string(),
    abilityName: v.string(),
    domain: v.optional(v.string()),
    description: v.string(),
    isPublished: v.boolean(),
    metadata: v.any(),
    dynamicHeadersRequired: v.boolean(),
    dynamicHeaderKeys: v.array(v.string()),
    staticHeaders: v.any(),
    wrapperCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("userAbilities", {
      ...args,
      healthScore: 1.0,
      totalExecutions: 0,
      successfulExecutions: 0,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("userAbilities"),
    abilityName: v.optional(v.string()),
    domain: v.optional(v.string()),
    description: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
    metadata: v.optional(v.any()),
    dynamicHeadersRequired: v.optional(v.boolean()),
    dynamicHeaderKeys: v.optional(v.array(v.string())),
    staticHeaders: v.optional(v.any()),
    wrapperCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    // Filter out undefined values
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("userAbilities") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
