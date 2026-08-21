/**
 * Phase 16: shared domain shapes (JSDoc).
 * Full TypeScript migration is deferred; these types document contracts
 * for editors and future .ts conversion without changing runtime.
 *
 * @typedef {'Safe'|'Caution'|'Unsafe'|'Unknown'} RiskLevel
 *
 * @typedef {Object} SafetyFactor
 * @property {string} name
 * @property {string} impact
 * @property {number} severity
 *
 * @typedef {Object} SafetyVerdict
 * @property {RiskLevel} level
 * @property {number} score
 * @property {SafetyFactor[]} factors
 * @property {string[]} recommendations
 * @property {{ level: RiskLevel, score: number, factors: SafetyFactor[] }} [safety]
 * @property {{ score: number, calories: number|null, protein: number|null, sugar: number|null, fiber: number|null }} [nutrition]
 * @property {{ level: string }} [processing]
 *
 * @typedef {Object} ProductSummary
 * @property {string} [_id]
 * @property {string} barcode
 * @property {string} name
 * @property {string} brand
 * @property {string} category
 * @property {string[]} [ingredients]
 * @property {object} [safetyInfo]
 * @property {object} [nutritionalInfo]
 * @property {string} [processingLevel]
 *
 * @typedef {Object} UserPreferences
 * @property {string[]} [allergies]
 * @property {string[]} [dietaryRestrictions]
 * @property {string[]} [medications]
 * @property {string[]} [healthGoals]
 *
 * @typedef {Object} EffectiveUser
 * @property {string} [_id]
 * @property {UserPreferences} preferences
 *
 * @typedef {Object} RecommendationItem
 * @property {string} barcode
 * @property {RiskLevel} safetyLevel
 * @property {number} safetyScore
 * @property {number} rankScore
 * @property {string} swapReason
 * @property {object} [scoreBreakdown]
 */

// Runtime marker so the file is a valid CommonJS module
module.exports = {
  DOMAIN_VERSION: 1
};
