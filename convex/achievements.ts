import { getAuthUserId } from "@convex-dev/auth/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { query } from "./_generated/server";

export const ACHIEVEMENTS = [
  { code: "FIRST_FLAG", title: "First Flag", description: "Menaklukkan misi pertamamu.", icon: "🚩" },
  { code: "TEN_FLAGS", title: "Flag Hunter", description: "Mengoleksi 10 flag dari mission board.", icon: "🎯" },
  { code: "RECON_SCOUT", title: "Recon Scout", description: "Menyelesaikan seluruh misi Recon & OSINT.", icon: "📡" },
  { code: "WEB_BREAKER", title: "Web Breaker", description: "Menyelesaikan seluruh misi Web Exploitation.", icon: "🌐" },
  { code: "CRYPTO_NOVICE", title: "Crypto Novice", description: "Menyelesaikan seluruh misi Kriptografi.", icon: "🔐" },
  { code: "FORENSIC_TRACKER", title: "Forensic Tracker", description: "Menyelesaikan seluruh misi Forensik Digital.", icon: "🧪" },
  { code: "LOGIC_BUILDER", title: "Logic Builder", description: "Menyelesaikan seluruh misi Coding & Logic.", icon: "🧠" },
  { code: "TOOLBOX_STARTER", title: "Toolbox Starter", description: "Menjalankan tool sandbox untuk pertama kalinya.", icon: "🛠️" },
  { code: "TOOLBOX_MASTER", title: "Toolbox Master", description: "Mencoba kelima tool sandbox.", icon: "⚙️" },
  { code: "CTF_FINISHER", title: "CTF Finisher", description: "Menyelesaikan CTF-01 di Arena.", icon: "🏁" },
  { code: "LEGENDARY", title: "Hacker Bocil Legendary", description: "Menyelesaikan CTF-02 dan mencapai level legendaris.", icon: "👑" },
] as const;

export async function syncAchievements(ctx: MutationCtx, userId: Id<"users">) {
  const progress = await ctx.db
    .query("missionProgress")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  const codes = new Set(progress.map((row) => row.missionCode));

  const runs = await ctx.db
    .query("scanJobs")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  const toolIds = new Set(runs.map((row) => row.toolId));

  const earned = new Set<string>();
  if (progress.length >= 1) earned.add("FIRST_FLAG");
  if (progress.length >= 10) earned.add("TEN_FLAGS");
  if (["REC-01", "REC-02"].every((code) => codes.has(code))) earned.add("RECON_SCOUT");
  if (["WEB-01", "WEB-02", "WEB-03"].every((code) => codes.has(code))) earned.add("WEB_BREAKER");
  if (["CRY-01", "CRY-02", "CRY-03"].every((code) => codes.has(code))) earned.add("CRYPTO_NOVICE");
  if (["FOR-01", "FOR-02"].every((code) => codes.has(code))) earned.add("FORENSIC_TRACKER");
  if (["CRD-01", "CRD-02"].every((code) => codes.has(code))) earned.add("LOGIC_BUILDER");
  if (runs.length >= 1) earned.add("TOOLBOX_STARTER");
  if (toolIds.size >= 5) earned.add("TOOLBOX_MASTER");
  if (codes.has("CTF-01")) earned.add("CTF_FINISHER");
  if (codes.has("CTF-02")) earned.add("LEGENDARY");

  const existing = await ctx.db
    .query("achievements")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  const existingCodes = new Set(existing.map((item) => item.code));
  const newlyUnlocked: string[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (earned.has(achievement.code) && !existingCodes.has(achievement.code)) {
      await ctx.db.insert("achievements", {
        userId,
        code: achievement.code,
        unlockedAt: Date.now(),
      });
      newlyUnlocked.push(achievement.code);
    }
  }
  return newlyUnlocked;
}

export const myAchievements = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const rows = await ctx.db
      .query("achievements")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    return rows.map((row) => {
      const meta = ACHIEVEMENTS.find((item) => item.code === row.code);
      return {
        code: row.code,
        title: meta?.title ?? row.code,
        description: meta?.description ?? "Achievement unlocked.",
        icon: meta?.icon ?? "🏆",
        unlockedAt: row.unlockedAt,
      };
    });
  },
});
