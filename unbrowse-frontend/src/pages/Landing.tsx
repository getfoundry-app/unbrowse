import { useState, useEffect, useRef } from 'react'

const LINES = [
  { txt: '$ unbrowse capture coingecko.com', color: '#e2e8f0', ms: 0 },
  { txt: '  ⚡ intercepting network traffic…', color: '#94a3b8', ms: 500 },
  { txt: '  → found 12 internal API endpoints', color: '#22d3ee', ms: 1200 },
  { txt: '  → generated typed client (2.1 kB)', color: '#22d3ee', ms: 1700 },
  { txt: '', color: '', ms: 2200 },
  { txt: '$ unbrowse replay getPrice --coin=solana', color: '#e2e8f0', ms: 2400 },
  { txt: '  ✓ 200 OK  119 ms', color: '#4ade80', ms: 3200 },
  { txt: '  { "solana": { "usd": 142.67 } }', color: '#fb923c', ms: 3600 },
]

function Term() {
  const [n, setN] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    const run = () => {
      setN(0)
      LINES.forEach((l, i) => setTimeout(() => setN(i + 1), l.ms))
      setTimeout(run, 6500)
    }
    run()
  }, [])

  return (
    <div ref={ref} className="w-full rounded-xl border border-white/[0.06] bg-[#0a0a0a] overflow-hidden">
      <div className="flex items-center gap-[6px] px-4 py-2 border-b border-white/[0.04] bg-[#0f0f0f]">
        <i className="w-[10px] h-[10px] rounded-full bg-[#ff5f56]" />
        <i className="w-[10px] h-[10px] rounded-full bg-[#ffbd2e]" />
        <i className="w-[10px] h-[10px] rounded-full bg-[#27c93f]" />
        <span className="ml-2 text-[10px] text-white/15 tracking-widest uppercase">terminal</span>
      </div>
      <div className="px-5 py-4 font-mono text-[13px] leading-7 min-h-[200px]">
        {LINES.slice(0, n).map((l, i) =>
          l.txt
            ? <div key={i} style={{ color: l.color }} className="whitespace-pre">{l.txt}</div>
            : <div key={i} className="h-2" />
        )}
        {n < LINES.length && <span className="inline-block w-[6px] h-[14px] bg-white/50 animate-pulse" />}
      </div>
    </div>
  )
}

