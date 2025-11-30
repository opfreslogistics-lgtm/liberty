/**
 * Generate a unique reference number for transactions
 * Format: REF + 6-digit random number
 * Example: REF843939
 */
export function generateReferenceNumber(): string {
  const prefix = 'REF'
  const randomNum = Math.floor(100000 + Math.random() * 900000) // 6-digit number (100000-999999)
  return `${prefix}${randomNum}`
}

/**
 * Generate a reference number with custom prefix
 * @param prefix - Custom prefix (e.g., 'BILL', 'MD', 'TKT')
 * @param length - Number of random digits (default: 6)
 */
export function generateReferenceNumberWithPrefix(prefix: string = 'REF', length: number = 6): string {
  const min = Math.pow(10, length - 1)
  const max = Math.pow(10, length) - 1
  const randomNum = Math.floor(min + Math.random() * (max - min + 1))
  return `${prefix}${randomNum}`
}

/**
 * Format reference number for display
 * @param refNumber - Reference number to format
 * @param separator - Separator between prefix and number (default: ' – ')
 */
export function formatReferenceNumber(refNumber: string, separator: string = ' – '): string {
  // If already formatted, return as is
  if (refNumber.includes(separator)) {
    return refNumber
  }
  
  // Extract prefix and number
  const match = refNumber.match(/^([A-Z]+)(\d+)$/)
  if (match) {
    return `${match[1]}${separator}${match[2]}`
  }
  
  // Return as is if doesn't match expected format
  return refNumber
}
