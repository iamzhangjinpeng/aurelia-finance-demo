export const DEMO_EMAIL = 'demo@aurelia.finance'
export const DEMO_PASSWORD = 'Aurelia2026!'
export const SNAPSHOT = 'October 19, 2026'
export type Category = 'Income' | 'Software' | 'Shopping' | 'Travel' | 'Food & drink' | 'Transfers'
export type Transaction = {
  id: string
  merchant: string
  description: string
  category: Category
  date: string
  amount: number
  status: 'Completed' | 'Pending' | 'Declined'
  account: string
}
export type Card = {
  id: string
  name: string
  last4: string
  holder: string
  limit: number
  spent: number
  frozen: boolean
  style: string
}
export type Budget = { id: string; name: string; spent: number; limit: number; color: string }
export type DemoData = {
  transactions: Transaction[]
  cards: Card[]
  budgets: Budget[]
  profile: { name: string; company: string }
  notifications: boolean
}
export const seed: DemoData = {
  transactions: [
    {
      id: 'TX-1048',
      merchant: 'Northstar Studio',
      description: 'October retainer · Invoice #048',
      category: 'Income',
      date: '2026-10-19',
      amount: 4800,
      status: 'Completed',
      account: 'Business checking',
    },
    {
      id: 'TX-1047',
      merchant: 'Figma',
      description: 'Professional plan · 3 seats',
      category: 'Software',
      date: '2026-10-19',
      amount: -45,
      status: 'Completed',
      account: 'Business card',
    },
    {
      id: 'TX-1046',
      merchant: 'Blue Bottle Coffee',
      description: 'Team catch-up',
      category: 'Food & drink',
      date: '2026-10-18',
      amount: -28.5,
      status: 'Completed',
      account: 'Business card',
    },
    {
      id: 'TX-1045',
      merchant: 'Apple',
      description: 'Studio equipment',
      category: 'Shopping',
      date: '2026-10-18',
      amount: -1299,
      status: 'Pending',
      account: 'Business card',
    },
    {
      id: 'TX-1044',
      merchant: 'Linear',
      description: 'Business subscription',
      category: 'Software',
      date: '2026-10-17',
      amount: -32,
      status: 'Completed',
      account: 'Business card',
    },
    {
      id: 'TX-1043',
      merchant: 'Lighthouse Labs',
      description: 'Brand strategy · Invoice #047',
      category: 'Income',
      date: '2026-10-16',
      amount: 3250,
      status: 'Completed',
      account: 'Business checking',
    },
    {
      id: 'TX-1042',
      merchant: 'United Airlines',
      description: 'Client workshop',
      category: 'Travel',
      date: '2026-10-15',
      amount: -482.2,
      status: 'Completed',
      account: 'Travel card',
    },
    {
      id: 'TX-1041',
      merchant: 'Notion',
      description: 'Workspace subscription',
      category: 'Software',
      date: '2026-10-14',
      amount: -24,
      status: 'Completed',
      account: 'Business card',
    },
    {
      id: 'TX-1040',
      merchant: 'Sweetgreen',
      description: 'Working lunch',
      category: 'Food & drink',
      date: '2026-10-13',
      amount: -36.8,
      status: 'Completed',
      account: 'Business card',
    },
    {
      id: 'TX-1039',
      merchant: 'Reserve transfer',
      description: 'Monthly savings allocation',
      category: 'Transfers',
      date: '2026-10-12',
      amount: -1500,
      status: 'Completed',
      account: 'Business checking',
    },
    {
      id: 'TX-1038',
      merchant: 'Webflow',
      description: 'Site plan renewal',
      category: 'Software',
      date: '2026-10-11',
      amount: -29,
      status: 'Declined',
      account: 'Business card',
    },
    {
      id: 'TX-1037',
      merchant: 'Evergreen Co.',
      description: 'Product design · Invoice #046',
      category: 'Income',
      date: '2026-10-10',
      amount: 6200,
      status: 'Completed',
      account: 'Business checking',
    },
    {
      id: 'TX-1036',
      merchant: 'The Hoxton',
      description: 'Two-night business stay',
      category: 'Travel',
      date: '2026-10-09',
      amount: -340,
      status: 'Completed',
      account: 'Travel card',
    },
    {
      id: 'TX-1035',
      merchant: 'Adobe',
      description: 'Creative Cloud subscription',
      category: 'Software',
      date: '2026-10-08',
      amount: -59.99,
      status: 'Completed',
      account: 'Business card',
    },
    {
      id: 'TX-1034',
      merchant: 'Amazon',
      description: 'Office supplies',
      category: 'Shopping',
      date: '2026-10-07',
      amount: -112.4,
      status: 'Completed',
      account: 'Business card',
    },
    {
      id: 'TX-1033',
      merchant: 'Atlas Digital',
      description: 'Website delivery · Invoice #045',
      category: 'Income',
      date: '2026-10-05',
      amount: 4200,
      status: 'Completed',
      account: 'Business checking',
    },
  ],
  cards: [
    {
      id: 'card-1',
      name: 'Business card',
      last4: '4829',
      holder: 'ALEX MORGAN',
      limit: 10000,
      spent: 2847.6,
      frozen: false,
      style: 'violet',
    },
    {
      id: 'card-2',
      name: 'Travel card',
      last4: '9016',
      holder: 'ALEX MORGAN',
      limit: 5000,
      spent: 822.2,
      frozen: false,
      style: 'midnight',
    },
  ],
  budgets: [
    { id: 'budget-1', name: 'Software & tools', spent: 625, limit: 1000, color: '#6c5cff' },
    { id: 'budget-2', name: 'Travel & stays', spent: 822.2, limit: 1500, color: '#408bfb' },
    { id: 'budget-3', name: 'Food & team', spent: 468, limit: 600, color: '#e69738' },
    { id: 'budget-4', name: 'Equipment', spent: 1411.4, limit: 2000, color: '#c36ce5' },
  ],
  profile: { name: 'Alex Morgan', company: 'Morgan Design Studio' },
  notifications: true,
}
export const cashflow = [
  { name: 'May', income: 12400, expenses: 6900 },
  { name: 'Jun', income: 15300, expenses: 8100 },
  { name: 'Jul', income: 13800, expenses: 7200 },
  { name: 'Aug', income: 19200, expenses: 9800 },
  { name: 'Sep', income: 16450, expenses: 8450 },
  { name: 'Oct', income: 18450, expenses: 7620 },
]
export function money(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)
}
export function dateLabel(value: string) {
  return new Date(`${value}T12:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
export function filterTransactions(
  rows: Transaction[],
  query: string,
  status: string,
  category: string,
) {
  const q = query.trim().toLowerCase()
  return rows.filter(
    (row) =>
      (!q || `${row.merchant} ${row.description} ${row.id}`.toLowerCase().includes(q)) &&
      (status === 'All statuses' || row.status === status) &&
      (category === 'All categories' || row.category === category),
  )
}
export function summarize(rows: Transaction[]) {
  const completed = rows.filter((row) => row.status === 'Completed')
  const income = completed.reduce((sum, row) => sum + Math.max(row.amount, 0), 0)
  const expenses = completed.reduce((sum, row) => sum + Math.max(-row.amount, 0), 0)
  return { income, expenses, balance: 25650 + income - expenses, savings: income - expenses }
}
export function csv(rows: Transaction[]) {
  const cell = (value: unknown) => `"${String(value).replace(/"/g, '""')}"`
  return [
    ['ID', 'Merchant', 'Category', 'Date', 'Amount (USD)', 'Status', 'Account'],
    ...rows.map((r) => [r.id, r.merchant, r.category, r.date, r.amount, r.status, r.account]),
  ]
    .map((row) => row.map(cell).join(','))
    .join('\r\n')
}
