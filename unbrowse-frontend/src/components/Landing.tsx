import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Zap, Database, Repeat, Package, Github, ArrowRight, Timer, Code2,
  Sparkles, Bot, Shield, Globe, ChevronDown, Wallet, ExternalLink,
  Terminal, Play, CheckCircle2
} from 'lucide-react';

interface LandingProps {
  onNavigate: (view: string) => void;
}

// Animated counter hook
function useCounter(end: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!startOnView || !inView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration, inView, startOnView]);

  return { count, ref };
}

// Terminal animation lines
const terminalLines = [
  { type: 'input', text: '$ unbrowse capture https://api.coingecko.com', delay: 0 },
  { type: 'output', text: '⚡ Intercepting network traffic...', delay: 800 },
  { type: 'output', text: '📡 Found 12 API endpoints', delay: 1600 },
  { type: 'output', text: '🔍 GET /api/v3/coins/markets', delay: 2000 },
  { type: 'output', text: '🔍 GET /api/v3/simple/price', delay: 2200 },
  { type: 'output', text: '🔍 GET /api/v3/coins/{id}', delay: 2400 },
  { type: 'output', text: '✨ Generated typed client: coingecko/api.ts', delay: 3200 },
  { type: 'input', text: '$ unbrowse replay coingecko.getPrice --coin=solana', delay: 4200 },
  { type: 'success', text: '✅ 200 OK — 119ms (vs 30,000ms Puppeteer)', delay: 5000 },
  { type: 'json', text: '{ "solana": { "usd": 142.67, "usd_24h_change": 5.2 } }', delay: 5400 },
];

