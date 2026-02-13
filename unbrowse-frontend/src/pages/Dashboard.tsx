import { useState, useEffect } from 'react'

const API = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? window.location.origin
  : 'https://unbrowse-api.vercel.app'

interface Skill { domain: string; name: string; description: string; endpoints: number; authMethod: string; tags?: string[]; abilities?: Ability[] }
interface Ability { id: string; name: string; method: string; path: string; description?: string }
interface Stats { totalSkills: number; totalAbilities: number; totalExecutions: number; avgResponseTime: number }

async function fetchSkills(q = ''): Promise<Skill[]> {
  try {
    const u = q ? `${API}/api/marketplace/search?q=${encodeURIComponent(q)}` : `${API}/api/marketplace/search`
    const r = await fetch(u)
    const d = await r.json()
    return Array.isArray(d) ? d : d.results || []
  } catch { return [] }
}

async function fetchStats(): Promise<Stats | null> {
  try { return await (await fetch(`${API}/api/stats`)).json() } catch { return null }
}

async function runAbility(domain: string, id: string) {
  const t0 = performance.now()
  try {
    const r = await fetch(`${API}/api/execution/run`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain, abilityId: id }),
    })
    const d = await r.json()
    return { ok: r.ok, data: d, ms: Math.round(performance.now() - t0), err: r.ok ? null : d.error }
  } catch (e: any) {
    return { ok: false, data: null, ms: Math.round(performance.now() - t0), err: e.message }
  }
}

