import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/client'
import {
  ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, Link as LinkIcon, Download,
  Type, Quote, Minus, ChevronDown, Check, X, Moon, Sun, Monitor, FileText, Settings, Upload
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { downloadMarkdown } from '../utils/markdownExport'
import { downloadPDF } from '../utils/pdfExport'
import SettingsModal from '../components/SettingsModal'

const FONTS = [
  { name: 'Libre Baskerville', value: 'Libre Baskerville', class: 'font-serif' },
  { name: 'Merriweather', value: 'Merriweather', class: 'font-serif-alt' },
  { name: 'EB Garamond', value: 'EB Garamond', class: 'font-serif-classic' },
  { name: 'Lora', value: 'Lora', class: 'font-serif-modern' },
  { name: 'Playfair Display', value: 'Playfair Display', class: 'font-serif-elegant' },
  { name: 'Crimson Text', value: 'Crimson Text', class: 'font-serif-book' },
  { name: 'Cormorant Garamond', value: 'Cormorant Garamond', class: 'font-serif-old' },
  { name: 'Source Serif 4', value: 'Source Serif 4', class: 'font-serif-clean' },
  { name: 'Literata', value: 'Literata', class: 'font-serif-soft' },
  { name: 'Libre Caslon Text', value: 'Libre Caslon Text', class: 'font-serif-strong' },
]

const BLOCK_TYPES = [
  { type: 'heading1', label: 'Title', icon: Type },
  { type: 'heading2', label: 'Subtitle', icon: Type },
  { type: 'heading3', label: 'Heading', icon: Type },
  { type: 'paragraph', label: 'Paragraph', icon: Type },
  { type: 'quote', label: 'Quote', icon: Quote },
  { type: 'divider', label: 'Divider', icon: Minus },
  { type: 'image', label: 'Image', icon: ImageIcon },
  { type: 'link', label: 'Reference', icon: LinkIcon },
]

export default function Editor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { theme, cycleTheme } = useTheme()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState(null)
  const [activeChapter, setActiveChapter] = useState(0)
  const [showToolbar, setShowToolbar] = useState(true)
  const [fontMenu, setFontMenu] = useState(false)
  const [exportMenu, setExportMenu] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const saveTimeout = useRef(null)
  const contentRef = useRef(null)
  const { user } = useAuth()

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor

  // Built-in + user's custom fonts
  const allFonts = [
    ...FONTS,
    ...(user?.customFonts || []).map((f) => ({
      name: f.name,
      value: f.family,
      class: '',
      custom: true,
    })),
  ]

  const fetchBook = useCallback(async () => {
    try {
      const { data } = await api.get(`/books/${id}`)
      setBook(data.book)
      if (data.book.chapters?.length) setActiveChapter(0)
    } catch (err) {
      console.error(err)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => {
    fetchBook()
  }, [fetchBook])

  // Auto-save
  const scheduleSave = useCallback((updatedBook) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(async () => {
      setSaving(true)
      try {
        await api.put(`/books/${id}/content`, { chapters: updatedBook.chapters })
        setSavedAt(new Date())
      } catch (err) {
        console.error('Auto-save failed', err)
      } finally {
        setSaving(false)
      }
    }, 1200)
  }, [id])

  const updateChapters = (newChapters) => {
    const updated = { ...book, chapters: newChapters }
    setBook(updated)
    scheduleSave(updated)
  }

  const currentChapter = book?.chapters?.[activeChapter]

  const updateBlock = (blockIdx, changes) => {
    const chapters = structuredClone(book.chapters)
    Object.assign(chapters[activeChapter].blocks[blockIdx], changes)
    updateChapters(chapters)
  }

  const addBlock = (type) => {
    const chapters = structuredClone(book.chapters)
    const blocks = chapters[activeChapter].blocks
    const newBlock = {
      type,
      content: '',
      order: blocks.length,
      fontFamily: book.defaultFont || 'Libre Baskerville',
      alignment: 'left',
    }
    if (type === 'image') {
      newBlock.imageUrl = ''
      newBlock.imageCaption = ''
    }
    if (type === 'link') {
      newBlock.linkUrl = ''
      newBlock.linkTitle = ''
    }
    blocks.push(newBlock)
    updateChapters(chapters)
  }

  const deleteBlock = (blockIdx) => {
    const chapters = structuredClone(book.chapters)
    chapters[activeChapter].blocks.splice(blockIdx, 1)
    chapters[activeChapter].blocks.forEach((b, i) => (b.order = i))
    updateChapters(chapters)
  }

  const addChapter = async () => {
    try {
      const { data } = await api.post(`/books/${id}/chapters`, {})
      setBook(data.book)
      setActiveChapter(data.book.chapters.length - 1)
    } catch (err) {
      alert('Failed to add chapter')
    }
  }

  const deleteChapter = async (chapterId) => {
    if (book.chapters.length <= 1) {
      alert('A book needs at least one chapter')
      return
    }
    if (!confirm('Delete this chapter and all its content?')) return
    try {
      const { data } = await api.delete(`/books/${id}/chapters/${chapterId}`)
      setBook(data.book)
      setActiveChapter(Math.max(0, activeChapter - 1))
    } catch (err) {
      alert('Failed to delete chapter')
    }
  }

  const renameChapter = (idx, title) => {
    const chapters = structuredClone(book.chapters)
    chapters[idx].title = title
    updateChapters(chapters)
  }

  const setDefaultFont = (font) => {
    const updated = { ...book, defaultFont: font }
    setBook(updated)
    api.put(`/books/${id}`, { defaultFont: font }).catch(console.error)
    setFontMenu(false)
  }

  const handleManualSave = async () => {
    if (!book) return
    setSaving(true)
    try {
      await api.put(`/books/${id}/content`, { chapters: book.chapters })
      setSavedAt(new Date())
    } catch (err) {
      alert('Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleExportMarkdown = () => {
    if (!book) return
    try {
      downloadMarkdown(book)
    } catch (err) {
      console.error(err)
      window.open(`/api/books/${id}/export/markdown`, '_blank')
    }
    setExportMenu(false)
  }

  const handleExportPDF = () => {
    if (!book) return
    try {
      downloadPDF(book)
    } catch (err) {
      console.error(err)
      alert('PDF export failed')
    }
    setExportMenu(false)
  }


  if (loading || !book) {
    return (
      <div className="h-screen flex items-center justify-center bg-parchment-100 dark:bg-night-950">
        <div className="animate-pulse font-serif text-xl text-ink-500">Opening book…</div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-parchment-100 dark:bg-night-950 overflow-hidden">
      {/* Minimal top bar – fades in on hover or always subtle */}
      <header
        className={`shrink-0 border-b border-ink-200/50 dark:border-night-700 bg-parchment-50/95 dark:bg-night-800/95 backdrop-blur transition-opacity duration-300 ${
          showToolbar ? 'opacity-100' : 'opacity-30 hover:opacity-100'
        }`}
      >
        <div className="h-12 px-3 flex items-center gap-2">
          <Link
            to="/"
            className="btn-ghost p-2"
            title="Back to library"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="flex-1 min-w-0">
            <h1 className="font-serif font-semibold text-ink-900 dark:text-cream-50 truncate text-sm md:text-base">
              {book.title}
            </h1>
          </div>

          <div className="flex items-center gap-1 text-xs text-ink-400">
            {saving ? (
              <span>Saving…</span>
            ) : savedAt ? (
              <span>Saved</span>
            ) : null}
          </div>

          {/* Font selector */}
          <div className="relative">
            <button
              onClick={() => setFontMenu(!fontMenu)}
              className="btn-ghost text-xs gap-1 px-2"
            >
              <Type className="w-4 h-4" />
              <span className="hidden sm:inline max-w-[100px] truncate">{book.defaultFont}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {fontMenu && (
              <div className="absolute right-0 top-full mt-1 w-56 max-h-72 overflow-y-auto book-page shadow-book z-50 py-1">
                {allFonts.map((f) => (
                  <button
                    key={f.value + f.name}
                    onClick={() => setDefaultFont(f.value)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-ink-100 dark:hover:bg-night-700 flex items-center justify-between ${
                      book.defaultFont === f.value ? 'text-leather-500' : ''
                    }`}
                    style={{ fontFamily: f.value }}
                  >
                    <span className="truncate">{f.name}{f.custom ? ' ★' : ''}</span>
                    {book.defaultFont === f.value && <Check className="w-4 h-4 shrink-0" />}
                  </button>
                ))}
                <button
                  onClick={() => { setFontMenu(false); setShowSettings(true) }}
                  className="w-full text-left px-3 py-2 text-xs text-leather-500 border-t border-ink-200 dark:border-night-600 hover:bg-ink-100 dark:hover:bg-night-700 flex items-center gap-2"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Manage custom fonts…
                </button>
              </div>
            )}
          </div>

          <button onClick={cycleTheme} className="btn-ghost p-2" title="Toggle theme">
            <ThemeIcon className="w-4 h-4" />
          </button>

          <button onClick={handleManualSave} className="btn-ghost p-2" title="Save now">
            <Save className="w-4 h-4" />
          </button>

          {/* Export menu */}
          <div className="relative">
            <button
              onClick={() => setExportMenu(!exportMenu)}
              className="btn-ghost p-2"
              title="Export book"
            >
              <Download className="w-4 h-4" />
            </button>
            {exportMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 book-page shadow-book z-50 py-1">
                <button
                  onClick={handleExportMarkdown}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-ink-100 dark:hover:bg-night-700 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Markdown (.md)
                </button>
                <button
                  onClick={handleExportPDF}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-ink-100 dark:hover:bg-night-700 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  PDF (.pdf)
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowSettings(true)}
            className="btn-ghost p-2"
            title="Custom fonts & settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />


      <div className="flex-1 flex overflow-hidden">
        {/* Chapter sidebar – collapsible feel */}
        <aside className="w-52 shrink-0 border-r border-ink-200/50 dark:border-night-700 bg-parchment-50/50 dark:bg-night-800/50 overflow-y-auto hidden md:block">
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium uppercase tracking-wider text-ink-400">
                Chapters
              </span>
              <button onClick={addChapter} className="btn-ghost p-1" title="Add chapter">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <ul className="space-y-0.5">
              {book.chapters.map((ch, idx) => (
                <li key={ch._id || idx}>
                  <button
                    onClick={() => setActiveChapter(idx)}
                    className={`w-full text-left px-2 py-1.5 rounded text-sm truncate transition ${
                      activeChapter === idx
                        ? 'bg-leather-500/15 text-leather-600 dark:text-leather-400 font-medium'
                        : 'text-ink-600 dark:text-cream-300 hover:bg-ink-100 dark:hover:bg-night-700'
                    }`}
                  >
                    {ch.title || `Chapter ${idx + 1}`}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Writing area – full immersion */}
        <div className="flex-1 overflow-y-auto editor-scroll" ref={contentRef}>
          <div className="max-w-2xl mx-auto px-6 py-10 md:py-16">
            {/* Chapter title editable */}
            <input
              value={currentChapter?.title || ''}
              onChange={(e) => renameChapter(activeChapter, e.target.value)}
              className="w-full bg-transparent border-none outline-none font-serif text-2xl md:text-3xl font-bold text-ink-900 dark:text-cream-50 mb-2 placeholder:text-ink-300"
              placeholder="Chapter title"
              style={{ fontFamily: book.defaultFont }}
            />

            {/* Mobile chapter selector */}
            <div className="md:hidden mb-6 flex items-center gap-2 overflow-x-auto pb-2">
              {book.chapters.map((ch, idx) => (
                <button
                  key={ch._id || idx}
                  onClick={() => setActiveChapter(idx)}
                  className={`shrink-0 px-3 py-1 rounded-full text-xs ${
                    activeChapter === idx
                      ? 'bg-leather-500 text-white'
                      : 'bg-ink-100 dark:bg-night-700 text-ink-600 dark:text-cream-300'
                  }`}
                >
                  {ch.title || `Ch ${idx + 1}`}
                </button>
              ))}
              <button onClick={addChapter} className="shrink-0 p-1 rounded-full bg-ink-100 dark:bg-night-700">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Blocks */}
            <div className="space-y-4" style={{ fontFamily: book.defaultFont }}>
              {currentChapter?.blocks?.map((block, bIdx) => (
                <BlockEditor
                  key={block._id || bIdx}
                  block={block}
                  onChange={(changes) => updateBlock(bIdx, changes)}
                  onDelete={() => deleteBlock(bIdx)}
                  defaultFont={book.defaultFont}
                />
              ))}
            </div>

            {/* Add block toolbar */}
            <div className="mt-8 pt-6 border-t border-ink-200/60 dark:border-night-600">
              <p className="text-xs text-ink-400 mb-3 uppercase tracking-wider">Add to page</p>
              <div className="flex flex-wrap gap-2">
                {BLOCK_TYPES.map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => addBlock(type)}
                    className="btn-ghost text-xs border border-ink-200 dark:border-night-600"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Danger zone for chapter */}
            {book.chapters.length > 1 && (
              <div className="mt-12 pt-6 border-t border-ink-200/40 dark:border-night-700">
                <button
                  onClick={() => deleteChapter(currentChapter._id)}
                  className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete this chapter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function BlockEditor({ block, onChange, onDelete, defaultFont }) {
  const [focused, setFocused] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('image', file)
      const { data } = await api.post('/upload/image', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (data.success && data.url) {
        onChange({ imageUrl: data.url })
      } else {
        alert(data.message || 'Upload failed')
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed. Check Cloudinary config.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  if (block.type === 'divider') {
    return (
      <div className="group relative py-4">
        <hr className="border-ink-300 dark:border-night-500" />
        <button
          onClick={onDelete}
          className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 btn-ghost p-1 text-red-500"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  if (block.type === 'image') {
    return (
      <div className="group relative space-y-2">
        {block.imageUrl ? (
          <figure>
            <img
              src={block.imageUrl}
              alt={block.imageCaption || ''}
              className="max-w-full rounded-sm shadow-page mx-auto"
            />
            <input
              value={block.imageCaption || ''}
              onChange={(e) => onChange({ imageCaption: e.target.value })}
              placeholder="Caption (optional)"
              className="w-full text-center text-sm text-ink-500 bg-transparent border-none outline-none mt-2"
            />
            <button
              type="button"
              onClick={() => onChange({ imageUrl: '', imageCaption: '' })}
              className="text-xs text-ink-400 hover:text-red-500 mt-1 block mx-auto"
            >
              Replace image
            </button>
          </figure>
        ) : (
          <div className="border-2 border-dashed border-ink-300 dark:border-night-500 rounded-lg p-6 text-center space-y-3">
            <ImageIcon className="w-8 h-8 mx-auto text-ink-400" />
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="btn-primary text-sm"
              >
                <Upload className="w-4 h-4" />
                {uploading ? 'Uploading…' : 'Upload image'}
              </button>
              <span className="text-xs text-ink-400">or</span>
              <input
                type="url"
                placeholder="Paste image URL…"
                className="input-field text-sm max-w-xs"
                onBlur={(e) => {
                  if (e.target.value.trim()) onChange({ imageUrl: e.target.value.trim() })
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    onChange({ imageUrl: e.target.value.trim() })
                  }
                }}
              />
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFileUpload}
            />
            <p className="text-xs text-ink-400">JPEG, PNG, WebP or GIF · max 5 MB</p>
          </div>
        )}
        <button
          onClick={onDelete}
          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 btn-ghost p-1 text-red-500"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  if (block.type === 'link') {
    return (
      <div className="group relative book-page p-4 border border-ink-200 dark:border-night-600">
        <div className="flex items-start gap-3">
          <LinkIcon className="w-5 h-5 text-leather-500 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <input
              value={block.linkTitle || ''}
              onChange={(e) => onChange({ linkTitle: e.target.value })}
              placeholder="Reference title"
              className="w-full bg-transparent border-none outline-none font-medium text-ink-900 dark:text-cream-100"
            />
            <input
              value={block.linkUrl || ''}
              onChange={(e) => onChange({ linkUrl: e.target.value })}
              placeholder="https://…"
              className="w-full bg-transparent border-none outline-none text-sm text-leather-500"
            />
          </div>
        </div>
        <button
          onClick={onDelete}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 btn-ghost p-1 text-red-500"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  // Text blocks
  const isHeading = block.type.startsWith('heading')
  const tagMap = { heading1: 'h1', heading2: 'h2', heading3: 'h3', paragraph: 'p', quote: 'blockquote' }
  const sizeMap = {
    heading1: 'text-3xl md:text-4xl font-bold',
    heading2: 'text-2xl md:text-3xl font-semibold',
    heading3: 'text-xl md:text-2xl font-medium',
    paragraph: 'text-base md:text-lg leading-relaxed',
    quote: 'text-lg italic border-l-4 border-leather-500 pl-4 text-ink-600 dark:text-cream-300',
  }

  return (
    <div className={`group relative ${focused ? 'ring-1 ring-leather-500/30 rounded' : ''}`}>
      <textarea
        value={block.content || ''}
        onChange={(e) => onChange({ content: e.target.value })}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={
          block.type === 'heading1'
            ? 'Main title…'
            : block.type === 'heading2'
            ? 'Subtitle…'
            : block.type === 'quote'
            ? 'A memorable line…'
            : 'Start writing…'
        }
        className={`w-full bg-transparent border-none outline-none resize-none overflow-hidden ${sizeMap[block.type] || ''} text-ink-900 dark:text-cream-50 placeholder:text-ink-300 dark:placeholder:text-night-500`}
        style={{ fontFamily: block.fontFamily || defaultFont, minHeight: isHeading ? '2.5rem' : '3rem' }}
        rows={1}
        onInput={(e) => {
          e.target.style.height = 'auto'
          e.target.style.height = e.target.scrollHeight + 'px'
        }}
        ref={(el) => {
          if (el) {
            el.style.height = 'auto'
            el.style.height = el.scrollHeight + 'px'
          }
        }}
      />
      <button
        onClick={onDelete}
        className="absolute -right-8 top-1 opacity-0 group-hover:opacity-100 btn-ghost p-1 text-red-500"
        title="Remove block"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
