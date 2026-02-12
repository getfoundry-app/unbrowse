import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Search, ArrowLeft, Zap, Database, Activity, Play, X, CheckCircle,
  XCircle, Loader2, ChevronRight, Shield, TrendingUp, Clock,
  ExternalLink, Filter, Wallet
} from 'lucide-react';
import { api, type Skill, type Stats, type ExecutionResult, type Ability } from '../config/api';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref as any, { once: true });

  useEffect(() => {
    if (!inView) return;
    let current = 0;
    const step = value / 40;
    const timer = setInterval(() => {
      current += step;
      if (current >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(current));
    }, 25);
    return () => clearInterval(timer);
  }, [value, inView]);

  return <span ref={ref}>{display.toLocaleString()}{suffix}</span>;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [skillsData, statsData] = await Promise.all([
      api.searchSkills(),
      api.getStats(),
    ]);
    setSkills(skillsData);
    setStats(statsData);
    setLoading(false);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    const results = await api.searchSkills(query);
    setSkills(results);
  };

  const handleExecute = async (ability: Ability) => {
    if (!selectedSkill) return;
    setIsExecuting(true);
    setExecutionResult(null);
    const result = await api.executeAbility(selectedSkill.domain, ability.id);
    setExecutionResult(result);
    setIsExecuting(false);
    const newStats = await api.getStats();
    setStats(newStats);
  };

  const allTags = [...new Set(skills.flatMap(s => s.tags || []))].slice(0, 8);

  return (
    <div className="min-h-screen bg-[#050508] text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Header */}
      <header className="border-b border-white/5 bg-[#050508]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => onNavigate('landing')}
              className="text-[#666] hover:text-white transition-colors flex items-center gap-2 text-sm">
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-gradient-to-br from-[#00d4ff] to-[#ff6b35] rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-[#050508]" />
              </div>
              <h1 className="text-xl font-bold">Unbrowse Marketplace</h1>
            </div>
            <div className="w-16" />
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#444]" />
            <input type="text" placeholder="Search skills, domains, or endpoints..."
              value={searchQuery} onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/5 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-[#444] focus:outline-none focus:border-[#00d4ff]/50 transition-colors font-medium" />
          </div>

          {/* Tag filters */}
          {allTags.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              <button onClick={() => setFilterTag(null)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex-shrink-0 ${
                  !filterTag ? 'bg-[#00d4ff]/10 border-[#00d4ff]/30 text-[#00d4ff]' : 'border-white/5 text-[#666] hover:border-white/10'
                }`}>All</button>
              {allTags.map(tag => (
                <button key={tag} onClick={() => setFilterTag(tag === filterTag ? null : tag)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex-shrink-0 ${
                    filterTag === tag ? 'bg-[#00d4ff]/10 border-[#00d4ff]/30 text-[#00d4ff]' : 'border-white/5 text-[#666] hover:border-white/10'
                  }`}>{tag}</button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Stats Bar */}
      {stats && (
        <section className="border-b border-white/5 bg-[#080810]">
          <div className="max-w-7xl mx-auto px-6 py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Database, label: 'Total Skills', value: stats.totalSkills, color: '#00d4ff' },
                { icon: Zap, label: 'Abilities', value: stats.totalAbilities, color: '#ff6b35' },
                { icon: Activity, label: 'Executions', value: stats.totalExecutions, color: '#14F195' },
                { icon: Clock, label: 'Avg Response', value: stats.avgResponseTime, suffix: 'ms', color: '#9945FF' },
              ].map((stat, i) => (
                <motion.div key={stat.label}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all">
                  <stat.icon className="w-4 h-4 mb-2" style={{ color: stat.color }} />
                  <div className="text-2xl font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-[10px] text-[#555] uppercase tracking-widest mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Skills Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-[#00d4ff] animate-spin" />
            <span className="text-[#666] text-sm">Loading marketplace...</span>
          </div>
        ) : skills.length === 0 ? (
          <div className="text-center py-20">
            <Database className="w-12 h-12 text-[#333] mx-auto mb-4" />
            <p className="text-[#666]">No skills found</p>
            <p className="text-[#444] text-sm mt-1">Try a different search query</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {skills
              .filter(s => !filterTag || (s.tags && s.tags.includes(filterTag)))
              .map((skill, idx) => (
              <motion.div key={skill.domain || idx}
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:border-[#00d4ff]/30 transition-all cursor-pointer group"
                onClick={() => { setSelectedSkill(skill); setExecutionResult(null); }}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg group-hover:text-[#00d4ff] transition-colors leading-tight">
                    {skill.name}
                  </h3>
                  <ChevronRight className="w-4 h-4 text-[#333] group-hover:text-[#00d4ff] transition-colors flex-shrink-0 mt-1" />
                </div>

                <p className="text-[#777] text-sm mb-4 line-clamp-2 leading-relaxed">{skill.description}</p>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-mono px-2 py-1 rounded-md bg-white/[0.03] border border-white/5 text-[#888]">
                    {skill.endpoints} endpoints
                  </span>
                  <span className="text-xs text-[#555] font-mono">{skill.authMethod}</span>
                </div>

                {skill.tags && skill.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {skill.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="text-[10px] text-[#00d4ff]/70 bg-[#00d4ff]/5 px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Skill Detail Modal */}
      <AnimatePresence>
        {selectedSkill && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedSkill(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0a0a12] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl shadow-black/50"
              onClick={(e) => e.stopPropagation()}>

              {/* Header */}
              <div className="sticky top-0 bg-[#0a0a12]/95 backdrop-blur-sm border-b border-white/5 p-6 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{selectedSkill.name}</h2>
                  <p className="text-[#666] font-mono text-sm">{selectedSkill.domain}</p>
                </div>
                <button onClick={() => setSelectedSkill(null)}
                  className="text-[#444] hover:text-white transition-colors p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-[#888] mb-6 leading-relaxed">{selectedSkill.description}</p>

                <div className="flex gap-3 mb-8">
                  <div className="bg-white/[0.03] border border-white/5 rounded-lg px-4 py-2 text-sm">
                    <span className="text-[#555]">Endpoints: </span>
                    <span className="font-bold font-mono">{selectedSkill.endpoints}</span>
                  </div>
                  <div className="bg-white/[0.03] border border-white/5 rounded-lg px-4 py-2 text-sm">
                    <span className="text-[#555]">Auth: </span>
                    <span className="font-mono">{selectedSkill.authMethod}</span>
                  </div>
                </div>

                {/* Abilities */}
                {selectedSkill.abilities && selectedSkill.abilities.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-[#ff6b35]" /> Abilities
                    </h3>
                    <div className="space-y-3">
                      {selectedSkill.abilities.map((ability, idx) => (
                        <div key={ability.id || idx}
                          className="bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:border-[#00d4ff]/20 transition-colors">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="min-w-0">
                              <h4 className="font-semibold mb-1">{ability.name}</h4>
                              <p className="text-sm font-mono text-[#666]">
                                <span className="text-[#00d4ff] font-bold">{ability.method}</span>{' '}
                                <span className="text-[#888]">{ability.path}</span>
                              </p>
                            </div>
                            <button onClick={() => handleExecute(ability)}
                              disabled={isExecuting}
                              className="bg-[#00d4ff] text-[#050508] px-4 py-2 rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-[#00d4ff]/20 transition-all disabled:opacity-40 flex items-center gap-2 flex-shrink-0">
                              {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                              Run
                            </button>
                          </div>
                          {ability.description && (
                            <p className="text-[#555] text-sm">{ability.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Execution Result */}
                <AnimatePresence>
                  {executionResult && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className={`mt-6 border rounded-xl p-5 ${
                        executionResult.success
                          ? 'bg-[#00d4ff]/5 border-[#00d4ff]/20'
                          : 'bg-[#ff6b35]/5 border-[#ff6b35]/20'
                      }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {executionResult.success
                            ? <CheckCircle className="w-5 h-5 text-[#14F195]" />
                            : <XCircle className="w-5 h-5 text-[#ff6b35]" />}
                          <span className="font-semibold">{executionResult.success ? 'Success' : 'Failed'}</span>
                        </div>
                        <span className="font-mono font-bold text-[#ff6b35]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          {executionResult.timing}ms
                        </span>
                      </div>
                      {executionResult.error && (
                        <p className="text-[#ff6b35] text-sm mb-3">{executionResult.error}</p>
                      )}
                      <pre className="bg-[#050508] rounded-lg p-4 overflow-x-auto text-sm font-mono text-[#888] max-h-64">
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
