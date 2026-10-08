# BOCIL LAB — Standalone Rebuild

Rebuild BOCIL LAB tanpa Freebuff/VLY.

## Fase 01 — Landing + Dashboard + Missions

- Landing page responsif dengan terminal sandbox simulasi
- Auth: guest + email/password melalui Convex Auth
- Dashboard operative
- 14 mission records di Convex
- 12 mission aktif
- 2 mission CTF dikunci untuk fase berikutnya
- Submit flag divalidasi di server
- XP + progress tersimpan per user
- Ranking dasar berdasarkan XP

## Fase berikutnya

- Tools sandbox
- CTF Arena
- Assets dan fitur tambahan hasil migrasi dari project lama

## Local development

Terminal 1:

```bash
npm install
npx convex dev
```

Terminal 2:

```bash
npm run dev
```

Buka `http://localhost:5173`.

## Penting

Jangan commit secret Convex, file `.env*`, atau `convex/_generated` ke GitHub. Project lama tetap dibiarkan utuh sebagai sumber migrasi; tidak ada ketergantungan Freebuff/VLY di scaffold ini.

## Phase 02

- Mission board: 14 missions, XP, rank, per-user progress.
- Tool sandbox: Recon, Vulnerability Scanner, Exploit Simulator, Hash Cracker, Multidecoder.
- CTF Arena: 60-minute sessions with rotating session keys and two dynamic challenges.
- Tool targets are restricted to `*.sandbox.bocil-lab.local` for lab safety.
