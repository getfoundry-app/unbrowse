import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const ingestSkill = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    domain: v.string(),
    skillMd: v.string(),
    endpoints: v.array(
      v.object({
        method: v.string(),
        path: v.string(),
        description: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const abilityIds: string[] = [];

    for (const endpoint of args.endpoints) {
      const abilityId = `${args.domain}:${endpoint.method}:${endpoint.path}`;
      const abilityName = `${args.name} - ${endpoint.method} ${endpoint.path}`;

      await ctx.db.insert("userAbilities", {
        userId: args.userId,
        abilityId,
        abilityName: abilityName,
        domain: args.domain,
        description: endpoint.description,
        isPublished: false,
        metadata: {
          method: endpoint.method,
          path: endpoint.path,
          skillMd: args.skillMd,
        },
        dynamicHeadersRequired: false,
        dynamicHeaderKeys: [],
        staticHeaders: {},
        healthScore: 1.0,
        totalExecutions: 0,
        successfulExecutions: 0,
      });

      abilityIds.push(abilityId);
    }

    return abilityIds;
  },
});
