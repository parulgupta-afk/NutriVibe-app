# Wire logout-all + common-password check

## 1. Copy files
- `server/src/data/commonPasswords.js`
- `server/src/routes/authRoutes.js` (includes POST /api/auth/logout-all)
- `server/src/config/validateEnv.js` (prod JWT_SECRET >= 32)
- `server/src/controllers/logoutAll.snippet.js` — **paste** `exports.logoutAll` into `authController.js`

## 2. In authController.js
At top:
```js
const { isCommonPassword } = require('../data/commonPasswords');
```

In **register** (after reading password) and **resetPassword** (after min-length check):
```js
if (isCommonPassword(password)) {
  return res.status(400).json({
    success: false,
    message: 'This password is too common. Choose a stronger one.',
  });
}
```

Paste the full `exports.logoutAll` from the snippet file into authController.js.

## 3. Client (optional)
After login success is unchanged. Add a settings action:
```js
await api.post('/auth/logout-all');
// then clear local token and redirect to login
```
