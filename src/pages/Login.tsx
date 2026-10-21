import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  ChartPie,
  Check,
  Eye,
  EyeOff,
  Globe2,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react'
import { useDemo } from '../lib/store'
import { DEMO_EMAIL, DEMO_PASSWORD } from '../lib/data'
import { Brand } from '../components/UI'
import ThemeButton from '../components/ThemeButton'
export default function Login() {
  const { authenticated, login } = useDemo()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState('')
  if (authenticated) return <Navigate to="/app" replace />
  return (
    <main className="login-shell">
      <div className="login-top">
        <Link to="/">← Back to home</Link>
        <ThemeButton />
      </div>
      <section className="login-stage">
        <div className="login-hero-panel">
          <div className="hero-grid" />
          <div className="hero-orbit" />
          <div className="hero-orbit orbit-two" />
          <div className="login-visual">
            <span className="visual-node node-left">
              <Wallet size={24} />
              <small>Your money</small>
            </span>
            <div className="visual-center">
              <ShieldCheck size={40} />
              <strong>Peace of mind.</strong>
              <small>One connected workspace</small>
            </div>
            <span className="visual-node node-right">
              <ChartPie size={24} />
              <small>Your perspective</small>
            </span>
            <svg viewBox="0 0 420 250" aria-hidden="true">
              <path d="M88 125 C140 30 280 30 332 125" />
              <path d="M88 125 C145 220 275 220 332 125" />
            </svg>
          </div>
          <div className="hero-caption">
            <h2>
              Your next chapter,
              <br />
              in a clearer light.
            </h2>
            <p>Good decisions start with a little perspective.</p>
          </div>
          <span className="login-visual-note">
            <Globe2 size={14} />
            An interactive portfolio experience
          </span>
        </div>
        <div className="login-form-panel">
          <Brand />
          <div className="login-copy">
            <span className="eyebrow">YOUR WORKSPACE AWAITS</span>
            <h1>Welcome back.</h1>
            <p>Sign in to see the bigger picture.</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
                setError('That email and password don’t match. Try the demo account below.')
                return
              }
              login()
              navigate(location.state?.from?.startsWith('/app') ? location.state.from : '/app', {
                replace: true,
              })
            }}
          >
            <label>
              Email address
              <input
                type="email"
                required
                autoComplete="username"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
              />
            </label>
            <label htmlFor="demo-password">Password</label>
            <span className="password-field">
              <input
                id="demo-password"
                type={visible ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
              />
              <button
                type="button"
                className="icon-button"
                aria-label={visible ? 'Hide password' : 'Show password'}
                onClick={() => setVisible(!visible)}
              >
                {visible ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
            {error && (
              <div className="error-banner" role="alert">
                {error}
              </div>
            )}
            <button className="primary-button login-button" type="submit">
              Sign in
              <ArrowRight size={17} />
            </button>
          </form>
          <div className="demo-credentials">
            <div>
              <Sparkles size={15} />
              <strong>Make yourself at home.</strong>
            </div>
            <p>
              Email: <code>{DEMO_EMAIL}</code>
              <br />
              Password: <code>{DEMO_PASSWORD}</code>
            </p>
            <button
              className="text-button"
              onClick={() => {
                setEmail(DEMO_EMAIL)
                setPassword(DEMO_PASSWORD)
                setError('')
              }}
            >
              Fill demo credentials
              <ArrowUpRight size={14} />
            </button>
          </div>
          <span className="login-footnote">
            <Check size={14} />
            Demo access only. No real financial services.
          </span>
        </div>
      </section>
    </main>
  )
}
