import { jsPDF } from 'jspdf'

/**
 * Export a Book Treasury book as a clean, readable PDF.
 * Uses a simple text layout that works well for books.
 */
export function downloadPDF(book) {
  if (!book) return

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  let y = margin

  const ensureSpace = (needed = 10) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage()
      y = margin
    }
  }

  // Title page
  doc.setFont('times', 'bold')
  doc.setFontSize(24)
  const titleLines = doc.splitTextToSize(book.title || 'Untitled', contentWidth)
  y = pageHeight / 3
  titleLines.forEach((line) => {
    doc.text(line, pageWidth / 2, y, { align: 'center' })
    y += 12
  })

  if (book.subtitle) {
    y += 6
    doc.setFont('times', 'italic')
    doc.setFontSize(14)
    const subLines = doc.splitTextToSize(book.subtitle, contentWidth)
    subLines.forEach((line) => {
      doc.text(line, pageWidth / 2, y, { align: 'center' })
      y += 8
    })
  }

  y += 20
  doc.setFont('times', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Exported from Book Treasury · ${new Date().toLocaleDateString()}`, pageWidth / 2, y, {
    align: 'center',
  })
  if (book.wordCount) {
    y += 6
    doc.text(`${book.wordCount.toLocaleString()} words`, pageWidth / 2, y, { align: 'center' })
  }

  // Content pages
  doc.setTextColor(0)
  const chapters = Array.isArray(book.chapters) ? book.chapters : []

  chapters.forEach((chapter, chIdx) => {
    doc.addPage()
    y = margin

    // Chapter title
    doc.setFont('times', 'bold')
    doc.setFontSize(18)
    const chTitle = chapter.title || `Chapter ${chIdx + 1}`
    const chLines = doc.splitTextToSize(chTitle, contentWidth)
    chLines.forEach((line) => {
      ensureSpace(12)
      doc.text(line, margin, y)
      y += 10
    })
    y += 6

    const blocks = Array.isArray(chapter.blocks)
      ? [...chapter.blocks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      : []

    blocks.forEach((block) => {
      if (!block) return

      switch (block.type) {
        case 'heading1':
          doc.setFont('times', 'bold')
          doc.setFontSize(16)
          break
        case 'heading2':
          doc.setFont('times', 'bold')
          doc.setFontSize(14)
          break
        case 'heading3':
          doc.setFont('times', 'bold')
          doc.setFontSize(12)
          break
        case 'quote':
          doc.setFont('times', 'italic')
          doc.setFontSize(11)
          break
        case 'paragraph':
        default:
          doc.setFont('times', 'normal')
          doc.setFontSize(11)
      }

      if (block.type === 'divider') {
        ensureSpace(8)
        doc.setDrawColor(180)
        doc.line(margin + 20, y, pageWidth - margin - 20, y)
        y += 10
        return
      }

      if (block.type === 'image' && block.imageUrl) {
        ensureSpace(12)
        doc.setFont('times', 'italic')
        doc.setFontSize(9)
        doc.setTextColor(80)
        const caption = block.imageCaption || 'Image'
        doc.text(`[Image: ${caption}]`, margin, y)
        doc.setTextColor(0)
        y += 8
        // Note: embedding remote images requires CORS-friendly URLs + extra work.
        // We show a placeholder caption for reliability.
        return
      }

      if (block.type === 'link') {
        ensureSpace(10)
        doc.setFont('times', 'normal')
        doc.setFontSize(10)
        doc.setTextColor(40, 80, 160)
        const label = block.linkTitle || block.linkUrl || 'Link'
        doc.textWithLink(label, margin, y, { url: block.linkUrl || '' })
        doc.setTextColor(0)
        y += 8
        return
      }

      const text = (block.content || '').trim()
      if (!text) return

      const lines = doc.splitTextToSize(
        block.type === 'quote' ? `"${text}"` : text,
        contentWidth - (block.type === 'quote' ? 10 : 0)
      )

      lines.forEach((line) => {
        ensureSpace(7)
        const x = block.type === 'quote' ? margin + 8 : margin
        doc.text(line, x, y)
        y += 6.5
      })
      y += 4
    })
  })

  // Filename
  const safeName =
    (book.title || 'book')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .toLowerCase()
      .slice(0, 60) || 'book'

  doc.save(`${safeName}.pdf`)
}
