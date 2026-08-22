/**
 * Convert a Book Treasury book document into clean Markdown.
 * Shared logic with the frontend version.
 */

function blockToMarkdown(block) {
  if (!block) return '';

  switch (block.type) {
    case 'heading1':
      return `# ${(block.content || '').trim()}`;
    case 'heading2':
      return `## ${(block.content || '').trim()}`;
    case 'heading3':
      return `### ${(block.content || '').trim()}`;
    case 'paragraph':
      return (block.content || '').trim();
    case 'quote':
      return (block.content || '')
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n');
    case 'divider':
      return '---';
    case 'image': {
      const alt = (block.imageCaption || '').trim() || 'image';
      const url = (block.imageUrl || '').trim();
      if (!url) return '';
      return `![${alt}](${url})`;
    }
    case 'link': {
      const title = (block.linkTitle || '').trim() || block.linkUrl || 'link';
      const url = (block.linkUrl || '').trim();
      if (!url) return '';
      return `[${title}](${url})`;
    }
    default:
      return (block.content || '').trim();
  }
}

/**
 * @param {Object} book - Mongoose book document (or plain object)
 * @returns {string} Markdown
 */
function bookToMarkdown(book) {
  if (!book) return '';

  const lines = [];

  lines.push(`# ${book.title || 'Untitled'}`);
  if (book.subtitle && book.subtitle.trim()) {
    lines.push('');
    lines.push(`*${book.subtitle.trim()}*`);
  }
  if (book.description && book.description.trim()) {
    lines.push('');
    lines.push(book.description.trim());
  }

  lines.push('');
  lines.push(`> Exported from Book Treasury · ${new Date().toLocaleDateString()}`);
  if (book.wordCount) {
    lines.push(`> ${book.wordCount.toLocaleString()} words`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  const chapters = Array.isArray(book.chapters) ? book.chapters : [];
  chapters.forEach((chapter, idx) => {
    const chapterTitle = (chapter.title || '').trim() || `Chapter ${idx + 1}`;
    lines.push(`## ${chapterTitle}`);
    lines.push('');

    const blocks = Array.isArray(chapter.blocks) ? chapter.blocks : [];
    const sorted = [...blocks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    sorted.forEach((block) => {
      const md = blockToMarkdown(block);
      if (md) {
        lines.push(md);
        lines.push('');
      }
    });

    if (idx < chapters.length - 1) {
      lines.push('');
    }
  });

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

module.exports = { bookToMarkdown };
