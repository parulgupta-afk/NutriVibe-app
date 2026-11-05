# NutriVibe — Security Audit & Hardening Report

**Application**: NutriVibe  
**Scope**: Full Stack (Node.js/Express Backend, React Frontend, MongoDB Atlas, Redis Cache)  
**Date**: November 2026  
**Auditor**: Principal Security & Full-Stack Architect  
**Classification**: Safety-Critical Health Tech Application  

---

## 1. Threat Model & Attack Surface Analysis

NutriVibe processes personal health indicators (allergies, medical conditions, medications, dietary restrictions) and outputs food safety advice. Inaccurate advice could induce an allergic reaction or medical crisis. As such, the system implements a defense-in-depth threat mitigation model.

### Key Threats & Mitigations

```text
[Threat: Injection / NoSQL Operator]
  └──> Sanitization via express-mongo-sanitize + Mongoose strict schemas
[Threat: Unauthorized Access to Family Profiles (IDOR)]
  └──> Strict ownership validation in profileResolver (fails closed to 404)
[Threat: Brute-Force & Denial of Service]
  └──> Global & route-specific rate limiters (express-rate-limit) + body size limits
[Threat: False-Safe Safety Advice]
  └──> Deterministic rules engine with CANNOT_VERIFY fail-safe on incomplete data
[Threat: Credential Theft / Session Hijacking]
  └──> Short-lived JWTs, bcrypt password hashing, secure HTTP headers (Helmet)
```

---

## 2. Vulnerabilities Identified and Remediated

| Vulnerability | Severity | Remediation | Status |
| :--- | :--- | :--- | :--- |
| **Silent Default to Safe on Incomplete Data** | Critical | Updated safety engine so empty ingredients or unreadable OCR never default to `SAFE`. Returns canonical `CANNOT_VERIFY`. | Resolved |
| **Dependent Profile IDOR** | High | Profile requests require `Dependent.findOne({ _id, owner: req.user.id })`. Any mismatch throws 404 without leaking profile existence. | Resolved |
| **Client-Side Prototype Pollution** | Moderate | Audited all recursive merge utilities; replaced raw object spread with validated schemas. | Resolved |
| **NoSQL Operator Injection (`$ne`, `$gt`)** | High | Stripped malicious Mongo query syntax with `express-mongo-sanitize`. Non-string IDs rejected prior to DB queries. | Resolved |
| **Information Disclosure via Stack Traces** | Low | Centralized error handler masks stack traces and internal errors in production (`NODE_ENV === 'production'`). | Resolved |
| **Unbounded Payload Body DoS** | Moderate | Body parser constrained to explicit byte limits (`10kb` for JSON/URL-encoded; multipart only on image upload routes). | Resolved |

---

## 3. Authentication & Authorization Flow

### JWT Lifecycle & Password Security

- **Hashing**: User passwords hashed using `bcryptjs` with salt rounds = 10.
- **JWT Storage & Expiration**: Authentication tokens signed with HMAC-SHA256 (`JWT_SECRET`). Expiration configured to 30 days default or short-lived session with token refresh.
- **Google SSO**: Verified using Google OAuth 2.0 public keys. If an existing account has the same email, it seamlessly links without password corruption.
- **Password Reset**: Generates a cryptographically random token (`crypto.randomBytes(20)`), stored as a SHA-256 hash in MongoDB with a 10-minute expiry window.

---

## 4. Injection Attack Protections

### NoSQL Injection Mitigation

All inputs destined for MongoDB queries are sanitized. Route handlers validate ObjectId formats using `mongoose.isValidObjectId(id)`. Direct user input is never concatenated into raw MongoDB `$where` or regex clauses without regex-escaping.

### Cross-Site Scripting (XSS)

- React’s JSX engine escapes text nodes by default.
- Dangerous methods (`dangerouslySetInnerHTML`) are strictly banned across the codebase.
- User-supplied strings rendered in labels or exports are truncated and sanitized.

---

## 5. Network Security & HTTP Headers

### HTTP Security Headers (Helmet)

Configured via `helmet()` middleware:

- `Content-Security-Policy`: Default restrictive directive preventing unauthorized script injection.
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` (prevents clickjacking)
- `Strict-Transport-Security` (enforces HTTPS)
- `Referrer-Policy: strict-origin-when-cross-origin`

### CORS Configuration

CORS middleware enforces origin whitelisting:

- Configured via `CLIENT_URL` environment variable.
- In production, only the configured production frontend origin is allowed access to the API.
- Credentials (`credentials: true`) explicitly controlled.

---

## 6. Dependency Vulnerability Audit

Audits performed via `npm audit --omit=dev`:

```text
==================================================
CLIENT DEPENDENCY AUDIT RESULT:
Directory: client/
Command: npm audit --omit=dev
Result: found 0 vulnerabilities
==================================================

==================================================
SERVER DEPENDENCY AUDIT RESULT:
Directory: server/
Command: npm audit --omit=dev
Result: found 0 vulnerabilities
==================================================
```

**Conclusion**: Zero production vulnerabilities detected across all client and server dependencies.
