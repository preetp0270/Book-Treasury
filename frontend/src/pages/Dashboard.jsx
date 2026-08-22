import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { Plus, Book, Trash2, FileText, Clock, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { downloadMarkdown } from '../utils/markdownExport'

export default function Dashboard() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [creating, setCreating] = useState(false)
  const navigate = useNavigate()

  const fetchBooks = async () => {
    try {
      const { data } = await api.get('/books')
      setBooks(data.books)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBooks()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setCreating(true)
    try {
      const { data } = await api.post('/books', { title: title.trim(), subtitle: subtitle.trim() })
      setShowCreate(false)
      setTitle('')
      setSubtitle('')
      navigate(`/book/${data.book._id}`)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create book')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id, bookTitle) => {
    if (!confirm(`Delete "${bookTitle}" forever? This cannot be undone.`)) return
    try {
      await api.delete(`/books/${id}`)
      setBooks((prev) => prev.filter((b) => b._id !== id))
    } catch (err) {
      alert('Failed to delete')
    }
  }

  const handleExport = async (bookId, e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      // Need full book with chapters for good export
      const { data } = await api.get(`/books/${bookId}`)
      downloadMarkdown(data.book)
    } catch (err) {
      alert('Failed to export')
    }
  }

  const formatDate = (d) =>
    new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-ink-500">
        Loading your library…
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-end justify-between mb-10">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-ink-900 dark:text-cream-50 tracking-tight">
            Your Library
          </h1>
          <p className="mt-1 text-ink-500 dark:text-cream-400">
            {books.length} {books.length === 1 ? 'book' : 'books'} in your treasury
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus className="w-5 h-5" />
          New Book
        </button>
      </div>

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-sm"
            onClick={() => setShowCreate(false)}
          >
            <motion.form
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleCreate}
              className="book-page w-full max-w-md p-6 shadow-book space-y-4"
            >
              <h2 className="font-serif text-xl font-semibold text-ink-900 dark:text-cream-100">
                Start a new book
              </h2>
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                  placeholder="The name of your book"
                  required
                  autoFocus
                  maxLength={150}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Subtitle <span className="text-ink-400 font-normal">(optional)</span>
                </label>
                <input
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="input-field"
                  placeholder="A short line beneath the title"
                  maxLength={200}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={creating} className="btn-primary flex-1">
                  {creating ? 'Creating…' : 'Create & Open'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {books.length === 0 ? (
        <div className="text-center py-24">
          <Book className="w-16 h-16 mx-auto text-ink-300 dark:text-night-400 mb-4" />
          <h2 className="font-serif text-xl text-ink-600 dark:text-cream-300 mb-2">
            Your shelves are empty
          </h2>
          <p className="text-ink-400 mb-6">Begin your first book and fill this treasury with words.</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus className="w-5 h-5" />
            Write your first book
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book, i) => (
            <motion.div
              key={book._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group relative book-page p-5 shadow-book hover:shadow-lg transition-shadow"
            >
              <Link to={`/book/${book._id}`} className="block">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-16 rounded bg-gradient-to-br from-leather-500 to-leather-700 flex items-center justify-center shrink-0 shadow-md">
                    <FileText className="w-6 h-6 text-cream-100" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif font-semibold text-lg text-ink-900 dark:text-cream-50 truncate group-hover:text-leather-500 transition-colors">
                      {book.title}
                    </h3>
                    {book.subtitle && (
                      <p className="text-sm text-ink-500 dark:text-cream-400 truncate mt-0.5">
                        {book.subtitle}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-3 text-xs text-ink-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(book.updatedAt)}
                      </span>
                      {book.wordCount > 0 && (
                        <span>{book.wordCount.toLocaleString()} words</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={(e) => handleExport(book._id, e)}
                  className="p-1.5 rounded-md text-ink-400 hover:text-leather-500 hover:bg-ink-100 dark:hover:bg-night-700"
                  title="Export as Markdown"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(book._id, book.title)}
                  className="p-1.5 rounded-md text-ink-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                  title="Delete book"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
