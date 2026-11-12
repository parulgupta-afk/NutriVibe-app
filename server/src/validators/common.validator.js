const { z } = require('zod');

/** Validates a 24-character hexadecimal MongoDB ObjectId */
const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid ObjectId');
// Validates trimmed non-empty string up to max length
const nonEmptyString = (max = 500) => z.string().trim().min(1).max(max);
const optionalString = (max = 500) => z.string().trim().max(max).optional();
const emailString = z.string().trim().toLowerCase().pipe(z.string().email().max(254));
/** Standard integer pagination schema with page (1-1000) and limit (1-100) */
const pagination = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

module.exports = { z, objectId, nonEmptyString, optionalString, emailString, pagination };
