import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ArrowLeft, Zap, Play, X, CheckCircle, XCircle,
  Loader2, ChevronRight
} from 'lucide-react';
import { api, type Skill, type Stats, type ExecutionResult, type Ability } from '../config/api';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [s, st] = await Promise.all([api.searchSkills(), api.getStats()]);
    setSkills(s); setStats(st); setLoading(false);
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    setSkills(await api.searchSkills(q));
  };

  const handleExecute = async (ability: Ability) => {
    if (!selectedSkill) return;
    setIsExecuting(true); setExecutionResult(null);
    const r = await api.executeAbility(selectedSkill.domain, ability.id);
    setExecutionResult(r); setIsExecuting(false);
    setStats(await api.getStats());
  };

  const tags = [...new Set(skills.flatMap(s => s.tags || []))].slice(0, 10);
  const filtered = activeTag ? skills.filter(s => s.tags?.includes(activeTag)) : skills;

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] selection:bg-cyan-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#09090b]/80 border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => onNavigate('landing')} className="text-white/30 hover:text-white/60 transition-colors text-sm flex items-center gap-1.5">
              <ArrowLeft size={14} /> Back
            </button>
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-md bg-gradient-to-br from-cyan-400 to-orange-500 grid place-items-center text-[10px] font-black text-black">U</div>
              <span className="font-semibold text-sm">Marketplace</span>
            </div>
            <div className="w-12" />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={15} />
            <input type="text" value={searchQuery} onChange={e => handleSearch(e.target.value)}
              placeholder="Search skills, domains, endpoints…"
              className="w-full h-10 bg-white/[0.03] border border-white/[0.05] rounded-lg pl-9 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/40 transition-colors" />
          </div>
          {tags.length > 0 && (
            <div className="flex gap-1.5 mt-2.5 overflow-x-auto pb-0.5 scrollbar-none">
              <button onClick={() => setActiveTag(null)}
                className={`text-[11px] px-2.5 py-1 rounded-md border flex-shrink-0 transition-all ${!activeTag ? 'bg-white/[0.06] border-white/10 text-white/60' : 'border-white/[0.04] text-white/25 hover:text-white/40'}`}>
                All
              </button>
              {tags.map(t => (
                <button key={t} onClick={() => setActiveTag(activeTag === t ? null : t)}
                  className={`text-[11px] px-2.5 py-1 rounded-md border flex-shrink-0 transition-all ${activeTag === t ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' : 'border-white/[0.04] text-white/25 hover:text-white/40'}`}>
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Stats */}
      {stats && (
        <div className="border-b border-white/[0.03]">
          <div className="max-w-6xl mx-auto px-6 md:px-10 py-5 grid grid-cols-4 gap-4">
            {[
              { label: 'Skills', value: stats.totalSkills, color: 'text-white/70' },
              { label: 'Abilities', value: stats.totalAbilities, color: 'text-cyan-400' },
              { label: 'Executions', value: stats.totalExecutions, color: 'text-emerald-400' },
              { label: 'Avg ms', value: stats.avgResponseTime, color: 'text-orange-400' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-white/20 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="text-white/20 animate-spin" size={24} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-white/20 text-sm">No skills found</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((skill, i) => (
              <motion.button key={skill.domain || i}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => { setSelectedSkill(skill); setExecutionResult(null); }}
                className="text-left p-5 md:p-6 rounded-xl bg-white/[0.015] border border-white/[0.04] hover:border-cyan-500/25 hover:bg-white/[0.025] transition-all group">
                <div className="flex items-start justify-between mb-1.5">
                  <h3 className="font-semibold text-[15px] group-hover:text-cyan-400 transition-colors leading-snug">{skill.name}</h3>
                  <ChevronRight size={14} className="text-white/10 group-hover:text-cyan-400/50 transition-colors flex-shrink-0 mt-0.5" />
                </div>
                <p className="text-white/25 text-[13px] mb-3 line-clamp-2 leading-relaxed">{skill.description}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono text-white/20">{skill.endpoints} ep</span>
                  {skill.tags?.slice(0, 2).map(t => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.03] text-white/20">{t}</span>
                  ))}
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedSkill && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedSkill(null)}>
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
              className="bg-[#0d1117] border border-white/[0.06] rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 bg-[#0d1117]/95 backdrop-blur-sm border-b border-white/[0.04] p-5 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold">{selectedSkill.name}</h2>
                  <p className="text-white/25 text-xs font-mono mt-0.5">{selectedSkill.domain}</p>
                </div>
                <button onClick={() => setSelectedSkill(null)} className="text-white/20 hover:text-white/60 transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="p-5">
                <p className="text-white/35 text-sm mb-5 leading-relaxed">{selectedSkill.description}</p>
                <div className="flex gap-2 mb-6">
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.04] text-white/40">{selectedSkill.endpoints} endpoints</span>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.04] text-white/40">{selectedSkill.authMethod}</span>
                </div>

                {selectedSkill.abilities?.length ? (
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-white/60">Abilities</h3>
                    <div className="space-y-2">
                      {selectedSkill.abilities.map((a, i) => (
                        <div key={a.id || i} className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors">
                          <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                              <span className="text-xs font-mono">
                                <span className="text-cyan-400 font-semibold">{a.method}</span>{' '}
                                <span className="text-white/40">{a.path}</span>
                              </span>
                            </div>
                            <button onClick={() => handleExecute(a)} disabled={isExecuting}
                              className="h-7 px-3 text-[11px] font-semibold rounded-md bg-cyan-400 text-black hover:bg-cyan-300 disabled:opacity-30 transition-all flex items-center gap-1 flex-shrink-0">
                              {isExecuting ? <Loader2 size={12} className="animate-spin" /> : <Play size={11} />}
                              Run
                            </button>
                          </div>
                          {a.description && <p className="text-white/20 text-[11px] mt-1.5">{a.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <AnimatePresence>
                  {executionResult && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className={`mt-5 p-4 rounded-lg border ${executionResult.success ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-red-500/5 border-red-500/15'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          {executionResult.success ? <CheckCircle size={14} className="text-emerald-400" /> : <XCircle size={14} className="text-red-400" />}
                          <span className="text-xs font-medium">{executionResult.success ? 'Success' : 'Failed'}</span>
                        </div>
                        <span className="text-xs font-mono text-orange-400">{executionResult.timing}ms</span>
                      </div>
                      {executionResult.error && <p className="text-red-400/80 text-xs mb-2">{executionResult.error}</p>}
                      <pre className="bg-black/30 rounded-md p-3 text-[11px] font-mono text-white/40 overflow-x-auto max-h-48 leading-relaxed">
                        {JSON.stringify(executionResult.data, null, 2)}
                      </pre>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
