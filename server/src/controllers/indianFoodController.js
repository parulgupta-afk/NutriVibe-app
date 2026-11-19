/**
 * Indian Food Intelligence helpers (Phase 6)
 */
const { matchInsInText } = require('../data/insAdditives');
const insList = require('../data/insAdditives');

/**
 * Lookup matching INS additives from query parameter or request body text.
 * @param {import('express').Request} req Express request containing q query or text body
 * @param {import('express').Response} res Express response
 */
async function lookupIns(req, res) {
  const text = req.body?.text || req.query?.q || '';
  const hits = matchInsInText(text);
  res.json({
    success: true,
    data: {
      matches: hits,
      count: hits.length,
      note: 'FSSAI/INS educational mapping. Not a complete regulatory database.',
    },
  });
}

/**
 * Returns comprehensive reference catalog of supported Indian INS food additives.
 * @param {import('express').Request} _req Express request
 * @param {import('express').Response} res Express response
 */
async function listIns(_req, res) {
  // strip the function export
  const entries = Array.isArray(insList) ? insList : [];
  res.json({ success: true, data: entries });
}

module.exports = { lookupIns, listIns };
