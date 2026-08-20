/**
 * Dietary restriction rules used by the safety engine.
 *
 * Phase 1: go beyond "does it have a matching certification?" —
 * also inspect ingredients / labels for obvious conflicts.
 *
 * Each rule:
 *  - matchNames: how the user might write the restriction
 *  - preferredCerts: certifications that satisfy the restriction
 *  - forbiddenKeywords: if present in product text → conflict
 *  - severity: how hard to flag (caution vs stronger note)
 */

const DIETARY_RULES = [
  {
    matchNames: ['vegan', 'plant-based', 'plant based'],
    preferredCerts: ['vegan', 'plant-based', 'plant based'],
    forbiddenKeywords: [
      'milk', 'cream', 'butter', 'cheese', 'whey', 'casein', 'lactose',
      'yogurt', 'yoghurt', 'ghee', 'egg', 'eggs', 'honey', 'gelatin',
      'gelatine', 'lard', 'tallow', 'anchovy', 'fish', 'meat', 'chicken',
      'beef', 'pork', 'lamb', 'shellfish', 'shrimp', 'crab', 'whey protein',
      'caseinate', 'albumin', 'carmine', 'isinglass'
    ],
    // Plant milks etc. should not trigger dairy-style forbidden words alone
    allowPhrases: [
      'coconut milk', 'almond milk', 'soy milk', 'oat milk', 'rice milk',
      'cashew milk', 'plant milk', 'vegan', 'dairy-free', 'dairy free'
    ],
    severity: 40,
    message: 'May contain animal-derived ingredients — may not fit a vegan diet'
  },
  {
    matchNames: ['vegetarian'],
    preferredCerts: ['vegetarian', 'vegan'],
    forbiddenKeywords: [
      'gelatin', 'gelatine', 'lard', 'tallow', 'anchovy', 'fish sauce',
      'meat', 'chicken', 'beef', 'pork', 'lamb', 'bacon', 'ham',
      'shellfish', 'shrimp', 'crab', 'lobster', 'rennet'
    ],
    allowPhrases: ['vegetable rennet', 'microbial rennet'],
    severity: 35,
    message: 'May contain meat, fish, or animal-derived ingredients — may not fit a vegetarian diet'
  },
  {
    matchNames: ['gluten-free', 'gluten free', 'gf', 'coeliac', 'celiac'],
    preferredCerts: ['gluten-free', 'gluten free', 'gf'],
    forbiddenKeywords: [
      'wheat', 'barley', 'rye', 'gluten', 'malt', 'semolina', 'spelt',
      'kamut', 'triticale', 'farina', 'durum', 'seitan', 'graham'
    ],
    allowPhrases: ['gluten-free', 'gluten free', 'wheat-free'],
    severity: 50,
    message: 'May contain gluten — may not be suitable if you need gluten-free'
  },
  {
    matchNames: ['dairy-free', 'dairy free', 'lactose-free', 'lactose free', 'no dairy'],
    preferredCerts: ['dairy-free', 'dairy free', 'lactose-free', 'lactose free', 'vegan'],
    forbiddenKeywords: [
      'milk', 'cream', 'butter', 'cheese', 'whey', 'casein', 'lactose',
      'yogurt', 'yoghurt', 'ghee', 'caseinate', 'milk solids'
    ],
    allowPhrases: [
      'coconut milk', 'almond milk', 'soy milk', 'oat milk', 'rice milk',
      'dairy-free', 'dairy free', 'lactose-free', 'lactose free'
    ],
    severity: 45,
    message: 'May contain dairy — may not fit a dairy-free diet'
  },
  {
    matchNames: ['nut-free', 'nut free', 'no nuts', 'tree-nut-free'],
    preferredCerts: ['nut-free', 'nut free'],
    forbiddenKeywords: [
      'almond', 'cashew', 'walnut', 'pecan', 'pistachio', 'hazelnut',
      'macadamia', 'brazil nut', 'peanut', 'tree nut', 'nut oil'
    ],
    allowPhrases: ['nut-free', 'nut free'],
    severity: 55,
    message: 'May contain nuts — may not fit a nut-free requirement'
  },
  {
    matchNames: ['halal'],
    preferredCerts: ['halal'],
    forbiddenKeywords: ['pork', 'bacon', 'ham', 'lard', 'alcohol', 'ethanol', 'wine', 'beer'],
    allowPhrases: ['halal'],
    severity: 40,
    message: 'May contain ingredients that conflict with a halal diet'
  },
  {
    matchNames: ['kosher'],
    preferredCerts: ['kosher'],
    forbiddenKeywords: [],
    allowPhrases: ['kosher'],
    severity: 25,
    message: 'No clear kosher certification found — verify the label if required'
  },
  {
    matchNames: ['keto', 'ketogenic', 'low-carb', 'low carb'],
    preferredCerts: ['keto', 'ketogenic'],
    forbiddenKeywords: [],
    allowPhrases: [],
    severity: 15,
    message: 'Check net carbs against your keto / low-carb targets'
  },
  {
    matchNames: ['low-sodium', 'low sodium', 'no salt', 'salt-free'],
    preferredCerts: ['low sodium', 'low-sodium', 'salt-free', 'no salt added'],
    forbiddenKeywords: [],
    allowPhrases: [],
    severity: 15,
    message: 'Check sodium content if you are limiting salt'
  }
];

