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
});
