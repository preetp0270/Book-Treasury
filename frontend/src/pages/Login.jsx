import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BookOpen, Lock, User } from 'lucide-react'

export default function Login() {
  const [username, setUsername] = useState('')
  const [mpin, setMpin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username.trim(), mpin)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-parchment-100 via-parchment-50 to-parchment-200 dark:from-night-950 dark:via-night-900 dark:to-night-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-leather-500/10 mb-4">
            <BookOpen className="w-8 h-8 text-leather-500" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-ink-900 dark:text-cream-50 tracking-tight">
            Book Treasury
          </h1>
          <p className="mt-2 text-ink-500 dark:text-cream-400 text-sm">
            Your private collection of words
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="book-page p-8 space-y-5 shadow-book"
        >
          <div>
            <label className="block text-sm font-medium text-ink-700 dark:text-cream-300 mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field pl-10"
                placeholder="yourname"
                required
                autoFocus
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 dark:text-cream-300 mb-1.5">
              MPIN
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={mpin}
                onChange={(e) => setMpin(e.target.value.replace(/\D/g, ''))}
                className="input-field pl-10 tracking-widest text-lg"
                placeholder="••••"
                required
                autoComplete="current-password"
              />
            </div>
            <p className="mt-1 text-xs text-ink-400">4–6 digit personal PIN</p>
          </div>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? 'Opening…' : 'Enter Treasury'}
          </button>

          <p className="text-center text-sm text-ink-500 dark:text-cream-400">
            New writer?{' '}
            <Link to="/register" className="text-leather-500 hover:underline font-medium">
              Create account
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
