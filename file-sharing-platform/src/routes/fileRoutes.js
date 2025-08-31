const express = require('express');
const fileController = require('../controllers/fileController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../config/multerConfig');

const router = express.Router();

// This download route is public so anyone with the link can access it.
// Password protection is handled within the controller itself.
// We use POST to allow sending a password in the request body.
router.post('/download/:token', fileController.downloadFile);
router.get('/download/:token', fileController.downloadFile); // Also allow GET for non-password protected files

// All subsequent routes are protected and require a logged-in user.
router.use(authMiddleware.protect);

router.get('/', fileController.getUserFiles);

// The 'upload.single('file')' middleware processes the file upload before the controller logic runs.
// 'file' must match the name attribute of the file input field in the frontend form.
router.post('/upload', upload.single('file'), fileController.uploadFile);

router.delete('/:id', fileController.deleteFile);

module.exports = router;
