export type LiquidEtherHandle = (() => void) & {
  /** Update background mixing without resetting the simulation. */
  setTheme(theme: 'light' | 'dark'): void
}

/** Source-preserving JavaScript solver; returns its resource cleanup function. */
export function initLiquidEther(
  container: HTMLElement,
  onUnavailable?: () => void,
): LiquidEtherHandle
