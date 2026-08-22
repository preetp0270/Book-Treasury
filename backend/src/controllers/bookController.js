const Book = require('../models/Book');
const { validationResult } = require('express-validator');

// @desc    Get all books of the logged-in user
// @route   GET /api/books
exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find({ owner: req.user._id })
      .select('-chapters.blocks') // lighter list view
      .sort({ updatedAt: -1 });

    res.json({ success: true, count: books.length, books });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch books' });
  }
};

// @desc    Get single book with full content
// @route   GET /api/books/:id
exports.getBook = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, owner: req.user._id });
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Update last opened
    book.lastOpened = new Date();
    await book.save({ validateBeforeSave: false });

    res.json({ success: true, book });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch book' });
  }
};

// @desc    Create a new book
// @route   POST /api/books
exports.createBook = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { title, subtitle, description, coverImage, defaultFont, theme } = req.body;

    const book = await Book.create({
      owner: req.user._id,
      title,
      subtitle: subtitle || '',
      description: description || '',
      coverImage: coverImage || '',
      defaultFont: defaultFont || 'Libre Baskerville',
      theme: theme || undefined,
      chapters: [
        {
          title: 'Chapter 1',
          order: 0,
          blocks: [
            {
              type: 'paragraph',
              content: '',
              order: 0,
              fontFamily: defaultFont || 'Libre Baskerville',
            },
          ],
        },
      ],
    });

    res.status(201).json({ success: true, book });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to create book' });
  }
};

// @desc    Update book metadata (title, cover, status, theme...)
// @route   PUT /api/books/:id
exports.updateBook = async (req, res) => {
  try {
    let book = await Book.findOne({ _id: req.params.id, owner: req.user._id });
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const allowed = ['title', 'subtitle', 'description', 'coverImage', 'defaultFont', 'theme', 'status'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        book[field] = req.body[field];
      }
    });

    await book.save();
    res.json({ success: true, book });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to update book' });
  }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    res.json({ success: true, message: 'Book deleted forever' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to delete book' });
  }
};

// @desc    Update full content (chapters + blocks) - the main save endpoint
// @route   PUT /api/books/:id/content
exports.updateContent = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, owner: req.user._id });
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const { chapters } = req.body;
    if (!Array.isArray(chapters)) {
      return res.status(400).json({ success: false, message: 'chapters must be an array' });
    }

    book.chapters = chapters;
    book.recalculateWordCount();
    book.updatedAt = new Date();
    await book.save();

    res.json({ success: true, book, wordCount: book.wordCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to save content' });
  }
};

// @desc    Add a new chapter
// @route   POST /api/books/:id/chapters
exports.addChapter = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, owner: req.user._id });
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const { title } = req.body;
    const newOrder = book.chapters.length;

    book.chapters.push({
      title: title || `Chapter ${newOrder + 1}`,
      order: newOrder,
      blocks: [
        {
          type: 'paragraph',
          content: '',
          order: 0,
          fontFamily: book.defaultFont,
        },
      ],
    });

    await book.save();
    res.status(201).json({ success: true, book });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to add chapter' });
  }
};

// @desc    Delete a chapter
// @route   DELETE /api/books/:id/chapters/:chapterId
exports.deleteChapter = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, owner: req.user._id });
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    book.chapters = book.chapters.filter(
      (ch) => ch._id.toString() !== req.params.chapterId
    );

    // Reorder remaining
    book.chapters.forEach((ch, idx) => {
      ch.order = idx;
    });

    book.recalculateWordCount();
    await book.save();

    res.json({ success: true, book });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to delete chapter' });
  }
};

// @desc    Export book as Markdown
// @route   GET /api/books/:id/export/markdown
exports.exportMarkdown = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, owner: req.user._id });
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const { bookToMarkdown } = require('../utils/markdownExport');
    const markdown = bookToMarkdown(book);

    // Safe filename
    const safeName = (book.title || 'book')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .toLowerCase()
      .slice(0, 60) || 'book';

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${safeName}.md"`
    );
    res.send(markdown);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to export Markdown' });
  }
};
