const mongoose = require('mongoose');

const contentBlockSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['heading1', 'heading2', 'heading3', 'paragraph', 'image', 'quote', 'divider', 'link'],
      required: true,
    },
    content: {
      type: String,
      default: '',
    },
    // For images
    imageUrl: String,
    imageCaption: String,
    // For links / references
    linkUrl: String,
    linkTitle: String,
    // Styling
    fontFamily: {
      type: String,
      default: 'serif',
    },
    alignment: {
      type: String,
      enum: ['left', 'center', 'right', 'justify'],
      default: 'left',
    },
    order: {
      type: Number,
      required: true,
    },
  },
  { _id: true }
);

const chapterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    order: {
      type: Number,
      required: true,
    },
    blocks: [contentBlockSchema],
  },
  { _id: true, timestamps: true }
);

const bookSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },
    description: {
      type: String,
      maxlength: 1000,
      default: '',
    },
    coverImage: {
      type: String, // URL or base64
      default: '',
    },
    // Visual style of the book
    theme: {
      paperColor: { type: String, default: '#f8f1e3' }, // parchment
      textColor: { type: String, default: '#2c1810' },
      accentColor: { type: String, default: '#8b4513' },
    },
    // Default font for this book
    defaultFont: {
      type: String,
      default: 'Libre Baskerville',
    },
    status: {
      type: String,
      enum: ['draft', 'in-progress', 'completed', 'archived'],
      default: 'draft',
    },
    chapters: [chapterSchema],
    // Simple stats
    wordCount: {
      type: Number,
      default: 0,
    },
    lastOpened: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast owner queries
bookSchema.index({ owner: 1, updatedAt: -1 });

// Helper to recalculate word count
bookSchema.methods.recalculateWordCount = function () {
  let count = 0;
  this.chapters.forEach((ch) => {
    ch.blocks.forEach((block) => {
      if (['heading1', 'heading2', 'heading3', 'paragraph', 'quote'].includes(block.type) && block.content) {
        count += block.content.trim().split(/\s+/).filter(Boolean).length;
      }
    });
  });
  this.wordCount = count;
  return count;
};

module.exports = mongoose.model('Book', bookSchema);
