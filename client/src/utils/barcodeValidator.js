/**
 * Standard barcode validation & checksum calculators for scanner inputs.
 */

/**
 * Computes standard modulo-10 EAN/UPC checksum digit.
 * @param {string} barcodeWithoutCheckDigit Digits excluding check digit.
 * @returns {number|null} Expected check digit.
 */
export function calculateEanChecksum(barcodeWithoutCheckDigit) {
  if (!barcodeWithoutCheckDigit || typeof barcodeWithoutCheckDigit !== 'string') {
    return null;
  }

  const digits = barcodeWithoutCheckDigit.replace(/\D/g, '');
  if (digits.length === 0) return null;

  let sum = 0;
  const isOddLen = digits.length % 2 !== 0;

  for (let i = 0; i < digits.length; i++) {
    const digit = Number.parseInt(digits[i], 10);
    // Weight alternating: 3, 1, 3, 1... from right
    const weight = (i % 2 === 0) === isOddLen ? 3 : 1;
    sum += digit * weight;
  }

  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}

/**
 * Validates barcode format and modulo-10 checksum algorithm.
 * @param {string} barcode Barcode string to validate.
 * @returns {boolean} True if valid EAN/UPC barcode.
 */
export function isValidBarcode(barcode) {
  if (!barcode || typeof barcode !== 'string') return false;
  const trimmed = barcode.trim();
  // Barcodes must consist purely of digits
  if (!/^\d+$/.test(trimmed)) return false;

  // Standard supported symbologies: EAN-8 (8), UPC-A (12), EAN-13 (13), GTIN-14 (14)
  if (![8, 12, 13, 14].includes(trimmed.length)) {
    return false;
  }

  const payload = trimmed.slice(0, -1);
  const checkDigit = Number.parseInt(trimmed.slice(-1), 10);
  const expected = calculateEanChecksum(payload);

  return expected === checkDigit;
}
