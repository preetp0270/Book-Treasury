import { useState } from 'react'
import { X, Plus, Trash2, Type } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

/**
 * Modal to manage custom Google Fonts.
 * User pastes a Google Fonts CSS URL + the CSS family name.
 */
export default function SettingsModal({ open, onClose }) {
  const { user, updatePreferences } = useAuth()
  const [fonts, setFonts] = useState(user?.customFonts || [])
  const [name, setName] = useState('')
  const [family, setFamily] = useState('')
  const [url, setUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const addFont = () => {
    setError('')
    if (!name.trim() || !family.trim() || !url.trim()) {
      setError('All three fields are required')
      return
    }
    if (!url.includes('fonts.googleapis.com') && !url.includes('fonts.gstatic.com')) {
      // soft warning only
    }
    const next = [...fonts, { name: name.trim(), family: family.trim(), url: url.trim() }]
    setFonts(next)
    setName('')
    setFamily('')
    setUrl('')
  }

  const removeFont = (idx) => {
    setFonts((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await updatePreferences({ customFonts: fonts })
      // Dynamically inject the CSS links
      fonts.forEach((f) => {
        if (f.url && !document.querySelector(`link[href="${f.url}"]`)) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = f.url
          document.head.appendChild(link)
        }
      })
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="book-page w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-book"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-xl font-semibold flex items-center gap-2">
            <Type className="w-5 h-5 text-leather-500" />
            Custom Fonts
          </h2>
          <button onClick={onClose} className="btn-ghost p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-ink-500 dark:text-cream-400 mb-4">
          Add any Google Font. Go to{' '}
          <a
            href="https://fonts.google.com"
            target="_blank"
            rel="noreferrer"
            className="text-leather-500 hover:underline"
          >
            fonts.google.com
          </a>
          , pick a font → Get font → copy the CSS link, then paste below.
        </p>

        {/* Existing fonts */}
        {fonts.length > 0 && (
          <ul className="space-y-2 mb-5">
            {fonts.map((f, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-ink-50 dark:bg-night-700/60"
              >
                <div className="min-w-0">
                  <div className="font-medium truncate" style={{ fontFamily: f.family }}>
                    {f.name}
                  </div>
                  <div className="text-xs text-ink-400 truncate">{f.family}</div>
                </div>
                <button
                  onClick={() => removeFont(idx)}
                  className="btn-ghost p-1 text-red-500 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Add form */}
        <div className="space-y-3 border-t border-ink-200 dark:border-night-600 pt-4">
          <div>
            <label className="block text-xs font-medium mb-1">Display name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field text-sm"
              placeholder="e.g. Cinzel Decorative"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">
              CSS font-family value
            </label>
            <input
              value={family}
              onChange={(e) => setFamily(e.target.value)}
              className="input-field text-sm"
              placeholder='e.g. "Cinzel Decorative", serif'
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Google Fonts CSS URL</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="input-field text-sm"
              placeholder="https://fonts.googleapis.com/css2?family=..."
            />
          </div>
          <button type="button" onClick={addFont} className="btn-ghost text-sm border border-ink-200 dark:border-night-600 w-full">
            <Plus className="w-4 h-4" />
            Add font
          </button>
        </div>

        {error && (
          <div className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</div>
        )}

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-ghost flex-1">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
            {saving ? 'Saving…' : 'Save fonts'}
          </button>
        </div>
      </div>
    </div>
  )
}
