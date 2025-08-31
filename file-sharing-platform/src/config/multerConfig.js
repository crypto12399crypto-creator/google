const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define the storage directory
const storageDir = path.join(__dirname, '..', '..', 'uploads');

// Ensure the storage directory exists. This is important for the server's first run.
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

// Set up storage for uploaded files using multer.diskStorage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storageDir);
  },
  filename: (req, file, cb) => {
    // Create a unique filename to avoid overwrites and naming conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer with storage, size limits, and a custom file filter
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 500 // 500 MB file size limit
  },
  fileFilter: (req, file, cb) => {
    // This is a crucial validation step.
    // We check if the user has enough storage space before accepting the file.
    const user = req.user;
    if (!user) {
        return cb(new Error('You must be logged in to upload files.'));
    }

    // Check if adding the new file exceeds the user's total storage limit
    if (user.used_storage + file.size > user.total_storage) {
        // Reject the file by passing an error to the callback
        return cb(new Error('Not enough storage space. Please upgrade your plan or free up space.'));
    }

    // If validation passes, accept the file
    cb(null, true);
  }
});

module.exports = upload;
