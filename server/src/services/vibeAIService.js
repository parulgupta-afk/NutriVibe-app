/**
 * VibeAI — grounded nutrition assistant (Phase 5)
 * Retrieves real user data first; Gemini only explains/suggests.
 * Allergy/medication questions ALWAYS go through the safety engine.
 */
const Meal = require('../models/Meal');
const HydrationLog = require('../models/HydrationLog');
const NutritionGoal = require('../models/NutritionGoal');
const DietPlan = require('../models/DietPlan');
const { getStreakSummary } = require('./streakService');
const { computeSafetyVerdict } = require('./safetyEngine');
const { roundTotals } = require('./nutritionCalculator');

const GEMINI_MODEL = 'gemini-flash-latest';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

async function gatherContext(userId, user) {
  const localDate = new Date().toISOString().slice(0, 10);
  const [meals, hydLogs, goals, streak, plan] = await Promise.all([
    Meal.find({ userId, localDate }),
    HydrationLog.find({ userId, localDate }),
    NutritionGoal.findOne({ userId }),
    getStreakSummary(userId),
    DietPlan.findOne({ userId, status: 'active' }).sort({ createdAt: -1 }),
  ]);

  const dailyTotals = roundTotals(
    meals.reduce(
      (acc, m) => {
        acc.calories += m.totals?.calories || 0;
        acc.protein += m.totals?.protein || 0;
        acc.carbs += m.totals?.carbs || 0;
        acc.fat += m.totals?.fat || 0;
        acc.fiber += m.totals?.fiber || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    )
  );

  const waterMl = hydLogs.reduce((s, l) => s + (l.amountMl || 0), 0);

  return {
    profile: {
      allergies: user.preferences?.allergies || [],
      restrictions: user.preferences?.dietaryRestrictions || [],
      medications: user.preferences?.medications || [],
      goals: user.preferences?.healthGoals || [],
    },
    today: {
      localDate,
      meals: meals.map((m) => ({
        type: m.mealType,
        items: m.items.map((i) => i.name),
        calories: m.totals?.calories,
      })),
      nutrition: dailyTotals,
      waterMl,
      waterGoal: goals?.waterMl || 2000,
      calorieGoal: goals?.calories || 2000,
    },
    streaks: streak,
    activePlan: plan
      ? {
          goal: plan.goal,
          dietType: plan.dietType,
          dayCount: plan.days?.length,
        }
      : null,
  };
}

function isSafetyQuestion(text) {
  return /safe|allerg|react|interact|medication|meds|can i eat|should i avoid|unsafe/i.test(text);
}

async function chat(userId, user, message, history = []) {
  const context = await gatherContext(userId, user);

  // Route safety-ish questions through deterministic engine when a product/ingredient is named
  let safetyNote = null;
  if (isSafetyQuestion(message)) {
    const productLike = {
      name: 'user-query',
      ingredients: [message],
      allergens: [],
    };
    try {
      const verdict = computeSafetyVerdict(productLike, user);
      safetyNote = {
        level: verdict.level,
        factors: verdict.factors?.slice(0, 5),
      };
    } catch {
      /* ignore */
    }
  }

  const systemContext = `You are VibeAI, the nutrition assistant inside NutriVibe.
You ONLY use the factual context below. Never invent calorie numbers or declare food safety on your own.
If asked about safety/allergies/medications, remind the user that the app's deterministic safety engine decides verdicts, and you only explain.

USER CONTEXT (authoritative):
${JSON.stringify(context, null, 2)}
${safetyNote ? `\nSAFETY ENGINE NOTE: ${JSON.stringify(safetyNote)}` : ''}

Rules:
- Be concise, friendly, practical.
- Prefer suggesting meals consistent with allergies and diet type.
- For "how was my nutrition today?" use the exact numbers in context.
- Never give medical advice or dosage guidance.
- End sentences completely.`;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Deterministic offline reply so the feature still demos
    const { nutrition, waterMl, waterGoal, calorieGoal } = context.today;
    return {
      success: true,
      offline: true,
      reply: `Here's what your data shows for today (no Gemini key configured):\n• Calories: ${Math.round(nutrition.calories)} / ${calorieGoal}\n• Protein: ${nutrition.protein}g · Carbs: ${nutrition.carbs}g · Fat: ${nutrition.fat}g\n• Water: ${waterMl} / ${waterGoal} ml\n• Meal streak: ${context.streaks?.mealLogging?.current || 0} days\n\nAsk again after setting GEMINI_API_KEY for richer suggestions. Safety questions are still checked by the rules engine.`,
      context: { today: context.today, streaks: context.streaks },
    };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    const contents = [
      { role: 'user', parts: [{ text: systemContext }] },
      ...history.slice(-6).map((h) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents,
        generationConfig: { maxOutputTokens: 1024 },
      }),
    });
    clearTimeout(timer);

    if (!response.ok) {
      const errText = await response.text();
      return { success: false, error: `Gemini error: ${response.status} ${errText.slice(0, 200)}` };
    }

    const data = await response.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ||
      'I could not generate a reply. Try again.';

    return {
      success: true,
      reply,
      context: { today: context.today, streaks: context.streaks },
      safetyNote,
    };
  } catch (err) {
    return {
      success: false,
      error: err.name === 'AbortError' ? 'AI timed out' : err.message,
    };
  }
}

module.exports = { chat, gatherContext, isSafetyQuestion };
