import { useState } from 'react'
import { ChevronLeft, ChevronRight, Download, Search, X } from 'lucide-react'
import { useDemo } from '../lib/store'
import { csv, dateLabel, filterTransactions, money } from '../lib/data'
import type { Transaction } from '../lib/data'
import { CategoryIcon, downloadFile, Empty, Modal, PageHeader } from '../components/UI'
export default function Transactions() {
  const { data, toast } = useDemo()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All statuses')
  const [category, setCategory] = useState('All categories')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Transaction | null>(null)
  const [sort, setSort] = useState<'date' | 'amount'>('date')
  const rows = filterTransactions(data.transactions, query, status, category).sort((a, b) =>
    sort === 'date' ? b.date.localeCompare(a.date) : b.amount - a.amount,
  )
  const pageCount = Math.max(1, Math.ceil(rows.length / 8))
  const visible = rows.slice((page - 1) * 8, page * 8)
  const filtered = query || status !== 'All statuses' || category !== 'All categories'
  function clear() {
    setQuery('')
    setStatus('All statuses')
    setCategory('All categories')
    setPage(1)
  }
  return (
    <>
      <PageHeader
        title="Every movement, in view."
        description="A searchable story of what comes in and what goes out."
      >
        <button
          className="secondary-button"
          onClick={() => {
            downloadFile(csv(rows), 'aurelia-transactions.csv')
            toast(`Exported ${rows.length} matching transactions.`)
          }}
        >
          <Download size={15} />
          Export CSV
        </button>
      </PageHeader>
      <section className="panel">
        <div className="filter-toolbar">
          <label className="search-field">
            <Search size={17} />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              placeholder="Search transactions…"
              aria-label="Search transactions"
            />
          </label>
          <select
            aria-label="Filter by status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
          >
            {['All statuses', 'Completed', 'Pending', 'Declined'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            aria-label="Filter by category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value)
              setPage(1)
            }}
          >
            {[
              'All categories',
              'Income',
              'Software',
              'Shopping',
              'Travel',
              'Food & drink',
              'Transfers',
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            aria-label="Sort transactions"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as 'date' | 'amount')
              setPage(1)
            }}
          >
            <option value="date">Newest first</option>
            <option value="amount">Amount: high to low</option>
          </select>
          {filtered && (
            <button className="text-button" onClick={clear}>
              <X size={14} />
              Clear
            </button>
          )}
        </div>
        <div className="table-heading">
          <strong>
            All transactions <span>{rows.length}</span>
          </strong>
          <small>USD · October 2026</small>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Category</th>
                <th>Date</th>
                <th>Account</th>
                <th>Status</th>
                <th className="text-right">Amount</th>
                <th>
                  <span className="sr-only">Details</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div className="merchant-cell">
                      <CategoryIcon category={t.category} />
                      <div>
                        <button className="merchant-button" onClick={() => setSelected(t)}>
                          {t.merchant}
                        </button>
                        <small>{t.description}</small>
                      </div>
                    </div>
                  </td>
                  <td>{t.category}</td>
                  <td>{dateLabel(t.date)}</td>
                  <td>{t.account}</td>
                  <td>
                    <span className={`badge ${t.status.toLowerCase()}`}>
                      <i />
                      {t.status}
                    </span>
                  </td>
                  <td className={`text-right amount ${t.amount > 0 ? 'positive' : ''}`}>
                    {t.amount > 0 ? '+' : ''}
                    {money(t.amount)}
                  </td>
                  <td>
                    <button
                      className="icon-button"
                      aria-label={`View ${t.id}`}
                      onClick={() => setSelected(t)}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && <Empty />}
        <div className="pagination">
          <span>
            {rows.length
              ? `Showing ${(page - 1) * 8 + 1}–${Math.min(page * 8, rows.length)} of ${rows.length} transactions`
              : '0 transactions'}
          </span>
          <div>
            <button
              className="icon-button"
              aria-label="Previous page"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft size={17} />
            </button>
            <span>
              Page {page} of {pageCount}
            </span>
            <button
              className="icon-button"
              aria-label="Next page"
              disabled={page >= pageCount}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>
      <p className="page-note">
        All names, transactions, and account details are fictional and provided for demonstration.
      </p>
      {selected && (
        <Modal
          title="Transaction details"
          description={selected.id}
          onClose={() => setSelected(null)}
        >
          <div className="transaction-detail">
            <CategoryIcon category={selected.category} />
            <h3>{selected.merchant}</h3>
            <strong className={selected.amount > 0 ? 'positive' : ''}>
              {selected.amount > 0 ? '+' : ''}
              {money(selected.amount)}
            </strong>
            <span className={`badge ${selected.status.toLowerCase()}`}>{selected.status}</span>
            <dl>
              {[
                ['Description', selected.description],
                ['Date', dateLabel(selected.date)],
                ['Category', selected.category],
                ['Account', selected.account],
                ['Reference', selected.id],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Modal>
      )}
    </>
  )
}
