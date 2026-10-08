import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { syncAchievements } from "./achievements";

type ToolDef = {
  id: string;
  name: string;
  codename: string;
  category: string;
  description: string;
  build: (target: string) => { summary: string; findings: string[] };
};

function hashString(value: string) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(seed: number, values: readonly T[], offset = 0) {
  const index = (seed + offset * 2654435761) % values.length;
  return values[Math.abs(index)];
}

const TOOLS: ToolDef[] = [
  {
    id: "recon",
    name: "BOCILSCAN Recon",
    codename: "nmap-style",
    category: "RECON",
    description: "Simulasi port/service enumeration terhadap target sandbox lab.",
    build: (target) => {
      const seed = hashString(target + ":recon");
      const ports = [22, 80, 443, 1337, 3000, 8080] as const;
      const open = [80, 443, pick(seed, ports, 1), pick(seed, ports, 2)].filter(
        (value, index, array) => array.indexOf(value) === index,
      ).sort((a, b) => a - b);
      return {
        summary: `${open.length} port terbuka pada ${target} (simulasi)`,
        findings: [
          `Target: ${target}`,
          `OS fingerprint: Linux 6.x (simulasi)`,
          ...open.map((port) => `PORT ${port}/tcp OPEN`),
          `Service guess: ${pick(seed, ["nginx", "caddy", "apache"], 3)}`,
          "Tidak ada paket jaringan nyata yang dikirim.",
        ],
      };
    },
  },
  {
    id: "vuln",
    name: "VULNPRISMA Scanner",
    codename: "scanner-style",
    category: "VULNERABILITY",
    description: "Simulasi pemeriksaan misconfiguration dan kelemahan web umum.",
    build: (target) => {
      const seed = hashString(target + ":vuln");
      const findings = [
        "Missing security headers — MEDIUM",
        "Directory listing pada /backup/ — LOW",
        "Reflected XSS pada parameter q — MEDIUM",
        "Outdated dependency terdeteksi — LOW",
      ];
      const first = pick(seed, findings, 1);
      const second = pick(seed, findings, 2);
      return {
        summary: `2 temuan simulasi pada ${target}`,
        findings: [`Target: ${target}`, first, second, "Semua temuan adalah data latihan."] ,
      };
    },
  },
  {
    id: "exploit",
    name: "EXPLOIT-KID Runner",
    codename: "exploit-simulator",
    category: "EXPLOIT",
    description: "Menjalankan bukti-konsep eksploitasi hanya di lingkungan simulasi.",
    build: (target) => ({
      summary: `PoC simulasi berhasil pada ${target}`,
      findings: [
        `[*] Preparing sandbox module against ${target}`,
        "[*] Checking vulnerable training endpoint...",
        "[+] Vulnerability confirmed (SIMULATION)",
        "[+] Session #3 opened — sandbox only",
        "[i] Tidak ada payload yang dikirim ke host eksternal.",
      ],
    }),
  },
  {
    id: "hash",
    name: "HASHMAU Cracker",
    codename: "hashcat-style",
    category: "CRYPTO",
    description: "Simulasi dictionary attack pada hash latihan yang sudah ditentukan lab.",
    build: () => ({
      summary: "1 hash latihan berhasil dipecahkan",
      findings: [
        "Hash: 5f4dcc3b5aa765d61d8327deb882cf99",
        "Algorithm: MD5 (simulasi)",
        "Mode: dictionary attack",
        "[+] Plaintext: password",
        "[i] Gunakan password panjang dan unik di dunia nyata.",
      ],
    }),
  },
  {
    id: "decode",
    name: "DECYPHER Multidecoder",
    codename: "decoder-style",
    category: "CRYPTO",
    description: "Latihan identifikasi dan decoding Base64, hex, ROT13, URL, dan binary.",
    build: (target) => ({
      summary: `Payload sample berhasil didekode untuk ${target}`,
      findings: [
        "Base64: Zm9vYmFyIQ==",
        'Decoded: "foobar!"',
        "ROT13 sample: obpvy → bocil",
        "Binary sample: 01101100 01100001 01100010 → lab",
      ],
    }),
  },
];

export const listTools = query({
  args: {},
  handler: async () =>
    TOOLS.map(({ build: _build, ...tool }) => tool),
});

export const myRuns = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("scanJobs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(12);
  },
});

export const runTool = mutation({
  args: { toolId: v.string(), target: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { status: "error" as const, message: "Autentikasi dibutuhkan." };

    const target = args.target.trim().toLowerCase();
    if (!target || target.length > 80) {
      return { status: "error" as const, message: "Target tidak valid." };
    }
    if (!(target === "sandbox.bocil-lab.local" || target.endsWith(".sandbox.bocil-lab.local"))) {
      return {
        status: "error" as const,
        message: "Tool hanya menerima target sandbox.bocil-lab.local untuk menjaga lab tetap aman.",
      };
    }

    const tool = TOOLS.find((item) => item.id === args.toolId);
    if (!tool) return { status: "error" as const, message: "Tool tidak ditemukan." };

    const startedAt = Date.now();
    const { summary, findings } = tool.build(target);
    const finishedAt = Date.now();

    await ctx.db.insert("scanJobs", {
      userId,
      toolId: tool.id,
      target,
      status: "done",
      createdAt: startedAt,
      finishedAt,
      durationMs: finishedAt - startedAt,
      summary,
      findings,
    });

    const achievementsUnlocked = await syncAchievements(ctx, userId);

    return {
      status: "done" as const,
      toolName: tool.name,
      summary,
      findings,
      achievementsUnlocked,
    };
  },
});
