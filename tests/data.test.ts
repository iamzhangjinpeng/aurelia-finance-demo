import { describe, expect, it } from 'vitest'
import { csv, filterTransactions, seed, summarize } from '../src/lib/data'
import type { Transaction } from '../src/lib/data'

describe('Finance reporting', () => {
  it('counts only settled funds and keeps the account balance consistent', () => {
    const totals = summarize(seed.transactions)
    expect(totals.income).toBe(18450)
    expect(totals.expenses).toBeCloseTo(2660.89, 2)
    expect(totals.balance).toBeCloseTo(41439.11, 2)
    expect(totals.savings).toBeCloseTo(15789.11, 2)
  })
  it('does not deduct pending or declined payments', () => {
    const rows = seed.transactions.filter((row) => row.status !== 'Completed')
    expect(summarize(rows)).toEqual({ income: 0, expenses: 0, balance: 25650, savings: 0 })
  })
  it('combines text search, status, and category without mutating the source', () => {
    const original = structuredClone(seed.transactions)
    const rows = filterTransactions(seed.transactions, ' FIGMA ', 'Completed', 'Software')
    expect(rows.map((row) => row.id)).toEqual(['TX-1047'])
    expect(filterTransactions(seed.transactions, 'figma', 'Pending', 'Software')).toEqual([])
    expect(seed.transactions).toEqual(original)
  })
  it('finds reference IDs and handles an empty result', () => {
    expect(
      filterTransactions(seed.transactions, 'tx-1048', 'All statuses', 'All categories'),
    ).toHaveLength(1)
    expect(
      filterTransactions(seed.transactions, 'does not exist', 'All statuses', 'All categories'),
    ).toEqual([])
  })
  it('escapes commas, quotation marks, and newlines in exported CSV', () => {
    const row: Transaction = { ...seed.transactions[0], merchant: 'Studio, "North"\nDesign' }
    const exported = csv([row])
    expect(exported).toContain('"Studio, ""North""\nDesign"')
    expect(exported).toContain('"4800"')
    expect(csv([])).toBe('"ID","Merchant","Category","Date","Amount (USD)","Status","Account"')
  })
})
