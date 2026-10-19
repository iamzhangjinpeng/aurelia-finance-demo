import { useState } from 'react'
import {
  CreditCard,
  LockKeyhole,
  Pencil,
  Plus,
  ShieldCheck,
  Snowflake,
  Wallet,
  Wifi,
} from 'lucide-react'
import { useDemo } from '../lib/store'
import { money, summarize } from '../lib/data'
import type { Card } from '../lib/data'
import { Confirm, Modal, PageHeader } from '../components/UI'
export default function Accounts() {
  const { data, update, toast } = useDemo()
  const [freeze, setFreeze] = useState<Card | null>(null)
  const [editing, setEditing] = useState<Card | null>(null)
  const [limit, setLimit] = useState('')
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const totals = summarize(data.transactions)
  return (
    <>
      <PageHeader
        title="Your money, well connected."
        description="Accounts that keep you grounded. Cards that keep you moving."
      >
        <button
          className="primary-button"
          onClick={() => {
            setCreating(true)
            setName('')
            setError('')
          }}
        >
          <Plus size={16} />
          Create virtual card
        </button>
      </PageHeader>
      <div className="account-grid">
        {[
          {
            title: 'Business checking',
            number: '•••• 7210',
            value: totals.balance - 10200,
            icon: Wallet,
          },
          { title: 'Studio reserve', number: '•••• 8432', value: 10200, icon: ShieldCheck },
        ].map(({ title, number, value, icon: Icon }) => (
          <section className="panel account-panel" key={title}>
            <div>
              <span className="stat-icon">
                <Icon size={22} />
              </span>
              <span className="badge completed">
                <i />
                Active
              </span>
            </div>
            <h2>{title}</h2>
            <p>
              Aurelia demo account <span>{number}</span>
            </p>
            <strong>{money(value)}</strong>
            <small>Available balance · USD</small>
          </section>
        ))}
      </div>
      <div className="section-title">
        <div>
          <h2>Your cards</h2>
          <p>A little control, wherever you go.</p>
        </div>
        <span className="muted">{data.cards.length} virtual cards</span>
      </div>
      <div className="cards-grid">
        {data.cards.map((card) => (
          <section className="panel card-panel" key={card.id}>
            <div className={`bank-card ${card.style} ${card.frozen ? 'frozen' : ''}`}>
              <div>
                <strong>
                  Aurelia<span>BUSINESS</span>
                </strong>
                {card.frozen ? <Snowflake size={22} /> : <Wifi size={23} />}
              </div>
              <div className="card-chip">
                <i />
                <i />
                <i />
              </div>
              <span className="card-number">•••• &nbsp; •••• &nbsp; •••• &nbsp; {card.last4}</span>
              <div className="card-bottom">
                <span>
                  {card.holder}
                  <small>VIRTUAL · EXPIRES 12/29</small>
                </span>
                <span className="card-network">
                  <i />
                  <i />
                </span>
              </div>
              {card.frozen && (
                <span className="frozen-stamp">
                  <Snowflake size={13} />
                  FROZEN
                </span>
              )}
            </div>
            <div className="card-info">
              <div>
                <h3>{card.name}</h3>
                <span className={`badge ${card.frozen ? 'pending' : 'completed'}`}>
                  <i />
                  {card.frozen ? 'Frozen' : 'Active'}
                </span>
              </div>
              <div className="card-spend">
                <span>Monthly spending</span>
                <strong>
                  {money(card.spent)} <small>/ {money(card.limit)}</small>
                </strong>
              </div>
              <div className="progress-track">
                <span style={{ width: `${Math.min((card.spent / card.limit) * 100, 100)}%` }} />
              </div>
              <div className="card-actions">
                <button className="secondary-button" onClick={() => setFreeze(card)}>
                  <Snowflake size={15} />
                  {card.frozen ? 'Unfreeze card' : 'Freeze card'}
                </button>
                <button
                  className="secondary-button"
                  onClick={() => {
                    setEditing(card)
                    setLimit(String(card.limit))
                    setError('')
                  }}
                >
                  <Pencil size={14} />
                  Edit limit
                </button>
              </div>
            </div>
          </section>
        ))}
      </div>
      <div className="info-strip">
        <LockKeyhole size={19} />
        <div>
          <strong>Designed for peace of mind.</strong>
          <p>
            These virtual cards are fictional. No real card numbers, bank connections, or payments
            are involved.
          </p>
        </div>
      </div>
      {freeze && (
        <Confirm
          title={`${freeze.frozen ? 'Unfreeze' : 'Freeze'} ${freeze.name}?`}
          description={`Card ending ${freeze.last4} will ${freeze.frozen ? 'be marked active again' : 'be marked frozen in this demo'}. You can reverse this at any time.`}
          label={freeze.frozen ? 'Unfreeze card' : 'Freeze card'}
          onClose={() => setFreeze(null)}
          onConfirm={() => {
            update((prev) => ({
              ...prev,
              cards: prev.cards.map((c) => (c.id === freeze.id ? { ...c, frozen: !c.frozen } : c)),
            }))
            toast(`${freeze.name} ${freeze.frozen ? 'unfrozen' : 'frozen'}.`)
          }}
        />
      )}
      {editing && (
        <Modal
          title={`Edit ${editing.name} limit`}
          description={`Monthly spending limit for card ending ${editing.last4}.`}
          onClose={() => setEditing(null)}
        >
          <form
            className="modal-form"
            onSubmit={(e) => {
              e.preventDefault()
              const value = Number(limit)
              if (!Number.isFinite(value) || value < editing.spent || value > 100000) {
                setError(`Enter a limit between ${money(editing.spent)} and $100,000.`)
                return
              }
              update((prev) => ({
                ...prev,
                cards: prev.cards.map((c) => (c.id === editing.id ? { ...c, limit: value } : c)),
              }))
              setEditing(null)
              toast('Card spending limit updated.')
            }}
          >
            <label>
              Monthly limit (USD)
              <input
                type="number"
                required
                min={editing.spent}
                max="100000"
                step="0.01"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
              />
            </label>
            {error && (
              <div className="error-banner" role="alert">
                {error}
              </div>
            )}
            <footer>
              <button type="button" className="secondary-button" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button className="primary-button">Save limit</button>
            </footer>
          </form>
        </Modal>
      )}
      {creating && (
        <Modal
          title="A card for your next chapter."
          description="Create a fictional virtual card in this workspace."
          onClose={() => setCreating(false)}
        >
          <form
            className="modal-form"
            onSubmit={(e) => {
              e.preventDefault()
              const clean = name.trim()
              if (!clean) {
                setError('Give your card a name.')
                return
              }
              update((prev) => ({
                ...prev,
                cards: [
                  ...prev.cards,
                  {
                    id: crypto.randomUUID(),
                    name: clean,
                    last4: String(2000 + prev.cards.length * 173),
                    holder: prev.profile.name.toUpperCase(),
                    spent: 0,
                    limit: 5000,
                    frozen: false,
                    style: prev.cards.length % 2 ? 'midnight' : 'violet',
                  },
                ],
              }))
              setCreating(false)
              toast('Your virtual demo card is ready.')
            }}
          >
            <label>
              Card name
              <input
                required
                maxLength={35}
                placeholder="e.g. Marketing tools"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <p className="muted">Starts with a $5,000 monthly limit. You can adjust it anytime.</p>
            {error && <div className="error-banner">{error}</div>}
            <footer>
              <button type="button" className="secondary-button" onClick={() => setCreating(false)}>
                Cancel
              </button>
              <button className="primary-button">
                <CreditCard size={15} />
                Create card
              </button>
            </footer>
          </form>
        </Modal>
      )}
    </>
  )
}
