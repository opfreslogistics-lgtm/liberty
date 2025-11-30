export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function maskCardNumber(cardNumber: string): string {
  const last4 = cardNumber.slice(-4)
  return `•••• •••• •••• ${last4}`
}

export function maskAccountNumber(accountNumber: string): string {
  const last4 = accountNumber.slice(-4)
  return `••••${last4}`
}

// Re-export from transactionFormatting for convenience
export { generateReferenceNumber } from './utils/transactionFormatting'




