# BOCIL LAB — Standalone Rebuild

Generasi baru BOCIL LAB, dibangun tanpa ketergantungan Freebuff/VLY.

## Stack

- React + Vite + TypeScript
- Convex backend + database
- Convex Auth
- Vercel hosting

## Auth

- Guest / Anonymous
- Email + password
- Google OAuth

## Menjalankan lokal

```bash
npm install
npx convex dev
```

Saat `npx convex dev` pertama kali dijalankan, Convex akan meminta login dan membuat atau memilih project/deployment. Setelah itu jalankan `npm run dev` di terminal lain.

Untuk Google OAuth, isi `AUTH_GOOGLE_ID` dan `AUTH_GOOGLE_SECRET` pada environment Convex deployment sesuai kredensial Google OAuth yang kamu buat.

## Vercel

Vercel menggunakan build command:

```bash
npx convex deploy --cmd-url-env-var-name VITE_CONVEX_URL --cmd "npm run build"
```

Set `CONVEX_DEPLOY_KEY` pada Vercel Production setelah deployment production Convex tersedia.

## Aturan migrasi

Project lama tidak disentuh. Labs, misi, assets, dan UI yang masih ingin dipertahankan akan dipindahkan satu per satu setelah auth, database, deployment, dan regression checks stabil.