export default function Dashboard({ goHome }: { goHome: () => void }) {
  const [skills, setSkills] = useState<Skill[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [q, setQ] = useState('')
  const [sel, setSel] = useState<Skill | null>(null)
  const [result, setResult] = useState<any>(null)
  const [running, setRunning] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tag, setTag] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const [s, st] = await Promise.all([fetchSkills(), fetchStats()])
    setSkills(s); setStats(st); setLoading(false)
  }

  const search = async (v: string) => { setQ(v); setSkills(await fetchSkills(v)) }

  const exec = async (a: Ability) => {
    if (!sel) return
    setRunning(true); setResult(null)
    const r = await runAbility(sel.domain, a.id)
    setResult(r); setRunning(false)
    setStats(await fetchStats())
  }

  const tags = [...new Set(skills.flatMap(s => s.tags || []))].slice(0, 10)
  const filtered = tag ? skills.filter(s => s.tags?.includes(tag)) : skills

  return (
    <div className="min-h-screen bg-black text-neutral-200">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/[0.05]">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={goHome} className="text-neutral-600 hover:text-white text-sm transition-colors">← Back</button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-400 to-orange-400 grid place-items-center text-[10px] font-black text-black leading-none">U</div>
              <span className="font-semibold text-sm text-white">Marketplace</span>
            </div>
            <div className="w-12" />
          </div>
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx={11} cy={11} r={8}/><path d="m21 21-4.35-4.35"/></svg>
            <input value={q} onChange={e => search(e.target.value)} placeholder="Search skills, domains…"
              className="w-full h-10 rounded-lg bg-white/[0.03] border border-white/[0.06] pl-10 pr-4 text-sm placeholder:text-neutral-700 focus:outline-none focus:border-cyan-500/40 transition-colors" />
          </div>
          {tags.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              <button onClick={() => setTag(null)} className={`text-xs px-3 py-1 rounded-md border shrink-0 transition-all ${!tag ? 'border-white/10 text-neutral-300 bg-white/[0.04]' : 'border-white/[0.04] text-neutral-700'}`}>All</button>
              {tags.map(t => (
                <button key={t} onClick={() => setTag(tag === t ? null : t)} className={`text-xs px-3 py-1 rounded-md border shrink-0 transition-all ${tag === t ? 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10' : 'border-white/[0.04] text-neutral-700'}`}>{t}</button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Stats */}
      {stats && (
        <div className="border-b border-white/[0.04]">
          <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-5 grid grid-cols-4 gap-4">
            {[
              { l: 'Skills', v: stats.totalSkills, c: '' },
              { l: 'Abilities', v: stats.totalAbilities, c: 'text-cyan-400' },
              { l: 'Runs', v: stats.totalExecutions, c: 'text-emerald-400' },
              { l: 'Avg ms', v: stats.avgResponseTime, c: 'text-orange-400' },
            ].map(s => (
              <div key={s.l} className="text-center">
                <div className={`text-xl font-bold font-mono ${s.c}`}>{s.v}</div>
                <div className="text-[10px] text-neutral-700 uppercase tracking-wider">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-8">
        {loading ? (
          <div className="text-center py-24 text-neutral-700 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-neutral-700 text-sm">No skills found</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((s, i) => (
              <button key={s.domain || i} onClick={() => { setSel(s); setResult(null) }}
                className="text-left p-5 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:border-cyan-500/20 hover:bg-white/[0.02] transition-all group">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">{s.name}</h3>
                  <span className="text-neutral-700 text-xs">→</span>
                </div>
                <p className="text-neutral-600 text-[13px] mb-3 line-clamp-2">{s.description}</p>
                <div className="flex items-center gap-2 text-xs text-neutral-700">
                  <span className="font-mono">{s.endpoints} ep</span>
                  {s.tags?.slice(0, 2).map(t => (
                    <span key={t} className="px-1.5 py-0.5 rounded bg-white/[0.03]">{t}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {sel && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSel(null)}>
          <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/[0.04] p-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{sel.name}</h2>
                <p className="text-neutral-600 font-mono text-xs mt-0.5">{sel.domain}</p>
              </div>
              <button onClick={() => setSel(null)} className="text-neutral-600 hover:text-white transition-colors text-xl leading-none">×</button>
            </div>
            <div className="p-6">
              <p className="text-neutral-500 text-sm mb-5">{sel.description}</p>
              <div className="flex gap-2 mb-6 text-xs">
                <span className="font-mono px-2.5 py-1 rounded border border-white/[0.05] bg-white/[0.02] text-neutral-400">{sel.endpoints} endpoints</span>
                <span className="font-mono px-2.5 py-1 rounded border border-white/[0.05] bg-white/[0.02] text-neutral-400">{sel.authMethod}</span>
              </div>

              {sel.abilities?.length ? (
                <>
                  <h3 className="text-sm font-semibold text-neutral-400 mb-3">Abilities</h3>
                  <div className="space-y-2">
                    {sel.abilities.map((a, i) => (
                      <div key={a.id || i} className="p-4 rounded-lg border border-white/[0.04] bg-white/[0.01] hover:border-white/[0.08] transition-colors">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-mono text-sm">
                            <span className="text-cyan-400 font-semibold">{a.method}</span>{' '}
                            <span className="text-neutral-500">{a.path}</span>
                          </span>
                          <button onClick={() => exec(a)} disabled={running}
                            className="h-8 px-4 rounded-md bg-cyan-400 text-black text-xs font-semibold hover:bg-cyan-300 disabled:opacity-30 transition-all shrink-0">
                            {running ? '…' : '▶ Run'}
                          </button>
                        </div>
                        {a.description && <p className="text-neutral-700 text-xs mt-1.5">{a.description}</p>}
                      </div>
                    ))}
                  </div>
                </>
              ) : null}

              {result && (
                <div className={`mt-5 p-4 rounded-lg border ${result.ok ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className={result.ok ? 'text-emerald-400' : 'text-red-400'}>{result.ok ? '✓ Success' : '✗ Failed'}</span>
                    <span className="font-mono text-orange-400 text-xs">{result.ms}ms</span>
                  </div>
                  {result.err && <p className="text-red-400/80 text-xs mb-2">{result.err}</p>}
                  <pre className="bg-black/40 rounded p-3 text-[11px] font-mono text-neutral-500 overflow-x-auto max-h-48">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
