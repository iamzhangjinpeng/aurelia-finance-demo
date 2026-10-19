import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
export default function ThemeButton() {
  const [theme, setTheme] = useState(() => localStorage.getItem('aurelia-theme') || 'light')
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('aurelia-theme', theme)
  }, [theme])
  return (
    <button
      className="icon-button"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  )
}
