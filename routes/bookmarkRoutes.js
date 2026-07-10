const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');

// Define routes for bookmarks
router.get('/', bookmarkController.getAllBookmarks);
router.post('/', bookmarkController.addBookmark);
router.delete('/:id', bookmarkController.deleteBookmark);

module.exports = router;
