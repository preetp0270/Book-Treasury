const express = require('express');
const { body } = require('express-validator');
const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  updateContent,
  addChapter,
  deleteChapter,
  exportMarkdown,
} = require('../controllers/bookController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // all book routes require auth

router
  .route('/')
  .get(getBooks)
  .post(
    [body('title').trim().notEmpty().withMessage('Title is required')],
    createBook
  );

router
  .route('/:id')
  .get(getBook)
  .put(updateBook)
  .delete(deleteBook);

router.put('/:id/content', updateContent);
router.post('/:id/chapters', addChapter);
router.delete('/:id/chapters/:chapterId', deleteChapter);

// Markdown export
router.get('/:id/export/markdown', exportMarkdown);

module.exports = router;
