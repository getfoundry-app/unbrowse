#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { HarParser } from './har-parser.js';
import { SkillGenerator } from './skill-generator.js';
import { CDPCapture } from './cdp-capture.js';

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(msg: string, color = colors.reset) {
  console.log(`${color}${msg}${colors.reset}`);
}

function error(msg: string) {
  log(`✗ ${msg}`, colors.red);
}

function success(msg: string) {
  log(`✓ ${msg}`, colors.green);
}

function info(msg: string) {
  log(`ℹ ${msg}`, colors.cyan);
}

function header(msg: string) {
  log(`\n${colors.bright}${msg}${colors.reset}\n`);
}

// Commands

async function cmdLearn(harFile: string) {
  header('📚 Learning from HAR file...');
  
  if (!existsSync(harFile)) {
    error(`HAR file not found: ${harFile}`);
    process.exit(1);
  }

  try {
    const harContent = readFileSync(harFile, 'utf-8');
    info(`Parsing HAR file: ${harFile}`);
    
    const parsed = HarParser.parse(harContent);
    const auth = HarParser.extractAuth(harContent);
    
    if (parsed.length === 0) {
      error('No API requests found in HAR file');
      process.exit(1);
    }

    success(`Found ${parsed.length} API requests`);
    
    // Determine domain from first request
    const domain = parsed[0].domain;
    info(`Domain: ${domain}`);
    info(`Auth method: ${auth.method}`);
    
    // Generate skill
    const generator = new SkillGenerator();
    const { skillMd, apiTs } = generator.generate(parsed, auth, domain);
    
    // Create skills directory
    const skillDir = join(process.cwd(), 'skills', domain.replace(/[^a-z0-9.-]/gi, '_'));
    mkdirSync(skillDir, { recursive: true });
    
    // Write files
    const skillPath = join(skillDir, 'SKILL.md');
    const apiPath = join(skillDir, 'api.ts');
    
    writeFileSync(skillPath, skillMd, 'utf-8');
    writeFileSync(apiPath, apiTs, 'utf-8');
    
    success(`Generated skill at: ${skillDir}`);
    log(`  - ${colors.dim}SKILL.md${colors.reset}`);
    log(`  - ${colors.dim}api.ts${colors.reset}`);
    
    // Show summary
    const endpoints = skillMd.match(/^### /gm)?.length ?? 0;
    log(`\n${colors.bright}Summary:${colors.reset}`);
    log(`  Domain: ${colors.cyan}${domain}${colors.reset}`);
    log(`  Endpoints: ${colors.cyan}${endpoints}${colors.reset}`);
    log(`  Auth: ${colors.cyan}${auth.method}${colors.reset}`);
    
  } catch (err) {
    error(`Failed to parse HAR: ${err}`);
    process.exit(1);
  }
}

async function cmdCapture(url: string) {
  header('🎯 Capturing API traffic...');
  
  info(`Target URL: ${url}`);
  
  try {
    // Try CDP capture first
    const cdp = new CDPCapture();
    info('Attempting to connect to Chrome DevTools Protocol...');
    
    const entries = await cdp.capture(url, { waitMs: 3000 });
    
    if (entries.length === 0) {
      error('No API traffic captured');
      process.exit(1);
    }
    
    success(`Captured ${entries.length} API requests`);
    
    // Convert to HAR format
    const har = {
      log: {
        version: '1.2',
        creator: { name: 'Unbrowse CLI', version: '1.0' },
        entries: entries.map(e => ({
          request: {
            url: e.url,
            method: e.method,
            headers: Object.entries(e.requestHeaders).map(([name, value]) => ({ name, value })),
            postData: e.requestBody ? { text: e.requestBody } : undefined,
          },
          response: {
            status: e.status,
            headers: Object.entries(e.responseHeaders).map(([name, value]) => ({ name, value })),
            content: { mimeType: e.mimeType, text: e.responseBody ?? '' },
          },
          _resourceType: 'xhr',
        })),
      },
    };
    
    // Save HAR file
    const harPath = join(process.cwd(), 'demo', `capture-${Date.now()}.har`);
    mkdirSync(dirname(harPath), { recursive: true });
    writeFileSync(harPath, JSON.stringify(har, null, 2), 'utf-8');
    
    success(`Saved HAR file: ${harPath}`);
    info(`Run: npx tsx packages/extension/src/cli.ts learn ${harPath}`);
    
  } catch (err) {
    error(`CDP capture failed: ${err}`);
    info('Falling back to direct fetch...');
    
    // Fallback: simple fetch
    try {
      const response = await fetch(url, { redirect: 'follow' });
      const contentType = response.headers.get('content-type') ?? '';
      
      success(`Fetched ${url}`);
      log(`  Status: ${response.status}`);
      log(`  Content-Type: ${contentType}`);
      
      if (contentType.includes('json')) {
        const data = await response.json();
        log(`  Response: ${JSON.stringify(data).slice(0, 100)}...`);
      }
      
      info('For real API capture, run Chrome with: chrome --remote-debugging-port=9222');
      
    } catch (fetchErr) {
      error(`Fetch failed: ${fetchErr}`);
      process.exit(1);
    }
  }
}

async function cmdSearch(query: string) {
  header('🔍 Searching marketplace...');
  
  const apiUrl = 'http://localhost:4111';
  info(`Query: ${query}`);
  
  try {
    // Note: This would need to match the actual Convex API structure
    // For now, we'll do a simple fetch
    const response = await fetch(`${apiUrl}/api/marketplace/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const results = await response.json();
    
    if (Array.isArray(results) && results.length > 0) {
      success(`Found ${results.length} results:`);
      results.forEach((r: any, i: number) => {
        log(`\n${i + 1}. ${colors.bright}${r.name}${colors.reset}`);
        log(`   Domain: ${colors.dim}${r.domain ?? 'N/A'}${colors.reset}`);
        log(`   Price: ${colors.cyan}${r.priceUsdc} USDC${colors.reset}`);
        log(`   Endpoints: ${r.endpointCount}`);
        log(`   Quality: ${r.qualityTier}`);
      });
    } else {
      info('No results found');
    }
    
  } catch (err) {
    error(`Search failed: ${err}`);
    info('Make sure the API server is running on localhost:4111');
    process.exit(1);
  }
}

async function cmdReplay(abilityId: string) {
  header('▶️  Replaying ability...');
  
  info(`Ability ID: ${abilityId}`);
  
  try {
    const apiUrl = 'http://localhost:4111';
    const response = await fetch(`${apiUrl}/api/abilities/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ abilityId, params: {} }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    success('Execution complete');
    log(`\n${colors.dim}${JSON.stringify(result, null, 2)}${colors.reset}`);
    
  } catch (err) {
    error(`Replay failed: ${err}`);
    info('Make sure the API server is running on localhost:4111');
    process.exit(1);
  }
}

async function cmdSkills() {
  header('📋 Local skills');
  
  const skillsDir = join(process.cwd(), 'skills');
  
  if (!existsSync(skillsDir)) {
    info('No skills directory found');
    info('Create skills with: npx tsx packages/extension/src/cli.ts learn <har-file>');
    return;
  }
  
  const domains = readdirSync(skillsDir).filter(f => {
    const stat = statSync(join(skillsDir, f));
    return stat.isDirectory();
  });
  
  if (domains.length === 0) {
    info('No skills found');
    return;
  }
  
  success(`Found ${domains.length} skills:`);
  
  domains.forEach((domain, i) => {
    const skillPath = join(skillsDir, domain, 'SKILL.md');
    const apiPath = join(skillsDir, domain, 'api.ts');
    
    const hasSkill = existsSync(skillPath);
    const hasApi = existsSync(apiPath);
    
    log(`\n${i + 1}. ${colors.bright}${domain}${colors.reset}`);
    log(`   ${hasSkill ? '✓' : '✗'} SKILL.md`);
    log(`   ${hasApi ? '✓' : '✗'} api.ts`);
    
    if (hasSkill) {
      const content = readFileSync(skillPath, 'utf-8');
      const endpoints = content.match(/^### /gm)?.length ?? 0;
      const authMatch = content.match(/Method: `(.+?)`/);
      const auth = authMatch ? authMatch[1] : 'unknown';
      
      log(`   ${colors.dim}${endpoints} endpoints, auth: ${auth}${colors.reset}`);
    }
  });
}

async function cmdStats() {
  header('📊 Server statistics');
  
  const apiUrl = 'http://localhost:4111';
  
  try {
    // Try to fetch stats from the API
    const response = await fetch(`${apiUrl}/api/stats`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const stats = await response.json();
    
    log(`${colors.bright}Marketplace:${colors.reset}`);
    log(`  Total skills: ${colors.cyan}${stats.totalSkills ?? 'N/A'}${colors.reset}`);
    log(`  Total downloads: ${colors.cyan}${stats.totalDownloads ?? 'N/A'}${colors.reset}`);
    log(`  Total executions: ${colors.cyan}${stats.totalExecutions ?? 'N/A'}${colors.reset}`);
    
    log(`\n${colors.bright}System:${colors.reset}`);
    log(`  API status: ${colors.green}online${colors.reset}`);
    log(`  Server: ${apiUrl}`);
    
  } catch (err) {
    error(`Failed to fetch stats: ${err}`);
    info('Make sure the API server is running on localhost:4111');
    process.exit(1);
  }
}

function showHelp() {
  log(`
${colors.bright}Unbrowse CLI${colors.reset} - AI-powered API skill generator

${colors.bright}Usage:${colors.reset}
  npx tsx packages/extension/src/cli.ts <command> [options]

${colors.bright}Commands:${colors.reset}
  ${colors.cyan}capture <url>${colors.reset}
    Capture API traffic from a URL
    Uses Chrome DevTools Protocol if available (run Chrome with --remote-debugging-port=9222)
    Falls back to direct fetch if CDP unavailable
    
  ${colors.cyan}learn <har-file>${colors.reset}
    Parse a HAR file and generate a skill
    Creates SKILL.md + api.ts in ./skills/<domain>/
    
  ${colors.cyan}search <query>${colors.reset}
    Search the marketplace for skills
    Queries the API server at localhost:4111
    
  ${colors.cyan}replay <ability-id>${colors.reset}
    Execute an ability by ID
    Sends request to localhost:4111
    
  ${colors.cyan}skills${colors.reset}
    List all local skills
    Shows skills in ./skills/ directory
    
  ${colors.cyan}stats${colors.reset}
    Show server statistics
    Requires API server running on localhost:4111

${colors.bright}Examples:${colors.reset}
  npx tsx packages/extension/src/cli.ts capture https://jsonplaceholder.typicode.com/posts
  npx tsx packages/extension/src/cli.ts learn demo/sample.har
  npx tsx packages/extension/src/cli.ts search "weather"
  npx tsx packages/extension/src/cli.ts skills
  npx tsx packages/extension/src/cli.ts stats

${colors.bright}Chrome DevTools Setup:${colors.reset}
  For full API capture, run Chrome with remote debugging:
  ${colors.dim}chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug${colors.reset}
`);
}

// Main CLI handler
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === 'help' || args[0] === '--help' || args[0] === '-h') {
    showHelp();
    return;
  }
  
  const command = args[0];
  
  try {
    switch (command) {
      case 'capture':
        if (!args[1]) {
          error('Missing URL argument');
          log('Usage: npx tsx packages/extension/src/cli.ts capture <url>');
          process.exit(1);
        }
        await cmdCapture(args[1]);
        break;
        
      case 'learn':
        if (!args[1]) {
          error('Missing HAR file argument');
          log('Usage: npx tsx packages/extension/src/cli.ts learn <har-file>');
          process.exit(1);
        }
        await cmdLearn(args[1]);
        break;
        
      case 'search':
        if (!args[1]) {
          error('Missing query argument');
          log('Usage: npx tsx packages/extension/src/cli.ts search <query>');
          process.exit(1);
        }
        await cmdSearch(args[1]);
        break;
        
      case 'replay':
        if (!args[1]) {
          error('Missing ability ID argument');
          log('Usage: npx tsx packages/extension/src/cli.ts replay <ability-id>');
          process.exit(1);
        }
        await cmdReplay(args[1]);
        break;
        
      case 'skills':
        await cmdSkills();
        break;
        
      case 'stats':
        await cmdStats();
        break;
        
      default:
        error(`Unknown command: ${command}`);
        log('Run with --help to see available commands');
        process.exit(1);
    }
  } catch (err) {
    error(`Command failed: ${err}`);
    process.exit(1);
  }
}

main();