function AnimatedTerminal() {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const timers: NodeJS.Timeout[] = [];
    terminalLines.forEach((line, i) => {
      timers.push(setTimeout(() => setVisibleLines(i + 1), line.delay));
    });
    // Loop
    timers.push(setTimeout(() => setVisibleLines(0), 7000));
    timers.push(setTimeout(() => {
      terminalLines.forEach((line, i) => {
        timers.push(setTimeout(() => setVisibleLines(i + 1), line.delay));
      });
    }, 7500));
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  return (
    <div ref={ref} className="relative">
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#00d4ff]/20 via-[#ff6b35]/20 to-[#00d4ff]/20 rounded-2xl blur-xl opacity-60" />
      <div className="relative bg-[#0c0c0c] border border-[#1a1a2e] rounded-2xl overflow-hidden shadow-2xl shadow-[#00d4ff]/10">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-[#111118] border-b border-[#1a1a2e]">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 text-xs text-[#555] font-mono">unbrowse — live capture</span>
        </div>
        {/* Terminal body */}
        <div className="p-5 font-mono text-sm leading-relaxed min-h-[280px]">
          {terminalLines.slice(0, visibleLines).map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className={`mb-1 ${
                line.type === 'input' ? 'text-[#00d4ff]' :
                line.type === 'success' ? 'text-[#28c840]' :
                line.type === 'json' ? 'text-[#ff6b35]' :
                'text-[#888]'
              }`}
            >
              {line.text}
            </motion.div>
          ))}
          {visibleLines < terminalLines.length && (
            <span className="inline-block w-2 h-4 bg-[#00d4ff] animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}

// Solana logo SVG
function SolanaLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 397 311" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z" fill="url(#a)"/>
      <path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" fill="url(#b)"/>
      <path d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" fill="url(#c)"/>
      <defs>
        <linearGradient id="a" x1="0" y1="0" x2="397" y2="311" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00FFA3"/><stop offset="1" stopColor="#DC1FFF"/>
        </linearGradient>
        <linearGradient id="b" x1="0" y1="0" x2="397" y2="311" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00FFA3"/><stop offset="1" stopColor="#DC1FFF"/>
        </linearGradient>
        <linearGradient id="c" x1="0" y1="0" x2="397" y2="311" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00FFA3"/><stop offset="1" stopColor="#DC1FFF"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Landing({ onNavigate }: LandingProps) {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const stats = [
    { label: 'Skills Indexed', end: 247, icon: Database },
    { label: 'APIs Captured', end: 1893, icon: Code2 },
    { label: 'Avg Response', end: 119, suffix: 'ms', icon: Timer },
    { label: 'Speedup', end: 253, suffix: 'x', icon: Zap },
  ];

  const useCases = [
    { domain: 'CoinGecko', endpoints: 12, speed: '119ms', desc: 'Crypto prices, market data, coin metadata — all via direct API calls', tags: ['crypto', 'prices'] },
    { domain: 'JSONPlaceholder', endpoints: 6, speed: '45ms', desc: 'Full CRUD operations captured and typed automatically', tags: ['rest', 'demo'] },
    { domain: 'Helius RPC', endpoints: 8, speed: '89ms', desc: 'Solana RPC endpoints for transactions, balances, NFT data', tags: ['solana', 'rpc'] },
    { domain: 'Jupiter Aggregator', endpoints: 5, speed: '156ms', desc: 'Token swaps, price quotes, route optimization on Solana', tags: ['solana', 'defi'] },
    { domain: 'Magic Eden', endpoints: 7, speed: '134ms', desc: 'NFT listings, collections, floor prices across chains', tags: ['nft', 'marketplace'] },
    { domain: 'Birdeye', endpoints: 9, speed: '112ms', desc: 'DeFi analytics, token security, trading volume data', tags: ['solana', 'analytics'] },
  ];

  const connectWallet = async () => {
    try {
      const sol = (window as any).solana;
      if (sol?.isPhantom) {
        const resp = await sol.connect();
        setWalletAddress(resp.publicKey.toString());
        setWalletConnected(true);
      } else {
        window.open('https://phantom.app/', '_blank');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Noise overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015] z-50"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")` }} />

      {/* Nav */}
      <nav className="fixed top-0 w-full z-40 bg-[#050508]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#00d4ff] to-[#ff6b35] rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#050508]" />
            </div>
            <span className="text-xl font-bold tracking-tight">Unbrowse</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/getfoundry-app/unbrowse" target="_blank" rel="noopener noreferrer"
              className="text-[#666] hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <button onClick={connectWallet}
              className="flex items-center gap-2 bg-gradient-to-r from-[#9945FF]/20 to-[#14F195]/20 border border-[#9945FF]/30 text-white px-4 py-2 rounded-lg text-sm font-medium hover:border-[#14F195]/50 transition-all">
              <Wallet className="w-4 h-4" />
              {walletConnected ? `${walletAddress.slice(0,4)}...${walletAddress.slice(-4)}` : 'Connect Wallet'}
            </button>
            <button onClick={() => onNavigate('dashboard')}
              className="bg-[#00d4ff] text-[#050508] px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#00bdea] transition-all">
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-[#00d4ff] opacity-[0.04] blur-[150px] rounded-full" />
        <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-[#ff6b35] opacity-[0.03] blur-[150px] rounded-full" />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#00d4ff 1px, transparent 1px), linear-gradient(90deg, #00d4ff 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <div className="inline-flex items-center gap-2 bg-[#14F195]/10 border border-[#14F195]/20 rounded-full px-4 py-1.5 mb-6">
                <SolanaLogo className="w-4 h-4" />
                <span className="text-xs font-medium text-[#14F195]">Powered by Solana x402</span>
              </div>

              <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[0.95] tracking-tight mb-6">
                Internal APIs<br/>
                <span className="bg-gradient-to-r from-[#00d4ff] to-[#ff6b35] bg-clip-text text-transparent">
                  Are All You Need
                </span>
              </h1>

              <p className="text-lg text-[#888] max-w-lg mb-8 leading-relaxed">
                Every website already has an API. Stop scraping with Puppeteer at 30,000ms.
                Capture internal endpoints, generate typed clients, replay at 119ms.
                <span className="text-[#00d4ff]"> 253x faster.</span>
              </p>

              <div className="flex flex-wrap gap-4">
                <button onClick={() => onNavigate('dashboard')}
                  className="group bg-[#00d4ff] text-[#050508] px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-[#00d4ff]/25 transition-all flex items-center gap-2">
                  Explore Marketplace
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <a href="https://github.com/getfoundry-app/unbrowse" target="_blank" rel="noopener noreferrer"
                  className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all flex items-center gap-2">
                  <Github className="w-5 h-5" /> Star on GitHub
                </a>
              </div>
            </motion.div>

            {/* Right: Terminal */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
              <AnimatedTerminal />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 border-y border-white/5 bg-[#080810]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => {
              const counter = useCounter(stat.end, 2000);
              return (
                <motion.div key={stat.label}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  ref={counter.ref}
                  className="text-center p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#00d4ff]/30 transition-all">
                  <stat.icon className="w-6 h-6 text-[#00d4ff] mx-auto mb-3" />
                  <div className="text-4xl md:text-5xl font-bold mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {counter.count.toLocaleString()}{stat.suffix || ''}
                  </div>
                  <div className="text-xs text-[#666] uppercase tracking-widest">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-4">How It Works</motion.h2>
          <p className="text-[#666] text-center mb-16 text-lg">Four steps from website to typed API client</p>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Globe, title: 'Visit', desc: 'Browse any website normally — we intercept the traffic', color: '#00d4ff' },
              { icon: Terminal, title: 'Capture', desc: 'Extract internal API endpoints, params, and auth patterns', color: '#ff6b35' },
              { icon: Code2, title: 'Generate', desc: 'Auto-create typed TypeScript client + SKILL.md docs', color: '#14F195' },
              { icon: Zap, title: 'Replay', desc: 'Execute APIs directly — 253x faster than browser automation', color: '#9945FF' },
            ].map((step, i) => (
              <motion.div key={step.title}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-b from-transparent to-transparent group-hover:from-[color-mix(in_srgb,var(--c)_20%,transparent)] group-hover:to-transparent rounded-2xl transition-all duration-500"
                  style={{ '--c': step.color } as any} />
                <div className="relative bg-[#0a0a12] border border-white/5 rounded-2xl p-6 h-full">
                  <div className="text-5xl font-bold text-white/5 mb-4" style={{ fontFamily: "'JetBrains Mono', monospace" }}>0{i + 1}</div>
                  <step.icon className="w-8 h-8 mb-4" style={{ color: step.color }} />
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-[#888] text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Captures / Use Cases */}
      <section className="py-24 bg-[#080810]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-4">Real API Captures</motion.h2>
          <p className="text-[#666] text-center mb-16 text-lg">Skills generated from live websites — ready to use</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((uc, i) => (
              <motion.div key={uc.domain}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-[#0a0a12] border border-white/5 rounded-2xl p-6 hover:border-[#00d4ff]/30 transition-all group cursor-pointer"
                onClick={() => onNavigate('dashboard')}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold group-hover:text-[#00d4ff] transition-colors">{uc.domain}</h3>
                  <span className="text-xs font-mono px-2 py-1 rounded bg-[#00d4ff]/10 text-[#00d4ff]">{uc.speed}</span>
                </div>
                <p className="text-[#888] text-sm mb-4 leading-relaxed">{uc.desc}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {uc.tags.map(t => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded bg-white/5 text-[#666]">{t}</span>
                    ))}
                  </div>
                  <span className="text-xs text-[#666] font-mono">{uc.endpoints} endpoints</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* For Agents */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="inline-flex items-center gap-2 bg-[#ff6b35]/10 border border-[#ff6b35]/20 rounded-full px-4 py-1.5 mb-6">
                <Bot className="w-4 h-4 text-[#ff6b35]" />
                <span className="text-xs font-medium text-[#ff6b35]">Built for AI Agents</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Your Agent's<br/>
                <span className="text-[#ff6b35]">Superpower</span>
              </h2>
              <p className="text-[#888] text-lg mb-8 leading-relaxed">
                AI agents waste 90% of their time fighting browser automation.
                Unbrowse gives them direct API access to any website —
                typed, documented, and reliable.
              </p>
              <div className="space-y-4">
                {[
                  'Drop-in replacement for Puppeteer/Playwright',
                  'Auto-generated TypeScript types for every endpoint',
                  'Health monitoring — know before your agent fails',
                  'x402 micropayments for premium API access',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#14F195] flex-shrink-0" />
                    <span className="text-[#ccc]">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="bg-[#0a0a12] border border-white/5 rounded-2xl p-6">
                <div className="text-xs text-[#666] mb-3 font-mono">// Before: Puppeteer (30,000ms)</div>
                <pre className="text-sm font-mono text-[#555] mb-6 overflow-x-auto leading-relaxed">
{`const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto(url);
await page.waitForSelector('#data');
const data = await page.evaluate(
  () => document.querySelector('#data').textContent
);
await browser.close();`}</pre>
                <div className="border-t border-white/5 my-4" />
                <div className="text-xs text-[#00d4ff] mb-3 font-mono">// After: Unbrowse (119ms)</div>
                <pre className="text-sm font-mono text-[#00d4ff] overflow-x-auto leading-relaxed">
{`import { api } from './skills/coingecko';

const prices = await api.getPrice({
  coins: ['solana', 'bitcoin'],
  currency: 'usd'
});`}</pre>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* x402 Payment Split */}
      <section className="py-24 bg-[#080810]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-4">
            Solana x402 Revenue Split
          </motion.h2>
          <p className="text-[#666] text-center mb-16 text-lg">Instant micropayments for every API call</p>

          <div className="max-w-2xl mx-auto">
            {[
              { label: 'Skill Creator', percent: 50, color: '#00d4ff', desc: 'Rewarded for discovering & publishing APIs' },
              { label: 'Website Owner', percent: 30, color: '#14F195', desc: 'Compensated for their data & infrastructure' },
              { label: 'Protocol Treasury', percent: 20, color: '#9945FF', desc: 'Funds development & marketplace operations' },
            ].map((item, i) => (
              <motion.div key={item.label}
                initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-semibold">{item.label}</span>
                    <span className="text-[#666] text-sm ml-3">{item.desc}</span>
                  </div>
                  <span className="font-mono font-bold text-lg" style={{ color: item.color }}>{item.percent}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${item.percent}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 + 0.3, duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color, boxShadow: `0 0 20px ${item.color}40` }}
                  />
                </div>
              </motion.div>
            ))}

            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="mt-12 text-center">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#9945FF]/10 to-[#14F195]/10 border border-[#9945FF]/20 rounded-2xl px-8 py-4">
                <SolanaLogo className="w-8 h-8" />
                <div className="text-left">
                  <div className="font-bold text-lg">Powered by Solana</div>
                  <div className="text-[#888] text-sm">Sub-cent transactions • Instant settlement • USDC payments</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00d4ff]/5 to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold mb-6">
            Ready to <span className="bg-gradient-to-r from-[#00d4ff] to-[#ff6b35] bg-clip-text text-transparent">Unbrowse</span>?
          </motion.h2>
          <p className="text-[#888] text-xl mb-10 max-w-2xl mx-auto">
            Join the decentralized API marketplace. Capture, share, and monetize web APIs on Solana.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => onNavigate('dashboard')}
              className="group bg-[#00d4ff] text-[#050508] px-10 py-5 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-[#00d4ff]/25 transition-all flex items-center gap-2">
              Launch Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a href="https://github.com/getfoundry-app/unbrowse" target="_blank" rel="noopener noreferrer"
              className="bg-white/5 border border-white/10 text-white px-10 py-5 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all flex items-center gap-2">
              <Github className="w-5 h-5" /> View Source
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 bg-[#050508]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gradient-to-br from-[#00d4ff] to-[#ff6b35] rounded-md flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#050508]" />
            </div>
            <span className="text-sm text-[#666]">Unbrowse — Built by{' '}
              <a href="https://github.com/getfoundry-app" target="_blank" rel="noopener noreferrer" className="text-[#00d4ff] hover:underline">
                aiko-9
              </a> for Colosseum Hackathon
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/getfoundry-app/unbrowse" target="_blank" rel="noopener noreferrer"
              className="text-[#666] hover:text-white transition-colors text-sm">GitHub</a>
            <a href="https://arena.colosseum.org/projects/unbrowse-x7fq05" target="_blank" rel="noopener noreferrer"
              className="text-[#666] hover:text-white transition-colors text-sm">Colosseum</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
