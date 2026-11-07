const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { register, login, resetRequest } = require('../src/validators/auth.validator');
const { emailString } = require('../src/validators/common.validator');

describe('auth validator schemas and email normalization', () => {
  it('normalizes uppercase email and trims surrounding whitespace', () => {
    const parsed = emailString.parse('  TestUser@Example.COM  ');
    assert.equal(parsed, 'testuser@example.com');
  });

  it('validates and normalizes registration payload', () => {
    const result = register.parse({
      name: 'Jane Doe',
      email: '  Jane.Doe@Domain.org ',
      password: 'StrongPassword123!',
    });
    assert.equal(result.name, 'Jane Doe');
    assert.equal(result.email, 'jane.doe@domain.org');
  });

  it('rejects registration when password is under 10 characters', () => {
    assert.throws(() => {
      register.parse({
        name: 'Jane Doe',
        email: 'jane@domain.org',
        password: 'short',
      });
    });
  });

  it('validates login payload and normalizes email', () => {
    const result = login.parse({
      email: ' User@DOMAIN.COM ',
      password: 'password123',
    });
    assert.equal(result.email, 'user@domain.com');
  });

  it('validates resetRequest payload', () => {
    const result = resetRequest.parse({
      email: ' RESET@NutriVibe.APP ',
    });
    assert.equal(result.email, 'reset@nutrivibe.app');
  });
});
