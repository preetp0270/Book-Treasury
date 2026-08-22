const express = require('express');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadImage } = require('../controllers/uploadController');

const router = express.Router();

router.use(protect);

router.post('/image', upload.single('image'), uploadImage);

module.exports = router;
