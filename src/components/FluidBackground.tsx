import { useEffect, useRef } from 'react'
import type { LiquidEtherHandle } from '../effects/liquidEther.js'

/** Owns one copy of the original fluid solver, including its GPU resources. */
export default function FluidBackground({ cta = false }: { cta?: boolean }) {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = container.current
    if (!element) return
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    let generation = 0
    let disposed = false
    let fluid: LiquidEtherHandle | undefined
    const syncTheme = () => {
      fluid?.setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')
    }
    async function setup() {
      const current = ++generation
      fluid?.()
      fluid = undefined
      if (preference.matches) {
        element!.dataset.fluidState = 'reduced-motion'
        return
      }
      element!.dataset.fluidState = 'loading'
      try {
        const { initLiquidEther } = await import('../effects/liquidEther.js')
        if (disposed || current !== generation) return
        const handle = initLiquidEther(element!, () => {
          element!.dataset.fluidState = 'fallback'
        })
        fluid = handle
        syncTheme()
        element!.dataset.fluidState = 'ready'
      } catch {
        // Keep the static gradient readable on devices without WebGL.
        if (!disposed && current === generation) element!.dataset.fluidState = 'fallback'
      }
    }
    const theme = new MutationObserver(syncTheme)
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    preference.addEventListener('change', setup)
    void setup()
    return () => {
      disposed = true
      generation += 1
      preference.removeEventListener('change', setup)
      theme.disconnect()
      fluid?.()
    }
  }, [])

  return (
    <div
      ref={container}
      className={`fluid-background${cta ? ' cta-fluid-background' : ''}`}
      aria-hidden="true"
    >
      <div className="fluid-softening" />
    </div>
  )
}
