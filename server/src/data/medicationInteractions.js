/**
 * Curated, well-documented medication-food interactions.
 *
 * This is intentionally general-education level information (the kind
 * printed on pharmacy handouts), NOT dosage or clinical guidance. Each
 * entry matches a medication the user has listed against ingredients/
 * categories/keywords commonly found in a scanned product.
 *
 * severity: 'high'  -> should push the verdict toward Unsafe
 * severity: 'medium' -> should push the verdict toward at least Caution
 *
 * Phase 1: a few extra common interactions + slightly tighter matching.
 */

const INTERACTIONS = [
  {
    medicationKeywords: ['warfarin', 'coumadin', 'jantoven'],
    triggerKeywords: [
      'vitamin k', 'kale', 'spinach', 'leafy green', 'broccoli',
      'brussels sprout', 'brussels sprouts', 'collard', 'turnip greens',
      'parsley', 'swiss chard'
    ],
    severity: 'medium',
    message:
      'Contains vitamin K-rich ingredients, which can interfere with blood-thinning medications like warfarin. Keep your vitamin K intake consistent and talk to your doctor before making major changes.'
  },
  {
    medicationKeywords: [
      'maoi', 'monoamine oxidase', 'phenelzine', 'tranylcypromine',
      'isocarboxazid', 'selegiline', 'rasagiline'
    ],
    triggerKeywords: [
      'aged cheese', 'cured meat', 'salami', 'soy sauce', 'fermented',
      'tyramine', 'sauerkraut', 'kimchi', 'aged', 'cured', 'pickled',
      'liver', 'fava bean'
    ],
    severity: 'high',
    message:
      'Contains ingredients high in tyramine, which can cause a dangerous blood pressure spike when combined with MAOI medications.'
  },
  {
    medicationKeywords: [
      'statin', 'atorvastatin', 'simvastatin', 'lovastatin', 'lipitor',
      'zocor', 'pravastatin', 'rosuvastatin', 'crestor'
    ],
    triggerKeywords: ['grapefruit', 'pomelo'],
    severity: 'high',
    message:
      'Contains grapefruit or grapefruit juice, which can dangerously increase statin levels in your blood.'
  },
  {
    medicationKeywords: ['levothyroxine', 'synthroid', 'thyroid', 'levoxyl', 'tirosint'],
    triggerKeywords: ['soy', 'soya', 'calcium', 'iron', 'walnut', 'walnuts', 'coffee'],
    severity: 'medium',
    message:
      'Contains soy, calcium, iron, or other ingredients that can reduce absorption of thyroid medication. Consider spacing this out from your dose by a few hours.'
  },
  {
    medicationKeywords: [
      'ciprofloxacin', 'tetracycline', 'doxycycline', 'antibiotic',
      'levofloxacin', 'moxifloxacin', 'minocycline'
    ],
    triggerKeywords: ['milk', 'dairy', 'calcium', 'yogurt', 'yoghurt', 'cheese', 'antacid'],
    severity: 'medium',
    message:
      'Dairy and calcium can bind to certain antibiotics and reduce their effectiveness. Consider spacing this out from your dose.'
  },
  {
    medicationKeywords: [
      'lisinopril', 'ace inhibitor', 'ramipril', 'enalapril',
      'potassium-sparing', 'spironolactone', 'eplerenone', 'losartan', 'valsartan'
    ],
    triggerKeywords: [
      'potassium', 'salt substitute', 'banana', 'coconut water',
      'orange juice', 'dried apricot'
    ],
    severity: 'medium',
    message:
      'High-potassium ingredients combined with this type of medication can raise potassium to unsafe levels for some people.'
  },
  {
    medicationKeywords: ['metformin'],
    triggerKeywords: ['alcohol', 'ethanol'],
    severity: 'medium',
    message:
      'Alcohol combined with metformin can increase the risk of a rare but serious condition called lactic acidosis.'
  },
  {
    medicationKeywords: [
      'ssri', 'fluoxetine', 'sertraline', 'antidepressant', 'prozac',
      'zoloft', 'escitalopram', 'citalopram', 'paroxetine', 'lexapro', 'paxil'
    ],
    triggerKeywords: ['alcohol', 'ethanol'],
    severity: 'medium',
    message:
      'Alcohol can intensify side effects when combined with this type of medication.'
  },
  {
    medicationKeywords: ['monoamine', 'linezolid'],
    triggerKeywords: ['tyramine', 'aged cheese', 'cured meat', 'soy sauce', 'fermented'],
    severity: 'high',
    message:
      'Contains tyramine-rich ingredients that can interact dangerously with this medication class.'
  },
  {
    medicationKeywords: ['digoxin', 'lanoxin'],
    triggerKeywords: ['licorice', 'liquorice', 'glycyrrhizin'],
    severity: 'medium',
    message:
      'Licorice can interact with digoxin and affect heart rhythm. Check with your pharmacist if unsure.'
  },
  {
    medicationKeywords: ['sildenafil', 'viagra', 'tadalafil', 'cialis', 'vardenafil'],
    triggerKeywords: ['grapefruit'],
    severity: 'medium',
    message:
      'Grapefruit can increase blood levels of this medication and raise the risk of side effects.'
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
    ...(product.safetyInfo?.warnings || []),
    product.category || '',
    product.name || '',
    product.description || '',
    product.brand || ''
  ]
    .join(' ')
    .toLowerCase();

  const matches = [];
  const seen = new Set(); // avoid duplicate messages for same rule + med

  for (const med of medications) {
    const medLower = String(med).toLowerCase().trim();
    if (!medLower) continue;

    for (const rule of INTERACTIONS) {
      const medMatches = rule.medicationKeywords.some(
        (kw) => medLower.includes(kw) || kw.includes(medLower)
      );
      if (!medMatches) continue;

      const triggerMatches = rule.triggerKeywords.filter((kw) =>
        productText.includes(kw.toLowerCase())
      );
      if (triggerMatches.length === 0) continue;

      const key = `${medLower}::${rule.message}`;
      if (seen.has(key)) continue;
      seen.add(key);

      matches.push({
        medication: med,
        severity: rule.severity,
        message: rule.message,
        matchedIngredients: triggerMatches
      });
    }
  }

  return matches;
}

module.exports = { checkMedicationInteractions, INTERACTIONS };
