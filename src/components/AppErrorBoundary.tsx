import { Component } from 'react'
import type { ReactNode } from 'react'
import { RefreshCw, TriangleAlert } from 'lucide-react'

export default class AppErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return (
        <section className="route-feedback" role="alert">
          <TriangleAlert size={28} />
          <h1>Let’s get your workspace back.</h1>
          <p>This page couldn’t load. Refresh to try again, or return to the homepage.</p>
          <div>
            <button className="primary-button" onClick={() => window.location.reload()}>
              <RefreshCw size={15} />
              Refresh page
            </button>
            <a className="secondary-button" href={import.meta.env.BASE_URL}>
              Back to home
            </a>
          </div>
        </section>
      )
    }
    return this.props.children
  }
}
