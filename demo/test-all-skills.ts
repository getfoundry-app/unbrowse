#!/usr/bin/env npx tsx

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

interface TestCase {
  domain: string;
  url: string;
  method?: string;
  headers?: Record<string, string>;
  expectJson?: boolean;
}

const tests: TestCase[] = [
  // Reverse-engineered Solana
  { domain: "jupiter-aggregator", url: "https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=1000000000&slippageBps=50" },
  { domain: "raydium-amm", url: "https://api-v3.raydium.io/pools/info/list?poolType=all&poolSortField=default&sortType=desc&pageSize=2&page=1" },
  { domain: "orca-whirlpool", url: "https://api.mainnet.orca.so/v1/whirlpool/list?whirlpoolsConfig=2LecshUwPBPI33iU1kmYkGBkGy3VhsQj25HSrja1qN7g" },
  { domain: "dexscreener", url: "https://api.dexscreener.com/latest/dex/tokens/So11111111111111111111111111111111111111112" },
  { domain: "geckoterminal", url: "https://api.geckoterminal.com/api/v2/networks/solana/tokens/So11111111111111111111111111111111111111112" },
  { domain: "marinade", url: "https://api.marinade.finance/tlv" },
  { domain: "magic-eden", url: "https://api-mainnet.magiceden.dev/v2/collections?offset=0&limit=3" },
  { domain: "jupiter-price", url: "https://price.jup.ag/v6/price?ids=SOL" },
  { domain: "jupiter-tokens", url: "https://token.jup.ag/strict" },
  
  // Reverse-engineered others
  { domain: "hackernews", url: "https://hacker-news.firebaseio.com/v0/topstories.json" },
  { domain: "reddit", url: "https://www.reddit.com/r/solana/hot.json?limit=2", headers: { "User-Agent": "unbrowse-test/1.0" } },
  { domain: "wikipedia", url: "https://en.wikipedia.org/api/rest_v1/page/summary/Solana_(blockchain)" },
  { domain: "stackoverflow", url: "https://api.stackexchange.com/2.3/questions?order=desc&sort=hot&site=stackoverflow&pagesize=2" },
  { domain: "npm-registry", url: "https://registry.npmjs.org/@solana/web3.js" },
  { domain: "pypi", url: "https://pypi.org/pypi/solana/json" },
  { domain: "crates.io", url: "https://crates.io/api/v1/crates?q=solana&per_page=2", headers: { "User-Agent": "unbrowse-test/1.0" } },
  { domain: "lichess", url: "https://lichess.org/api/puzzle/daily" },
  { domain: "dev.to", url: "https://dev.to/api/articles?per_page=2&tag=solana" },
  { domain: "lobsters", url: "https://lobste.rs/hottest.json" },
  
  // Solana infra
  { domain: "solana-rpc", url: "https://api.mainnet-beta.solana.com", method: "POST", headers: { "Content-Type": "application/json" } },
  { domain: "colosseum", url: "https://agents.colosseum.com/api/hackathons/active" },
  
  // Popular public APIs
  { domain: "jsonplaceholder", url: "https://jsonplaceholder.typicode.com/posts/1" },
  { domain: "github", url: "https://api.github.com/repos/getfoundry-app/unbrowse", headers: { "User-Agent": "unbrowse-test", Accept: "application/vnd.github.v3+json" } },
  { domain: "coingecko", url: "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd" },
  { domain: "binance", url: "https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT" },
  { domain: "coinpaprika", url: "https://api.coinpaprika.com/v1/tickers/sol-solana" },
  { domain: "coindesk", url: "https://api.coindesk.com/v1/bpi/currentprice.json" },
  { domain: "openweather", url: "https://api.openweathermap.org/data/2.5/weather?q=London&appid=demo" },
  { domain: "spacex", url: "https://api.spacexdata.com/v5/launches/latest" },
  { domain: "pokeapi", url: "https://pokeapi.co/api/v2/pokemon/pikachu" },
  { domain: "swapi", url: "https://swapi.dev/api/people/1/" },
  { domain: "httpbin", url: "https://httpbin.org/get" },
  { domain: "ipify", url: "https://api.ipify.org/?format=json" },
  { domain: "catfact", url: "https://catfact.ninja/fact" },
  { domain: "dog-ceo", url: "https://dog.ceo/api/breeds/list/all" },
  { domain: "randomuser", url: "https://randomuser.me/api/" },
  { domain: "restcountries", url: "https://restcountries.com/v3.1/alpha/US" },
  { domain: "adviceslip", url: "https://api.adviceslip.com/advice" },
  { domain: "chucknorris", url: "https://api.chucknorris.io/jokes/random" },
  { domain: "agify", url: "https://api.agify.io/?name=michael" },
  { domain: "nationalize", url: "https://api.nationalize.io/?name=michael" },
  { domain: "tvmaze", url: "https://api.tvmaze.com/search/shows?q=solana" },
  { domain: "jikan", url: "https://api.jikan.moe/v4/anime/1" },
  { domain: "cocktaildb", url: "https://www.thecocktaildb.com/api/json/v1/1/random.php" },
  { domain: "mealdb", url: "https://www.themealdb.com/api/json/v1/1/random.php" },
  { domain: "dummyjson", url: "https://dummyjson.com/products/1" },
  { domain: "fakestore", url: "https://fakestoreapi.com/products/1" },
  { domain: "openlibrary", url: "https://openlibrary.org/search.json?q=solana&limit=1" },
  { domain: "nasa", url: "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY" },
  { domain: "nager-date", url: "https://date.nager.at/api/v3/publicholidays/2026/US" },
  { domain: "exchangerate", url: "https://api.exchangerate-api.com/v4/latest/USD" },
  { domain: "alternative-me", url: "https://api.alternative.me/fng/" },
  { domain: "blockchain-info", url: "https://api.blockchain.info/stats" },
  { domain: "public-apis", url: "https://api.publicapis.org/entries?category=Blockchain&https=true" },
  { domain: "quotable", url: "https://api.quotable.io/random" },
  { domain: "genderize", url: "https://api.genderize.io/?name=alice" },
];

