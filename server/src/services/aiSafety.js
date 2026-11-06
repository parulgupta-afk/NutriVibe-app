/**
 * Gemini / AI safety helpers.
 * - Validate model output with Zod; on failure return safe fallback (never raw text as verdict).
 * - Delimit untrusted product/user text in prompts.
 * - Quotas, cache, circuit breaker hooks.
 */

const { ingredientExtraction, mealAnalysis, vibeAIReply, explanation } = require('../validators/gemini.validator');

const SAFE_FALLBACKS = {
  ingredients: { ingredients: [], allergens: [], confidence: 0 },
  meal: { items: [], confidence: 0, notes: 'AI estimate unavailable; please enter manually.' },
  vibe: { answer: 'I could not generate a reliable answer. Please try again or check your records.', grounded: false },
  explain: { summary: 'Explanation unavailable.', reasons: [] },
};

function validateGemini(schema, raw, fallbackKey) {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const result = schema.safeParse(parsed);
    if (!result.success) {
      return { ok: false, data: SAFE_FALLBACKS[fallbackKey], errors: result.error.issues };
    }
    return { ok: true, data: result.data };
  } catch {
    return { ok: false, data: SAFE_FALLBACKS[fallbackKey], errors: [{ message: 'Invalid JSON from model' }] };
  }
}

/** Wrap untrusted text so the model treats it as data, not instructions. */
function delimitUntrusted(label, text) {
  const safe = String(text || '').slice(0, 8000).replace(/```/g, '');
  return `\n<<<UNTRUSTED_${label}_START>>>\n${safe}\n<<<UNTRUSTED_${label}_END>>>\n`;
}

/** Strip common injection phrases from user/product text before prompt assembly (defense in depth). */
function stripInstructionLike(text) {
  return String(text || '')
    .replace(/ignore (all )?(previous|prior|above) instructions?/gi, '[filtered]')
    .replace(/disregard (all )?(previous|prior|above) (instructions?|prompts?)/gi, '[filtered]')
    .replace(/you are now/gi, '[filtered]')
    .replace(/act as an? (unrestricted|jailbroken|dan)/gi, '[filtered]')
    .replace(/(system|assistant|developer)\s*:/gi, '[filtered]')
    .replace(/override (safety|verdict|rules)/gi, '[filtered]')
    .replace(/reveal (system )?prompt/gi, '[filtered]');
}

// --- Quota / circuit (wire to Redis or in-memory) ---
const dailyCounts = new Map(); // userId -> { date, count }
const circuit = { failures: 0, openUntil: 0 };

function checkUserQuota(userId, limit = 50) {
  const today = new Date().toISOString().slice(0, 10);
  const entry = dailyCounts.get(String(userId)) || { date: today, count: 0 };
  if (entry.date !== today) {
    entry.date = today;
    entry.count = 0;
  }
  if (entry.count >= limit) return { allowed: false, remaining: 0 };
  entry.count += 1;
  dailyCounts.set(String(userId), entry);
  return { allowed: true, remaining: limit - entry.count };
}

/**
 * Distributed quota check using Redis if configured, falling back to in-memory tracking.
 */
async function checkUserQuotaAsync(userId, limit = 50) {
  const today = new Date().toISOString().slice(0, 10);
  if (process.env.REDIS_URL) {
    try {
      const { getRedis } = require('../config/redis');
      const redis = await getRedis();
      if (redis) {
        const key = `quota:ai:${userId}:${today}`;
        const count = await redis.incr(key);
        if (count === 1) {
          await redis.expire(key, 86400); // 24 hours
        }
        if (count > limit) {
          return { allowed: false, remaining: 0 };
        }
        return { allowed: true, remaining: limit - count };
      }
    } catch {
      // Fall through to in-memory map
    }
  }

  return checkUserQuota(userId, limit);
}

function recordGeminiFailure() {
  circuit.failures += 1;
  if (circuit.failures >= 5) {
    circuit.openUntil = Date.now() + 60_000; // 1 min
    circuit.failures = 0;
  }
}

function recordGeminiSuccess() {
  circuit.failures = 0;
}

function isCircuitOpen() {
  return Date.now() < circuit.openUntil;
}

module.exports = {
  validateGemini,
  delimitUntrusted,
  stripInstructionLike,
  checkUserQuota,
  checkUserQuotaAsync,
  recordGeminiFailure,
  recordGeminiSuccess,
  isCircuitOpen,
  schemas: { ingredientExtraction, mealAnalysis, vibeAIReply, explanation },
  SAFE_FALLBACKS,
};
