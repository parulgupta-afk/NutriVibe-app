// Uses the "-latest" alias so this doesn't silently break every time
// Google renames/retires a specific dated model. As of mid-2026 this
// points at the Gemini 3.5 Flash generation. If Google ever retires
// the alias itself, check https://ai.google.dev/gemini-api/docs/models
const GEMINI_MODEL = 'gemini-flash-latest';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Simple in-memory cache so refreshing the same product page for the
// same profile doesn't burn an API call every time. Cleared on server
// restart — fine for this use case since explanations rarely change.
const explanationCache = new Map();

function buildCacheKey(product, user) {
  return `${product._id}::${JSON.stringify(user.preferences || {})}`;
}

/**
 * Build a prompt that gives Gemini just enough context to explain a
 * product's ingredients in plain English, personalized to what the
 * user actually cares about (their allergies, diet, goals, meds) —
 * without ever asking it to give medical advice or a diagnosis.
 */
function buildPrompt(product, user) {
  const prefs = user.preferences || {};
  const allergies = prefs.allergies?.length ? prefs.allergies.join(', ') : 'none listed';
  const restrictions = prefs.dietaryRestrictions?.length ? prefs.dietaryRestrictions.join(', ') : 'none listed';
  const goals = prefs.healthGoals?.length ? prefs.healthGoals.join(', ') : 'none listed';
  const medications = prefs.medications?.length ? prefs.medications.join(', ') : 'none listed';
  const ingredients = product.ingredients?.length ? product.ingredients.join(', ') : 'not available';

  return `You are explaining a food product's ingredients to a regular person using a food-safety app. Be clear, warm, and practical — not clinical, not alarmist.

Product: ${product.name} (${product.brand || 'unknown brand'})
Ingredients: ${ingredients}

This person's profile:
- Allergies: ${allergies}
- Dietary restrictions: ${restrictions}
- Health goals: ${goals}
- Medications: ${medications}

Write a short, complete explanation covering:
1. What the notable or less-common ingredients actually are, in everyday language
2. Anything in this product that's specifically relevant to THIS person's allergies, restrictions, goals, or medications listed above — only mention what's actually relevant, don't force a connection if there isn't one
3. Any generally useful context (e.g. how processed it is, what role an additive serves)

Keep it to about 3-5 sentences in plain paragraphs (no headers, no bullet lists), but the most important rule is: ALWAYS finish your last sentence completely. Never stop mid-sentence. If you're running long, wrap up early and end cleanly rather than getting cut off.

Do not give medical advice, do not diagnose, and do not tell them whether to eat it or not — that's not your call. Just help them understand what's actually in it and why it might matter to them specifically.`;
}

/**
 * Ask Gemini to explain a product's ingredients for a specific user
 * profile. Returns { success: true, explanation } or
 * { success: false, error } — callers should surface `error` to the
 * developer/console but show a friendly fallback message to the user.
 */
async function explainIngredients(product, user) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: 'GEMINI_API_KEY is not set in server/.env. Get a free key from aistudio.google.com/apikey and add it to enable this feature.'
    };
  }

  if (!product.ingredients || product.ingredients.length === 0) {
    return {
      success: false,
      error: 'This product has no ingredient data to explain.'
    };
  }

  const cacheKey = buildCacheKey(product, user);
  if (explanationCache.has(cacheKey)) {
    return { success: true, explanation: explanationCache.get(cacheKey), cached: true };
  }

  try {
    // Phase 4: timeout so a hung Gemini call cannot block the request forever
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    let response;
    try {
      response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: buildPrompt(product, user) }]
            }
          ],
          generationConfig: {
            maxOutputTokens: 2048
          }
        })
      });
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      // Do not log response body in production (may contain prompt fragments)
      if (process.env.NODE_ENV === 'development') {
        const errorBody = await response.text();
        console.error('Gemini API error:', response.status, errorBody.slice(0, 500));
      } else {
        console.error('Gemini API error status:', response.status);
      }
      return {
        success: false,
        error: `AI explainer service returned an error (status ${response.status}). Check server logs.`
      };
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error('Unexpected Gemini response shape:', JSON.stringify(data));
      return { success: false, error: 'AI explainer returned an unexpected response format.' };
    }

    const explanation = text.trim();
    explanationCache.set(cacheKey, explanation);

    return { success: true, explanation };
  } catch (error) {
    if (error.name === 'AbortError') {
      return { success: false, error: 'AI explainer timed out. Please try again.' };
    }
    console.error('Error calling Gemini API:', error.message);
    return { success: false, error: 'Could not reach the AI explainer service. Please try again.' };
  }
}

module.exports = { explainIngredients };