import React, { StrictMode, useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { ConvexAuthProvider, useAuthActions } from "@convex-dev/auth/react";
import { ConvexReactClient, useConvexAuth, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import "./index.css";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
if (!convexUrl) throw new Error("VITE_CONVEX_URL belum tersedia. Jalankan npx convex dev terlebih dahulu.");
const convex = new ConvexReactClient(convexUrl);

function Shell() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  const user = useQuery(api.users.currentUser, isAuthenticated ? {} : "skip");
  const [view, setView] = useState<"home" | "auth">("home");
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isAuthenticated) setView("home");
  }, [isAuthenticated]);

  async function handlePassword(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true); setError(null);
    try {
      const form = new FormData();
      form.set("email", email);
      form.set("password", password);
      form.set("flow", mode);
      await signIn("password", form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Autentikasi gagal.");
    } finally { setBusy(false); }
  }

  async function handleGoogle() {
    setBusy(true); setError(null);
    try { await signIn("google"); }
    catch (err) { setError(err instanceof Error ? err.message : "Google login gagal."); setBusy(false); }
  }

  async function handleGuest() {
    setBusy(true); setError(null);
    try { await signIn("anonymous"); }
    catch (err) { setError(err instanceof Error ? err.message : "Guest login gagal."); setBusy(false); }
  }

  if (isLoading) return <main className="page"><div className="card"><div className="eyebrow">BOCIL LAB</div><p>Menyiapkan koneksi autentikasi...</p></div></main>;

  if (view === "auth" && !isAuthenticated) {
    return <main className="page"><div className="card">
      <div className="eyebrow">AUTHENTICATION CORE</div>
      <h2>Masuk ke BOCIL LAB</h2>
      <p className="muted">Auth dikelola langsung oleh Convex. Tidak ada editor platform pihak ketiga.</p>
      <div className="actions"><button className="btn" onClick={handleGoogle} disabled={busy}>Lanjutkan dengan Google</button><button className="btn" onClick={handleGuest} disabled={busy}>Masuk sebagai Tamu</button></div>
      <div className="sep" />
      <form onSubmit={handlePassword}>
        <div className="field"><label>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email" /></div>
        <div className="field"><label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} autoComplete={mode === "signIn" ? "current-password" : "new-password"} /></div>
        {error && <div className="error">{error}</div>}
        <div className="actions"><button className="btn primary" disabled={busy}>{busy ? "Memproses..." : mode === "signIn" ? "Masuk" : "Buat akun"}</button><button type="button" className="btn" onClick={()=>setMode(mode === "signIn" ? "signUp" : "signIn")}>{mode === "signIn" ? "Daftar" : "Sudah punya akun"}</button></div>
      </form>
      <button className="btn" style={{marginTop:12,width:"100%"}} onClick={()=>{setView("home");setError(null)}}>Kembali</button>
    </div></main>;
  }

  return <>
    <nav className="nav"><strong>BOCIL LAB</strong>{isAuthenticated && <div className="actions" style={{margin:0}}><span className="badge">AUTH OK</span><button className="btn" onClick={()=>signOut()}>Keluar</button></div>}</nav>
    <main className="content">
      <div className="eyebrow">INDEPENDENT CYBER LAB</div>
      <h1>Bangun ulang.<br/>Mulai bersih.</h1>
      {isAuthenticated ? <p>Akun aktif{user?.email ? ` sebagai ${user.email}` : " sebagai guest"}. Fondasi BOCIL LAB baru sudah terhubung ke Convex.</p> : <p>Ini fondasi generasi baru BOCIL LAB. Repo, hosting, database, dan autentikasi akan berdiri sendiri tanpa ketergantungan Freebuff.</p>}
      <div className="actions">{!isAuthenticated && <button className="btn primary" onClick={()=>setView("auth")}>Masuk / Daftar</button>}</div>
      <div className="grid"><div className="panel"><div className="badge">STEP 01</div><h2>Core</h2><p>React + Vite dengan struktur minimal dan mudah dirawat.</p></div><div className="panel"><div className="badge">STEP 02</div><h2>Backend</h2><p>Convex untuk database, functions, dan autentikasi.</p></div><div className="panel"><div className="badge">STEP 03</div><h2>Labs</h2><p>Semua misi dan tools lama akan dipindahkan setelah fondasi stabil.</p></div></div>
    </main>
  </>;
}

ReactDOM.createRoot(document.getElementById("root")!).render(<StrictMode><ConvexAuthProvider client={convex}><Shell /></ConvexAuthProvider></StrictMode>);
