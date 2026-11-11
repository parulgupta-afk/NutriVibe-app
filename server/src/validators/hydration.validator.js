const { z } = require('zod');

// Safe timezone: letters, numbers, slash, underscore, hyphen, plus
const safeTimezone = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(/^[a-zA-Z0-9_\-+/]+$/, 'Invalid timezone format');

/** Zod schema validating bounded numeric targets and safe timezone for hydration goals */
const updateGoalsSchema = z
  .object({
    calories: z.coerce.number().min(500, 'Calories must be between 500 and 10000').max(10000, 'Calories must be between 500 and 10000').optional(),
    protein: z.coerce.number().min(0, 'Protein cannot be negative').max(1000).optional(),
    carbs: z.coerce.number().min(0, 'Carbs cannot be negative').max(2000).optional(),
    fat: z.coerce.number().min(0, 'Fat cannot be negative').max(1000).optional(),
    fiber: z.coerce.number().min(0, 'Fiber cannot be negative').max(500).optional(),
    waterMl: z.coerce.number().min(250, 'waterMl must be between 250 and 10000').max(10000, 'waterMl must be between 250 and 10000').optional(),
    timezone: safeTimezone.optional(),
  })
  .strip();

module.exports = {
  safeTimezone,
  updateGoalsSchema,
};

