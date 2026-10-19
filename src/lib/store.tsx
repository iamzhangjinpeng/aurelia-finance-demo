import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { seed } from './data'
import type { DemoData } from './data'
const DATA_KEY = 'aurelia-demo-data-v1'
const AUTH_KEY = 'aurelia-demo-session'
function initialData(): DemoData {
  try {
    const raw = JSON.parse(localStorage.getItem(DATA_KEY) || 'null')
    if (
      raw &&
      Array.isArray(raw.transactions) &&
      Array.isArray(raw.cards) &&
      Array.isArray(raw.budgets) &&
      typeof raw.profile?.name === 'string' &&
      typeof raw.profile?.company === 'string'
    )
      return raw
  } catch {
    /* Restore a damaged demo snapshot. */
  }
  return structuredClone(seed)
}
type Store = {
  data: DemoData
  update: (fn: (prev: DemoData) => DemoData) => void
  reset: () => void
  authenticated: boolean
  login: () => void
  logout: () => void
  toast: (message: string) => void
}
const Context = createContext<Store | null>(null)
export function DemoProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(initialData)
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem(AUTH_KEY) === 'active',
  )
  const [message, setMessage] = useState('')
  function update(fn: (prev: DemoData) => DemoData) {
    setData((prev) => {
      const next = fn(prev)
      localStorage.setItem(DATA_KEY, JSON.stringify(next))
      return next
    })
  }
  function reset() {
    const next = structuredClone(seed)
    setData(next)
    localStorage.removeItem(DATA_KEY)
    setMessage('Demo workspace restored to its original data.')
  }
  return (
    <Context.Provider
      value={{
        data,
        update,
        reset,
        authenticated,
        login: () => {
          sessionStorage.setItem(AUTH_KEY, 'active')
          setAuthenticated(true)
        },
        logout: () => {
          sessionStorage.removeItem(AUTH_KEY)
          setAuthenticated(false)
        },
        toast: setMessage,
      }}
    >
      {children}
      {message && (
        <div className="toast" role="status">
          {message}
          <button aria-label="Dismiss notification" onClick={() => setMessage('')}>
            ×
          </button>
        </div>
      )}
    </Context.Provider>
  )
}
export function useDemo() {
  const value = useContext(Context)
  if (!value) throw new Error('DemoProvider missing')
  return value
}