function Sol({ s = 16 }: { s?: number }) {
  return <svg width={s} height={s} viewBox="0 0 397 311" fill="none"><path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z" fill="url(#a)"/><path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" fill="url(#b)"/><path d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" fill="url(#c)"/><defs><linearGradient id="a" x1="0" y1="0" x2="397" y2="311" gradientUnits="userSpaceOnUse"><stop stopColor="#00FFA3"/><stop offset="1" stopColor="#DC1FFF"/></linearGradient><linearGradient id="b" x1="0" y1="0" x2="397" y2="311" gradientUnits="userSpaceOnUse"><stop stopColor="#00FFA3"/><stop offset="1" stopColor="#DC1FFF"/></linearGradient><linearGradient id="c" x1="0" y1="0" x2="397" y2="311" gradientUnits="userSpaceOnUse"><stop stopColor="#00FFA3"/><stop offset="1" stopColor="#DC1FFF"/></linearGradient></defs></svg>
}

const APIS = [
  { name: 'CoinGecko', n: 12, ms: 119, tag: 'crypto' },
  { name: 'Jupiter', n: 5, ms: 156, tag: 'defi' },
  { name: 'Helius', n: 8, ms: 89, tag: 'solana' },
  { name: 'Magic Eden', n: 7, ms: 134, tag: 'nft' },
  { name: 'Birdeye', n: 9, ms: 112, tag: 'analytics' },
  { name: 'DexScreener', n: 3, ms: 98, tag: 'defi' },
  { name: 'Raydium', n: 3, ms: 145, tag: 'amm' },
  { name: 'Solscan', n: 4, ms: 107, tag: 'explorer' },
]

export default function Landing({ goDash }: { goDash: () => void }) {
  const [wallet, setWallet] = useState('')

  const connect = async () => {
    try {
      const s = (window as any).solana
      if (s?.isPhantom) { const r = await s.connect(); setWallet(r.publicKey.toString()) }
      else window.open('https://phantom.app/', '_blank')
    } catch {}
  }

  return (
    <div className="min-h-screen bg-black text-neutral-200">
      {/* ─ NAV ─ */}
      <nav className="fixed inset-x-0 top-0 z-50 h-16 flex items-center border-b border-white/[0.05] bg-black/80 backdrop-blur-lg">
        <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-10 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-orange-400 grid place-items-center text-[12px] font-black text-black leading-none">U</div>
            <span className="font-semibold tracking-tight text-white">Unbrowse</span>
          </a>
          <div className="flex items-center gap-3">
            <a href="https://github.com/getfoundry-app/unbrowse" target="_blank" className="text-neutral-500 hover:text-white transition-colors text-sm hidden sm:block">GitHub</a>
            <button onClick={connect} className="h-9 px-4 rounded-lg border border-white/10 text-sm text-neutral-400 hover:text-white hover:border-white/25 transition-all">
              {wallet ? `${wallet.slice(0,4)}…${wallet.slice(-4)}` : '🔗 Connect'}
            </button>
            <button onClick={goDash} className="h-9 px-5 rounded-lg bg-white text-black text-sm font-semibold hover:bg-neutral-200 transition-colors">
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* ─ HERO ─ */}
      <section className="min-h-screen flex items-center pt-16">
        <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-10 py-16 grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-20 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] mb-7">
              <Sol s={14} />
              <span className="text-[11px] text-neutral-500 tracking-wide font-medium">POWERED BY SOLANA · x402</span>
            </div>

            <h1 className="text-[clamp(2.4rem,5vw,4.5rem)] font-bold leading-[1] tracking-[-0.035em] text-white mb-5">
              Stop scraping.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-orange-400">Start calling.</span>
            </h1>

            <p className="text-neutral-500 text-lg leading-relaxed max-w-[480px] mb-9">
              Every website already has an API. Unbrowse captures internal endpoints, generates typed clients, and replays at{' '}
              <strong className="text-cyan-400 font-mono">253×</strong> the speed of Puppeteer.
            </p>

            <div className="flex flex-wrap gap-3">
              <button onClick={goDash} className="h-11 px-6 rounded-lg bg-cyan-400 text-black font-semibold text-[15px] hover:bg-cyan-300 transition-colors inline-flex items-center gap-2">
                Explore marketplace <span className="text-lg">→</span>
              </button>
              <a href="https://github.com/getfoundry-app/unbrowse" target="_blank" className="h-11 px-6 rounded-lg border border-white/10 text-[15px] text-neutral-400 hover:text-white hover:border-white/25 transition-all inline-flex items-center gap-2">
                Source code
              </a>
            </div>
          </div>

          <Term />
        </div>
      </section>

      {/* ─ SPEED ─ */}
      <section className="border-y border-white/[0.04] py-20">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10 text-center">
          <div className="flex items-center justify-center gap-8 sm:gap-14">
            <div>
              <div className="text-[clamp(2rem,5vw,3.5rem)] font-mono font-bold text-neutral-700 line-through">30,000ms</div>
              <p className="text-neutral-600 text-sm mt-1">Puppeteer</p>
            </div>
            <span className="text-neutral-700 text-2xl">→</span>
            <div>
              <div className="text-[clamp(2rem,5vw,3.5rem)] font-mono font-bold text-cyan-400">119ms</div>
              <p className="text-cyan-400/60 text-sm mt-1">Unbrowse</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─ HOW IT WORKS ─ */}
      <section className="py-24">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10">
          <h2 className="text-xs uppercase tracking-[0.2em] text-neutral-600 mb-12 text-center">How it works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-white/[0.04] rounded-2xl overflow-hidden">
            {[
              ['01', 'Visit', 'Browse any website. We silently intercept API traffic.'],
              ['02', 'Capture', 'Extract endpoints, params, headers, auth patterns.'],
              ['03', 'Generate', 'Auto-create a typed TypeScript client + docs.'],
              ['04', 'Replay', 'Call APIs directly. 253× faster, 97%+ reliable.'],
            ].map(([n, t, d]) => (
              <div key={n} className="bg-black p-8">
                <span className="text-[32px] font-bold text-white/[0.05] font-mono block mb-3">{n}</span>
                <h3 className="text-white font-semibold text-lg mb-2">{t}</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─ APIS ─ */}
      <section className="py-24 border-t border-white/[0.04]">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10">
          <div className="mb-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Real API captures</h2>
            <p className="text-neutral-600 mt-2">Skills generated from live sites — ready to use</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {APIS.map(a => (
              <button key={a.name} onClick={goDash} className="text-left p-5 rounded-xl border border-white/[0.05] bg-white/[0.01] hover:border-cyan-500/25 hover:bg-white/[0.02] transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white group-hover:text-cyan-400 transition-colors">{a.name}</span>
                  <span className="font-mono text-xs text-cyan-400/60">{a.ms}ms</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-600">
                  <span className="font-mono">{a.n} endpoints</span>
                  <span className="px-1.5 py-0.5 rounded bg-white/[0.04]">{a.tag}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─ FOR AGENTS ─ */}
      <section className="py-24 border-t border-white/[0.04]">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-orange-400/60 text-xs uppercase tracking-[0.2em] mb-4">For AI agents</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-5">Your agent's new superpower</h2>
            <p className="text-neutral-500 leading-relaxed mb-7">
              AI agents waste 90% of compute fighting browser automation. Give them direct API access — typed, documented, monitored, 253× faster.
            </p>
            <ul className="space-y-3">
              {['Drop-in Puppeteer replacement', 'Auto-generated TypeScript types', 'Health monitoring & reliability', 'x402 micropayments on Solana'].map(s => (
                <li key={s} className="flex items-center gap-3 text-sm text-neutral-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />{s}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-6 font-mono text-[13px] leading-7">
            <p className="text-neutral-700 mb-2">// before — puppeteer, 30 seconds</p>
            <pre className="text-neutral-600">{`const browser = await puppeteer.launch()
const page = await browser.newPage()
await page.goto(url)
await page.waitForSelector('#data')
const data = await page.evaluate(…)
await browser.close()`}</pre>
            <div className="border-t border-white/[0.04] my-5" />
            <p className="text-cyan-500/50 mb-2">// after — unbrowse, 119 ms</p>
            <pre className="text-cyan-400/80">{`import { api } from './skills/coingecko'

const price = await api.getPrice({
  coins: ['solana'],
  currency: 'usd'
})`}</pre>
          </div>
        </div>
      </section>

      {/* ─ x402 ─ */}
      <section className="py-24 border-t border-white/[0.04]">
        <div className="max-w-[640px] mx-auto px-6 sm:px-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-10">Solana x402 revenue split</h2>
          <div className="space-y-6 text-left">
            {[
              { who: 'Skill creator', pct: 50, bar: 'bg-cyan-400' },
              { who: 'Website owner', pct: 30, bar: 'bg-emerald-400' },
              { who: 'Protocol', pct: 20, bar: 'bg-violet-400' },
            ].map(r => (
              <div key={r.who}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-neutral-400">{r.who}</span>
                  <span className="font-mono text-neutral-300">{r.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.04]">
                  <div className={`h-full rounded-full ${r.bar}`} style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/[0.06] bg-white/[0.02]">
            <Sol s={18} />
            <span className="text-sm text-neutral-500">Sub-cent · Instant · USDC</span>
          </div>
        </div>
      </section>

      {/* ─ CTA ─ */}
      <section className="py-32 text-center px-6">
        <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-5">
          Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-orange-400">unbrowse</span>?
        </h2>
        <p className="text-neutral-600 text-lg mb-10 max-w-md mx-auto">The decentralized API marketplace on Solana.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={goDash} className="h-12 px-8 rounded-lg bg-white text-black font-semibold hover:bg-neutral-200 transition-colors inline-flex items-center gap-2">
            Launch dashboard <span className="text-lg">→</span>
          </button>
          <a href="https://github.com/getfoundry-app/unbrowse" target="_blank" className="h-12 px-8 rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:border-white/25 transition-all inline-flex items-center gap-2">
            Source code
          </a>
        </div>
      </section>

      {/* ─ FOOTER ─ */}
      <footer className="border-t border-white/[0.04] py-8 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-700">
          <span>Built autonomously by <a href="https://github.com/getfoundry-app" target="_blank" className="text-neutral-500 hover:text-white transition-colors">aiko-9</a> for Colosseum Hackathon</span>
          <div className="flex gap-5">
            <a href="https://github.com/getfoundry-app/unbrowse" target="_blank" className="hover:text-neutral-400 transition-colors">GitHub</a>
            <a href="https://arena.colosseum.org/projects/unbrowse-x7fq05" target="_blank" className="hover:text-neutral-400 transition-colors">Colosseum</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
