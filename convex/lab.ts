import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { syncAchievements } from "./achievements";

type Difficulty = "MUDAH" | "SEDANG" | "SULIT" | "LEGENDARY";

type Mission = {
  code: string;
  title: string;
  module: string;
  difficulty: Difficulty;
  brief: string;
  points: number;
  flag: string;
  hint: string;
  echo: string;
  available: boolean;
  arenaOnly?: boolean;
};

/**
 * Phase 01 mission catalogue.
 * Flags stay server-side; the client only receives a masked preview.
 */
const MISSIONS: Mission[] = [
  {
    code: "REC-01",
    title: "Jejak di /var/log",
    module: "Recon & OSINT",
    difficulty: "MUDAH",
    brief:
      "Server latihan menyimpan access log dengan satu nama file yang mencurigakan. Temukan nama file itu di direktori log latihan.",
    points: 100,
    flag: "bocil{r3c0n_1s_p0w3r}",
    hint: "Misi recon pertama selalu soal file log yang namanya tidak biasa.",
    echo: "access.log terbaca... satu entry tidak seperti yang lain.",
    available: true,
  },
  {
    code: "REC-02",
    title: "Metadata Si Bocah",
    module: "Recon & OSINT",
    difficulty: "MUDAH",
    brief:
      "Foto profil latihan menyimpan string identifikasi di tag EXIF Software: exif_d4ta_l3ak. Flag = bocil{string_tersebut}.",
    points: 150,
    flag: "bocil{exif_d4ta_l3ak}",
    hint: "EXIF membawa nama software pembuat foto sebagai identitas.",
    echo: "EXIF diekstrak... tag software menyerahkan dirinya.",
    available: true,
  },
  {
    code: "WEB-01",
    title: "Robots.txt Berbisik",
    module: "Web Exploitation",
    difficulty: "MUDAH",
    brief:
      "Cek file yang biasa dibaca robot di root domain latihan. Flag tercetak di komentar terakhirnya.",
    points: 150,
    flag: "bocil{d1sall0w_but_n0t_h1dden}",
    hint: "Semua crawler membaca satu file teks di / sebelum menjelajah.",
    echo: "robots.txt diambil... baris komentar terakhir berbinar.",
    available: true,
  },
  {
    code: "WEB-02",
    title: "Form Login Bodoh",
    module: "Web Exploitation",
    difficulty: "SEDANG",
    brief:
      "Halaman login latihan memvalidasi kredensial di sisi klien. Buka console atau cari kredensial yang paling sering dipakai manusia.",
    points: 250,
    flag: "bocil{cl13nt_s1d3_n3v3r_s3cur3}",
    hint: "Validasi di browser hanyalah panggung — kebenarannya ada di console.",
    echo: "POST /login -> 200 OK... auth bypass tercatat.",
    available: true,
  },
  {
    code: "WEB-03",
    title: "Payload Terenkode",
    module: "Web Exploitation",
    difficulty: "SEDANG",
    brief:
      "WAF lab menyimpan payload base64: Ym9jaWx7c2FuZGJveF9lc2NhcGV9. Dekode, lalu kirim hasilnya sebagai flag.",
    points: 200,
    flag: "bocil{sandbox_escape}",
    hint: "Base64 menggunakan A-Z, a-z, 0-9, +, / dan bisa berakhir dengan =.",
    echo: "Base64 didekode... payload WAF mengaku.",
    available: true,
  },
  {
    code: "CRY-01",
    title: "Rotasi 13 Ajaib",
    module: "Kriptografi",
    difficulty: "MUDAH",
    brief:
      "Pesan latihan dienkripsi ROT13: obpvy{pynffvp}. Dekripsi teks tersebut dan kirim hasilnya sebagai flag.",
    points: 150,
    flag: "bocil{classic}",
    hint: "ROT13 memutar alfabet tepat setengah putaran.",
    echo: "ROT13 diterapkan... pesan papan buletin terbaca.",
    available: true,
  },
  {
    code: "CRY-02",
    title: "Sinyal Binari",
    module: "Kriptografi",
    difficulty: "SEDANG",
    brief:
      "Intersep transmisi: 01101100 01100001 01100010. Konversi tiap oktet biner ke ASCII, lalu bentuk flag bocil{hasil}.",
    points: 200,
    flag: "bocil{lab}",
    hint: "Setiap 8 bit adalah satu karakter ASCII.",
    echo: "Transmisi diterjemahkan... sinyal biner berbunyi lab.",
    available: true,
  },
  {
    code: "CRY-03",
    title: "Hash Terpotong",
    module: "Kriptografi",
    difficulty: "SEDANG",
    brief:
      "Dump database latihan menyimpan hash 81dc9bdb52d04dc20036dbd8313ed055. Identifikasi algoritmanya, crack plaintext-nya, lalu kirim bocil{plaintext}.",
    points: 250,
    flag: "bocil{1234}",
    hint: "32 karakter hex mengarah ke MD5. Plaintext-nya adalah sandi yang sangat lemah.",
    echo: "Rainbow table dijalankan... hash menyerah.",
    available: true,
  },
  {
    code: "FOR-01",
    title: "Kapal Kertas Berlubang",
    module: "Forensik Digital",
    difficulty: "SEDANG",
    brief:
      "File gambar latihan rusak karena magic bytes diubah. Pulihkan signature PNG lalu temukan flag di dalam gambar.",
    points: 250,
    flag: "bocil{m4g1c_byt3s_r3st0r3d}",
    hint: "PNG selalu dimulai dengan 89 50 4E 47.",
    echo: "Magic bytes dipulihkan... payload PNG terbaca.",
    available: true,
  },
  {
    code: "FOR-02",
    title: "Paket Tersembunyi",
    module: "Forensik Digital",
    difficulty: "SULIT",
    brief:
      "Capture jaringan latihan menyelundupkan data di payload ICMP. Cari flag yang terenkode di dalam paket.",
    points: 350,
    flag: "bocil{p4ylo4d_smuggl3r}",
    hint: "ICMP bisa membawa data selain echo request/reply.",
    echo: "pcap diurai... payload ICMP menyerahkan rahasianya.",
    available: true,
  },
  {
    code: "CRD-01",
    title: "Lintasan Kaki Merah",
    module: "Coding & Logic",
    difficulty: "SULIT",
    brief:
      "Grid 1000x1000 mempunyai lintasan dan tembok. Hitung langkah minimum dari kiri-atas ke kanan-bawah dan kirim bocil{angka_langkah}.",
    points: 400,
    flag: "bocil{1998}",
    hint: "Di grid berbobot sama, BFS menemukan jalan terpendek.",
    echo: "Solver dijalankan... lintasan optimal ditemukan: 1998 langkah.",
    available: true,
  },
  {
    code: "CRD-02",
    title: "Kata Sandi Anak Ayam",
    module: "Coding & Logic",
    difficulty: "SEDANG",
    brief:
      "Password simulasi terdiri dari kata ayam diikuti angka 00-99. Jalankan dictionary attack kecil dan kirim password lengkapnya.",
    points: 300,
    flag: "bocil{4y4m_77}",
    hint: "Coba format kata + dua digit, mulai dari 00.",
    echo: "Dictionary attack selesai... sandi ditemukan.",
    available: true,
  },
  {
    code: "CTF-01",
    title: "Sesi Sandi Bergilir",
    module: "CTF Arena",
    difficulty: "SULIT",
    brief:
      "Arena CTF akan memakai kunci baru setiap sesi selama 60 menit. Modul ini akan aktif setelah CTF Arena selesai dibangun.",
    points: 300,
    flag: "bocil{t3mp0ral_key}",
    hint: "Mulai session, decode Stage-1, lalu ambil KEY.",
    echo: "CTF-01 cleared lewat Arena.",
    available: true,
    arenaOnly: true,
  },
  {
    code: "CTF-02",
    title: "Operasi Tengah Malam",
    module: "CTF Arena",
    difficulty: "LEGENDARY",
    brief: "Misi legendaris dua tahap akan aktif setelah CTF Arena dibangun.",
    points: 500,
    flag: "bocil{midnight_protocol}",
    hint: "Decode Stage-1 untuk menemukan SECRET_NUMBER.",
    echo: "CTF-02 cleared lewat Arena.",
    available: true,
    arenaOnly: true,
  },
];

