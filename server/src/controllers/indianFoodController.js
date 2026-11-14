/**
 * Indian Food Intelligence helpers (Phase 6)
 */
const { matchInsInText } = require('../data/insAdditives');
const insList = require('../data/insAdditives');

/**
 * Lookup matching INS additives from query param or request body text.
 * @param {object} req Express request
 * @param {object} res Express response
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

async function listIns(_req, res) {
  // strip the function export
  const entries = Array.isArray(insList) ? insList : [];
  res.json({ success: true, data: entries });
}

module.exports = { lookupIns, listIns };
