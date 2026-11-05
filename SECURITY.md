# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| 1.0.x   | :x:                |

---

## Reporting a Vulnerability

The NutriVibe team takes the security of our application and users seriously. If you discover a security vulnerability, please do **NOT** disclose it publicly via GitHub Issues.

### Reporting Procedure

1. **Email**: Send vulnerability reports directly to the maintainers at `security@nutrivibe.app` (or contact via GitHub security advisory).
2. **Details to Include**:
   - Description of the vulnerability and affected endpoints/components.
   - Proof of Concept (PoC) or step-by-step reproduction instructions.
   - Potential impact of the issue.
3. **Response Window**: You will receive an acknowledgment within 48 hours with an assessment and estimated timeline for a patch.

---

## Security Practices in NutriVibe

- **Authentication & Sessions**: Passwords hashed using `bcryptjs` with salt rounds. Tokens issued via `jsonwebtoken` with explicit expiration.
- **Rate Limiting**: Multi-tiered rate limiting via `express-rate-limit` prevents brute-force login attempts, AI quota exhaustion, and denial of service.
- **Headers & Middleware**: `helmet` is enabled with deny-by-default Content-Security-Policy (CSP) headers. Dedicated relaxed CSP is scoped strictly to `/api/docs`.
- **Payload Size Limits**: Strict 100kb JSON body limits for standard requests, with isolated 8MB limit reserved exclusively for meal and OCR image endpoints.
- **Fail-Closed Profile Resolution**: Dependent profile resolution fails closed with 404 on unknown, malformed, or unauthorized profile IDs, preventing safety bypasses.
- **Service Worker Privacy**: Browser Cache Storage never stores private medical or health API responses.
- **API Key Quota**: Hourly rate-limiting quotas on public API keys are enforced atomically with header-only authentication (`X-API-Key`).
- **Data Protection**: CORS is strictly enforced, and secrets are never committed or returned in API responses.
- **Deterministic Food Safety**: Allergen, medication, and dietary risk assessments are calculated deterministically by rules engines rather than ungrounded generative AI.
