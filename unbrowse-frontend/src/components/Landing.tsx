import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Github, ArrowRight, Wallet, ExternalLink } from 'lucide-react';

interface LandingProps {
  onNavigate: (view: string) => void;
}

/* ─── Animated typing terminal ─── */
function Terminal() {
  const lines = [
    { t: '$ unbrowse capture coingecko.com', c: '#e2e8f0', d: 0 },
    { t: '  ⚡ intercepting network traffic…', c: '#64748b', d: 600 },
    { t: '  → found 12 internal API endpoints', c: '#22d3ee', d: 1400 },
    { t: '  → generated typed client (2.1kb)', c: '#22d3ee', d: 2000 },
    { t: '', c: '', d: 2600 },
    { t: '$ unbrowse replay getPrice --coin=solana', c: '#e2e8f0', d: 2800 },
    { t: '  ✓ 200 OK  119ms', c: '#4ade80', d: 3600 },
    { t: '  { "solana": { "usd": 142.67 } }', c: '#fb923c', d: 4000 },
  ];

  const [visible, setVisible] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const timers = lines.map((l, i) =>
      setTimeout(() => setVisible(i + 1), l.d)
    );
    const loop = setTimeout(() => {
      setVisible(0);
      lines.forEach((l, i) =>
        setTimeout(() => setVisible(i + 1), l.d)
      );
    }, 6000);
    return () => { timers.forEach(clearTimeout); clearTimeout(loop); };
  }, [inView]);

  return (
    <div ref={ref} className="relative max-w-2xl w-full">
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent" />
      <div className="relative rounded-2xl bg-[#0d1117] overflow-hidden ring-1 ring-white/[0.06]">
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/[0.04]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]/80" />
          <span className="ml-2 text-[10px] text-white/20 tracking-wider uppercase">unbrowse</span>
        </div>
        <div className="p-5 font-mono text-[13px] leading-[1.7] min-h-[220px]">
          {lines.slice(0, visible).map((l, i) =>
            l.t ? (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                style={{ color: l.c }}
              >{l.t}</motion.div>
            ) : <div key={i} className="h-3" />
          )}
          {visible < lines.length && (
            <span className="inline-block w-[7px] h-[15px] bg-white/60 animate-[pulse_1s_ease-in-out_infinite]" />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Solana logo ─── */
function SolanaLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 397 311" fill="none">
      <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z" fill="url(#s1)"/>
      <path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" fill="url(#s2)"/>
      <path d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" fill="url(#s3)"/>
      <defs>
        <linearGradient id="s1" x1="0" y1="0" x2="397" y2="311" gradientUnits="userSpaceOnUse"><stop stopColor="#00FFA3"/><stop offset="1" stopColor="#DC1FFF"/></linearGradient>
        <linearGradient id="s2" x1="0" y1="0" x2="397" y2="311" gradientUnits="userSpaceOnUse"><stop stopColor="#00FFA3"/><stop offset="1" stopColor="#DC1FFF"/></linearGradient>
        <linearGradient id="s3" x1="0" y1="0" x2="397" y2="311" gradientUnits="userSpaceOnUse"><stop stopColor="#00FFA3"/><stop offset="1" stopColor="#DC1FFF"/></linearGradient>
      </defs>
    </svg>
  );
}

/* ─── Counter ─── */
function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref as any, { once: true });
  useEffect(() => {
    if (!inView) return;
    let cur = 0;
    const step = value / 30;
    const t = setInterval(() => {
      cur += step;
      if (cur >= value) { setN(value); clearInterval(t); }
      else setN(Math.floor(cur));
    }, 30);
    return () => clearInterval(t);
  }, [value, inView]);
  return <span ref={ref}>{n.toLocaleString()}{suffix}</span>;
}

/* ─── Main Landing ─── */
export function Landing({ onNavigate }: LandingProps) {
  const [walletAddr, setWalletAddr] = useState('');
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -60]);

  const connectWallet = async () => {
    try {
      const sol = (window as any).solana;
      if (sol?.isPhantom) {
        const r = await sol.connect();
        setWalletAddr(r.publicKey.toString());
      } else window.open('https://phantom.app/', '_blank');
    } catch {}
  };

  const captures = [
    { name: 'CoinGecko', apis: 12, ms: 119, cat: 'crypto' },
    { name: 'Jupiter', apis: 5, ms: 156, cat: 'defi' },
    { name: 'Helius RPC', apis: 8, ms: 89, cat: 'solana' },
    { name: 'Magic Eden', apis: 7, ms: 134, cat: 'nft' },
    { name: 'Birdeye', apis: 9, ms: 112, cat: 'analytics' },
    { name: 'DexScreener', apis: 3, ms: 98, cat: 'defi' },
    { name: 'Raydium', apis: 3, ms: 145, cat: 'amm' },
    { name: 'Orca', apis: 3, ms: 131, cat: 'dex' },
  ];

  return (
    <div className="bg-[#09090b] text-[#fafafa] selection:bg-cyan-500/30 overflow-x-hidden">
      {/* ──────────── NAV ──────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-[#09090b]/70 border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 h-14">
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="size-7 rounded-md bg-gradient-to-br from-cyan-400 to-orange-500 grid place-items-center text-[11px] font-black text-black">U</div>
            <span className="font-semibold text-[15px] tracking-tight">Unbrowse</span>
          </a>
          <div className="flex items-center gap-2">
            <a href="https://github.com/getfoundry-app/unbrowse" target="_blank" className="size-8 grid place-items-center rounded-md text-white/40 hover:text-white/80 hover:bg-white/[0.04] transition-all">
              <Github size={16} />
            </a>
            <button onClick={connectWallet} className="h-8 px-3 text-xs font-medium rounded-md border border-white/[0.08] text-white/60 hover:text-white hover:border-white/20 transition-all flex items-center gap-1.5">
              <Wallet size={13} />
              {walletAddr ? `${walletAddr.slice(0,4)}…${walletAddr.slice(-4)}` : 'Connect'}
            </button>
            <button onClick={() => onNavigate('dashboard')} className="h-8 px-4 text-xs font-semibold rounded-md bg-white text-black hover:bg-white/90 transition-all">
              Dashboard →
            </button>
          </div>
        </div>
      </nav>

      {/* ──────────── HERO ──────────── */}
      <motion.section style={{ opacity: heroOpacity, y: heroY }} className="relative min-h-[100dvh] flex flex-col items-center justify-center px-5 pt-14">
        {/* bg effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-cyan-500/[0.07] blur-[180px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-orange-500/[0.04] blur-[150px] rounded-full pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 h-7 px-3 rounded-full bg-white/[0.04] border border-white/[0.06] mb-8">
            <SolanaLogo size={14} />
            <span className="text-[11px] font-medium text-white/50 tracking-wide">BUILT ON SOLANA · x402 PAYMENTS</span>
          </div>

          <h1 className="text-[clamp(2.8rem,8vw,6.5rem)] font-bold leading-[0.9] tracking-[-0.04em] mb-5">
            Stop scraping.<br />
            <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-orange-400 bg-clip-text text-transparent">Start calling.</span>
          </h1>

          <p className="text-white/40 text-[clamp(1rem,2vw,1.25rem)] max-w-xl mx-auto leading-relaxed mb-8">
            Every website has internal APIs. Unbrowse captures them, generates typed clients, and replays at <span className="text-cyan-400 font-mono font-medium">253×</span> the speed of browser automation.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={() => onNavigate('dashboard')} className="h-12 px-7 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 text-black font-semibold text-[15px] hover:shadow-[0_0_32px_rgba(34,211,238,0.3)] transition-all flex items-center gap-2">
              Explore marketplace <ArrowRight size={16} />
            </button>
            <a href="https://github.com/getfoundry-app/unbrowse" target="_blank" className="h-12 px-7 rounded-xl bg-white/[0.04] border border-white/[0.08] font-medium text-[15px] text-white/70 hover:text-white hover:border-white/20 transition-all flex items-center gap-2">
              <Github size={16} /> Source code
            </a>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}>
          <Terminal />
        </motion.div>

        {/* scroll hint */}
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-8 text-white/15 text-xs tracking-widest uppercase">
          scroll
        </motion.div>
      </motion.section>

      {/* ──────────── SPEED COMPARISON ──────────── */}
      <section className="py-28 px-5">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <p className="text-white/30 text-xs uppercase tracking-[0.2em] mb-6">The difference</p>
            <div className="flex items-center justify-center gap-5 md:gap-8 mb-4">
              <div>
                <div className="text-[clamp(2rem,6vw,4.5rem)] font-bold text-white/15 line-through decoration-white/10 font-mono tracking-tight">30,000<span className="text-[0.5em]">ms</span></div>
                <p className="text-white/20 text-xs mt-1">Puppeteer</p>
              </div>
              <ArrowRight className="text-white/10" size={28} />
              <div>
                <div className="text-[clamp(2rem,6vw,4.5rem)] font-bold text-cyan-400 font-mono tracking-tight">119<span className="text-[0.5em]">ms</span></div>
                <p className="text-cyan-400/60 text-xs mt-1">Unbrowse</p>
              </div>
            </div>
            <p className="text-white/25 text-sm">Same data. <span className="text-white/50">253× faster.</span> Zero browser overhead.</p>
          </motion.div>
        </div>
      </section>

      {/* ──────────── HOW IT WORKS ──────────── */}
      <section className="py-24 px-5 border-y border-white/[0.03]">
        <div className="max-w-5xl mx-auto">
          <p className="text-white/30 text-xs uppercase tracking-[0.2em] mb-12 text-center">How it works</p>
          <div className="grid md:grid-cols-4 gap-px bg-white/[0.04] rounded-2xl overflow-hidden">
            {[
              { n: '01', title: 'Visit', desc: 'Browse any website. We intercept API traffic in the background.' },
              { n: '02', title: 'Capture', desc: 'Extract endpoints, params, auth patterns, response schemas.' },
              { n: '03', title: 'Generate', desc: 'Auto-create typed TypeScript client with full documentation.' },
              { n: '04', title: 'Replay', desc: 'Call APIs directly. 253× faster than browser automation.' },
            ].map((step, i) => (
              <motion.div key={step.n}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-[#09090b] p-7">
                <span className="text-white/10 text-[40px] font-bold leading-none font-mono">{step.n}</span>
                <h3 className="text-lg font-semibold mt-3 mb-2">{step.title}</h3>
                <p className="text-white/35 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────── LIVE CAPTURES ──────────── */}
      <section className="py-28 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-white/30 text-xs uppercase tracking-[0.2em] mb-3">Marketplace</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Real API captures, ready to use</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {captures.map((c, i) => (
              <motion.button key={c.name}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                onClick={() => onNavigate('dashboard')}
                className="text-left p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-cyan-500/30 hover:bg-white/[0.03] transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-[15px] group-hover:text-cyan-400 transition-colors">{c.name}</span>
                  <span className="text-[11px] font-mono text-cyan-400/70">{c.ms}ms</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-white/25 font-mono">{c.apis} endpoints</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-white/30">{c.cat}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────── FOR AGENTS ──────────── */}
      <section className="py-28 px-5 border-y border-white/[0.03]">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="text-orange-400/70 text-xs uppercase tracking-[0.2em] mb-4">For AI agents</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-5">
              Your agent's new<br />superpower
            </h2>
            <p className="text-white/35 leading-relaxed mb-8">
              AI agents waste 90% of compute fighting browser automation. Give them direct API access instead — typed, documented, monitored, and 253× faster.
            </p>
            <div className="space-y-3">
              {['Drop-in Puppeteer/Playwright replacement', 'Auto-generated TypeScript types', 'Health monitoring & reliability scores', 'x402 micropayments on Solana'].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="size-1.5 rounded-full bg-cyan-400" />
                  <span className="text-white/50">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-6 font-mono text-[13px]">
            <p className="text-white/20 mb-3">// before — puppeteer, 30s</p>
            <pre className="text-white/15 leading-relaxed mb-5">{`const browser = await puppeteer.launch()
const page = await browser.newPage()
await page.goto(url)
await page.waitForSelector('#data')
const data = await page.evaluate(…)
await browser.close()`}</pre>
            <div className="border-t border-white/[0.04] my-4" />
            <p className="text-cyan-400/50 mb-3">// after — unbrowse, 119ms</p>
            <pre className="text-cyan-400/80 leading-relaxed">{`import { api } from './skills/coingecko'

const price = await api.getPrice({
  coins: ['solana'],
  currency: 'usd'
})`}</pre>
          </motion.div>
        </div>
      </section>

      {/* ──────────── STATS ──────────── */}
      <section className="py-28 px-5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.04] rounded-2xl overflow-hidden">
          {[
            { label: 'Skills indexed', value: 67, suffix: '' },
            { label: 'APIs captured', value: 1893, suffix: '' },
            { label: 'Avg response', value: 119, suffix: 'ms' },
            { label: 'Speedup', value: 253, suffix: '×' },
          ].map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="bg-[#09090b] p-7 text-center">
              <div className="text-3xl md:text-4xl font-bold font-mono tracking-tight mb-1">
                <Counter value={s.value} suffix={s.suffix} />
              </div>
              <div className="text-[11px] text-white/25 uppercase tracking-widest">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ──────────── x402 PAYMENT ──────────── */}
      <section className="py-28 px-5 border-t border-white/[0.03]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-white/30 text-xs uppercase tracking-[0.2em] mb-3">Revenue model</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12">Solana x402 micropayments</h2>
          <div className="space-y-5 mb-12">
            {[
              { label: 'Skill creator', pct: 50, color: 'bg-cyan-400' },
              { label: 'Website owner', pct: 30, color: 'bg-emerald-400' },
              { label: 'Protocol treasury', pct: 20, color: 'bg-violet-400' },
            ].map((item, i) => (
              <motion.div key={item.label}
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="flex items-center justify-between mb-1.5 text-sm">
                  <span className="text-white/50">{item.label}</span>
                  <span className="font-mono text-white/70">{item.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${item.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 + 0.3, duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${item.color}`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
          <div className="inline-flex items-center gap-2.5 h-10 px-5 rounded-full bg-white/[0.03] border border-white/[0.06]">
            <SolanaLogo size={16} />
            <span className="text-xs text-white/40">Sub-cent transactions · Instant settlement · USDC</span>
          </div>
        </div>
      </section>

      {/* ──────────── CTA ──────────── */}
      <section className="py-36 px-5 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/[0.03] to-transparent pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative">
          <h2 className="text-4xl md:text-6xl font-bold tracking-[-0.03em] mb-5">
            Ready to <span className="bg-gradient-to-r from-cyan-300 to-orange-400 bg-clip-text text-transparent">unbrowse</span>?
          </h2>
          <p className="text-white/30 text-lg mb-10 max-w-md mx-auto">The decentralized API marketplace. Capture, share, and monetize web APIs on Solana.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={() => onNavigate('dashboard')} className="h-12 px-8 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all flex items-center gap-2">
              Launch dashboard <ArrowRight size={16} />
            </button>
            <a href="https://github.com/getfoundry-app/unbrowse" target="_blank" className="h-12 px-8 rounded-xl border border-white/[0.08] font-medium text-white/60 hover:text-white hover:border-white/20 transition-all flex items-center gap-2">
              <Github size={16} /> View source
            </a>
          </div>
        </motion.div>
      </section>

      {/* ──────────── FOOTER ──────────── */}
      <footer className="border-t border-white/[0.03] py-8 px-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-white/20">
          <span>Unbrowse · Built autonomously by <a href="https://github.com/getfoundry-app" target="_blank" className="text-white/40 hover:text-white/60 transition-colors">aiko-9</a> for Colosseum Hackathon</span>
          <div className="flex gap-5">
            <a href="https://github.com/getfoundry-app/unbrowse" target="_blank" className="hover:text-white/40 transition-colors">GitHub</a>
            <a href="https://arena.colosseum.org/projects/unbrowse-x7fq05" target="_blank" className="hover:text-white/40 transition-colors">Colosseum</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
