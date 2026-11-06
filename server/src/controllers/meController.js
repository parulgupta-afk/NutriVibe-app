/**
 * Phase 8 — GET /api/me/export and DELETE /api/me
 * Wire into routes; cascade delete owned data; require password on delete.
 */

// Example shapes – adapt to your models and error helper.

async function exportMe(req, res, next) {
  try {
    const userId = req.user._id;
    // Load owned collections only:
    // const [user, dependents, meals, hydration, favorites, keys, tracking] = await Promise.all([...]);
    const payload = {
      exportedAt: new Date().toISOString(),
      user: { id: userId, email: req.user.email, name: req.user.name },
      dependents: [],
      meals: [],
      hydration: [],
      favorites: [],
      tracking: [],
      apiKeys: [], // hashes only, never raw keys
    };
    res.json({ success: true, data: payload });
  } catch (err) {
    next(err);
  }
}

async function deleteMe(req, res, next) {
  try {
    const { password } = req.body || {};
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password required' });
    }
    // const ok = await req.user.comparePassword(password);
    // if (!ok) return res.status(401).json({ success: false, message: 'Invalid password' });
    // Cascade: dependents, meals, hydration, favorites, tracking, api keys, then user
    // await Dependent.deleteMany({ owner: req.user._id });
    // ...
    // await User.deleteOne({ _id: req.user._id });
    res.json({ success: true, message: 'Account scheduled for deletion' });
  } catch (err) {
    next(err);
  }
}

module.exports = { exportMe, deleteMe };
