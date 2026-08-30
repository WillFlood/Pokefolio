const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const START_PORT = Number(process.env.PORT || 4173);
const ROOT = path.join(__dirname, 'public');
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };
const apiCache = new Map();

function getJsonWithoutCompression(target) {
  return new Promise((resolve, reject) => {
    const request = https.get(target, { headers: { Accept: 'application/json', 'Accept-Encoding': 'identity' } }, response => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => { body += chunk; });
      response.on('end', () => {
        if (response.statusCode < 200 || response.statusCode >= 300) return reject(new Error(`HTTP ${response.statusCode}`));
        try { resolve(JSON.parse(body)); } catch (error) { reject(error); }
      });
    });
    request.setTimeout(60000, () => request.destroy(new Error('TCGplayer request timed out')));
    request.on('error', reject);
  });
}

function reply(res, status, body, type = 'application/json; charset=utf-8') {
  const isPageAsset = /text\/html|text\/css|javascript/.test(type);
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': status === 200 && !isPageAsset ? 'public, max-age=300' : 'no-store' });
  res.end(body);
}

async function proxyApi(req, res, url) {
  const endpoint = url.pathname.replace('/api/tcg/', '');
  if (!['cards', 'sets'].includes(endpoint)) return reply(res, 404, JSON.stringify({ error: 'Unknown endpoint' }));
  const target = `https://api.pokemontcg.io/v2/${endpoint}${url.search}`;
  const cached = apiCache.get(target);
  if (cached && Date.now() - cached.savedAt < 300000) return reply(res, 200, cached.body);
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(target, { headers: process.env.POKEMONTCG_API_KEY ? { 'X-Api-Key': process.env.POKEMONTCG_API_KEY } : {} });
      const body = await response.text();
      if (response.ok) apiCache.set(target, { body, savedAt: Date.now() });
      if (response.ok || attempt === 3) return reply(res, response.status, body);
    } catch (error) { lastError = error; }
  }
  if (cached) return reply(res, 200, cached.body);
  reply(res, 502, JSON.stringify({ error: 'Card data service unavailable', detail: lastError?.message }));
}

async function tcgplayerSetPrices(res, config) {
  const target = `https://infinite-api.tcgplayer.com/priceguide/set/${config.tcgplayerId}/cards/?rows=5000&productTypeID=1`;
  const cacheKey = `tcgplayer:${config.slug}`;
  const cached = apiCache.get(cacheKey);
  if (cached && Date.now() - cached.savedAt < 900000) return reply(res, 200, cached.body);
  try {
    const guide = await getJsonWithoutCompression(target);
    const prices = (guide.result || [])
      .filter(row => row.condition.startsWith('Near Mint') && Number(row.marketPrice) > 0 && /^\d+\//.test(row.number || ''))
      .map(row => ({
        number: Number(String(row.number).split('/')[0]),
        name: row.productName,
        rarity: row.rarity,
        printing: row.printing,
        market: Number(row.marketPrice),
        low: Number(row.lowPrice) || 0,
        productId: row.productID
      }));
    const body = JSON.stringify({ set: config.name, setId: config.tcgplayerId, refreshedAt: new Date().toISOString(), prices });
    apiCache.set(cacheKey, { body, savedAt: Date.now() });
    return reply(res, 200, body);
  } catch (error) {
    if (cached) return reply(res, 200, cached.body);
    return reply(res, 502, JSON.stringify({ error: 'TCGplayer price guide unavailable', detail: error.cause?.message || error.message }));
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname === '/api/prices/ascended-heroes') return tcgplayerSetPrices(res, { slug: 'ascended-heroes', name: 'ME: Ascended Heroes', tcgplayerId: 24541 });
  if (url.pathname === '/api/prices/pitch-black') return tcgplayerSetPrices(res, { slug: 'pitch-black', name: 'ME05: Pitch Black', tcgplayerId: 24688 });
  if (url.pathname === '/api/prices/chaos-rising') return tcgplayerSetPrices(res, { slug: 'chaos-rising', name: 'ME04: Chaos Rising', tcgplayerId: 24655 });
  if (url.pathname === '/api/prices/perfect-order') return tcgplayerSetPrices(res, { slug: 'perfect-order', name: 'ME03: Perfect Order', tcgplayerId: 24587 });
  if (url.pathname.startsWith('/api/tcg/')) return proxyApi(req, res, url);
  const requested = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.slice(1));
  const file = path.resolve(ROOT, requested);
  if (!file.startsWith(path.resolve(ROOT))) return reply(res, 403, 'Forbidden', 'text/plain');
  fs.readFile(file, (error, data) => {
    if (error) return reply(res, 404, 'Not found', 'text/plain');
    reply(res, 200, data, TYPES[path.extname(file)] || 'application/octet-stream');
  });
});

function start(port) {
  server.once('error', error => {
    if (error.code === 'EADDRINUSE' && !process.env.PORT) {
      console.log(`Port ${port} is already in use. Trying ${port + 1}…`);
      setTimeout(() => start(port + 1), 100);
      return;
    }
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Choose another with: $env:PORT=4174; npm.cmd start`);
      process.exitCode = 1;
      return;
    }
    throw error;
  });
  server.listen(port);
}

server.on('listening', () => {
  const address = server.address();
  console.log(`CardFolio running at http://localhost:${address.port}`);
});

start(START_PORT);
