const { z } = require('zod');

/** Structured Gemini outputs must pass these schemas or we use safe fallbacks. */

// Validates extracted ingredients and allergens from vision/OCR models
const ingredientExtraction = z.object({
  ingredients: z.array(z.string().max(200)).max(200),
  allergens: z.array(z.string().max(80)).max(30).optional(),
  confidence: z.number().min(0).max(1).optional(),
}).strict();

const mealAnalysis = z.object({
  items: z.array(z.object({
    name: z.string().max(120),
    estimatedGrams: z.number().positive().max(5000).optional(),
    calories: z.number().min(0).max(10000).optional(),
  })).max(50),
  confidence: z.number().min(0).max(1),
  notes: z.string().max(1000).optional(),
}).strict();

const vibeAIReply = z.object({
  answer: z.string().max(4000),
  grounded: z.boolean().optional(),
  sources: z.array(z.string().max(120)).max(20).optional(),
}).strict();

const explanation = z.object({
  summary: z.string().max(2000),
  reasons: z.array(z.string().max(300)).max(20).optional(),
}).strict();

module.exports = {
  ingredientExtraction,
  mealAnalysis,
  vibeAIReply,
  explanation,
};
