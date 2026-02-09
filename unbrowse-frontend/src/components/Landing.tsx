import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Database, Repeat, Package, Github, ArrowRight, Timer, Code2, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

interface LandingProps {
  onNavigate: (view: string) => void;
}

export function Landing({ onNavigate }: LandingProps) {
  const [speedCounter, setSpeedCounter] = useState(30000);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!hasAnimated) {
      const timer = setTimeout(() => {
        setHasAnimated(true);
        let current = 30000;
        const interval = setInterval(() => {
          current -= 500;
          if (current <= 119) {
            current = 119;
            clearInterval(interval);
          }
          setSpeedCounter(current);
        }, 30);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasAnimated]);

  const stats = [
    { label: 'Skills Indexed', value: '247', icon: Database },
    { label: 'APIs Captured', value: '1,893', icon: Code2 },
    { label: 'Avg Response', value: '119ms', icon: Timer },
  ];

  const steps = [
    { icon: Zap, title: 'Capture', desc: 'Visit any site, intercept API calls' },
    { icon: Sparkles, title: 'Generate', desc: 'Auto-create typed client + docs' },
    { icon: Repeat, title: 'Replay', desc: 'Execute APIs 100x faster than Puppeteer' },
    { icon: Package, title: 'Marketplace', desc: 'Share & monetize on Solana x402' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
        {/* Gradient Orb */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00d4ff] opacity-10 blur-[120px] rounded-full pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-5xl"
        >
          <h1 className="text-[clamp(3rem,12vw,10rem)] font-bold leading-none mb-6 tracking-tighter">
            Unbrowse
          </h1>
          
          <p className="text-[clamp(1.25rem,3vw,2rem)] text-[#a1a1a1] mb-12 font-light">
            Internal APIs Are All You Need
          </p>

          {/* Speed Comparison */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-16 inline-block"
          >
            <div className="bg-[#141414] border border-[#222222] rounded-2xl px-12 py-8">
              <div className="flex items-center gap-6 text-[clamp(2rem,5vw,4rem)] font-mono font-bold">
                <span className="text-[#666666] line-through">30,000ms</span>
                <ArrowRight className="text-[#00d4ff] w-12 h-12" />
                <motion.span
                  className="text-[#ff6b35]"
                  key={speedCounter}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {speedCounter}ms
                </motion.span>
              </div>
              <p className="text-[#666666] mt-4 text-sm uppercase tracking-wider">
                Puppeteer → Unbrowse
              </p>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => onNavigate('dashboard')}
              className="group bg-[#00d4ff] text-[#0a0a0a] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#00bdea] transition-all hover:scale-105 flex items-center gap-2"
            >
              Try Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="https://github.com/yourusername/unbrowse"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#141414] border border-[#222222] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:border-[#00d4ff] transition-all flex items-center gap-2"
            >
              <Github className="w-5 h-5" />
              View on GitHub
            </a>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#141414] border border-[#222222] rounded-xl p-8 hover:border-[#00d4ff] transition-all"
            >
              <stat.icon className="w-8 h-8 text-[#00d4ff] mb-4" />
              <div className="text-5xl font-bold mb-2">{stat.value}</div>
              <div className="text-[#a1a1a1] uppercase tracking-wider text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <h2 className="text-5xl font-bold text-center mb-16">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              <div className="bg-[#141414] border border-[#222222] rounded-xl p-6 h-full hover:border-[#00d4ff] transition-all">
                <div className="bg-[#00d4ff]/10 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                  <step.icon className="w-7 h-7 text-[#00d4ff]" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                <p className="text-[#a1a1a1]">{step.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-[2px] bg-[#222222]" />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Code Comparison */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <h2 className="text-5xl font-bold text-center mb-16">Code Comparison</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Puppeteer */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-[#141414] border border-[#222222] rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#666666]">Puppeteer</h3>
              <span className="text-[#ff6b35] font-mono text-sm">~30,000ms</span>
            </div>
            <pre className="font-mono text-sm text-[#a1a1a1] overflow-x-auto">
              <code>{`const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto('https://api.example.com');
await page.click('#login-button');
await page.waitForSelector('#data');
const data = await page.evaluate(() => {
  return fetch('/api/endpoint').then(r => r.json());
});
await browser.close();
return data;`}</code>
            </pre>
          </motion.div>

          {/* Unbrowse */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-[#141414] border border-[#00d4ff] rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#00d4ff]">Unbrowse</h3>
              <span className="text-[#00d4ff] font-mono text-sm">~119ms</span>
            </div>
            <pre className="font-mono text-sm text-white overflow-x-auto">
              <code>{`import { api } from './skills/example';

const data = await api.getData();
return data;`}</code>
            </pre>
          </motion.div>
        </div>
      </section>

      {/* Solana x402 Payment Split */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <h2 className="text-5xl font-bold text-center mb-16">Solana x402 Revenue Split</h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#141414] border border-[#222222] rounded-xl p-8"
        >
          <div className="space-y-6">
            {[
              { label: 'Skill Creator', percent: 50, color: '#00d4ff' },
              { label: 'Marketplace', percent: 30, color: '#ff6b35' },
              { label: 'Infrastructure', percent: 20, color: '#666666' },
            ].map((item, i) => (
              <div key={item.label}>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">{item.label}</span>
                  <span className="font-mono text-[#a1a1a1]">{item.percent}%</span>
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${item.percent}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.8 }}
                  className="h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              </div>
            ))}
          </div>
          <p className="text-[#a1a1a1] mt-6 text-center">
            Powered by Solana x402 protocol for instant, transparent micropayments
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#222222] py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-[#666666]">
            Built by{' '}
            <a
              href="https://github.com/aiko-9"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00d4ff] hover:underline"
            >
              aiko-9
            </a>
            {' '}for{' '}
            <a
              href="https://colosseum.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00d4ff] hover:underline"
            >
              Colosseum Hackathon
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
