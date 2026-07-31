const Dependent = require('../models/Dependent');

/**
 * Resolve which profile a scan/log request is actually for.
 *
 * If no profileId is given (or it doesn't belong to the requesting
 * user, or was deleted), we silently fall back to the account owner's
 * own preferences — a stale profileId should never break scanning.
 *
 * Returns an object shaped like a User (has ._id and .preferences) so
 * it can be passed directly into computeSafetyVerdict without any
 * special-casing there.
 */
async function resolveEffectiveUser(req) {
  const profileId = req.query?.profileId || req.body?.profileId;

  if (!profileId) {
    return { effectiveUser: req.user, profileId: null, profileName: null };
  }

  const dependent = await Dependent.findOne({ _id: profileId, owner: req.user.id });

  if (!dependent) {
    return { effectiveUser: req.user, profileId: null, profileName: null };
  }

  return {
    effectiveUser: { _id: req.user.id, preferences: dependent.preferences },
    profileId: dependent._id,
    profileName: dependent.name
  };
}

module.exports = { resolveEffectiveUser };