const XP_MULTIPLIER: Record<Difficulty, number> = {
  MUDAH: 1,
  SEDANG: 1.25,
  SULIT: 1.5,
  LEGENDARY: 2,
};

function xpFor(mission: Mission) {
  return Math.round(mission.points * XP_MULTIPLIER[mission.difficulty]);
}

export const missions = query({
  args: {},
  handler: async () =>
    MISSIONS.map((mission) => ({
      code: mission.code,
      title: mission.title,
      module: mission.module,
      difficulty: mission.difficulty,
      brief: mission.brief,
      points: mission.points,
      xp: xpFor(mission),
      available: mission.available,
      arenaOnly: mission.arenaOnly ?? false,
      flagPreview: `bocil{${"*".repeat(Math.max(8, mission.flag.length - 6))}}`,
    })),
});

export const myProgress = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { solvedCodes: [] as string[], totalSolved: 0, xp: 0 };
    }

    const rows = await ctx.db
      .query("missionProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const solvedCodes = rows.map((row) => row.missionCode);
    const xp = solvedCodes.reduce((sum, code) => {
      const mission = MISSIONS.find((item) => item.code === code);
      return mission ? sum + xpFor(mission) : sum;
    }, 0);

    return { solvedCodes, totalSolved: solvedCodes.length, xp };
  },
});

