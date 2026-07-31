/**
 * Curated, well-documented medication-food interactions.
 *
 * This is intentionally general-education level information (the kind
 * printed on pharmacy handouts), NOT dosage or clinical guidance. Each
 * entry matches a medication the user has listed against ingredients/
 * categories/keywords commonly found in a scanned product.
 *
 * severity: 'high' -> should push the verdict toward Unsafe
 * severity: 'medium' -> should push the verdict toward at least Caution
 */

const INTERACTIONS = [
  {
    medicationKeywords: ['warfarin', 'coumadin'],
    triggerKeywords: ['vitamin k', 'kale', 'spinach', 'leafy green', 'broccoli', 'brussels sprout'],
    severity: 'medium',
    message: 'Contains vitamin K-rich ingredients, which can interfere with blood-thinning medications like warfarin. Keep your vitamin K intake consistent and talk to your doctor before making major changes.'
  },
  {
    medicationKeywords: ['maoi', 'monoamine oxidase', 'phenelzine', 'tranylcypromine', 'isocarboxazid'],
    triggerKeywords: ['aged cheese', 'cured meat', 'salami', 'soy sauce', 'fermented', 'tyramine', 'sauerkraut', 'kimchi'],
    severity: 'high',
    message: 'Contains ingredients high in tyramine, which can cause a dangerous blood pressure spike when combined with MAOI medications.'
  },
  {
    medicationKeywords: ['statin', 'atorvastatin', 'simvastatin', 'lovastatin', 'lipitor', 'zocor'],
    triggerKeywords: ['grapefruit'],
    severity: 'high',
    message: 'Contains grapefruit or grapefruit juice, which can dangerously increase statin levels in your blood.'
  },
  {
    medicationKeywords: ['levothyroxine', 'synthroid', 'thyroid'],
    triggerKeywords: ['soy', 'calcium', 'iron', 'walnut'],
    severity: 'medium',
    message: 'Contains soy, calcium, or iron, which can reduce absorption of thyroid medication. Consider spacing this out from your dose by a few hours.'
  },
  {
    medicationKeywords: ['ciprofloxacin', 'tetracycline', 'doxycycline', 'antibiotic'],
    triggerKeywords: ['milk', 'dairy', 'calcium', 'yogurt', 'cheese'],
    severity: 'medium',
    message: 'Dairy and calcium can bind to certain antibiotics and reduce their effectiveness. Consider spacing this out from your dose.'
  },
  {
    medicationKeywords: ['lisinopril', 'ace inhibitor', 'ramipril', 'enalapril', 'potassium-sparing', 'spironolactone'],
    triggerKeywords: ['potassium', 'salt substitute', 'banana', 'coconut water'],
    severity: 'medium',
    message: 'High-potassium ingredients combined with this type of medication can raise potassium to unsafe levels for some people.'
  },
  {
    medicationKeywords: ['metformin'],
    triggerKeywords: ['alcohol', 'ethanol'],
    severity: 'medium',
    message: 'Alcohol combined with metformin can increase the risk of a rare but serious condition called lactic acidosis.'
  },
  {
    medicationKeywords: ['ssri', 'fluoxetine', 'sertraline', 'antidepressant', 'prozac', 'zoloft'],
    triggerKeywords: ['alcohol', 'ethanol', 'caffeine'],
    severity: 'medium',
    message: 'Alcohol and high caffeine intake can intensify side effects when combined with this type of medication.'
  }
];

/**
 * Given the user's listed medications and a product's text fields,
 * return any matching interaction warnings.
 */
function checkMedicationInteractions(medications = [], product) {
  if (!medications || medications.length === 0) return [];

  const productText = [
    ...(product.ingredients || []),
    ...(product.safetyInfo?.allergens || []),
    product.category || '',
    product.name || '',
    product.description || ''
  ]
    .join(' ')
    .toLowerCase();

  const matches = [];

  for (const med of medications) {
    const medLower = med.toLowerCase();

    for (const rule of INTERACTIONS) {
      const medMatches = rule.medicationKeywords.some((kw) => medLower.includes(kw) || kw.includes(medLower));
      if (!medMatches) continue;

      const triggerMatches = rule.triggerKeywords.filter((kw) => productText.includes(kw));
      if (triggerMatches.length > 0) {
        matches.push({
          medication: med,
          severity: rule.severity,
          message: rule.message,
          matchedIngredients: triggerMatches
        });
      }
    }
  }

  return matches;
}

module.exports = { checkMedicationInteractions };