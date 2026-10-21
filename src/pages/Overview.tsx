import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Download,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useState } from 'react'
import { useDemo } from '../lib/store'
import { cashflow, csv, dateLabel, money, SNAPSHOT, summarize } from '../lib/data'
import { CategoryIcon, downloadFile, PageHeader, Trend } from '../components/UI'
export default function Overview() {
  const { data, toast } = useDemo()
  const totals = summarize(data.transactions)
  const [period, setPeriod] = useState('6M')
  const points = period === '3M' ? cashflow.slice(-3) : cashflow
  const spent = data.budgets.reduce((sum, b) => sum + b.spent, 0)
  return (
    <>
      <PageHeader
        title={`A clearer picture, ${data.profile.name.split(' ')[0]}.`}
        description={`Here’s how your money is moving. A little perspective goes a long way.`}
      >
        <span className="date-chip">
          <CalendarDays size={15} />
          {SNAPSHOT}
        </span>
        <button
          className="secondary-button"
          onClick={() => {
            downloadFile(csv(data.transactions), 'aurelia-workspace-report.csv')
            toast('Your workspace report has been exported.')
          }}
        >
          <Download size={15} />
          Export report
        </button>
      </PageHeader>
      <div className="welcome-banner">
        <span className="welcome-icon">
          <Sparkles size={21} />
        </span>
        <div>
          <strong>Your money has a story. Let’s make it a good one.</strong>
          <p>You’re exploring a fictional workspace. Every detail is here for you to try.</p>
        </div>
        <span className="outline-pill">OCTOBER SNAPSHOT</span>
      </div>
      <section className="stats-grid">
        {[
          {
            label: 'Total balance',
            value: totals.balance,
            icon: Wallet,
            note: 'Across your accounts',
            trend: 'Available funds',
            color: '',
          },
          {
            label: 'Income this month',
            value: totals.income,
            icon: ArrowDownLeft,
            note: 'Completed incoming payments',
            trend: '4 payments received',
            color: 'green',
          },
          {
            label: 'Expenses this month',
            value: totals.expenses,
            icon: ArrowUpRight,
            note: 'Completed outgoing payments',
            trend: 'Within your plan',
            color: 'blue',
          },
          {
            label: 'Net cash flow',
            value: totals.savings,
            icon: TrendingUp,
            note: 'Income less expenses',
            trend: 'A positive month',
            color: 'pink',
          },
        ].map(({ label, value, icon: Icon, note, trend, color }) => (
          <article className="stat-card" key={label}>
            <div className="stat-top">
              <span>{label}</span>
              <span className={`stat-icon ${color}`}>
                <Icon size={18} />
              </span>
            </div>
            <strong>{money(value)}</strong>
            <div className="stat-bottom">
              <Trend>{trend}</Trend>
            </div>
            <small>{note}</small>
          </article>
        ))}
      </section>
      <div className="dashboard-grid">
        <section className="panel cashflow-panel">
          <div className="panel-heading">
            <div>
              <h2>Cash flow</h2>
              <p>Illustrative history and October forecast, separate from settled balances.</p>
            </div>
            <div className="segmented">
              {['3M', '6M'].map((p) => (
                <button
                  key={p}
                  className={period === p ? 'active' : ''}
                  onClick={() => setPeriod(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="chart-summary">
            <div>
              <span className="legend-dot purple" />
              Income<strong>{money(18450)}</strong>
            </div>
            <div>
              <span className="legend-dot blue" />
              Expenses<strong>{money(7620)}</strong>
            </div>
            <span>October forecast</span>
          </div>
          <div
            className="cashflow-chart"
            role="img"
            aria-label="Monthly income and expenses from May through October 2026"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={points} margin={{ top: 12, right: 18, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6c5cff" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#6c5cff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--ink-3)', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  tickFormatter={(n) => `$${n / 1000}k`}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--ink-3)', fontSize: 11 }}
                  width={55}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    color: 'var(--ink)',
                  }}
                  formatter={(value) => money(Number(value))}
                />
                <Area
                  type="monotone"
                  name="Income"
                  dataKey="income"
                  stroke="#6c5cff"
                  fill="url(#income)"
                  strokeWidth={2.5}
                />
                <Area
                  type="monotone"
                  name="Expenses"
                  dataKey="expenses"
                  stroke="#408bfb"
                  fill="transparent"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-footnote">
            <span className="positive">
              <TrendingUp size={14} />
              Room to grow.
            </span>
            <span>Income outpaces expenses across this period.</span>
          </div>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Spending breakdown</h2>
              <p>October budget activity</p>
            </div>
            <Link className="icon-button" aria-label="View budgets" to="/app/budgets">
              <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="donut-wrap">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data.budgets}
                  dataKey="spent"
                  nameKey="name"
                  innerRadius={68}
                  outerRadius={85}
                  paddingAngle={5}
                  cornerRadius={4}
                  stroke="none"
                >
                  {data.budgets.map((b) => (
                    <Cell key={b.id} fill={b.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => money(Number(value))}
                  contentStyle={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center">
              <small>Budget spend</small>
              <strong>{money(spent)}</strong>
            </div>
          </div>
          <div className="breakdown-list">
            {data.budgets.map((b) => (
              <div key={b.id}>
                <i style={{ background: b.color }} />
                <span>{b.name}</span>
                <strong>{Math.round((b.spent / spent) * 100)}%</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Recent transactions</h2>
              <p>The latest movements in your workspace</p>
            </div>
            <Link className="text-button" to="/app/transactions">
              View all
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="table-scroll" role="region" aria-label="Recent transactions" tabIndex={0}>
            <table>
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.transactions.slice(0, 5).map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div className="merchant-cell">
                        <CategoryIcon category={t.category} />
                        <div>
                          <strong>{t.merchant}</strong>
                          <small>{t.category}</small>
                        </div>
                      </div>
                    </td>
                    <td>{dateLabel(t.date)}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="panel goals-panel">
          <div className="panel-heading">
            <div>
              <h2>A little further, every month.</h2>
              <p>Your next milestone</p>
            </div>
            <Target size={19} />
          </div>
          <div className="goal-illustration">
            <span className="goal-orbit" />
            <Target size={44} />
            <span className="goal-spark">✦</span>
          </div>
          <div className="goal-content">
            <span className="eyebrow">THE STUDIO FUND</span>
            <h3>Room for what’s next.</h3>
            <p>A brighter workspace, a bigger idea, or just a little breathing room.</p>
            <div className="goal-values">
              <strong>
                $10,200 <span>/ $15,000</span>
              </strong>
              <span>68%</span>
            </div>
            <div className="progress-track">
              <span style={{ width: '68%' }} />
            </div>
            <small>Illustrative savings goal · $4,800 to go</small>
            <Link className="secondary-button" to="/app/budgets">
              Explore your budgets
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
