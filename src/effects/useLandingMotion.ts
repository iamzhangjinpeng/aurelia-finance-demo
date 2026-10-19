import { useEffect } from 'react'
import type { RefObject } from 'react'

export function useLandingMotion(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const elements = root.current?.querySelectorAll<HTMLElement>('.reveal')
    if (!elements?.length) return
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (preference.matches || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 },
    )
    elements.forEach((element) => {
      element.classList.add('reveal-pending')
      observer.observe(element)
    })
    const revealAll = () => {
      if (preference.matches) {
        elements.forEach((element) => element.classList.add('visible'))
        observer.disconnect()
      }
    }
    preference.addEventListener('change', revealAll)
    return () => {
      observer.disconnect()
      preference.removeEventListener('change', revealAll)
      elements.forEach((element) => element.classList.remove('reveal-pending'))
    }
  }, [root])
}