async function main() {
  console.log(`\n${BOLD}${CYAN}══════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}${CYAN}  🔓 UNBROWSE — Testing All ${tests.length} Skills Live${RESET}`);
  console.log(`${BOLD}${CYAN}══════════════════════════════════════════════════${RESET}\n`);

  let passed = 0, failed = 0;
  const failures: string[] = [];

  for (const t of tests) {
    const start = Date.now();
    try {
      const body = t.domain === "solana-rpc" 
        ? JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getHealth" })
        : undefined;
      const res = await fetch(t.url, {
        method: t.method || "GET",
        headers: { Accept: "application/json", ...(t.headers || {}) },
        body,
        signal: AbortSignal.timeout(10000),
      });
      const ms = Date.now() - start;
      const ok = res.status >= 200 && res.status < 400;
      
      if (ok) {
        passed++;
        const preview = await res.text().then(t => t.slice(0, 80));
        console.log(`  ${GREEN}✓${RESET} ${t.domain.padEnd(22)} ${DIM}${String(ms).padStart(5)}ms${RESET} ${DIM}${res.status} ${preview}...${RESET}`);
      } else {
        failed++;
        failures.push(`${t.domain}: HTTP ${res.status}`);
        console.log(`  ${RED}✗${RESET} ${t.domain.padEnd(22)} ${DIM}${String(ms).padStart(5)}ms${RESET} ${RED}${res.status}${RESET}`);
      }
    } catch (e: any) {
      const ms = Date.now() - start;
      failed++;
      const msg = e.message?.slice(0, 50) || "unknown";
      failures.push(`${t.domain}: ${msg}`);
      console.log(`  ${RED}✗${RESET} ${t.domain.padEnd(22)} ${DIM}${String(ms).padStart(5)}ms${RESET} ${RED}${msg}${RESET}`);
    }
  }

  console.log(`\n${BOLD}${CYAN}══════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}  Results: ${GREEN}${passed}${RESET}${BOLD} passed / ${RED}${failed}${RESET}${BOLD} failed / ${tests.length} total${RESET}`);
  console.log(`${BOLD}  Success rate: ${passed >= tests.length * 0.9 ? GREEN : RED}${((passed / tests.length) * 100).toFixed(1)}%${RESET}`);
  if (failures.length > 0) {
    console.log(`\n${RED}  Failed:${RESET}`);
    for (const f of failures) console.log(`    ${RED}✗${RESET} ${f}`);
  }
  console.log(`${BOLD}${CYAN}══════════════════════════════════════════════════${RESET}\n`);
}

main().catch(console.error);
