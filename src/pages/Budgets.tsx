import { useState } from 'react'
import { Pencil, Plus, Target, Trash2, Wallet } from 'lucide-react'
import { useDemo } from '../lib/store'
import { money } from '../lib/data'
import type { Budget } from '../lib/data'
import { Confirm, Empty, Modal, PageHeader } from '../components/UI'
export default function Budgets() {
  const { data, update, toast } = useDemo()
  const [editing, setEditing] = useState<Budget | 'new' | null>(null)
  const [removing, setRemoving] = useState<Budget | null>(null)
  const [name, setName] = useState('')
  const [limit, setLimit] = useState('')
  const total = data.budgets.reduce((sum, b) => sum + b.limit, 0),
    spent = data.budgets.reduce((sum, b) => sum + b.spent, 0)
  function open(b: Budget | 'new') {
    setEditing(b)
    setName(b === 'new' ? '' : b.name)
    setLimit(b === 'new' ? '' : String(b.limit))
  }
  return (
    <>
      <PageHeader
        title="A plan for what matters."
        description="Give your spending some direction, and your next idea a little room."
      >
        <button className="primary-button" onClick={() => open('new')}>
          <Plus size={16} />
          Create budget
        </button>
      </PageHeader>
      <section className="budget-summary panel">
        <span className="stat-icon">
          <Target size={24} />
        </span>
        <div>
          <small>October budget plan</small>
          <strong>
            {money(spent)} <span>of {money(total)} used</span>
          </strong>
        </div>
        <div className="summary-progress">
          <div>
            <span>{total ? Math.round((spent / total) * 100) : 0}% allocated spending</span>
            <strong className={total - spent < 0 ? 'negative' : 'positive'}>
              {money(total - spent)} {total - spent < 0 ? 'over budget' : 'remaining'}
            </strong>
          </div>
          <div className="progress-track">
            <span style={{ width: `${total ? Math.min(100, (spent / total) * 100) : 0}%` }} />
          </div>
        </div>
      </section>
      <div className="budgets-grid">
        {data.budgets.map((b) => {
          const ratio = b.spent / b.limit
          return (
            <section className="panel budget-card" key={b.id}>
              <div className="budget-card-top">
                <span className="stat-icon" style={{ color: b.color, background: `${b.color}15` }}>
                  <Wallet size={21} />
                </span>
                <div>
                  <button
                    className="icon-button"
                    aria-label={`Edit ${b.name}`}
                    onClick={() => open(b)}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label={`Delete ${b.name}`}
                    onClick={() => setRemoving(b)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h2>{b.name}</h2>
              <p>Monthly budget · October 2026</p>
              <div className="budget-values">
                <strong>{money(b.spent)}</strong>
                <span>of {money(b.limit)}</span>
              </div>
              <div className="progress-track">
                <span
                  style={{
                    width: `${Math.min(ratio * 100, 100)}%`,
                    background: ratio >= 1 ? 'var(--red)' : b.color,
                  }}
                />
              </div>
              <div className="budget-bottom">
                <span
                  className={`badge ${ratio >= 1 ? 'declined' : ratio >= 0.75 ? 'pending' : 'completed'}`}
                >
                  <i />
                  {ratio >= 1 ? 'Over budget' : ratio >= 0.75 ? 'Keep an eye on it' : 'On track'}
                </span>
                <span>{Math.round(ratio * 100)}% used</span>
              </div>
            </section>
          )
        })}
      </div>
      {!data.budgets.length && (
        <section className="panel">
          <Empty
            title="Room for a fresh start."
            text="Create your first budget to give your spending a direction."
          />
        </section>
      )}
      <div className="info-strip">
        <Target size={21} />
        <div>
          <strong>Progress over perfection.</strong>
          <p>
            Budget spending is an illustrative snapshot, tracked separately from the transaction
            sample. Adjust limits and explore different plans.
          </p>
        </div>
      </div>
      {editing && (
        <Modal
          title={editing === 'new' ? 'Make room for a new goal.' : `Edit ${editing.name}`}
          description="Set a monthly spending limit for this category."
          onClose={() => setEditing(null)}
        >
          <form
            className="modal-form"
            onSubmit={(e) => {
              e.preventDefault()
              const clean = name.trim(),
                amount = Number(limit)
              if (!clean || !Number.isFinite(amount) || amount <= 0 || amount > 1000000) return
              update((prev) => ({
                ...prev,
                budgets:
                  editing === 'new'
                    ? [
                        ...prev.budgets,
                        {
                          id: crypto.randomUUID(),
                          name: clean,
                          limit: amount,
                          spent: 0,
                          color: '#408bfb',
                        },
                      ]
                    : prev.budgets.map((b) =>
                        b.id === editing.id ? { ...b, name: clean, limit: amount } : b,
                      ),
              }))
              setEditing(null)
              toast(editing === 'new' ? 'Your new budget is ready.' : 'Budget updated.')
            }}
          >
            <label>
              Budget name
              <input
                required
                maxLength={40}
                value={name}
                pattern=".*\S.*"
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Team experiences"
              />
            </label>
            <label>
              Monthly limit (USD)
              <input
                type="number"
                min="1"
                max="1000000"
                step="0.01"
                required
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="1000"
              />
            </label>
            <footer>
              <button type="button" className="secondary-button" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button className="primary-button">
                {editing === 'new' ? 'Create budget' : 'Save changes'}
              </button>
            </footer>
          </form>
        </Modal>
      )}
      {removing && (
        <Confirm
          title={`Delete ${removing.name}?`}
          description={`This removes the ${money(removing.limit)} monthly budget and its sample spending from this browser. Transactions will stay in your workspace.`}
          label="Delete budget"
          onClose={() => setRemoving(null)}
          onConfirm={() => {
            update((prev) => ({
              ...prev,
              budgets: prev.budgets.filter((b) => b.id !== removing.id),
            }))
            toast('Budget deleted.')
          }}
        />
      )}
    </>
  )
}
