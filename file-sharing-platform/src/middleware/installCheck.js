const fs = require('fs');
const path = require('path');

const lockPath = path.join(__dirname, '..', '..', 'install.lock');

// This function will be used as middleware in app.js
module.exports = (req, res, next) => {
  // Allow requests to the installer itself and to public assets (like CSS) to pass through
  if (req.originalUrl.startsWith('/install') || req.originalUrl.startsWith('/styles')) {
    return next();
  }

  // Check if the installation lock file exists.
  if (fs.existsSync(lockPath)) {
    // If it exists, the app is installed. Proceed to the main application routes.
    return next();
  } else {
    // If it does not exist, redirect to the new, single-step installer.
    return res.redirect('/install/step');
  }
};
