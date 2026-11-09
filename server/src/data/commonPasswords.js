/** Small bundled common-password denylist — not exhaustive. */
const COMMON = new Set([
  'password', 'password1', 'password12', 'password123', '1234567890',
  'qwertyuiop', 'letmein123', 'welcome123', 'admin12345', 'iloveyou12',
  'abc1234567', 'monkey1234', 'dragon1234', 'master1234', 'login12345',
  'princess12', 'football12', 'baseball12', 'sunshine12', 'trustno1!!',
  'passw0rd12', 'changeme12', 'nutrivibe1', 'nutrivibe12', 'testtest12',
].map((s) => s.toLowerCase()));

function isCommonPassword(password) {
  if (!password || typeof password !== 'string') return true;
  return COMMON.has(password.toLowerCase());
}

module.exports = { isCommonPassword, COMMON };
