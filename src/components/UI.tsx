import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import {
  X,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  ShoppingBag,
  Plane,
  Coffee,
  Layers,
  ArrowLeftRight,
} from 'lucide-react'
import type { Category } from '../lib/data'
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand">
      <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width="39" height="39" />
      {!compact && (
        <span>
          <strong>
            Aurelia<span className="brand-period">.</span>
          </strong>
          <small>FINANCE WORKSPACE</small>
        </span>
      )}
    </span>
  )
}
export function PageHeader({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children?: ReactNode
}) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="page-actions">{children}</div>
    </div>
  )
}
export function Modal({
  title,
  description,
  children,
  onClose,
  confirm = false,
}: {
  title: string
  description?: string
  children: ReactNode
  onClose: () => void
  confirm?: boolean
}) {
  const dialog = useRef<HTMLElement>(null)
  const close = useRef(onClose)
  close.current = onClose
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.current?.focus()
    function handle(e: KeyboardEvent) {
      if (e.key === 'Escape') close.current()
      if (e.key === 'Tab') {
        const items = Array.from(
          dialog.current?.querySelectorAll<HTMLElement>('button,input,select,textarea,a[href]') ||
            [],
        ).filter((el) => !el.hasAttribute('disabled'))
        const first = items[0],
          last = items[items.length - 1]
        if (
          e.shiftKey &&
          (document.activeElement === first || document.activeElement === dialog.current)
        ) {
          e.preventDefault()
          last?.focus()
        } else if (
          !e.shiftKey &&
          (document.activeElement === last || document.activeElement === dialog.current)
        ) {
          e.preventDefault()
          first?.focus()
        }
      }
    }
    document.addEventListener('keydown', handle)
    return () => {
      document.removeEventListener('keydown', handle)
      document.body.style.overflow = original
      previous?.focus()
    }
  }, [])
  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <section
        ref={dialog}
        tabIndex={-1}
        className={`modal-card ${confirm ? 'confirm-modal' : ''}`}
        role={confirm ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby={description ? 'dialog-description' : undefined}
      >
        {confirm ? (
          <div className="confirm-icon">
            <AlertTriangle size={22} />
          </div>
        ) : null}
        <header>
          <div>
            <h2 id="dialog-title">{title}</h2>
            {description && <p id="dialog-description">{description}</p>}
          </div>
          <button className="icon-button" aria-label="Close dialog" onClick={onClose}>
            <X size={18} />
          </button>
        </header>
        {children}
      </section>
    </div>
  )
}
export function Confirm({
  title,
  description,
  label = 'Confirm',
  onClose,
  onConfirm,
}: {
  title: string
  description: string
  label?: string
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <Modal title={title} description={description} confirm onClose={onClose}>
      <footer>
        <button className="secondary-button" onClick={onClose}>
          Cancel
        </button>
        <button
          className="danger-button"
          onClick={() => {
            onConfirm()
            onClose()
          }}
        >
          {label}
        </button>
      </footer>
    </Modal>
  )
}
export function CategoryIcon({ category }: { category: Category }) {
  const Icon = {
    Income: ArrowDownLeft,
    Software: Layers,
    Shopping: ShoppingBag,
    Travel: Plane,
    'Food & drink': Coffee,
    Transfers: ArrowLeftRight,
  }[category]
  return (
    <span className={`merchant-icon ${category === 'Income' ? 'green' : ''}`}>
      <Icon size={18} />
    </span>
  )
}
export function Trend({ children }: { children: ReactNode }) {
  return (
    <span className="trend">
      <ArrowUpRight size={13} />
      {children}
    </span>
  )
}
export function Empty({
  title = 'No transactions found',
  text = 'Try another search or clear your filters.',
}: {
  title?: string
  text?: string
}) {
  return (
    <div className="empty-state">
      <Layers size={30} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  )
}
export function downloadFile(content: string, name: string, type = 'text/csv;charset=utf-8;') {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