/**
 * Check product against a list of user dietary restrictions.
 * Returns an array of conflict objects (empty if all good / unknown).
 */
function checkDietaryRestrictions(userRestrictions = [], product) {
  if (!userRestrictions || userRestrictions.length === 0) return [];

  const certs = (product.safetyInfo?.certifications || []).map((c) =>
    String(c).toLowerCase()
  );
  const productText = [
    ...(product.ingredients || []),
    ...(product.safetyInfo?.allergens || []),
    ...(product.safetyInfo?.warnings || []),
    product.name || '',
    product.description || ''
  ]
    .join(' ')
    .toLowerCase();

  const conflicts = [];

  for (const restriction of userRestrictions) {
    const rLower = String(restriction).toLowerCase().trim();
    if (!rLower) continue;

    const rule = DIETARY_RULES.find((dr) =>
      dr.matchNames.some((n) => rLower.includes(n) || n.includes(rLower))
    );

    if (!rule) {
      // Unknown restriction name — only flag if no cert mentions it at all
      const hasCert = certs.some(
        (c) => c.includes(rLower) || rLower.includes(c)
      );
      if (!hasCert) {
        conflicts.push({
          restriction,
          severity: 20,
          message: `No clear "${restriction}" certification found on this product — check the label if this matters to you`
        });
      }
      continue;
    }

    // Satisfied by certification?
    const hasPreferredCert = rule.preferredCerts.some((pc) =>
      certs.some((c) => c.includes(pc) || pc.includes(c))
    );
    if (hasPreferredCert) continue;

    // Allow-phrases present (e.g. "dairy-free" written in ingredients)?
    const hasAllowPhrase =
      rule.allowPhrases &&
      rule.allowPhrases.some((p) => productText.includes(p));
    if (hasAllowPhrase) continue;

    // Forbidden keywords present?
    const hits = (rule.forbiddenKeywords || []).filter((kw) => {
      // Don't fire if an allow-phrase contains that keyword context
      if (rule.allowPhrases && rule.allowPhrases.some((p) => p.includes(kw) && productText.includes(p))) {
        return false;
      }
      return productText.includes(kw);
    });

    if (hits.length > 0) {
      conflicts.push({
        restriction,
        severity: rule.severity,
        message: rule.message,
        matchedIngredients: hits
      });
    } else if (rule.preferredCerts.length > 0 && certs.length === 0 && (product.ingredients || []).length === 0) {
      // No certs and no ingredients — soft note only
      conflicts.push({
        restriction,
        severity: 15,
        message: `Limited data to confirm this product is suitable for "${restriction}" — check the physical label`
      });
    } else if (rule.preferredCerts.length > 0 && !hasPreferredCert && hits.length === 0) {
      // No forbidden ingredients found, but also no cert — mild note
      conflicts.push({
        restriction,
        severity: Math.min(rule.severity, 25),
        message: `No formal "${restriction}" certification listed — ingredients look okay, but verify the label if needed`
      });
    }
  }

  return conflicts;
}

module.exports = { DIETARY_RULES, checkDietaryRestrictions };
