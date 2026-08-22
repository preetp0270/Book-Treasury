/**
 * Convert a Book Treasury book object into clean Markdown.
 * Supports: title, subtitle, chapters, all block types.
 */

function escapeMarkdown(text = '') {
  // Minimal escaping – keep readable output
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/([*_`])/g, '\\$1')
}

function blockToMarkdown(block) {
  if (!block) return ''

  switch (block.type) {
    case 'heading1':
      return `# ${block.content?.trim() || ''}`
    case 'heading2':
      return `## ${block.content?.trim() || ''}`
    case 'heading3':
      return `### ${block.content?.trim() || ''}`
    case 'paragraph':
      return block.content?.trim() || ''
    case 'quote':
      return (block.content || '')
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n')
    case 'divider':
      return '---'
    case 'image': {
      const alt = block.imageCaption?.trim() || 'image'
      const url = block.imageUrl?.trim() || ''
      if (!url) return ''
      return `![${alt}](${url})`
    }
    case 'link': {
      const title = block.linkTitle?.trim() || block.linkUrl || 'link'
      const url = block.linkUrl?.trim() || ''
      if (!url) return ''
      return `[${title}](${url})`
    }
    default:
      return block.content?.trim() || ''
  }
}

/**
 * @param {Object} book - Full book document from API
 * @returns {string} Markdown string
 */
export function bookToMarkdown(book) {
  if (!book) return ''

  const lines = []

  // Front matter style header
  lines.push(`# ${book.title || 'Untitled'}`)
  if (book.subtitle?.trim()) {
    lines.push('')
    lines.push(`*${book.subtitle.trim()}*`)
  }
  if (book.description?.trim()) {
    lines.push('')
    lines.push(book.description.trim())
  }

  lines.push('')
  lines.push(`> Exported from Book Treasury · ${new Date().toLocaleDateString()}`)
  if (book.wordCount) {
    lines.push(`> ${book.wordCount.toLocaleString()} words`)
  }
  lines.push('')
  lines.push('---')
  lines.push('')

  // Chapters
  const chapters = Array.isArray(book.chapters) ? book.chapters : []
  chapters.forEach((chapter, idx) => {
    const chapterTitle = chapter.title?.trim() || `Chapter ${idx + 1}`
    lines.push(`## ${chapterTitle}`)
    lines.push('')

    const blocks = Array.isArray(chapter.blocks) ? chapter.blocks : []
    // Sort by order just in case
    const sorted = [...blocks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

    sorted.forEach((block) => {
      const md = blockToMarkdown(block)
      if (md) {
        lines.push(md)
        lines.push('') // blank line after every block for readability
      }
    })

    // Extra spacing between chapters
    if (idx < chapters.length - 1) {
      lines.push('')
    }
  })

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n'
}

/**
 * Trigger a browser download of the Markdown file.
 */
export function downloadMarkdown(book) {
  const markdown = bookToMarkdown(book)
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const safeName = (book.title || 'book')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 60) || 'book'

  const a = document.createElement('a')
  a.href = url
  a.download = `${safeName}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
