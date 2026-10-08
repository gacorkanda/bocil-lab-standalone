import React, { StrictMode, useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { ConvexAuthProvider, useAuthActions } from "@convex-dev/auth/react";
import { ConvexReactClient, useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import {
  Activity,
  Award,
  BarChart3,
  CircleCheck,
  Layers3,
  Binary,
  CheckCircle2,
  Compass,
  Flag,
  KeyRound,
  LockKeyhole,
  LogIn,
  LogOut,
  Radar,
  Search,
  Shield,
  TerminalSquare,
  Timer,
  Trophy,
  UserRound,
  Wrench,
  Zap,
} from "lucide-react";
import "./index.css";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
if (!convexUrl) throw new Error("VITE_CONVEX_URL belum tersedia. Jalankan npx convex dev terlebih dahulu.");
const convex = new ConvexReactClient(convexUrl);

type Screen = "landing" | "auth";
type Tab = "missions" | "tools" | "ctf";

const MODULES = [
  ["Recon & OSINT", "Bongkar jejak digital dari log, metadata, dan informasi terbuka.", Radar],
  ["Web Exploitation", "Belajar memahami validasi, encoding, dan kesalahan web di sandbox.", TerminalSquare],
  ["Kriptografi", "ROT13, binary, base64, sampai hash lemah untuk melatih pola pikir.", KeyRound],
  ["Forensik Digital", "Pulihkan file, baca paket, dan cari artefak tersembunyi.", Compass],
  ["Coding & Logic", "BFS, dictionary attack, dan puzzle algoritmik untuk otak bocil.", Zap],
] as const;

const rankList: Array<readonly [number, string, string]> = [
  [0, "Script Kiddie", "🐣"],
  [200, "Byte Beginner", "🔧"],
  [500, "Net Runner", "🛰️"],
  [900, "Cipher Breaker", "🔐"],
  [1400, "Shadow Coder", "🕶️"],
  [2000, "Hacker Bocil Legendary", "👑"],
];

function rankFor(xp: number) {
  let current = rankList[0];
  let next: (typeof rankList)[number] | null = null;
  for (const rank of rankList) {
    if (xp >= rank[0]) current = rank;
  }
  const index = rankList.findIndex((rank) => rank === current);
  next = rankList[index + 1] ?? null;
  const pct = next ? Math.min(100, Math.round(((xp - current[0]) / (next[0] - current[0])) * 100)) : 100;
  return { current, next, pct };
}

function Landing({ goAuth }: { goAuth: () => void }) {
  const [terminal, setTerminal] = useState<string[]>([
    "BOCIL LAB // secure sandbox",
    "ketik help untuk daftar perintah",
    "",
  ]);
  const [cmd, setCmd] = useState("");

  const run = (value: string) => {
    const input = value.trim();
    const command = input.toLowerCase();
    if (!command) return;
    const output =
      command === "help"
        ? ["help, ls, scan, missions, tools, ctf, clear"]
        : command === "ls"
          ? ["labs/  missions/  terminal/  ctf/  tools/"]
          : command === "scan"
            ? ["sandbox.bocil-lab.local", "22/tcp open ssh", "80/tcp open http", "1337/tcp open lab"]
            : command === "missions"
              ? ["14 misi total • 12 misi board + 2 arena CTF"]
              : command === "tools"
                ? ["BOCILSCAN • VULNPRISMA • EXPLOIT-KID • HASHMAU • DECYPHER"]
                : command === "ctf"
                  ? ["CTF ARENA • 60 menit • key berganti setiap session"]
                  : ["command not found — coba 'help'"];
    setTerminal((prev) => (command === "clear" ? [] : [...prev, `bocil@lab:~$ ${input}`, ...output]));
    setCmd("");
  };

  return (
    <div className="site-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">▰</span><span>BOCIL LAB</span></div>
        <button className="ghost-btn" onClick={goAuth}><LogIn size={16} /> MASUK LAB</button>
      </header>
      <main>
        <section className="hero">
          <div className="hero-grid" />
          <div className="hero-copy">
            <div className="eyebrow"><Shield size={15} /> INDEPENDENT CYBER LEARNING LAB</div>
            <h1>Belajar cyber.<br /><span>Main aman.</span></h1>
            <p>Lab latihan mandiri untuk recon, web, kriptografi, forensik, coding, tools simulasi, dan CTF. Semua praktik berjalan di sandbox buatan sendiri.</p>
            <div className="hero-actions">
              <button className="primary-btn" onClick={goAuth}>MASUK & MULAI <Zap size={17} /></button>
              <a href="#modules" className="secondary-btn">LIHAT MODUL</a>
            </div>
            <div className="hero-stats">
              <div><strong>14</strong><span>misi</span></div>
              <div><strong>5</strong><span>modul</span></div>
              <div><strong>5</strong><span>tools simulasi</span></div>
              <div><strong>60M</strong><span>CTF session</span></div>
            </div>
          </div>
          <div className="terminal-card">
            <div className="terminal-head"><span>lab-console</span><span>● LIVE</span></div>
            <div className="terminal-body">
              {terminal.map((line, index) => <div className={line.startsWith("bocil@") ? "term-line cmd" : "term-line"} key={`${line}-${index}`}>{line || "\u00A0"}</div>)}
              <div className="term-input"><span>$</span><input value={cmd} onChange={(event) => setCmd(event.target.value)} onKeyDown={(event) => event.key === "Enter" && run(cmd)} placeholder="help" /></div>
            </div>
          </div>
        </section>

        <section id="modules" className="section">
          <div className="section-heading"><div><div className="eyebrow">MISSION TREE</div><h2>Lima modul, satu lab.</h2></div><span className="section-tag">PHASE 02</span></div>
          <div className="module-grid">
            {MODULES.map(([name, description, Icon], index) => (
              <article className="module-card" key={name}>
                <div className="module-num">MOD-0{index + 1}</div>
                <div className="icon-box"><Icon size={22} /></div>
                <h3>{name}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section split">
          <div><div className="eyebrow">HOW IT WORKS</div><h2>Masuk. Pecahkan. Naik level.</h2><p className="section-copy">Flag dan hasil latihan tersimpan di Convex. Tools hanya bekerja pada target sandbox lab; tidak ada scanner yang diarahkan ke sistem eksternal.</p></div>
          <div className="steps">
            {[["01", "LOGIN", "Buat identitas operative"], ["02", "MISSIONS", "Pecahkan briefing + flag"], ["03", "TOOLS", "Eksplorasi scanner simulasi"], ["04", "CTF", "Tantangan 60 menit"]].map(([number, title, description]) => <div className="step" key={number}><span>{number}</span><div><strong>{title}</strong><p>{description}</p></div></div>)}
          </div>
        </section>
      </main>
      <footer>BOCIL LAB — independent rebuild • Convex backend • Vercel hosting</footer>
    </div>
  );
}

function Auth({ onBack }: { onBack: () => void }) {
  const { signIn } = useAuthActions();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError(null);
    try {
      const form = new FormData(); form.set("email", email); form.set("password", password); form.set("flow", mode);
      await signIn("password", form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Autentikasi gagal."); setBusy(false);
    }
  };

  const guest = async () => {
    setBusy(true); setError(null);
    try { await signIn("anonymous"); }
    catch (err) { setError(err instanceof Error ? err.message : "Guest login gagal."); setBusy(false); }
  };

  return <div className="auth-page"><div className="auth-orbit" /><div className="auth-card">
    <button className="back-link" onClick={onBack}>← kembali</button>
    <div className="eyebrow"><LockKeyhole size={15} /> AUTH CORE</div>
    <h1>{mode === "signIn" ? "Masuk ke lab" : "Buat akun lab"}</h1>
    <p>Gunakan email + password atau masuk sebagai guest untuk mencoba seluruh sandbox latihan.</p>
    <form onSubmit={submit}>
      <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label>
      <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required autoComplete={mode === "signIn" ? "current-password" : "new-password"} /></label>
      {error && <div className="error-box">{error}</div>}
      <button className="primary-btn wide" disabled={busy}>{busy ? "MEMPROSES..." : mode === "signIn" ? "MASUK" : "BUAT AKUN"}</button>
    </form>
    <div className="or">ATAU</div>
    <button className="secondary-btn wide" onClick={guest} disabled={busy}><UserRound size={17} /> MASUK SEBAGAI TAMU</button>
    <button className="switch-link" onClick={() => { setMode(mode === "signIn" ? "signUp" : "signIn"); setError(null); }}>{mode === "signIn" ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"}</button>
  </div></div>;
}

function Countdown({ expiresAt }: { expiresAt: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, []);
  const remaining = Math.max(0, expiresAt - now);
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  return <span className={remaining < 5 * 60 * 1000 ? "countdown danger" : "countdown"}><Timer size={15} /> {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}</span>;
}

function OverviewPanel({
  progress,
  achievements,
  onTab,
}: {
  progress: { solvedCodes: string[]; totalSolved: number; xp: number };
  achievements: Array<{ code: string; title: string; description: string; icon: string }>;
  onTab: (tab: Tab) => void;
}) {
  const rank = rankFor(progress.xp);
  const moduleStats = [
    ["Recon", ["REC-01", "REC-02"]],
    ["Web", ["WEB-01", "WEB-02", "WEB-03"]],
    ["Crypto", ["CRY-01", "CRY-02", "CRY-03"]],
    ["Forensik", ["FOR-01", "FOR-02"]],
    ["Logic", ["CRD-01", "CRD-02"]],
  ];
  return <section className="overview-grid">
    <div className="overview-main panel">
      <div className="eyebrow"><BarChart3 size={15} /> PROGRESS INTEL</div>
      <div className="overview-rank"><div className="overview-rank-badge">{rank.current[2]}</div><div><strong>{rank.current[1]}</strong><p>{progress.xp} XP{rank.next ? ` • ${rank.next[0] - progress.xp} XP ke ${rank.next[1]}` : " • MAX RANK"}</p></div></div>
      <div className="module-progress-list">
        {moduleStats.map(([label, codes]) => {
          const done = (codes as string[]).filter((code) => progress.solvedCodes.includes(code)).length;
          const pct = Math.round((done / (codes as string[]).length) * 100);
          return <div className="module-progress" key={label as string}><div className="module-progress-head"><span>{label}</span><span>{done}/{(codes as string[]).length}</span></div><div className="module-progress-bar"><i style={{ width: `${pct}%` }} /></div></div>;
        })}
      </div>
      <div className="quick-actions">
        <button className="secondary-btn" onClick={() => onTab("missions")}><Flag size={15} /> LANJUT MISI</button>
        <button className="secondary-btn" onClick={() => onTab("tools")}><Wrench size={15} /> BUKA TOOLS</button>
        <button className="secondary-btn" onClick={() => onTab("ctf")}><Trophy size={15} /> MASUK ARENA</button>
      </div>
    </div>
    <div className="achievement-panel panel">
      <div className="section-heading compact"><div><div className="eyebrow"><Award size={15} /> ACHIEVEMENTS</div><h3>{achievements.length}/11 unlocked</h3></div><span className="section-tag">MEDALS</span></div>
      {achievements.length === 0 ? <div className="achievement-empty"><Award size={28} /><p>Belum ada medal. Selesaikan misi pertama untuk membuka <strong>First Flag</strong>.</p></div> : <div className="achievement-list">{achievements.slice(0, 6).map((achievement) => <div className="achievement-row" key={achievement.code}><span className="achievement-icon">{achievement.icon}</span><div><strong>{achievement.title}</strong><p>{achievement.description}</p></div><CircleCheck size={16} /></div>)}</div>}
    </div>
  </section>;
}

function MissionsTab({ onCTF }: { onCTF: () => void }) {
  const missions = useQuery(api.lab.missions) ?? [];
  const progress = useQuery(api.lab.myProgress) ?? { solvedCodes: [], totalSolved: 0, xp: 0 };
  const submitFlag = useMutation(api.lab.submitFlag);
  const [selected, setSelected] = useState<string | null>(null);
  const [flag, setFlag] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [difficulty, setDifficulty] = useState("ALL");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: string; text: string } | null>(null);
  const solved = useMemo(() => new Set(progress.solvedCodes), [progress.solvedCodes]);
  const normalizedSearch = search.trim().toLowerCase();
  const visible = missions.filter((mission) =>
    (filter === "ALL" || mission.module === filter) &&
    (difficulty === "ALL" || mission.difficulty === difficulty) &&
    (!normalizedSearch || `${mission.code} ${mission.title} ${mission.brief}`.toLowerCase().includes(normalizedSearch)),
  );

  const solve = async (code: string) => {
    if (!flag.trim()) return;
    setBusy(true); setMessage(null);
    try {
      const result = await submitFlag({ code, flag });
      if (result.status === "solved") {
        setMessage({ tone: "ok", text: `${result.message} ${result.echo ?? ""}${result.achievementsUnlocked?.length ? ` • Achievement: ${result.achievementsUnlocked.join(", ")}` : ""}` }); setSelected(null); setFlag("");
      } else if (result.status === "wrong") {
        setMessage({ tone: "err", text: `${result.message} Hint: ${result.hint}` });
      } else setMessage({ tone: "info", text: result.message });
    } catch (err) { setMessage({ tone: "err", text: err instanceof Error ? err.message : "Gagal mengirim flag." }); }
    finally { setBusy(false); }
  };

  return <section>
    <div className="filter-row mission-filters"><div><div className="eyebrow"><Flag size={15} /> MISSION BOARD</div><p className="small-copy">Pecahkan misi biasa di sini. CTF-01 dan CTF-02 diselesaikan melalui Arena.</p></div><div className="filter-controls"><label><Search size={14} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari misi..." /></label><select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="ALL">Semua modul</option>{[...new Set(missions.map((mission) => mission.module))].map((module) => <option value={module} key={module}>{module}</option>)}</select><select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option value="ALL">Semua tingkat</option><option value="MUDAH">MUDAH</option><option value="SEDANG">SEDANG</option><option value="SULIT">SULIT</option><option value="LEGENDARY">LEGENDARY</option></select></div></div>
    {message && <div className={`toast-msg ${message.tone}`}>{message.text}</div>}
    <div className="mission-grid">
      {visible.map((mission) => {
        const done = solved.has(mission.code);
        return <article className={`mission-card ${done ? "done" : ""} ${mission.arenaOnly ? "arena" : ""}`} key={mission.code}>
          <div className="mission-top"><span className="mission-code">{mission.code}</span><span className={`diff ${mission.difficulty.toLowerCase()}`}>{mission.difficulty}</span></div>
          <div className="mission-icon">{done ? <CheckCircle2 size={21} /> : mission.arenaOnly ? <Trophy size={21} /> : <KeyRound size={21} />}</div>
          <div className="mission-module">{mission.module}</div>
          <h3>{mission.title}</h3>
          <p>{mission.brief}</p>
          <div className="mission-meta"><span>+{mission.xp} XP</span><span>{done ? "CLEARED" : mission.arenaOnly ? "ARENA" : "FLAG TERKUNCI"}</span></div>
          {mission.arenaOnly ? <button className="secondary-btn wide" onClick={onCTF}>{done ? "LIHAT ARENA" : "BUKA CTF ARENA"}</button> : !done && <button className="primary-btn wide" onClick={() => { setSelected(selected === mission.code ? null : mission.code); setMessage(null); setFlag(""); }}>{selected === mission.code ? "TUTUP" : "BUKA MISI"}</button>}
          {selected === mission.code && !done && <div className="submit-box"><input value={flag} onChange={(event) => setFlag(event.target.value)} onKeyDown={(event) => event.key === "Enter" && solve(mission.code)} placeholder="bocil{flagmu}" spellCheck={false} /><button className="primary-btn wide" disabled={busy || !flag.trim()} onClick={() => solve(mission.code)}>{busy ? "CEK..." : "KIRIM FLAG"}</button></div>}
        </article>;
      })}
    </div>
  </section>;
}

function ToolsTab() {
  const tools = useQuery(api.tools.listTools) ?? [];
  const runs = useQuery(api.tools.myRuns) ?? [];
  const runTool = useMutation(api.tools.runTool);
  const [target, setTarget] = useState("sandbox.bocil-lab.local");
  const [active, setActive] = useState<string | null>(null);
  const [result, setResult] = useState<{ summary: string; findings: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const execute = async (toolId: string) => {
    setActive(toolId); setResult(null); setError(null);
    try {
      const response = await runTool({ toolId, target });
      if (response.status === "done") setResult({ summary: `${response.summary}${response.achievementsUnlocked?.length ? ` • Achievement: ${response.achievementsUnlocked.join(", ")}` : ""}`, findings: response.findings });
      else setError(response.message);
    } catch (err) { setError(err instanceof Error ? err.message : "Tool gagal dijalankan."); }
    finally { setActive(null); }
  };

  return <section className="tools-layout">
    <div>
      <div className="filter-row"><div><div className="eyebrow"><Wrench size={15} /> TOOLBOX</div><p className="small-copy">Semua tool di bawah adalah simulasi deterministik. Target dibatasi ke sandbox BOCIL LAB.</p></div></div>
      <div className="target-box"><label>Sandbox target<input value={target} onChange={(event) => setTarget(event.target.value)} spellCheck={false} /><small>Gunakan sandbox.bocil-lab.local atau subdomain sandbox-nya.</small></label></div>
      <div className="tool-grid">
        {tools.map((tool) => <article className="tool-card" key={tool.id}>
          <div className="tool-card-top"><span className="tool-category">{tool.category}</span><Activity size={18} /></div>
          <h3>{tool.name}</h3><p>{tool.description}</p><code>{tool.codename}</code>
          <button className="primary-btn wide" onClick={() => execute(tool.id)} disabled={active !== null}>{active === tool.id ? "MENJALANKAN..." : "JALANKAN SIMULASI"}</button>
        </article>)}
      </div>
    </div>
    <aside className="tool-result panel">
      <div className="eyebrow"><TerminalSquare size={15} /> TOOL OUTPUT</div>
      {error && <div className="error-box">{error}</div>}
      {result ? <><h3>{result.summary}</h3><div className="result-lines">{result.findings.map((line, index) => <div key={index}>{line}</div>)}</div></> : <p className="muted-copy">Pilih tool untuk melihat hasil simulasi di sini.</p>}
      <div className="run-history"><div className="history-title">RIWAYAT TERAKHIR</div>{runs.slice(0, 6).map((run) => <div className="history-row" key={run._id}><span>{run.toolId}</span><span>{run.target}</span></div>)}</div>
    </aside>
  </section>;
}

function CtfTab() {
  const state = useQuery(api.ctf.sessionState);
  const startSession = useMutation(api.ctf.startSession);
  const solve01 = useMutation(api.ctf.solve01);
  const solve02 = useMutation(api.ctf.solve02);
  const [answer01, setAnswer01] = useState("");
  const [answer02, setAnswer02] = useState("");
  const [message, setMessage] = useState<{ tone: string; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const start = async () => {
    setBusy(true); setMessage(null); setAnswer01(""); setAnswer02("");
    try { const response = await startSession({}); setMessage({ tone: response.status === "started" ? "ok" : "err", text: response.message }); }
    catch (err) { setMessage({ tone: "err", text: err instanceof Error ? err.message : "Gagal membuat session." }); }
    finally { setBusy(false); }
  };

  const doSolve = async (stage: "01" | "02") => {
    setBusy(true); setMessage(null);
    try {
      const response = stage === "01" ? await solve01({ answer: answer01 }) : await solve02({ answer: answer02 });
      const tone = response.status === "solved" ? "ok" : response.status === "wrong" ? "err" : "info";
      setMessage({ tone, text: `${response.message}${response.achievementsUnlocked?.length ? ` • Achievement: ${response.achievementsUnlocked.join(", ")}` : ""}` });
      if (response.status === "solved" && stage === "01") setAnswer01("");
      if (response.status === "solved" && stage === "02") setAnswer02("");
    } catch (err) { setMessage({ tone: "err", text: err instanceof Error ? err.message : "Jawaban gagal dikirim." }); }
    finally { setBusy(false); }
  };

  return <section>
    <div className="ctf-hero panel">
      <div><div className="eyebrow"><Trophy size={15} /> CTF ARENA</div><h2>Kunci bergilir. 60 menit.</h2><p>Setiap session menghasilkan challenge baru. Stage-1 berisi data yang di-encode Base64; Stage-2 meminta SECRET_NUMBER dari payload yang sama.</p></div>
      <div className="ctf-actions">{state?.active && <Countdown expiresAt={state.expiresAt} />}<button className="primary-btn" onClick={start} disabled={busy}>{busy ? "MEMPROSES..." : state?.active ? "RESET SESSION" : "INITIALIZE SESSION"}</button></div>
    </div>
    {message && <div className={`toast-msg ${message.tone}`}>{message.text}</div>}
    {!state?.active ? <div className="empty-arena panel"><Trophy size={34} /><h3>Arena belum aktif</h3><p>Tekan INITIALIZE SESSION untuk menghasilkan payload baru. Session sebelumnya akan dianggap hangus.</p></div> : <div className="ctf-grid">
      <article className="panel ctf-card"><div className="mission-top"><span className="mission-code">CTF-01</span><span className="diff sulit">+450 XP</span></div><h3>Decode kunci sesi</h3><p>Decode Base64 berikut. Cari bagian <strong>KEY=...</strong> dan kirim persis nilai key-nya.</p><pre>{state.stage1}</pre><div className="submit-box"><input value={answer01} onChange={(event) => setAnswer01(event.target.value)} placeholder="K-XXXXXXX" disabled={state.solved01} spellCheck={false} /><button className="primary-btn wide" disabled={busy || state.solved01 || !answer01.trim()} onClick={() => doSolve("01")}>{state.solved01 ? "CLEARED" : "KIRIM KEY"}</button></div></article>
      <article className="panel ctf-card"><div className="mission-top"><span className="mission-code">CTF-02</span><span className="diff legendary">+1000 XP</span></div><h3>Operasi tengah malam</h3><p>Dari hasil decode Stage-1, cari <strong>SECRET_NUMBER=...</strong> lalu kirim angka tersebut. Satu payload, dua challenge.</p><div className="ctf-secret-hint"><Binary size={17} /><span>Stage-1 adalah payload training yang sengaja dibuat bisa dianalisis offline.</span></div><div className="submit-box"><input value={answer02} onChange={(event) => setAnswer02(event.target.value)} placeholder="SECRET_NUMBER" disabled={state.solved02} /><button className="primary-btn wide" disabled={busy || state.solved02 || !answer02.trim()} onClick={() => doSolve("02")}>{state.solved02 ? "CLEARED" : "KIRIM ANGKA"}</button></div></article>
    </div>}
  </section>;
}

function Dashboard() {
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.currentUser);
  const progress = useQuery(api.lab.myProgress) ?? { solvedCodes: [], totalSolved: 0, xp: 0 };
  const stats = useQuery(api.lab.labStats) ?? { operatives: 0, flagsCaptured: 0, totalXp: 0 };
  const achievements = useQuery(api.achievements.myAchievements) ?? [];
  const [tab, setTab] = useState<Tab>("missions");
  const rank = rankFor(progress.xp);

  return <div className="dashboard">
    <header className="dashbar"><div className="brand"><span className="brand-mark">▰</span><span>BOCIL LAB</span></div><div className="dash-actions"><span className="auth-pill"><UserRound size={14} /> {user?.email ?? "GUEST"}</span><button className="ghost-btn" onClick={() => signOut()}><LogOut size={15} /> KELUAR</button></div></header>
    <main className="dash-main">
      <div className="dash-title"><div><div className="eyebrow"><Trophy size={15} /> OPERATIVE DASHBOARD</div><h1>Siap berburu flag?</h1><p>Missions, tools sandbox, dan CTF semuanya sudah tersambung ke backend baru.</p></div><div className="rank-card"><span>{rank.current[2]}</span><div><strong>{rank.current[1]}</strong><small>{progress.xp} XP{rank.next ? ` • ${rank.next[0] - progress.xp} menuju ${rank.next[1]}` : " • MAX RANK"}</small></div><div className="rank-bar"><i style={{ width: `${rank.pct}%` }} /></div></div></div>
      <div className="stat-grid"><div className="stat"><span>FLAGS</span><strong>{progress.totalSolved}/14</strong></div><div className="stat"><span>XP</span><strong>{progress.xp}</strong></div><div className="stat"><span>OPERATIVES</span><strong>{stats.operatives}</strong></div><div className="stat"><span>GLOBAL FLAGS</span><strong>{stats.flagsCaptured}</strong></div></div>
      <OverviewPanel progress={progress} achievements={achievements} onTab={setTab} />
      <nav className="dash-tabs"><button className={tab === "missions" ? "active" : ""} onClick={() => setTab("missions")}><Flag size={16} /> MISSIONS</button><button className={tab === "tools" ? "active" : ""} onClick={() => setTab("tools")}><Wrench size={16} /> TOOLS</button><button className={tab === "ctf" ? "active" : ""} onClick={() => setTab("ctf")}><Trophy size={16} /> CTF ARENA</button></nav>
      {tab === "missions" && <MissionsTab onCTF={() => setTab("ctf")} />}
      {tab === "tools" && <ToolsTab />}
      {tab === "ctf" && <CtfTab />}
    </main>
  </div>;
}

function App() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const [screen, setScreen] = useState<Screen>("landing");
  useEffect(() => { if (!isAuthenticated && screen !== "landing" && !isLoading) setScreen("landing"); }, [isAuthenticated, isLoading, screen]);
  if (isLoading) return <div className="loading-screen">INITIALIZING BOCIL LAB...</div>;
  if (isAuthenticated) return <Dashboard />;
  return screen === "auth" ? <Auth onBack={() => setScreen("landing")} /> : <Landing goAuth={() => setScreen("auth")} />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(<StrictMode><ConvexAuthProvider client={convex}><App /></ConvexAuthProvider></StrictMode>);
