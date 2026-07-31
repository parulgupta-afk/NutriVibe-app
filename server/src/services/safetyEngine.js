/**
 * Single source of truth for computing a personalized safety verdict.
 * Previously this logic was duplicated (and slightly inconsistent)
 * across productController, safetyController, and missing entirely
 * from trackingController — which is why the same product could show
 * different risk levels in different parts of the app.
 */
const { checkMedicationInteractions } = require('../data/medicationInteractions');

function computeSafetyVerdict(product, user) {
  const userAllergies = user.preferences?.allergies || [];
  const userRestrictions = user.preferences?.dietaryRestrictions || [];

  const productAllergens = product.safetyInfo?.allergens || [];
  const productWarnings = product.safetyInfo?.warnings || [];

  const foundAllergens = userAllergies.filter((allergy) =>
    productAllergens.some(
      (pa) =>
        pa.toLowerCase().includes(allergy.toLowerCase()) ||
        allergy.toLowerCase().includes(pa.toLowerCase())
    )
  );

  let level = 'Safe';
  let score = 90;
  const factors = [];
  const recommendations = [];

  if (foundAllergens.length > 0) {
    level = 'Unsafe';
    score = 20;
    factors.push({
      name: 'Contains flagged allergens',
      impact: 'Direct allergen match',
      severity: 90
    });
    recommendations.push(`Contains: ${foundAllergens.join(', ')}`);
    recommendations.push('Avoid this product - contains your flagged allergens');
  } else if (
    productWarnings.some(
      (w) =>
        w.toLowerCase().includes('may contain') ||
        w.toLowerCase().includes('traces') ||
        w.toLowerCase().includes('shared facility')
    )
  ) {
    level = 'Caution';
    score = 60;
    factors.push({
      name: 'Cross-contamination risk',
      impact: 'May contain traces of allergens',
      severity: 60
    });
    recommendations.push('Check physical packaging for cross-contamination warnings');
  } else if ((product.safetyInfo?.riskLevel || 'Unknown') === 'Unknown') {
    // No allergen conflict AND no data either way — be honest that we
    // don't have enough info, rather than defaulting to "Safe"
    level = 'Unknown';
    score = 50;
    factors.push({
      name: 'Insufficient data',
      impact: 'Not enough ingredient/allergen data to fully assess this product',
      severity: 20
    });
    recommendations.push('No allergens matched your profile, but this product has limited data — check the label yourself if you have concerns');
  }

  if (product.processingLevel === 'Ultra-Processed' && level !== 'Unsafe') {
    factors.push({
      name: 'High processing level',
      impact: 'Ultra-processed food',
      severity: 40
    });
    if (level === 'Safe') {
      recommendations.push('Consider less processed alternatives');
    }
  }

  if (userRestrictions.length > 0) {
    const productIsSuitable = userRestrictions.every((restriction) =>
      product.safetyInfo?.certifications?.some((cert) =>
        cert.toLowerCase().includes(restriction.toLowerCase())
      )
    );

    if (!productIsSuitable) {
      factors.push({
        name: 'Does not meet dietary restrictions',
        impact: 'Product may not align with your dietary choices',
        severity: 30
      });
      recommendations.push('This product may not align with your dietary preferences');
    }
  }

  // Medication-food interaction check. This can escalate (never
  // downgrade) the verdict — a product that's otherwise "Safe" for
  // allergies can still be a real concern for someone on certain
  // medications.
  const medications = user.preferences?.medications || [];
  const interactionMatches = checkMedicationInteractions(medications, product);

  for (const match of interactionMatches) {
    factors.push({
      name: `Interaction with ${match.medication}`,
      impact: match.message,
      severity: match.severity === 'high' ? 95 : 65
    });
    recommendations.push(
      `⚕️ ${match.message} (relevant to: ${match.medication})`
    );

    if (match.severity === 'high') {
      level = 'Unsafe';
      score = Math.min(score, 15);
    } else if (match.severity === 'medium' && level !== 'Unsafe') {
      level = 'Caution';
      score = Math.min(score, 55);
    }
  }

  return {
    level,
    score,
    factors,
    recommendations
  };
}

module.exports = { computeSafetyVerdict };