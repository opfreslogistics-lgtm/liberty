/**
 * Card Number Generation Utility
 * Generates realistic-looking but fictional card numbers
 * Uses Luhn algorithm for validation
 */

export type CardNetwork = 'visa' | 'mastercard' | 'amex'

export interface CardDetails {
  cardNumber: string
  cardNetwork: CardNetwork
  expirationMonth: string // MM format
  expirationYear: string // YY format
  cvv: string
  formattedCardNumber: string // With spaces for display
}

/**
 * Luhn algorithm validator
 * Validates if a card number passes the Luhn check
 */
function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '').split('').map(Number)
  let sum = 0
  let isEven = false

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i]

    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

/**
 * Generate a valid card number using Luhn algorithm
 */
function generateLuhnValidNumber(prefix: string, length: number): string {
  let cardNumber = prefix

  // Fill with random digits up to length - 1 (last digit will be check digit)
  while (cardNumber.length < length - 1) {
    cardNumber += Math.floor(Math.random() * 10).toString()
  }

  // Calculate check digit using Luhn algorithm
  const digits = cardNumber.split('').map(Number)
  let sum = 0
  let isEven = false

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i]

    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    isEven = !isEven
  }

  const checkDigit = (10 - (sum % 10)) % 10
  cardNumber += checkDigit.toString()

  return cardNumber
}

/**
 * Generate Visa card number
 * Visa: starts with 4, 16 digits
 */
function generateVisaCard(): string {
  // Visa BIN ranges: 4XXXXXXXXXXXXXXX
  // Use 4 as prefix, generate rest
  const prefix = '4'
  return generateLuhnValidNumber(prefix, 16)
}

/**
 * Generate Mastercard card number
 * Mastercard: starts with 51-55 or 2221-2720, 16 digits
 */
function generateMastercardCard(): string {
  // Randomly choose between 51-55 range or 2221-2720 range
  let prefix: string
  
  if (Math.random() < 0.5) {
    // Use 51-55 range
    const firstTwo = 51 + Math.floor(Math.random() * 5) // 51-55
    prefix = firstTwo.toString()
  } else {
    // Use 2221-2720 range
    const firstFour = 2221 + Math.floor(Math.random() * 500) // 2221-2720
    prefix = firstFour.toString()
  }
  
  return generateLuhnValidNumber(prefix, 16)
}

/**
 * Generate Amex card number
 * Amex: starts with 34 or 37, 15 digits
 */
function generateAmexCard(): string {
  // Amex: 34 or 37
  const prefix = Math.random() < 0.5 ? '34' : '37'
  return generateLuhnValidNumber(prefix, 15)
}

/**
 * Format card number with spaces for display
 */
export function formatCardNumber(cardNumber: string, network: CardNetwork): string {
  if (network === 'amex') {
    // Amex: XXXX XXXXXX XXXXX
    return `${cardNumber.slice(0, 4)} ${cardNumber.slice(4, 10)} ${cardNumber.slice(10, 15)}`
  } else {
    // Visa/Mastercard: XXXX XXXX XXXX XXXX
    return `${cardNumber.slice(0, 4)} ${cardNumber.slice(4, 8)} ${cardNumber.slice(8, 12)} ${cardNumber.slice(12, 16)}`
  }
}

/**
 * Generate a complete card with all details
 */
export function generateCard(network?: CardNetwork): CardDetails {
  // Randomly select network if not provided
  if (!network) {
    const rand = Math.random()
    if (rand < 0.33) {
      network = 'visa'
    } else if (rand < 0.66) {
      network = 'mastercard'
    } else {
      network = 'amex'
    }
  }

  // Generate card number based on network
  let cardNumber: string
  switch (network) {
    case 'visa':
      cardNumber = generateVisaCard()
      break
    case 'mastercard':
      cardNumber = generateMastercardCard()
      break
    case 'amex':
      cardNumber = generateAmexCard()
      break
    default:
      cardNumber = generateVisaCard()
      network = 'visa'
  }

  // Generate expiration date (2-5 years from now)
  const now = new Date()
  const yearsFromNow = 2 + Math.floor(Math.random() * 3) // 2-4 years
  const expirationDate = new Date(now.getFullYear() + yearsFromNow, Math.floor(Math.random() * 12), 1)
  
  const expirationMonth = String(expirationDate.getMonth() + 1).padStart(2, '0')
  const expirationYear = String(expirationDate.getFullYear() % 100).padStart(2, '0')

  // Generate CVV (3 digits for Visa/Mastercard, 4 for Amex)
  const cvvLength = network === 'amex' ? 4 : 3
  const cvv = Array.from({ length: cvvLength }, () => Math.floor(Math.random() * 10)).join('')

  // Format card number
  const formattedCardNumber = formatCardNumber(cardNumber, network)

  return {
    cardNumber,
    cardNetwork: network,
    expirationMonth,
    expirationYear,
    cvv,
    formattedCardNumber,
  }
}

/**
 * Validate card number using Luhn algorithm
 */
export function validateCardNumber(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\D/g, '')
  if (cleaned.length < 13 || cleaned.length > 19) {
    return false
  }
  return luhnCheck(cleaned)
}

/**
 * Mask card number for display (show only last 4 digits)
 */
export function maskCardNumber(cardNumber: string, network: CardNetwork = 'visa'): string {
  const cleaned = cardNumber.replace(/\D/g, '')
  const last4 = cleaned.slice(-4)
  
  if (network === 'amex') {
    return `XXXX XXXXXX ${last4}`
  } else {
    return `XXXX XXXX XXXX ${last4}`
  }
}

/**
 * Get card network from card number
 */
export function detectCardNetwork(cardNumber: string): CardNetwork | null {
  const cleaned = cardNumber.replace(/\D/g, '')
  
  if (cleaned.startsWith('4') && cleaned.length === 16) {
    return 'visa'
  } else if (
    (cleaned.match(/^5[1-5]/) && cleaned.length === 16) ||
    (cleaned.match(/^22[2-7]/) && cleaned.length === 16)
  ) {
    return 'mastercard'
  } else if ((cleaned.startsWith('34') || cleaned.startsWith('37')) && cleaned.length === 15) {
    return 'amex'
  }
  
  return null
}

