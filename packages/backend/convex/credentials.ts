import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const store = mutation({
  args: {
    userId: v.string(),
    domain: v.string(),
    encryptedHeaders: v.optional(v.any()),
    encryptedCookies: v.optional(v.any()),
    encryptedTokens: v.optional(v.any()),
    refreshConfig: v.optional(v.any()),
    expiresAt: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    // Upsert: check if exists first
    const existing = await ctx.db
      .query("userCredentials")
      .withIndex("by_userId_domain", (q: any) =>
        q.eq("userId", args.userId).eq("domain", args.domain)
      )
      .first();
    if (existing) {
      const { userId: _u, domain: _d, ...updates } = args;
      await ctx.db.patch(existing._id, updates);
      return existing._id;
    }
    return await ctx.db.insert("userCredentials", args);
  },
});

export const getByDomain = query({
  args: { userId: v.string(), domain: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userCredentials")
      .withIndex("by_userId_domain", (q: any) =>
        q.eq("userId", args.userId).eq("domain", args.domain)
      )
      .first();
  },
});
