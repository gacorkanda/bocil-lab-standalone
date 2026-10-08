import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  labProfiles: defineTable({
    userId: v.id("users"),
    displayName: v.optional(v.string()),
    xp: v.number(),
    level: v.number(),
  }).index("by_user", ["userId"]),
  missionProgress: defineTable({
    userId: v.id("users"),
    missionCode: v.string(),
    solvedAt: v.number(),
  }).index("by_user", ["userId"]),
  scanJobs: defineTable({
    userId: v.id("users"),
    toolId: v.string(),
    target: v.string(),
    status: v.string(),
    createdAt: v.number(),
    finishedAt: v.optional(v.number()),
    durationMs: v.optional(v.number()),
    summary: v.optional(v.string()),
    findings: v.optional(v.array(v.string())),
  }).index("by_user", ["userId"]),
  achievements: defineTable({
    userId: v.id("users"),
    code: v.string(),
    unlockedAt: v.number(),
  }).index("by_user", ["userId"]),
  ctfSessions: defineTable({
    userId: v.id("users"),
    key: v.string(),
    seed: v.number(),
    secretNumber: v.number(),
    stage1: v.string(),
    startedAt: v.number(),
    expiresAt: v.number(),
    solved01: v.optional(v.boolean()),
    solved02: v.optional(v.boolean()),
  }).index("by_user", ["userId"]),
});
