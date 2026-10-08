import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { syncAchievements } from "./achievements";

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function base64Ascii(input: string) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let output = "";
  for (let i = 0; i < input.length; i += 3) {
    const a = input.charCodeAt(i);
    const b = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
    const c = i + 2 < input.length ? input.charCodeAt(i + 2) : 0;
    const triple = (a << 16) | (b << 8) | c;
    output += chars[(triple >> 18) & 63];
    output += chars[(triple >> 12) & 63];
    output += i + 1 < input.length ? chars[(triple >> 6) & 63] : "=";
    output += i + 2 < input.length ? chars[triple & 63] : "=";
  }
  return output;
}

function makeSession(userId: string) {
  const seed = hashSeed(`${userId}:${Date.now()}:${Math.random()}`);
  const key = `K-${seed.toString(36).toUpperCase().padStart(7, "0").slice(0, 7)}`;
  const secretNumber = 100 + (seed % 900);
  const stage1 = base64Ascii(`BOCIL-CTF|SECRET_NUMBER=${secretNumber}|KEY=${key}`);
  return { key, secretNumber, stage1, seed };
}

export const sessionState = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { active: false as const };

    const session = await ctx.db
      .query("ctfSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .first();

    if (!session || Date.now() > session.expiresAt) {
      return { active: false as const };
    }

    return {
      active: true as const,
      startedAt: session.startedAt,
      expiresAt: session.expiresAt,
      solved01: session.solved01 ?? false,
      solved02: session.solved02 ?? false,
      stage1: session.stage1,
      keyHint: `${session.key.slice(0, 2)}•••••`,
    };
  },
});

export const startSession = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { status: "error" as const, message: "Autentikasi dibutuhkan." };

    const data = makeSession(userId);
    const now = Date.now();
    await ctx.db.insert("ctfSessions", {
      userId,
      key: data.key,
      seed: data.seed,
      secretNumber: data.secretNumber,
      stage1: data.stage1,
      startedAt: now,
      expiresAt: now + 60 * 60 * 1000,
      solved01: false,
      solved02: false,
    });

    return { status: "started" as const, message: "CTF session baru dimulai. Kunci lama tidak berlaku." };
  },
});

async function latestLiveSession(ctx: any, userId: any) {
  const session = await ctx.db
    .query("ctfSessions")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .order("desc")
    .first();
  if (!session || Date.now() > session.expiresAt) return null;
  return session;
}

async function awardMission(ctx: any, userId: any, code: string) {
  const existing = await ctx.db
    .query("missionProgress")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .collect();
  if (existing.some((row: any) => row.missionCode === code)) return;
  await ctx.db.insert("missionProgress", { userId, missionCode: code, solvedAt: Date.now() });
}

export const solve01 = mutation({
  args: { answer: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { status: "error" as const, message: "Autentikasi dibutuhkan." };
    const session = await latestLiveSession(ctx, userId);
    if (!session) return { status: "expired" as const, message: "Session sudah expired. Start session baru." };
    if (session.solved01) return { status: "duplicate" as const, message: "CTF-01 sudah cleared." };

    const expected = session.key;
    if (args.answer.trim().toUpperCase() !== expected) {
      return { status: "wrong" as const, message: "Jawaban salah. Decode Stage-1 lalu ambil KEY." };
    }

    await ctx.db.patch(session._id, { solved01: true });
    await awardMission(ctx, userId, "CTF-01");
    const achievementsUnlocked = await syncAchievements(ctx, userId);
    return { status: "solved" as const, message: "CTF-01 CLEARED — +450 XP." };
  },
});

export const solve02 = mutation({
  args: { answer: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { status: "error" as const, message: "Autentikasi dibutuhkan." };
    const session = await latestLiveSession(ctx, userId);
    if (!session) return { status: "expired" as const, message: "Session sudah expired. Start session baru." };
    if (session.solved02) return { status: "duplicate" as const, message: "CTF-02 sudah cleared." };

    const numeric = Number(args.answer.trim());
    if (!Number.isInteger(numeric) || numeric !== session.secretNumber) {
      return { status: "wrong" as const, message: "SECRET_NUMBER belum benar. Decode Stage-1 lagi." };
    }

    await ctx.db.patch(session._id, { solved02: true });
    await awardMission(ctx, userId, "CTF-02");
    const achievementsUnlocked = await syncAchievements(ctx, userId);
    return { status: "solved" as const, message: "CTF-02 CLEARED — +1000 XP. RANK LEGENDARY." };
  },
});
