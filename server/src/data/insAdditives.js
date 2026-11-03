/**
 * Indian Food Intelligence — INS / E-number mapping (Phase 6)
 */
const INS_ADDITIVES = [
  { code: 'INS 102', names: ['tartrazine', 'yellow 5'], category: 'colour', caution: 'May cause hyperactivity in sensitive children' },
  { code: 'INS 110', names: ['sunset yellow', 'yellow 6'], category: 'colour', caution: null },
  { code: 'INS 122', names: ['carmoisine', 'azorubine'], category: 'colour', caution: null },
  { code: 'INS 124', names: ['ponceau 4r'], category: 'colour', caution: null },
  { code: 'INS 129', names: ['allura red', 'red 40'], category: 'colour', caution: null },
  { code: 'INS 133', names: ['brilliant blue'], category: 'colour', caution: null },
  { code: 'INS 150a', names: ['caramel'], category: 'colour', caution: null },
  { code: 'INS 160a', names: ['carotene', 'beta-carotene'], category: 'colour', caution: null },
  { code: 'INS 200', names: ['sorbic acid'], category: 'preservative', caution: null },
  { code: 'INS 211', names: ['sodium benzoate'], category: 'preservative', caution: 'Avoid with vitamin C in soft drinks (benzene risk)' },
  { code: 'INS 220', names: ['sulphur dioxide', 'sulfites'], category: 'preservative', caution: 'Allergen for sulfite-sensitive individuals' },
  { code: 'INS 250', names: ['sodium nitrite'], category: 'preservative', caution: 'Processed meats; limit intake' },
  { code: 'INS 300', names: ['ascorbic acid', 'vitamin c'], category: 'antioxidant', caution: null },
  { code: 'INS 330', names: ['citric acid'], category: 'acidity regulator', caution: null },
  { code: 'INS 621', names: ['msg', 'monosodium glutamate'], category: 'flavour enhancer', caution: 'May cause sensitivity in some people' },
  { code: 'INS 950', names: ['acesulfame k'], category: 'sweetener', caution: null },
  { code: 'INS 951', names: ['aspartame'], category: 'sweetener', caution: 'Phenylketonuria (PKU) warning' },
  { code: 'INS 955', names: ['sucralose'], category: 'sweetener', caution: null },
  { code: 'INS 960', names: ['steviol glycosides', 'stevia'], category: 'sweetener', caution: null },
];

function matchInsInText(text = '') {
  const lower = String(text).toLowerCase();
  const hits = [];
  for (const entry of INS_ADDITIVES) {
    if (lower.includes(entry.code.toLowerCase())) {
      hits.push(entry);
      continue;
    }
    for (const n of entry.names) {
      if (lower.includes(n.toLowerCase())) {
        hits.push(entry);
        break;
      }
    }
  }
  return hits;
}

module.exports = INS_ADDITIVES;
module.exports.matchInsInText = matchInsInText;
module.exports.INS_ADDITIVES = INS_ADDITIVES;
