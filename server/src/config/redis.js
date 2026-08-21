/**
 * Phase 11: optional Redis.
 * If REDIS_URL is unset or Redis is down, all helpers no-op and the app
 * continues using MongoDB only.
 */

let client = null;
let connectAttempted = false;
let available = false;

async function getRedis() {
  if (connectAttempted) return available ? client : null;
  connectAttempted = true;

  const url = process.env.REDIS_URL;
  if (!url) {
    return null;
  }

  try {
    // Optional dependency — only required when REDIS_URL is set.
    // Install with: npm install redis
    const { createClient } = require('redis');
    client = createClient({ url });
    client.on('error', (err) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Redis error:', err.message);
      }
      available = false;
    });
    await client.connect();
    available = true;
    console.log('Redis connected (product cache enabled)');
    return client;
  } catch (err) {
    console.warn(
      'Redis unavailable — continuing without cache:',
      err.message
    );
    available = false;
    client = null;
    return null;
  }
}

async function cacheGet(key) {
  try {
    const c = await getRedis();
    if (!c) return null;
    const val = await c.get(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

async function cacheSet(key, value, ttlSeconds = 3600) {
  try {
    const c = await getRedis();
    if (!c) return false;
    await c.set(key, JSON.stringify(value), { EX: ttlSeconds });
    return true;
  } catch {
    return false;
  }
}

async function cacheDel(key) {
  try {
    const c = await getRedis();
    if (!c) return false;
    await c.del(key);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  getRedis,
  cacheGet,
  cacheSet,
  cacheDel
};
