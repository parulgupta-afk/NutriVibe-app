const mongoose = require('mongoose');
const Dependent = require('../models/Dependent');
const { AppError, Codes } = require('../errors/AppError');

/**
 * Resolve which profile a scan/log request is actually for.
 *
 * SAFETY: if a profileId is supplied it MUST resolve to a profile owned by the
 * requesting user. We never fall back to the account owner's preferences,
 * because a dependent's allergies/medications differ from the owner's and a
 * silent fallback could yield a false "Safe" verdict. Malformed, unknown,
 * deleted and other-user ids all produce the same 404 (no ownership oracle).
 *
 * Returns an object shaped like a User (has ._id and .preferences) so it can be
 * passed directly into computeSafetyVerdict.
 */
async function resolveEffectiveUser(req) {
  const rawId = req.query?.profileId ?? req.body?.profileId;

  if (rawId === undefined || rawId === null || rawId === '') {
    return { effectiveUser: req.user, profileId: null, profileName: null };
  }

  const notFound = () => new AppError('Profile not found', 404, Codes.NOT_FOUND);

  // Reject non-strings (e.g. {"$ne":null} operator injection) and bad ObjectIds.
  if (typeof rawId !== 'string' || !mongoose.isValidObjectId(rawId)) {
    throw notFound();
  }

  const dependent = await Dependent.findOne({ _id: rawId, owner: req.user.id });
  if (!dependent) {
    throw notFound();
  }

  return {
    effectiveUser: { _id: req.user.id, preferences: dependent.preferences },
    profileId: dependent._id,
    profileName: dependent.name
  };
}

module.exports = { resolveEffectiveUser };
