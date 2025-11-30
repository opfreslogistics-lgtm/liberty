import { create } from 'zustand'

export interface Account {
  id: string
  name: string
  type: 'checking' | 'savings' | 'credit'
  balance: number
  last4: string
  trend: number[]
}

export interface Transaction {
  id: string
  accountId: string
  type: 'debit' | 'credit'
  amount: number
  description: string
  category: string
  date: Date
  pending: boolean
  merchant?: string
  location?: string
}

export interface Budget {
  category: string
  limit: number
  spent: number
}

export interface Subscription {
  id: string
  name: string
  amount: number
  frequency: 'monthly' | 'yearly'
  nextPayment: Date
  status: 'active' | 'review' | 'cancelled'
}

interface AppState {
  accounts: Account[]
  transactions: Transaction[]
  budgets: Budget[]
  subscriptions: Subscription[]
  btcBalance: number
  btcPrice: number
  darkMode: boolean
  setAccounts: (accounts: Account[]) => void
  addTransaction: (transaction: Transaction) => void
  updateBudget: (category: string, spent: number) => void
}

// New users start with zero balances - accounts will be created when user registers
const mockAccounts: Account[] = [
  {
    id: '1',
    name: 'Primary Checking',
    type: 'checking',
    balance: 0.00,
    last4: '4532',
    trend: [],
  },
  {
    id: '2',
    name: 'High Yield Savings',
    type: 'savings',
    balance: 0.00,
    last4: '7890',
    trend: [],
  },
]

// Empty transaction history - transactions will only appear when real actions occur
const mockTransactions: Transaction[] = []

export const useStore = create<AppState>((set) => ({
  accounts: mockAccounts,
  transactions: mockTransactions,
  budgets: [],
  subscriptions: [],
  btcBalance: 0.00,
  btcPrice: 43250.00,
  darkMode: false,
  setAccounts: (accounts) => set({ accounts }),
  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    })),
  updateBudget: (category, spent) =>
    set((state) => ({
      budgets: state.budgets.map((budget) =>
        budget.category === category ? { ...budget, spent } : budget
      ),
    })),
}))

