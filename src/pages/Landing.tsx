import { useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  ArrowLeftRight,
  BarChart3,
  ChartPie,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Target,
  Wallet,
} from 'lucide-react'
import { useDemo } from '../lib/store'
import { Brand } from '../components/UI'
import ThemeButton from '../components/ThemeButton'
import FluidBackground from '../components/FluidBackground'
import { useLandingMotion } from '../effects/useLandingMotion'
export default function Landing() {
  const { authenticated } = useDemo()
  const root = useRef<HTMLElement>(null)
  useLandingMotion(root)
  return (
    <main ref={root} className="landing">
      <header className="public-header">
        <Link to="/" aria-label="Aurelia home">
          <Brand />
        </Link>
        <nav>
          <a href="#experience">The experience</a>
          <a href="#features">Features</a>
          <ThemeButton />
          <Link className="secondary-button" to={authenticated ? '/app' : '/login'}>
            {authenticated ? 'Your workspace' : 'Sign in'}
            <ArrowUpRight size={14} />
          </Link>
        </nav>
      </header>
      <section className="hero">
        <FluidBackground />
        <div className="hero-grid" />
        <span className="hero-glow glow-one" />
        <span className="hero-glow glow-two" />
        <div className="hero-content">
          <span className="hero-badge">
            <span className="pulse" />A little clarity. A lot of possibility.
          </span>
          <h1>
            Your money.
            <br />
            <span className="gradient-text">A clearer perspective.</span>
          </h1>
          <p className="hero-tagline">A calmer place to manage your finances.</p>
          <p className="hero-description">
            See the bigger picture, stay on top of spending, and make room for what comes next. All
            in one beautifully simple workspace.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" to={authenticated ? '/app' : '/login'}>
              Explore the demo
              <ArrowRight size={17} />
            </Link>
            <a className="secondary-button" href="#experience">
              Take a closer look
              <ChevronRight size={16} />
            </a>
          </div>
          <div className="hero-note">
            <ShieldCheck size={14} />
            Fictional data · No bank connection · No signup needed
          </div>
        </div>
        <div className="floating-stat stat-left">
          <span className="stat-icon">
            <Wallet size={20} />
          </span>
          <div>
            <small>Total balance</small>
            <strong>$41,439.11</strong>
            <span className="positive">Your finances, at a glance</span>
          </div>
        </div>
        <div className="floating-stat stat-right">
          <span className="stat-icon green">
            <Target size={20} />
          </span>
          <div>
            <small>Building your next chapter</small>
            <strong>68% of savings goal</strong>
            <div className="progress-track">
              <span style={{ width: '68%', background: 'var(--green)' }} />
            </div>
          </div>
        </div>
      </section>
      <section id="experience" className="experience-section">
        <div className="section-intro reveal">
          <span className="eyebrow">LESS NOISE. MORE CLARITY.</span>
          <h2>
            Everything connects.
            <br />
            Everything makes sense.
          </h2>
          <p>From the first payment to your next milestone, see how your money moves.</p>
        </div>
        <Link
          to={authenticated ? '/app' : '/login'}
          className="workspace-preview reveal"
          aria-label="Explore the finance workspace"
        >
          <div className="preview-sidebar">
            <Brand compact />
            <LayoutDashboard />
            <ArrowLeftRight />
            <CreditCard />
            <ChartPie />
          </div>
          <div className="preview-main">
            <div className="preview-top">
              <span>Your workspace</span>
              <span className="status-pill">
                <i />
                Demo workspace
              </span>
            </div>
            <h3>
              Good morning, Alex <span>↗</span>
            </h3>
            <p>Here’s the bigger picture.</p>
            <div className="preview-metrics">
              {[
                ['Total balance', '$41,439'],
                ['Income', '$18,450'],
                ['Expenses', '$2,661'],
              ].map(([label, value]) => (
                <div key={label}>
                  <small>{label}</small>
                  <strong>{value}</strong>
                  <span>October 2026</span>
                </div>
              ))}
            </div>
            <div className="preview-chart">
              <div>
                <h4>Cash flow</h4>
                <small>Income & expenses over time</small>
              </div>
              <svg viewBox="0 0 700 160" role="img" aria-label="Illustrative cash flow trend">
                <defs>
                  <linearGradient id="preview-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop stopColor="#6c5cff" stopOpacity=".22" />
                    <stop offset="1" stopColor="#6c5cff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 120 C50 120 60 70 120 90 S220 120 280 65 S370 95 420 45 S530 70 580 30 S650 50 700 10 V160 H0Z"
                  fill="url(#preview-fill)"
                />
                <path
                  d="M0 120 C50 120 60 70 120 90 S220 120 280 65 S370 95 420 45 S530 70 580 30 S650 50 700 10"
                  stroke="#6c5cff"
                  fill="none"
                  strokeWidth="3"
                />
                <path
                  d="M0 145 C80 110 100 135 160 125 S260 150 320 110 S420 130 480 100 S580 120 700 75"
                  fill="none"
                  stroke="#408bfb"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                />
              </svg>
            </div>
          </div>
        </Link>
      </section>
      <section id="features" className="features-section">
        <div className="section-intro reveal">
          <span className="eyebrow">A WORKSPACE THAT WORKS FOR YOU</span>
          <h2>Small details. Big difference.</h2>
        </div>
        <div className="feature-grid">
          {[
            {
              icon: BarChart3,
              title: 'Know where you stand',
              text: 'A clear view of your balances, income, expenses, and the patterns behind them.',
            },
            {
              icon: ArrowLeftRight,
              title: 'Follow every movement',
              text: 'Search, filter, and explore transactions. Export the view you need in a single click.',
            },
            {
              icon: CreditCard,
              title: 'Keep cards in check',
              text: 'Manage virtual cards, adjust spending limits, and freeze a card when you need a pause.',
            },
            {
              icon: Target,
              title: 'Make space for your goals',
              text: 'Build thoughtful budgets and see exactly how much room you have left.',
            },
          ].map(({ icon: Icon, title, text }, i) => (
            <article className="feature-card reveal" key={title}>
              <span className="feature-number">0{i + 1}</span>
              <span className="stat-icon">
                <Icon size={22} />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="landing-cta">
        <FluidBackground cta />
        <div className="cta-content reveal">
          <Sparkles size={26} />
          <h2>A little more clarity starts here.</h2>
          <p>Step into Alex’s workspace and try it for yourself.</p>
          <Link className="primary-button" to={authenticated ? '/app' : '/login'}>
            Open the demo
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
      <footer className="public-footer">
        <Brand />
        <span>A React portfolio project. All financial data is fictional.</span>
        <span>Made for the details.</span>
      </footer>
    </main>
  )
}
