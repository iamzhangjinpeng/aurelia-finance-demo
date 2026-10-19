import { useState } from 'react'
import { Check, Code2, Database, Mail, RotateCcw, Save, ShieldCheck } from 'lucide-react'
import { useDemo } from '../lib/store'
import { DEMO_EMAIL } from '../lib/data'
import { Confirm, PageHeader } from '../components/UI'
export default function Settings() {
  const { data, update, reset, toast } = useDemo()
  const [name, setName] = useState(data.profile.name)
  const [company, setCompany] = useState(data.profile.company)
  const [resetting, setResetting] = useState(false)
  return (
    <>
      <PageHeader
        title="Make yourself at home."
        description="Your profile, your preferences, and a little peace of mind."
      />
      <div className="settings-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Profile details</h2>
              <p>A personal touch for your demo workspace</p>
            </div>
            <span className="user-avatar">{data.profile.name[0]}</span>
          </div>
          <form
            className="settings-form"
            onSubmit={(e) => {
              e.preventDefault()
              if (!name.trim() || !company.trim()) return
              update((prev) => ({
                ...prev,
                profile: { name: name.trim(), company: company.trim() },
              }))
              toast('Your profile has been updated.')
            }}
          >
            <label>
              Full name
              <input
                required
                maxLength={45}
                pattern=".*\S.*"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              Company
              <input
                required
                maxLength={65}
                pattern=".*\S.*"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </label>
            <label>
              Email address
              <input type="email" value={DEMO_EMAIL} readOnly />
              <small>The shared demo account email stays the same.</small>
            </label>
            <button className="primary-button">
              <Save size={15} />
              Save profile
            </button>
          </form>
        </section>
        <div className="settings-stack">
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>Security & access</h2>
                <p>A transparent look at this experience</p>
              </div>
              <ShieldCheck size={21} />
            </div>
            <div className="settings-rows">
              <div>
                <span className="stat-icon green">
                  <Check size={19} />
                </span>
                <div>
                  <strong>Demo session</strong>
                  <p>
                    Signed in with the shared email account. This session stays in your current
                    browser tab.
                  </p>
                </div>
                <span className="badge completed">Active</span>
              </div>
              <div>
                <span className="stat-icon">
                  <Database size={18} />
                </span>
                <div>
                  <strong>Local data only</strong>
                  <p>
                    Your demo changes are saved in this browser. No bank connections or external
                    services.
                  </p>
                </div>
              </div>
            </div>
          </section>
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>Preferences</h2>
                <p>Make the demo feel a little more yours</p>
              </div>
            </div>
            <div className="settings-rows">
              <div>
                <span className="stat-icon">
                  <Mail size={18} />
                </span>
                <div>
                  <strong>Activity email previews</strong>
                  <p>A saved demo preference. No emails are sent.</p>
                </div>
                <button
                  className={`toggle ${data.notifications ? 'on' : ''}`}
                  role="switch"
                  aria-label="Activity email previews"
                  aria-checked={data.notifications}
                  onClick={() =>
                    update((prev) => ({ ...prev, notifications: !prev.notifications }))
                  }
                >
                  <i />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
      <section className="panel about-demo">
        <Code2 size={23} />
        <div>
          <h2>Built for the details.</h2>
          <p>
            Aurelia is an interactive portfolio project built with React, TypeScript, and a
            carefully considered design system. Every name, balance, account, and transaction is
            fictional. Login is a client-side demo gate, and does not provide production
            authentication.
          </p>
          <div className="technology-tags">
            <span>React</span>
            <span>TypeScript</span>
            <span>Vite</span>
            <span>Recharts</span>
            <span>Lucide icons</span>
          </div>
        </div>
      </section>
      <section className="panel reset-panel">
        <div>
          <h2>A fresh perspective?</h2>
          <p>Restore the original profile, cards, budgets, and transactions in this browser.</p>
        </div>
        <button className="secondary-button" onClick={() => setResetting(true)}>
          <RotateCcw size={15} />
          Reset demo data
        </button>
      </section>
      {resetting && (
        <Confirm
          title="Reset this demo workspace?"
          description="This replaces all locally saved profile changes, cards, budgets, and preferences with the original sample data. Your custom demo changes will be lost."
          label="Reset demo"
          onClose={() => setResetting(false)}
          onConfirm={() => {
            reset()
            setName('Alex Morgan')
            setCompany('Morgan Design Studio')
          }}
        />
      )}
    </>
  )
}
