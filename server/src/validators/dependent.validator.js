const { z, objectId, nonEmptyString } = require('./common.validator');

const createDependent = z.object({
  name: nonEmptyString(80),
  relationship: nonEmptyString(40).optional(),
  allergies: z.array(nonEmptyString(60)).max(50).default([]),
  dietaryRestrictions: z.array(nonEmptyString(60)).max(20).default([]),
  medications: z.array(nonEmptyString(80)).max(30).default([]),
}).strict();

const updateDependent = createDependent.partial().strict();

const dependentIdParam = z.object({ id: objectId });

module.exports = { createDependent, updateDependent, dependentIdParam };