export const labStats = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("missionProgress").collect();
    const operatives = new Set(rows.map((row) => row.userId));
    const totalXp = rows.reduce((sum, row) => {
      const mission = MISSIONS.find((item) => item.code === row.missionCode);
      return mission ? sum + xpFor(mission) : sum;
    }, 0);

    return {
      operatives: operatives.size,
      flagsCaptured: rows.length,
      totalXp,
    };
  },
});

export const submitFlag = mutation({
  args: {
    code: v.string(),
    flag: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        status: "error" as const,
        message: "ACCESS DENIED — silakan masuk ke lab.",
      };
    }

    const mission = MISSIONS.find((item) => item.code === args.code);
    if (!mission) {
      return {
        status: "error" as const,
        message: "Misi tidak ditemukan.",
      };
    }

    if (!mission.available || mission.arenaOnly) {
      return {
        status: "locked" as const,
        message: "Misi ini diselesaikan melalui tab CTF Arena.",
      };
    }

    const solved = await ctx.db
      .query("missionProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    if (solved.some((row) => row.missionCode === mission.code)) {
      return {
        status: "duplicate" as const,
        message: "Misi ini sudah kamu taklukkan.",
      };
    }

    if (args.flag.trim().toLowerCase() !== mission.flag.toLowerCase()) {
      return {
        status: "wrong" as const,
        message: "FLAG SALAH — coba pecahkan petunjuknya lagi.",
        hint: mission.hint,
      };
    }

    await ctx.db.insert("missionProgress", {
      userId,
      missionCode: mission.code,
      solvedAt: Date.now(),
    });

    const xp = xpFor(mission);
    const unlocked = await syncAchievements(ctx, userId);
    return {
      status: "solved" as const,
      message: `FLAG DITERIMA — ${mission.title} cleared! +${xp} XP`,
      echo: mission.echo,
      xpGained: xp,
      achievementsUnlocked: unlocked,
    };
  },
});
