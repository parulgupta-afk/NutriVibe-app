const { z, nonEmptyString, emailString } = require('./common.validator');

/** Zod schemas for user registration, authentication, and credential recovery */
const register = z.object({
  name: nonEmptyString(80),
  email: emailString,
  password: z.string().min(10).max(128),
}).strict();

const login = z.object({
  email: emailString,
  password: z.string().min(1).max(128),
}).strict();

const resetRequest = z.object({
  email: emailString,
}).strict();

const resetConfirm = z.object({
  token: nonEmptyString(200),
  password: z.string().min(10).max(128),
}).strict();

module.exports = { register, login, resetRequest, resetConfirm };
