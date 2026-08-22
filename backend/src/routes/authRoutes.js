const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getMe,
  updatePreferences,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username 3-30 chars'),
    body('mpin').isLength({ min: 4, max: 6 }).withMessage('MPIN must be 4-6 digits'),
  ],
  register
);

router.post(
  '/login',
  [
    body('username').trim().notEmpty(),
    body('mpin').notEmpty(),
  ],
  login
);

router.get('/me', protect, getMe);
router.put('/preferences', protect, updatePreferences);

module.exports = router;
