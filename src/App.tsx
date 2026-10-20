import { lazy, useEffect } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { DemoProvider } from './lib/store'
import { Brand } from './components/UI'
import Workspace from './components/Workspace'
import Landing from './pages/Landing'
import Login from './pages/Login'
import AppErrorBoundary from './components/AppErrorBoundary'
const Overview = lazy(() => import('./pages/Overview'))
const Transactions = lazy(() => import('./pages/Transactions'))
const Accounts = lazy(() => import('./pages/Accounts'))
const Budgets = lazy(() => import('./pages/Budgets'))
const Settings = lazy(() => import('./pages/Settings'))
function AppRoutes() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1))
      target?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
      })
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }
  }, [pathname, hash])
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/app" element={<Workspace />}>
        <Route index element={<Overview />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="budgets" element={<Budgets />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route
        path="*"
        element={
          <main className="not-found">
            <Brand />
            <h1>Looks like a wrong turn.</h1>
            <p>This page doesn’t exist. Your workspace is just a click away.</p>
            <Link className="primary-button" to="/">
              Back to home
              <ArrowRight size={16} />
            </Link>
          </main>
        }
      />
    </Routes>
  )
}

export default function App() {
  return (
    <AppErrorBoundary>
      <DemoProvider>
        <AppRoutes />
      </DemoProvider>
    </AppErrorBoundary>
  )
}
