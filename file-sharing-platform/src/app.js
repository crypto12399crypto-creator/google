require('dotenv').config();
const express = require('express');
const path = require('path');
const db = require('./models');
const i18next = require('./config/i18n');
const i18nextMiddleware = require('i18next-http-middleware');
const installCheck = require('./middleware/installCheck');

const app = express();

// --- Core Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(i18nextMiddleware.handle(i18next));

// --- Static Files ---
// Serve HTML, CSS, etc., from the 'public' directory.
app.use(express.static(path.join(__dirname, '..', 'public')));

// --- Installation Check ---
// This middleware must run before any application routes.
// It will redirect to the installer if the app is not yet installed.
app.use(installCheck);

// --- Installer Routes ---
const installerRoutes = require('./routes/installerRoutes');
app.use('/install', installerRoutes);

// --- API Routes ---
const authRoutes = require('./routes/authRoutes');
const planRoutes = require('./routes/planRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const fileRoutes = require('./routes/fileRoutes');
const userRoutes = require('./routes/userRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

// Mount API routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/plans', planRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/files', fileRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tickets', ticketRoutes);

// The main page route is now handled by the static middleware,
// serving public/index.html. We can keep this for API-only tests.
app.get('/api', (req, res) => {
  res.status(200).json({ message: req.t('welcome') });
});

// --- Handle Undefined API Routes ---
app.all('/api/*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: req.t('errors.notFound', { url: req.originalUrl }),
  });
});

// --- Server ---
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // We only sync the DB if the app is installed.
    // The installer handles the initial sync.
    const fs = require('fs');
    if (fs.existsSync(path.join(__dirname, '..', 'install.lock'))) {
        await db.sequelize.sync();
        console.log('Database connected and synced successfully.');
    } else {
        console.log('Application not installed. Starting in installer mode.');
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
      console.log(`Access it at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
