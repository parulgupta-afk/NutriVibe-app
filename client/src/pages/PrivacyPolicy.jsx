/**
 * Phase 8/13 — Privacy policy stub. Route e.g. /privacy
 */
export default function PrivacyPolicy() {
  return (
    <main className="max-w-2xl mx-auto p-6 prose">
      <h1>Privacy Policy</h1>
      <p>Last updated: (set date)</p>
      <h2>Information we collect</h2>
      <p>Account data (email, name), profile preferences (allergies, dietary restrictions, medications), scan and meal logs, and optional device data needed to provide the service.</p>
      <h2>How we use it</h2>
      <p>To provide personalized food-safety verdicts, sync your data across devices, and improve reliability. AI features process product text and optional meal photos as estimates only.</p>
      <h2>Third parties</h2>
      <p>Product data may come from Open Food Facts. AI features may use Google Gemini. Hosting and analytics providers process data under their agreements.</p>
      <h2>Your rights</h2>
      <p>You can export your data (GET /api/me/export) and delete your account (DELETE /api/me with password confirmation).</p>
      <h2>Contact</h2>
      <p>Update with a real contact email before public release.</p>
    </main>
  );
}
