import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { BookOpen, LogOut, Moon, Sun, Monitor, User } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Layout() {
  const { user, logout } = useAuth()
  const { theme, cycleTheme } = useTheme()
  const location = useLocation()
  const isEditor = location.pathname.startsWith('/book/')

  // Full immersion in editor – no chrome
  if (isEditor) {
    return <Outlet />
  }

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar – library feel */}
      <header className="sticky top-0 z-40 border-b border-ink-200/60 dark:border-night-700 bg-parchment-50/90 dark:bg-night-800/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <BookOpen className="w-6 h-6 text-leather-500 group-hover:scale-110 transition-transform" />
            <span className="font-serif text-lg font-semibold tracking-tight text-ink-900 dark:text-cream-100">
              Book Treasury
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <button
              onClick={cycleTheme}
              className="btn-ghost p-2"
              title={`Theme: ${theme}`}
            >
              <ThemeIcon className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-ink-600 dark:text-cream-300">
              <User className="w-4 h-4" />
              <span className="font-medium">{user?.displayName || user?.username}</span>
            </div>

            <button onClick={logout} className="btn-ghost p-2" title="Logout">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
