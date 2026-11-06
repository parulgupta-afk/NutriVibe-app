const { z, nonEmptyString } = require('./common.validator');

const register = z.object({
  name: nonEmptyString(80),
  email: z.string().email().max(254),
  password: z.string().min(10).max(128),
}).strict();

const login = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(128),
}).strict();

const resetRequest = z.object({
  email: z.string().email().max(254),
}).strict();

const resetConfirm = z.object({
  token: nonEmptyString(200),
  password: z.string().min(10).max(128),
}).strict();

module.exports = { register, login, resetRequest, resetConfirm };
