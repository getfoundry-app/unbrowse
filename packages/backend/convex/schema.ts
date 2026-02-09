import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  userAbilities: defineTable({
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
    healthScore: v.float64(),
    totalExecutions: v.float64(),
    successfulExecutions: v.float64(),
    lastExecutedAt: v.optional(v.float64()),
    embedding: v.optional(v.array(v.float64())),
  })
    .index("by_userId", ["userId"])
    .index("by_abilityId", ["abilityId"]),

  userCredentials: defineTable({
    userId: v.string(),
    domain: v.string(),
    encryptedHeaders: v.optional(v.any()),
    encryptedCookies: v.optional(v.any()),
    encryptedTokens: v.optional(v.any()),
    refreshConfig: v.optional(v.any()),
    expiresAt: v.optional(v.float64()),
  }).index("by_userId_domain", ["userId", "domain"]),

  executionLogs: defineTable({
    userId: v.string(),
    abilityId: v.string(),
    success: v.boolean(),
    statusCode: v.optional(v.float64()),
    latencyMs: v.optional(v.float64()),
    responseHash: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
  })
    .index("by_abilityId", ["abilityId"])
    .index("by_userId", ["userId"]),

  marketplaceSkills: defineTable({
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
    healthScore: v.float64(),
    totalDownloads: v.float64(),
    totalExecutions: v.float64(),
    successRate: v.float64(),
    qualityTier: v.string(),
    version: v.string(),
    versionHash: v.optional(v.string()),
    tags: v.array(v.string()),
    embedding: v.optional(v.array(v.float64())),
  })
    .index("by_skillId", ["skillId"])
    .index("by_creatorId", ["creatorId"]),

  payments: defineTable({
    txSignature: v.string(),
    payerWallet: v.string(),
    skillId: v.string(),
    amountUsdc: v.float64(),
    paymentType: v.string(),
    creatorShare: v.float64(),
    websiteOwnerShare: v.float64(),
    treasuryShare: v.float64(),
    indexerShare: v.float64(),
    verifiedAt: v.optional(v.float64()),
  })
    .index("by_skillId", ["skillId"])
    .index("by_payerWallet", ["payerWallet"]),

  domainRegistry: defineTable({
    domain: v.string(),
    ownerWallet: v.optional(v.string()),
    verified: v.boolean(),
    dnsTxtRecord: v.optional(v.string()),
    verifiedAt: v.optional(v.float64()),
    totalRevenueUsdc: v.float64(),
  }).index("by_domain", ["domain"]),

  reporterReputation: defineTable({
    userId: v.string(),
    totalReports: v.float64(),
    verifiedReports: v.float64(),
    falseReports: v.float64(),
    reputationScore: v.float64(),
    trustTier: v.string(),
    lastReportAt: v.optional(v.float64()),
    flaggedUntil: v.optional(v.float64()),
  }).index("by_userId", ["userId"]),

  userFeedback: defineTable({
    userId: v.string(),
    abilityId: v.string(),
    feedbackType: v.string(),
    comment: v.optional(v.string()),
    weight: v.optional(v.float64()),
  })
    .index("by_abilityId", ["abilityId"])
    .index("by_userId", ["userId"]),

  usageAnalytics: defineTable({
    userId: v.string(),
    abilityId: v.optional(v.string()),
    action: v.string(),
    costUsdc: v.float64(),
  })
    .index("by_userId", ["userId"])
    .index("by_action", ["action"]),
});
