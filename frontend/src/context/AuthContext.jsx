import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('bt_token')
    const saved = localStorage.getItem('bt_user')
    const loadCustomFonts = (fonts = []) => {
      fonts.forEach((f) => {
        if (f.url && !document.querySelector(`link[data-bt-font="${f.url}"]`)) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = f.url
          link.setAttribute('data-bt-font', f.url)
          document.head.appendChild(link)
        }
      })
    }

    if (token && saved) {
      try {
        const parsed = JSON.parse(saved)
        setUser(parsed)
        loadCustomFonts(parsed.customFonts)
        api.get('/auth/me')
          .then((res) => {
            setUser(res.data.user)
            localStorage.setItem('bt_user', JSON.stringify(res.data.user))
            loadCustomFonts(res.data.user.customFonts)
          })
          .catch(() => {
            localStorage.removeItem('bt_token')
            localStorage.removeItem('bt_user')
            setUser(null)
          })
          .finally(() => setLoading(false))
      } catch {
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (username, mpin) => {
    const { data } = await api.post('/auth/login', { username, mpin })
    localStorage.setItem('bt_token', data.token)
    localStorage.setItem('bt_user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  const register = async (username, mpin, displayName) => {
    const { data } = await api.post('/auth/register', { username, mpin, displayName })
    localStorage.setItem('bt_token', data.token)
    localStorage.setItem('bt_user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  const logout = () => {
    localStorage.removeItem('bt_token')
    localStorage.removeItem('bt_user')
    setUser(null)
  }

  const updatePreferences = async (prefs) => {
    const { data } = await api.put('/auth/preferences', prefs)
    setUser(data.user)
    localStorage.setItem('bt_user', JSON.stringify(data.user))
    return data.user
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updatePreferences }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
