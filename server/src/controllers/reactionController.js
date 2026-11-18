const Reaction = require('../models/Reaction');

/**
 * Creates new user reaction log documenting symptoms, suspected foods, and severity.
 * @param {import('express').Request} req Express request with user and reaction payload
 * @param {import('express').Response} res Express response
 * @param {import('express').NextFunction} next Express next callback
 */
async function createReaction(req, res, next) {
  try {
    const { foods, productName, productId, mealId, symptoms, severity, occurredAt, notes, profileId } = req.body;
    if (!symptoms || !symptoms.length) {
      return res.status(400).json({ message: 'symptoms required' });
    }
    const doc = await Reaction.create({
      userId: req.user._id,
      profileId,
      foods: foods || [],
      productName,
      productId,
      mealId,
      symptoms,
      severity: severity || 'mild',
      occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
      notes,
    });
    res.status(201).json({
      success: true,
      data: doc,
      disclaimer: 'This journal helps you notice patterns. It does not diagnose allergies or food intolerance. Consult a clinician for medical advice.',
    });
  } catch (err) {
    next(err);
  }
}

async function listReactions(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const list = await Reaction.find({ userId: req.user._id })
      .sort({ occurredAt: -1 })
      .limit(limit);
    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
}

/**
 * Computes frequency counts for foods and symptoms across logged reactions.
 * @param {Array<object>} [list=[]] List of user reaction records
 * @returns {{ totalEntries: number, topFoodsMentioned: Array<{name: string, count: number}>, topSymptoms: Array<{name: string, count: number}> }}
 */
function calculateReactionInsights(list = []) {
  const foodCounts = {};
  const symptomCounts = {};
  for (const r of list) {
    for (const f of r.foods || []) {
      const k = (f || '').toLowerCase();
      if (k) foodCounts[k] = (foodCounts[k] || 0) + 1;
    }
    for (const s of r.symptoms || []) {
      const k = (s || '').toLowerCase();
      if (k) symptomCounts[k] = (symptomCounts[k] || 0) + 1;
    }
  }
  const topFoods = Object.entries(foodCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));
  const topSymptoms = Object.entries(symptomCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  return {
    totalEntries: list.length,
    topFoodsMentioned: topFoods,
    topSymptoms: topSymptoms,
  };
}

/** Possible correlations only — never claims causation */
async function insights(req, res, next) {
  try {
    const list = await Reaction.find({ userId: req.user._id }).limit(200);
    const data = calculateReactionInsights(list);

    res.json({
      success: true,
      data,
      disclaimer: 'Correlations are observational only and are not a diagnosis.',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { createReaction, listReactions, insights, calculateReactionInsights };
