import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ArrowLeft,
  Zap,
  Database,
  Activity,
  Play,
  X,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { api, type Skill, type Stats, type ExecutionResult, type Ability } from '../config/api';
import { cn } from '../lib/utils';

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

  useEffect(() => {
    loadData();
  }, []);

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

    // Refresh stats after execution
    const newStats = await api.getStats();
    setStats(newStats);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-[#222222] bg-[#141414]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate('landing')}
                className="text-[#a1a1a1] hover:text-white transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Landing</span>
              </button>
            </div>
            <h1 className="text-3xl font-bold">Unbrowse Dashboard</h1>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666]" />
            <input
              type="text"
              placeholder="Search skills, domains, or endpoints..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#222222] rounded-lg pl-12 pr-4 py-3 text-white placeholder:text-[#666666] focus:outline-none focus:border-[#00d4ff] transition-colors"
            />
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      {stats && (
        <section className="border-b border-[#222222] bg-[#141414]/50">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={Database} label="Total Skills" value={stats.totalSkills.toString()} />
              <StatCard icon={Zap} label="Abilities" value={stats.totalAbilities.toString()} />
              <StatCard icon={Activity} label="Executions" value={stats.totalExecutions.toString()} />
              <StatCard
                icon={Activity}
                label="Avg Response"
                value={`${stats.avgResponseTime}ms`}
                highlight
              />
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#00d4ff] animate-spin" />
          </div>
        ) : skills.length === 0 ? (
          <div className="text-center py-20">
            <Database className="w-16 h-16 text-[#666666] mx-auto mb-4" />
            <p className="text-[#a1a1a1] text-lg">No skills found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill, idx) => (
              <SkillCard
                key={skill.domain || idx}
                skill={skill}
                onClick={() => setSelectedSkill(skill)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Skill Detail Modal */}
      <AnimatePresence>
        {selectedSkill && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedSkill(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#141414] border border-[#222222] rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-[#141414] border-b border-[#222222] p-6 flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{selectedSkill.name}</h2>
                  <p className="text-[#a1a1a1] font-mono text-sm">{selectedSkill.domain}</p>
                </div>
                <button
                  onClick={() => setSelectedSkill(null)}
                  className="text-[#666666] hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <p className="text-[#a1a1a1] mb-6">{selectedSkill.description}</p>

                <div className="flex gap-4 mb-6">
                  <div className="bg-[#0a0a0a] border border-[#222222] rounded-lg px-4 py-2">
                    <span className="text-[#666666] text-sm">Endpoints: </span>
                    <span className="font-bold">{selectedSkill.endpoints}</span>
                  </div>
                  <div className="bg-[#0a0a0a] border border-[#222222] rounded-lg px-4 py-2">
                    <span className="text-[#666666] text-sm">Auth: </span>
                    <span className="font-mono text-sm">{selectedSkill.authMethod}</span>
                  </div>
                </div>

                {/* Abilities */}
                {selectedSkill.abilities && selectedSkill.abilities.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">Abilities</h3>
                    <div className="space-y-3">
                      {selectedSkill.abilities.map((ability, idx) => (
                        <div
                          key={ability.id || idx}
                          className="bg-[#0a0a0a] border border-[#222222] rounded-lg p-4 hover:border-[#00d4ff] transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold mb-1">{ability.name}</h4>
                              <p className="text-[#a1a1a1] text-sm font-mono">
                                <span className="text-[#00d4ff]">{ability.method}</span> {ability.path}
                              </p>
                            </div>
                            <button
                              onClick={() => handleExecute(ability)}
                              disabled={isExecuting}
                              className="bg-[#00d4ff] text-[#0a0a0a] px-4 py-2 rounded-lg font-semibold hover:bg-[#00bdea] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              {isExecuting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                              Execute
                            </button>
                          </div>
                          {ability.description && (
                            <p className="text-[#666666] text-sm">{ability.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Execution Result */}
                <AnimatePresence>
                  {executionResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={cn(
                        'mt-6 border rounded-lg p-4',
                        executionResult.success
                          ? 'bg-[#00d4ff]/5 border-[#00d4ff]'
                          : 'bg-[#ff6b35]/5 border-[#ff6b35]'
                      )}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {executionResult.success ? (
                            <CheckCircle className="w-5 h-5 text-[#00d4ff]" />
                          ) : (
                            <XCircle className="w-5 h-5 text-[#ff6b35]" />
                          )}
                          <span className="font-semibold">
                            {executionResult.success ? 'Success' : 'Failed'}
                          </span>
                        </div>
                        <span className="font-mono text-[#ff6b35] font-bold">
                          {executionResult.timing}ms
                        </span>
                      </div>
                      {executionResult.error && (
                        <p className="text-[#ff6b35] text-sm mb-2">{executionResult.error}</p>
                      )}
                      <pre className="bg-[#0a0a0a] rounded p-3 overflow-x-auto text-sm font-mono text-[#a1a1a1]">
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

function StatCard({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: any;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-[#0a0a0a] border border-[#222222] rounded-lg p-4">
      <Icon className={cn('w-5 h-5 mb-2', highlight ? 'text-[#ff6b35]' : 'text-[#00d4ff]')} />
      <div className={cn('text-2xl font-bold mb-1', highlight && 'text-[#ff6b35]')}>{value}</div>
      <div className="text-[#666666] text-sm uppercase tracking-wider">{label}</div>
    </div>
  );
}

function SkillCard({ skill, onClick }: { skill: Skill; onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-[#141414] border border-[#222222] rounded-xl p-6 hover:border-[#00d4ff] transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-bold group-hover:text-[#00d4ff] transition-colors">
          {skill.name}
        </h3>
        <ChevronRight className="w-5 h-5 text-[#666666] group-hover:text-[#00d4ff] transition-colors" />
      </div>
      
      <p className="text-[#a1a1a1] text-sm mb-4 line-clamp-2">{skill.description}</p>
      
      <div className="flex items-center gap-3 text-sm">
        <span className="bg-[#0a0a0a] border border-[#222222] rounded px-3 py-1 font-mono">
          {skill.endpoints} endpoints
        </span>
        <span className="text-[#666666]">{skill.authMethod}</span>
      </div>

      {skill.tags && skill.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {skill.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs text-[#00d4ff] bg-[#00d4ff]/10 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
