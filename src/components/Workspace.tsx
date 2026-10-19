import { Suspense, useEffect, useState } from 'react'
import { Link, Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  ArrowLeftRight,
  ArrowUpRight,
  ChartPie,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import { useDemo } from '../lib/store'
import { Brand, Confirm } from './UI'
import ThemeButton from './ThemeButton'
import AppErrorBoundary from './AppErrorBoundary'
const navigation = [
  { label: 'Overview', path: '/app', icon: LayoutDashboard },
  { label: 'Transactions', path: '/app/transactions', icon: ArrowLeftRight },
  { label: 'Accounts & cards', path: '/app/accounts', icon: CreditCard },
  { label: 'Budgets', path: '/app/budgets', icon: ChartPie },
]
export default function Workspace() {
  const { authenticated, data, logout } = useDemo()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobile, setMobile] = useState(false)
  const [narrow, setNarrow] = useState(() => window.matchMedia('(max-width: 760px)').matches)
  const [signout, setSignout] = useState(false)
  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)')
    const sync = () => setNarrow(media.matches)
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])
  useEffect(() => {
    setMobile(false)
  }, [location.pathname])
  if (!authenticated) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  const title =
    navigation.find((item) => item.path === location.pathname)?.label || 'Settings & security'
  return (
    <div className={`app-shell ${collapsed ? 'collapsed' : ''}`}>
      <aside
        id="workspace-navigation"
        inert={narrow && !mobile}
        className={`sidebar ${mobile ? 'mobile-open' : ''}`}
      >
        <div className="brand-row">
          <Link to="/" aria-label="Aurelia home">
            <Brand compact={collapsed} />
          </Link>
          <button
            className="icon-button collapse-button"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
          <button
            className="icon-button mobile-close"
            aria-label="Close navigation"
            onClick={() => setMobile(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="workspace-label">
          <span className="workspace-icon">M</span>
          <div>
            <strong>{data.profile.company}</strong>
            <small>Personal workspace</small>
          </div>
          <span className="tiny-pill">PRO</span>
        </div>
        <nav className="sidebar-nav">
          <span className="nav-section">WORKSPACE</span>
          {navigation.map(({ label, path, icon: Icon }) => (
            <NavLink
              className="nav-item"
              end={path === '/app'}
              to={path}
              key={path}
              title={collapsed ? label : undefined}
            >
              <Icon size={19} />
              <span>{label}</span>
              {label === 'Transactions' && <small>{data.transactions.length}</small>}
            </NavLink>
          ))}
          <span className="nav-section management-label">MANAGEMENT</span>
          <NavLink
            className="nav-item"
            to="/app/settings"
            title={collapsed ? 'Settings & security' : undefined}
          >
            <ShieldCheck size={19} />
            <span>Settings & security</span>
          </NavLink>
        </nav>
        <div className="sidebar-demo">
          <Sparkles size={19} />
          <strong>A space to explore.</strong>
          <p>All data is fictional. Try things out and make it yours.</p>
          <Link to="/">
            About this demo
            <ArrowUpRight size={13} />
          </Link>
        </div>
        <div className="sidebar-footer">
          <Link to="/app/settings" className="sidebar-user">
            <span className="user-avatar">
              {data.profile.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </span>
            <span className="user-copy">
              <strong>{data.profile.name}</strong>
              <small>Demo account</small>
            </span>
          </Link>
          <button className="icon-button" aria-label="Sign out" onClick={() => setSignout(true)}>
            <LogOut size={17} />
          </button>
        </div>
      </aside>
      {mobile && (
        <button
          className="mobile-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <main className="main-area">
        <header className="topbar">
          <div>
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              aria-controls="workspace-navigation"
              aria-expanded={mobile}
              onClick={() => setMobile(true)}
            >
              <Menu size={20} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{title}</strong>
          </div>
          <div>
            <span className="status-pill">
              <i />
              Demo workspace
            </span>
            <ThemeButton />
            <Link className="top-avatar" to="/app/settings" aria-label="Open profile">
              {data.profile.name[0]}
            </Link>
          </div>
        </header>
        <div className="content-area">
          <AppErrorBoundary key={location.pathname}>
            <Suspense
              fallback={
                <div className="route-pending" role="status">
                  Loading your workspace…
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </AppErrorBoundary>
        </div>
        <footer className="workspace-footer">
          <span>© 2026 Aurelia Finance</span>
          <span>Fictional data · USD · October 2026 snapshot</span>
        </footer>
      </main>
      {signout && (
        <Confirm
          title="Sign out of Aurelia?"
          description="Your demo changes will stay in this browser. Use the demo credentials to sign back in."
          label="Sign out"
          onClose={() => setSignout(false)}
          onConfirm={logout}
        />
      )}
    </div>
  )
}
